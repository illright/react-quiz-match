import { assign, createMachine } from "xstate";

type Input = { initialEntries: Record<string, Array<string>> };
type Context = {
  entries: Record<string, Array<string>>;
  selectedKeys: Array<string>;
  selectedValues: Array<string>;
};
type Events =
  | { type: "SELECT_KEY"; keyId: string }
  | { type: "SELECT_VALUE"; valueId: string };

export const manyToManyMachine = createMachine(
  {
    types: {} as { events: Events; context: Context; input: Input },
    initial: "idle",
    context: ({ input }) => ({
      entries: input?.initialEntries ?? {},
      selectedKeys: [],
      selectedValues: [],
    }),
    states: {
      idle: {
        on: {
          SELECT_KEY: {
            target: "keySelected",
            actions: assign({
              selectedKeys: ({ event }) => [event.keyId],
            }),
          },
          SELECT_VALUE: {
            target: "valueSelected",
            actions: assign({
              selectedValues: ({ event }) => [event.valueId],
            }),
          },
        },
      },
      keySelected: {
        on: {
          SELECT_KEY: [
            {
              target: "idle",
              guard: ({ context, event }) =>
                context.selectedKeys.length === 1 &&
                context.selectedKeys[0] === event.keyId,
              actions: assign({ selectedKeys: [] }),
            },
            {
              target: "keySelected",
              guard: ({ context, event }) =>
                context.selectedKeys.includes(event.keyId),
              actions: assign({
                selectedKeys: ({ context, event }) =>
                  context.selectedKeys.filter((aKey) => aKey !== event.keyId),
              }),
            },
            {
              target: "keySelected",
              actions: assign({
                selectedKeys: ({ context, event }) => [
                  ...context.selectedKeys,
                  event.keyId,
                ],
              }),
            },
          ],
          SELECT_VALUE: {
            target: "pairMade",
            actions: assign({
              selectedValues: ({ event }) => [event.valueId],
            }),
          },
        },
      },
      valueSelected: {
        on: {
          SELECT_KEY: {
            target: "pairMade",
            actions: assign({
              selectedKeys: ({ event }) => [event.keyId],
            }),
          },
          SELECT_VALUE: [
            {
              target: "idle",
              guard: ({ context, event }) =>
                context.selectedValues.length === 1 &&
                context.selectedValues[0] === event.valueId,
              actions: assign({ selectedValues: [] }),
            },
            {
              target: "valueSelected",
              guard: ({ context, event }) =>
                context.selectedValues.includes(event.valueId),
              actions: assign({
                selectedValues: ({ context, event }) =>
                  context.selectedValues.filter(
                    (aValue) => aValue !== event.valueId,
                  ),
              }),
            },
            {
              target: "valueSelected",
              actions: assign({
                selectedValues: ({ context, event }) => [
                  ...context.selectedValues,
                  event.valueId,
                ],
              }),
            },
          ],
        },
      },
      pairMade: {
        always: {
          target: "idle",
          actions: assign({
            entries: ({
              context: { entries, selectedKeys, selectedValues },
            }) => {
              if (selectedKeys.length !== 1 && selectedValues.length !== 1) {
                throw new Error(
                  "To make pairs, either only one key or one value must be selected",
                );
              }

              const newEntries = { ...entries };
              if (selectedValues.length === 1) {
                const [selectedValue] = selectedValues;

                if (
                  selectedKeys.every(
                    (key) => newEntries[key]?.includes(selectedValue),
                  )
                ) {
                  for (const selectedKey of selectedKeys) {
                    if (newEntries[selectedKey].length === 1) {
                      delete newEntries[selectedKey];
                    } else {
                      newEntries[selectedKey] = newEntries[selectedKey].filter(
                        (aValue) => aValue !== selectedValue,
                      );
                    }
                  }
                } else {
                  for (const selectedKey of selectedKeys) {
                    if (!newEntries[selectedKey]?.includes(selectedValue)) {
                      newEntries[selectedKey] = [
                        ...(newEntries[selectedKey] ?? []),
                        selectedValue,
                      ];
                    }
                  }
                }
              } else {
                const [selectedKey] = selectedKeys;

                if (
                  selectedValues.every(
                    (value) => newEntries[selectedKey]?.includes(value),
                  )
                ) {
                  if (
                    newEntries[selectedKey].length === selectedValues.length
                  ) {
                    delete newEntries[selectedKey];
                  } else {
                    newEntries[selectedKey] = newEntries[selectedKey].filter(
                      (aValue) => !selectedValues.includes(aValue),
                    );
                  }
                } else {
                  newEntries[selectedKey] = [
                    ...(newEntries[selectedKey] ?? []),
                    ...selectedValues.filter(aValue => !newEntries[selectedKey]?.includes(aValue))
                  ]
                }
              }

              return newEntries;
            },
            selectedKeys: [],
            selectedValues: [],
          }),
        },
      },
    },
  },
  { actions: {} },
);

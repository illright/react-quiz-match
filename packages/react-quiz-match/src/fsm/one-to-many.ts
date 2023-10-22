import { assign, createMachine } from "xstate";

type Input = { initialEntries: Record<string, string> };
type Context = {
  entries: Record<string, string>;
  selectedKeys: Array<string>;
  selectedValue: string | null;
};
type Events =
  | { type: "SELECT_KEY"; keyId: string }
  | { type: "SELECT_VALUE"; valueId: string };

export const oneToManyMachine = createMachine(
  {
    types: {} as { events: Events; context: Context; input: Input },
    initial: "idle",
    context: ({ input }) => ({
      entries: input?.initialEntries ?? {},
      selectedKeys: [],
      selectedValue: null,
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
              selectedValue: ({ event }) => event.valueId,
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
              selectedValue: ({ event }) => event.valueId,
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
                context.selectedValue === event.valueId,
              actions: assign({ selectedValue: null }),
            },
            {
              target: "valueSelected",
              actions: assign({
                selectedValue: ({ event }) => event.valueId,
              }),
            },
          ],
        },
      },
      pairMade: {
        always: {
          target: "idle",
          actions: assign({
            entries: ({ context: { entries, selectedKeys, selectedValue } }) => {
              if (selectedKeys.length === 0 || selectedValue === null) {
                throw new Error("To make a pair, a value and at least 1 key must be selected");
              }

              const newEntries = { ...entries };

              if (selectedKeys.every(key => newEntries[key] === selectedValue)) {
                for (const selectedKey of selectedKeys) {
                  delete newEntries[selectedKey];
                }
              } else {
                for (const selectedKey of selectedKeys) {
                  newEntries[selectedKey] = selectedValue;
                }
              }

              return newEntries;
            },
            selectedKeys: [],
            selectedValue: null,
          }),
        },
      },
    },
  },
  { actions: {} },
);

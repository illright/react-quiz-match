import { assign, createMachine } from "xstate";

type Input = { initialEntries: Record<string, string> };
type Context = {
  entries: Record<string, string>;
  selectedKey: string | null;
  selectedValue: string | null;
};
type Events =
  | { type: "SELECT_KEY"; keyId: string }
  | { type: "SELECT_VALUE"; valueId: string };

export const oneToOneMachine = createMachine(
  {
    types: {} as { events: Events; context: Context; input: Input },
    initial: "idle",
    context: ({ input }) => ({
      entries: input?.initialEntries ?? {},
      selectedKey: null,
      selectedValue: null,
    }),
    states: {
      idle: {
        on: {
          SELECT_KEY: {
            target: "keySelected",
            actions: assign({
              selectedKey: ({ event }) => event.keyId,
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
                context.selectedKey === event.keyId,
              actions: assign({ selectedKey: null }),
            },
            {
              target: "keySelected",
              actions: assign({
                selectedKey: ({ event }) => event.keyId,
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
              selectedKey: ({ event }) => event.keyId,
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
            entries: ({ context: { entries, selectedKey, selectedValue } }) => {
              if (selectedKey === null || selectedValue === null) {
                throw new Error("To make a pair, a key and a value must be selected");
              }

              if (selectedKey in entries && entries[selectedKey] === selectedValue) {
                const { [selectedKey]: _, ...rest } = entries;

                return rest;
              }

              if (Object.values(entries).includes(selectedValue)) {
                if (entries[selectedKey] === selectedValue) {
                  const { [selectedKey]: _, ...rest } = entries;

                  return rest;
                } else {
                  const occupyingKey = Object.keys(entries).find(theKey => entries[theKey] === selectedValue)!;
                  const { [occupyingKey]: _, ...rest } = entries;

                  return { ...rest, [selectedKey]: selectedValue };
                }
              }

              return { ...entries, [selectedKey]: selectedValue };
            },
            selectedKey: null,
            selectedValue: null,
          }),
        },
      },
    },
  },
  { actions: {} },
);

// Issues with xstate:
// - no invariants
// - guards don't assert the actions
// - the input is not nullable, though it should be

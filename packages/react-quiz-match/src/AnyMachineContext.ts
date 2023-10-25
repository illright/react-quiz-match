import { createContext } from "react";
import type { ActorRefFrom, SnapshotFrom } from "xstate";

import { oneToOneMachine } from "./fsm/one-to-one";
import { manyToOneMachine } from "./fsm/many-to-one";
import { manyToManyMachine } from "./fsm/many-to-many";

type MachineContext = { disabled: boolean | undefined } & (
  | {
      type: "one-to-one";
      actorRef: ActorRefFrom<typeof oneToOneMachine>;
    }
  | {
      type: "many-to-one";
      actorRef: ActorRefFrom<typeof manyToOneMachine>;
    }
  | {
      type: "many-to-many";
      actorRef: ActorRefFrom<typeof manyToManyMachine>;
    }
);

export type AnyMachineSnapshot = SnapshotFrom<
  typeof oneToOneMachine | typeof manyToOneMachine | typeof manyToManyMachine
>;

export const AnyMachineContext = createContext<MachineContext | null>(null);

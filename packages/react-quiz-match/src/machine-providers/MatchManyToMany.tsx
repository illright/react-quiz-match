import type { ReactNode } from "react";
import type { ContextFrom } from "xstate";
import { useActorRef } from "@xstate/react";

import { manyToManyMachine } from "../fsm/many-to-many";
import { AnyMachineContext } from "../AnyMachineContext";

export function MatchManyToMany({
  children,
  onChange,
  disabled,
}: {
  children: ReactNode;
  onChange?: (context: ContextFrom<typeof manyToManyMachine>) => void;
  disabled?: boolean;
}) {
  const actorRef = useActorRef(
    manyToManyMachine,
    {},
    (snapshot) => onChange?.(snapshot.context),
  );

  return (
    <AnyMachineContext.Provider
      value={{ actorRef, type: "many-to-many", disabled }}
    >
      {children}
    </AnyMachineContext.Provider>
  );
}

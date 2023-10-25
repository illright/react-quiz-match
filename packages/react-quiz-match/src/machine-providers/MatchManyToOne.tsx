import type { ReactNode } from "react";
import type { ContextFrom } from "xstate";
import { useActorRef } from "@xstate/react";

import { manyToOneMachine } from "../fsm/many-to-one";
import { AnyMachineContext } from "../AnyMachineContext";

export function MatchManyToOne({
  children,
  onChange,
  disabled,
}: {
  children: ReactNode;
  onChange?: (context: ContextFrom<typeof manyToOneMachine>) => void;
  disabled?: boolean;
}) {
  const actorRef = useActorRef(
    manyToOneMachine,
    {},
    (snapshot) => onChange?.(snapshot.context),
  );

  return (
    <AnyMachineContext.Provider
      value={{ actorRef, type: "many-to-one", disabled }}
    >
      {children}
    </AnyMachineContext.Provider>
  );
}

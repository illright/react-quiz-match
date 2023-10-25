import type { ReactNode } from "react";
import type { ContextFrom } from "xstate";
import { useActorRef } from "@xstate/react";

import { oneToOneMachine } from "../fsm/one-to-one";
import { AnyMachineContext } from "../AnyMachineContext";

export function MatchOneToOne({
  children,
  onChange,
  disabled,
}: {
  children: ReactNode;
  onChange?: (context: ContextFrom<typeof oneToOneMachine>) => void;
  disabled?: boolean;
}) {
  const actorRef = useActorRef(
    oneToOneMachine,
    {},
    (snapshot) => onChange?.(snapshot.context),
  );

  return (
    <AnyMachineContext.Provider
      value={{ actorRef, type: "one-to-one", disabled }}
    >
      {children}
    </AnyMachineContext.Provider>
  );
}

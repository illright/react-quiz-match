import { useCallback, useContext } from "react";
import {
  AnyMachineContext,
  type AnyMachineSnapshot,
} from "./AnyMachineContext";
import { type SyncExternalStore, useSelector } from "./useSelector";

function selectSelectedKeys(state: AnyMachineSnapshot) {
  if ("selectedKeys" in state.context) {
    return state.context.selectedKeys;
  }

  return state.context.selectedKey !== null ? [state.context.selectedKey] : [];
}

function selectSelectedValues(state: AnyMachineSnapshot) {
  if ("selectedValues" in state.context) {
    return state.context.selectedValues;
  }

  return state.context.selectedValue !== null
    ? [state.context.selectedValue]
    : [];
}

export function useMatchItem({
  name,
  value,
}: { name: string; value?: never } | { name?: never; value: string }) {
  const { actorRef, disabled } = useContext(AnyMachineContext) ?? {};

  const toggle = useCallback(() => {
    if (actorRef === undefined) {
      console.error(
        "useMatchItem must be used inside a component inside a Match context.",
      );
      return;
    }

    if (disabled) {
      return;
    }

    if (name !== undefined) {
      actorRef.send({ type: "SELECT_KEY", keyId: name });
    } else {
      actorRef.send({ type: "SELECT_VALUE", valueId: value });
    }
  }, [actorRef, disabled]);

  const selectedKeys = useSelector(
    actorRef as unknown as SyncExternalStore<AnyMachineSnapshot>,
    selectSelectedKeys,
  );
  const selectedValues = useSelector(
    actorRef as unknown as SyncExternalStore<AnyMachineSnapshot>,
    selectSelectedValues,
  );

  const isSelected =
    actorRef !== undefined &&
    (name !== undefined
      ? selectedKeys.includes(name)
      : selectedValues.includes(value));

  return { toggle, isSelected, isDisabled: disabled ?? false };
}

import { useMemo, useSyncExternalStore } from "react";

export type SyncExternalStore<StateType> = {
  subscribe: (cb: () => void) => { unsubscribe: () => void };
  getSnapshot: () => StateType;
};

/**
 * Custom implementation of `useSelector` from @xstate/react
 * because theirs wouldn't accept `undefined` as the actor.
 */
export function useSelector<StateType, SelectedType>(
  actor: SyncExternalStore<StateType> | undefined,
  select: (state: StateType) => SelectedType,
) {
  const state = useSyncExternalStore(
    (cb) => actor?.subscribe(cb).unsubscribe ?? (() => {}),
    actor?.getSnapshot.bind(actor) ?? (() => ({}) as StateType),
  );

  return useMemo(() => select(state), [select, state]);
}

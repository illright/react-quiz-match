import { type RefObject, createContext } from "react";

export interface ContextValue {
  values: Record<string, string | Array<string>>;
  refs: RefObject<Record<`${"key" | "value"}:${string}`, HTMLButtonElement>>;
  activeKey: string | null;
  activeValue: string | null;
  toggleActiveKey: ((key: string) => void) | undefined;
  toggleActiveValue: ((value: string) => void) | undefined;
  setRef:
    | ((
        element: HTMLButtonElement,
        key: string,
        scope: "key" | "value",
      ) => void)
    | undefined;
  disabled: boolean;
}

const defaultContextValue: ContextValue = {
  values: {},
  refs: { current: {} },
  activeKey: null,
  activeValue: null,
  toggleActiveKey: undefined,
  toggleActiveValue: undefined,
  setRef: undefined,
  disabled: false,
};

export const MatchContext = createContext<ContextValue>(defaultContextValue);

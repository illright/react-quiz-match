import {
  useState,
  useCallback,
  useRef,
  type ReactNode,
  useEffect,
} from "react";

import { MatchContext } from "./MatchContext";

export interface MatchProps {
  /** Allows you to use the component in an uncontrolled way. */
  defaultValue?: Record<string, string>;
  /** Specify the options using `Match.Item` components anywhere within the tree. */
  children: ReactNode;
  /** Allows you to use the component in a controlled way. */
  value?: Record<string, string>;
  /** Disables the buttons. */
  disabled?: boolean;
  /** Called with an object of key-value pairs when the user changes the choice. */
  onChange?: (value: Record<string, string>) => void;
}

export function Match({
  children,
  defaultValue = {},
  value,
  onChange,
  disabled = false,
}: MatchProps) {
  const refs = useRef<Record<string, HTMLButtonElement>>({});
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [activeValue, setActiveValue] = useState<string | null>(null);
  const [values, setValues] =
    useState<Record<string, string>>(defaultValue);

  useEffect(() => {
    if (value !== undefined) {
      setValues(value);
    }
  }, [value]);

  const toggleActiveKeyOrPairUp = useCallback(
    (key: string) => {
      if (activeValue === null) {
        setActiveKey((prevKey) => (prevKey === key ? null : key));
      } else {
        const newValues = { ...values, [key]: activeValue };
        setValues(newValues);
        onChange?.(newValues);
        setActiveValue(null);
      }
    },
    [activeValue, setActiveKey, setActiveValue, values],
  );

  const toggleActiveValueOrPairUp = useCallback(
    (value: string) => {
      if (activeKey === null) {
        setActiveValue((prevValue) => (prevValue === value ? null : value));
      } else {
        const newValues = { ...values, [activeKey]: value };
        setValues(newValues);
        onChange?.(newValues);
        setActiveKey(null);
      }
    },
    [activeKey, setActiveKey, setActiveValue],
  );

  const setRef = useCallback(
    (element: HTMLButtonElement, key: string, scope: "key" | "value") => {
      refs.current[`${scope}:${key}`] = element;
    },
    [refs],
  );

  return (
    <MatchContext.Provider
      value={{
        values,
        refs,
        setRef,
        activeKey,
        activeValue,
        toggleActiveKey: toggleActiveKeyOrPairUp,
        toggleActiveValue: toggleActiveValueOrPairUp,
        disabled,
      }}
    >
      {children}
    </MatchContext.Provider>
  );
}

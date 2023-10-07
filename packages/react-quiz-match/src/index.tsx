import {
  createContext,
  type ComponentProps,
  useContext,
  useState,
  useCallback,
  useRef,
  type RefObject,
  useMemo,
  type ReactNode,
  useEffect,
  forwardRef,
} from "react";
import { useMergeRefs } from "use-callback-ref";

interface ContextValue {
  values: Record<string, string>;
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

const MatchContext = createContext<ContextValue>(defaultContextValue);

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

/** The controller component, keeps track of value and disabled state and fires events. */
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
  const [values, setValues] = useState<Record<string, string>>(defaultValue);

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

/** A point on an X-Y plane. */
export type Point = [x: number, y: number];
/** The middle points on all 4 sides of a DOM rect. */
export type ConnectionPoints = {
  top: Point;
  right: Point;
  bottom: Point;
  left: Point;
};

/** A line that the user has drawn between a key and a value. */
export interface MatchLine {
  key: ConnectionPoints;
  value: ConnectionPoints;
  /**
   * Whether the line connects the key with the right value.
   * `undefined` when answers are `undefined`.
   */
  isCorrect: boolean | undefined;
  /**
   * Whether the line doesn't connect the key with a value, but the answers say it should.
   * `undefined` when answers are `undefined`.
   */
  isMissed: boolean | undefined;
}

/**
 * Returns the lines that a user has drawn, along with coordinates to display them.
 *
 * If you want to show the correct answers, pass them as the `correctAnswers` argument.
 */
export function useMatchLines(
  correctAnswers: Record<string, string> | undefined = undefined,
) {
  const { refs, values } = useContext(MatchContext);

  return useMemo<Array<MatchLine>>(() => {
    return Object.entries(values)
      .map(([key, value]) => {
        const isCorrect = correctAnswers && correctAnswers[key] === value;
        const isMissed =
          correctAnswers && key in correctAnswers && !(key in values);
        const keyElement = refs.current?.[`key:${key}`];
        const valueElement = refs.current?.[`value:${value}`];

        if (keyElement === undefined || valueElement === undefined) {
          return null;
        }

        const keyRect = keyElement.getBoundingClientRect();
        const valueRect = valueElement.getBoundingClientRect();

        return {
          key: rectToConnectionPoints(keyRect),
          value: rectToConnectionPoints(valueRect),
          isCorrect,
          isMissed,
        };
      })
      .filter(Boolean) as Array<MatchLine>;
  }, [refs, values, correctAnswers]);
}

function rectToConnectionPoints(rect: DOMRect): ConnectionPoints {
  return {
    top: [rect.x + rect.width / 2, rect.y],
    right: [rect.x + rect.width, rect.y + rect.height / 2],
    bottom: [rect.x + rect.width / 2, rect.y + rect.height],
    left: [rect.x, rect.y + rect.height / 2],
  };
}

/** The presence of `value` marks the item as a value, the presence of a key marks it as a key. */
export type MatchItemProps = (
  | { value: string; name?: never }
  | { name: string; value?: never }
) &
  Omit<ComponentProps<"button">, "name" | "value" | "onClick">;

const MatchItem = forwardRef<HTMLButtonElement, MatchItemProps>(
  ({ children, value, name, ...restProps }, ref) => {
    const isKey = name !== undefined;
    const {
      values,
      toggleActiveKey,
      toggleActiveValue,
      activeKey,
      activeValue,
      setRef,
      disabled,
    } = useContext(MatchContext);

    const chosenValue = isKey ? values[name] : undefined;

    const handleClick = useCallback(() => {
      if (isKey) {
        toggleActiveKey?.(name);
      } else if (value !== undefined) {
        toggleActiveValue?.(value);
      }
    }, [isKey, name, value, toggleActiveKey, toggleActiveValue]);

    const measuringRef = useCallback(
      (element: HTMLButtonElement | null) => {
        element &&
          setRef?.(
            element,
            isKey ? name : value ?? "",
            isKey ? "key" : "value",
          );
      },
      [isKey, name, value, setRef],
    );

    const commonRef = useMergeRefs([measuringRef, ref]);

    return (
      <>
        <button
          onClick={handleClick}
          type="button"
          data-name={name}
          data-value={value}
          data-active={name === activeKey || value === activeValue}
          ref={commonRef}
          disabled={disabled}
          {...restProps}
        >
          {children}
        </button>
        {isKey && <input type="hidden" name={name} value={chosenValue ?? ""} />}
      </>
    );
  },
);
MatchItem.displayName = "Match.Item";

/**
 * A single item, whether a key or a value.
 *
 * To mark this as a key, pass the `name` prop (this will also create a hidden <input> with this name).
 * To mark this as a value, pass the `value` prop.
 *
 * Renders as a `<button>` element.
 */
Match.Item = MatchItem;

import {
  type ComponentProps,
  useContext,
  useCallback,
  forwardRef,
} from "react";
import { useMergeRefs } from "use-callback-ref";

import { MatchContext } from "./MatchContext";

/** The presence of `value` marks the item as a value, the presence of a key marks it as a key. */
export type MatchItemProps = (
  | { value: string; name?: never }
  | { name: string; value?: never }
) &
  Omit<ComponentProps<"button">, "name" | "value" | "onClick">;

export const MatchItem = forwardRef<HTMLButtonElement, MatchItemProps>(
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

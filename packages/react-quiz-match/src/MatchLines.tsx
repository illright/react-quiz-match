import {
  createContext,
  useRef,
  type RefObject,
  useCallback,
  useMemo,
  useContext,
  ComponentPropsWithoutRef,
} from "react";
import { AnyMachineContext, AnyMachineSnapshot } from "./AnyMachineContext";
import { type SyncExternalStore, useSelector } from "./useSelector";

interface ContextValue {
  refs: RefObject<Record<`${"key" | "value"}:${string}`, HTMLElement>>;
  ownRef: RefObject<HTMLDivElement>;
  setRef:
    | ((
        element: HTMLElement | null,
        scope: "key" | "value",
        id: string,
      ) => void)
    | undefined;
}

const MatchLinesContext = createContext<ContextValue>({
  refs: { current: {} },
  ownRef: { current: null },
  setRef: undefined,
});

export function MatchLinesProvider({
  children,
  ...restProps
}: ComponentPropsWithoutRef<"div">) {
  const ownRef = useRef<HTMLDivElement>(null);
  const refs = useRef<Record<string, HTMLElement>>({});

  const setRef = useCallback(
    (element: HTMLElement | null, scope: "key" | "value", id: string) => {
      if (element !== null) {
        refs.current[`${scope}:${id}`] = element;
      } else {
        delete refs.current[`${scope}:${id}`];
      }
    },
    [refs],
  );

  return (
    <MatchLinesContext.Provider value={{ refs, setRef, ownRef }}>
      <div style={{ position: "relative" }} ref={ownRef} {...restProps}>
        {children}
      </div>
    </MatchLinesContext.Provider>
  );
}

function selectEntries(state: AnyMachineSnapshot) {
  return state.context.entries;
}

function useConnections() {
  const { actorRef } = useContext(AnyMachineContext) ?? {};

  const entries = useSelector(
    actorRef as unknown as SyncExternalStore<AnyMachineSnapshot>,
    selectEntries,
  );

  const connections = useMemo(
    () =>
      Object.entries(entries).flatMap(
        ([key, valueOrValues]: [string, string | Array<string>]) =>
          Array.isArray(valueOrValues)
            ? valueOrValues.map((value) => [key, value] as const)
            : [[key, valueOrValues] as const],
      ),
    [entries],
  );

  return connections;
}

export function useMatchLines() {
  const connections = useConnections();
  const { ownRef, refs } = useContext(MatchLinesContext);

  return useMemo<Array<MatchLine>>(() => {
    const ownRect = ownRef.current?.getBoundingClientRect();

    if (ownRect === undefined) {
      return [];
    }

    return connections
      .map(([key, value]) => {
        // const isCorrect = correctAnswers && correctAnswers[key] === value;
        // const isMissed =
        //   correctAnswers && key in correctAnswers && !(key in values);
        const keyElement = refs.current?.[`key:${key}`];
        const valueElement = refs.current?.[`value:${value}`];

        if (keyElement === undefined || valueElement === undefined) {
          return null;
        }

        const keyRect = keyElement.getBoundingClientRect();
        const valueRect = valueElement.getBoundingClientRect();

        return {
          key: rectToRelativeConnectionPoints(keyRect, ownRect),
          value: rectToRelativeConnectionPoints(valueRect, ownRect),
          isCorrect: undefined,
          isMissed: undefined,
        };
      })
      .filter(Boolean) as Array<MatchLine>;
  }, [refs, connections]);
}

export function useLineConnectionPoint(scope: "key" | "value", id: string) {
  const { setRef } = useContext(MatchLinesContext);

  const ref = useCallback(
    (element: HTMLElement | null) => setRef?.(element, scope, id),
    [setRef, scope, id],
  );

  return ref;
}

function rectToRelativeConnectionPoints(
  rect: DOMRect,
  relativeParentRect: DOMRect,
): ConnectionPoints {
  // return {
  //   top: [rect.x + rect.width / 2, rect.y],
  //   right: [rect.x + rect.width, rect.y + rect.height / 2],
  //   bottom: [rect.x + rect.width / 2, rect.y + rect.height],
  //   left: [rect.x, rect.y + rect.height / 2],
  // };
  return {
    top: [
      rect.x - relativeParentRect.x + rect.width / 2,
      rect.y - relativeParentRect.y,
    ],
    right: [
      rect.x - relativeParentRect.x + rect.width,
      rect.y - relativeParentRect.y + rect.height / 2,
    ],
    bottom: [
      rect.x - relativeParentRect.x + rect.width / 2,
      rect.y - relativeParentRect.y + rect.height,
    ],
    left: [
      rect.x - relativeParentRect.x,
      rect.y - relativeParentRect.y + rect.height / 2,
    ],
  };
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

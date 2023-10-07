import { useContext, useMemo } from "react";
import { MatchContext } from "./MatchContext";

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

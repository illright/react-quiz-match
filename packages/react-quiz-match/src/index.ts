import { Match as MatchUntyped } from "./Match";
import { MatchItem } from "./MatchItem";

export { useMatchLines } from "./useMatchLines";

/** The controller component, keeps track of value and disabled state and fires events. */
const Match = MatchUntyped as typeof MatchUntyped & {
  Item: typeof MatchItem;
};

/**
 * A single item, whether a key or a value.
 *
 * To mark this as a key, pass the `name` prop (this will also create a hidden <input> with this name).
 * To mark this as a value, pass the `value` prop.
 *
 * Renders as a `<button>` element.
 */
Match.Item = MatchItem;

export { Match };

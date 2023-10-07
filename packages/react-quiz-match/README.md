# React Quiz Match

![npm version](https://img.shields.io/npm/v/@illright/react-feed)
![minzipped package size](https://img.shields.io/bundlephobia/minzip/@illright/react-feed.svg)

_Take a card from the left, connect it with the one from the right!_

A quiz component to match or connect items from one set with the items from another.

## Installation

```bash
npm install react-quiz-match
```

```bash
pnpm add react-quiz-match
```

Type definitions are built in 😎.

Minimum requirements for React? The one that has hooks (16.8+), that's it.

## Usage

It exports two things, a component `Match` and a hook `useMatchLines`. The `Match` component also contains a related component, `Match.Item`, to render out the items on either sides.

Props of `Match`:

```ts
interface MatchProps {
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
```

Props of `Match.Item`:

```ts
/** The presence of `value` marks the item as a value, the presence of a key marks it as a key. */
type MatchItemProps = (
  | { value: string; name?: never }
  | { name: string; value?: never }
) &
  Omit<ComponentProps<"button">, "name" | "value" | "onClick">;
```

### Example

Here's an example (see the [apps/example](./apps/example) folder for a complete one):

```tsx
<Match
  className="flex justify-between"
  onChange={console.log}
  disabled={disabled}
>
  <div className="flex flex-col gap-2">
    <Match.Item name="pizza-shop">Pizza shop</Match.Item>
    <Match.Item name="library">Library</Match.Item>
  </div>

  <MatchLines
    answers={
      answersShown ? { "pizza-shop": "user", library: "user" } : undefined
    }
  />

  <div className="flex flex-col gap-2">
    <Match.Item value="post">Post</Match.Item>
    <Match.Item value="user">User</Match.Item>
  </div>
</Match>
```

### Styling

The `<Match>` component renders nothing (in other words, it is a headless component). The `Match.Item` component renders a button

Therefore, styling with Tailwind CSS, plain CSS, or any other CSS-in-JS library is easy. Styling with styled-components will be supported in future versions.

## License

The source code of this project is distributed under the terms of the ISC license. It's like MIT, but better. [Click here](https://choosealicense.com/licenses/isc/) to learn what that means.

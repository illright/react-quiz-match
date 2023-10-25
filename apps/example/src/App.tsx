import "./App.css";
import {
  MatchLinesProvider,
  useLineConnectionPoint,
  useMatchItem,
  MatchManyToOne,
  useMatchLines,
} from "react-quiz-match";
import { type ReactNode, useState } from "react";

function App() {
  const [disabled, setDisabled] = useState(false);
  const [answersShown, setAnswersShown] = useState(false);

  return (
    <>
      <h1 className="mb-8">React Quiz Match</h1>
      <MatchManyToOne
        disabled={disabled}
        onChange={(ctx) => console.log(ctx.entries)}
      >
        <MatchLinesProvider>
          <div className="flex justify-between">
            <div className="flex flex-col gap-2">
              <MatchItem name="pizza-shop">Pizza shop</MatchItem>
              <MatchItem name="library">Library</MatchItem>
            </div>

            <MatchLines />

            <div className="flex flex-col gap-2">
              <MatchItem value="post">Post</MatchItem>
              <MatchItem value="user">User</MatchItem>
            </div>
          </div>
        </MatchLinesProvider>
      </MatchManyToOne>

      <button className="mt-4" onClick={() => setDisabled(!disabled)}>
        Turn {disabled ? "off" : "on"} disabled state
      </button>
      <button className="ml-1" onClick={() => setAnswersShown(!answersShown)}>
        Toggle answers
      </button>
    </>
  );
}

function MatchItem({
  name,
  value,
}: { children: ReactNode } & (
  | { name: string; value?: never }
  | { name?: never; value: string }
)) {
  const { toggle, isSelected, isDisabled } = useMatchItem(
    name !== undefined ? { name } : { value },
  );
  const ref = useLineConnectionPoint(
    name !== undefined ? "key" : "value",
    name ?? value,
  );

  return (
    <button
      ref={ref}
      disabled={isDisabled}
      onClick={toggle}
      className={isSelected ? "text-purple-500" : undefined}
    >
      {name ?? value}
    </button>
  );
}

function MatchLines() {
  const matchLines = useMatchLines();

  return (
    <div className="flex-1 min-w-[100px]">
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        {matchLines.map((line, index) => {
          const midWayX = (line.key.right[0] + line.value.left[0]) / 2;

          return (
            <path
              key={index}
              d={[
                `M ${line.key.right[0]} ${line.key.right[1]}`,
                `C ${midWayX} ${line.key.right[1]} ${midWayX} ${line.value.left[1]} ${line.value.left[0]}, ${line.value.left[1]}`,
              ].join(" ")}
              className={
                line.isCorrect === true
                  ? "stroke-green-600"
                  : line.isCorrect === false
                  ? "stroke-red-600"
                  : "stroke-gray-600"
              }
              fill="none"
              strokeWidth="2"
            />
          );
        })}
      </svg>
    </div>
  );
}

export default App;

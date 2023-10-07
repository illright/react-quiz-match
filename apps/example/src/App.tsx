import "./App.css";
import { Match, useMatchLines } from "react-quiz-match";
import { useState } from "react";

function App() {
  const [disabled, setDisabled] = useState(false);
  const [answersShown, setAnswersShown] = useState(false);

  return (
    <>
      <h1 className="mb-8">Quiz</h1>
      <Match onChange={console.log} disabled={disabled}>
        <div className="flex justify-between">
          <div className="flex flex-col gap-2">
            <Match.Item name="pizza-shop">Pizza shop</Match.Item>
            <Match.Item name="library">Library</Match.Item>
          </div>

          <MatchLines
            answers={
              answersShown
                ? { "pizza-shop": "user", library: "user" }
                : undefined
            }
          />

          <div className="flex flex-col gap-2">
            <Match.Item value="post">Post</Match.Item>
            <Match.Item value="user">User</Match.Item>
          </div>
        </div>
      </Match>

      <button className="mt-4" onClick={() => setDisabled(!disabled)}>
        Toggle disabled state
      </button>
      <button className="ml-1" onClick={() => setAnswersShown(!answersShown)}>
        Toggle answers
      </button>
    </>
  );
}

function MatchLines({
  answers,
}: {
  answers: Record<string, string> | undefined;
}) {
  const lines = useMatchLines(answers);

  return (
    <div className="flex-1 min-w-[100px]">
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        {lines.map((line, index) => {
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

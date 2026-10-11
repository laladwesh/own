import { guide } from "../guide/store";
import { explain } from "../constants/explain";

// A small pixel "?" that asks the guide to explain the part of the page it sits next to. Quiet in
// "engineer" view, clearer in "human" view (see guide.css).
const QUESTION = ["XXX.", "X..X", "...X", "..X.", ".X..", "....", ".X.."];

export const PixelQuestion = ({ size = 10 }) => (
  <svg viewBox="0 0 4 7" width={size} height={(size * 7) / 4} aria-hidden="true" shapeRendering="crispEdges">
    {QUESTION.flatMap((row, y) =>
      [...row].map((c, x) => (c === "X" ? <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" fill="currentColor" /> : null))
    )}
  </svg>
);

const ExplainButton = ({ id, dark = false }) => {
  if (!explain[id]) return null;
  return (
    <button
      type="button"
      className={`explain-btn${dark ? " explain-btn--dark" : ""}`}
      aria-label="What is this?"
      title="What is this?"
      onClick={(e) => {
        e.stopPropagation();
        guide.openExplain(id, e.currentTarget);
      }}
    >
      <PixelQuestion />
    </button>
  );
};

export default ExplainButton;

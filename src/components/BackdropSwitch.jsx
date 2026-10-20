import { setBg, useBg } from "../background/store";

// A small slide switch for the page background, like the toggle switches on a circuit board: a dark
// rounded body, a light slider, "BACKDROP" engraved above and the two positions on either side.
// Click, Space or Enter slides the knob (150ms) and switches the background.
const BackdropSwitch = () => {
  const paper = useBg() === "paper";
  return (
    <div className="bd">
      <span className="bd-title" aria-hidden="true">
        BACKDROP
      </span>
      <span className="bd-row">
        <span className={`bd-pos${paper ? "" : " bd-pos--on"}`} aria-hidden="true">
          GIT
        </span>
        <button
          type="button"
          role="switch"
          aria-checked={paper}
          aria-label="Background: git graph or paper"
          className="bd-body"
          onClick={() => setBg(paper ? "git" : "paper")}
        >
          <span className="bd-knob" />
          <span className="bd-tip" role="tooltip">
            change the background
          </span>
        </button>
        <span className={`bd-pos${paper ? " bd-pos--on" : ""}`} aria-hidden="true">
          PAPER
        </span>
      </span>
    </div>
  );
};

export default BackdropSwitch;

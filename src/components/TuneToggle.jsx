import { setTune, useTune } from "../view/store";

// "tune: engineer | human" in the navbar, on every page. Engineer is the site as it always was;
// human adds plain-English help. The choice is remembered for the session.
const TuneToggle = ({ className = "" }) => {
  const tune = useTune();
  return (
    <div className={`view-toggle ${className}`} role="group" aria-label="Tune the site">
      <span className="view-toggle-label" aria-hidden="true">
        tune:
      </span>
      {["engineer", "human"].map((v, i) => (
        <span key={v}>
          {i > 0 && (
            <span className="view-toggle-sep" aria-hidden="true">
              {" "}
              |{" "}
            </span>
          )}
          <button type="button" className="view-btn" aria-pressed={tune === v} onClick={() => setTune(v)}>
            {v}
          </button>
        </span>
      ))}
    </div>
  );
};

export default TuneToggle;

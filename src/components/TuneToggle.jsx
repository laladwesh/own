import { setTune, useTune } from "../view/store";

// "reading: technical | plain English" in the navbar, on every page. Technical is the site as it
// always was; plain English adds plain-English help. The choice is remembered for the session.
const TuneToggle = ({ className = "" }) => {
  const tune = useTune();
  return (
    <div className={`view-toggle ${className}`} role="group" aria-label="Reading mode: technical or plain English">
      <span className="view-toggle-label" aria-hidden="true">
        reading:
      </span>
      {[["engineer", "technical"], ["human", "plain English"]].map(([v, name], i) => (
        <span key={v}>
          {i > 0 && (
            <span className="view-toggle-sep" aria-hidden="true">
              {" "}
              |{" "}
            </span>
          )}
          <button type="button" className="view-btn" aria-pressed={tune === v} onClick={() => setTune(v)}>
            {name}
          </button>
        </span>
      ))}
    </div>
  );
};

export default TuneToggle;

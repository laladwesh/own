import { useHuman } from "../view/store";
import { Gloss } from "./Gloss";

// "human" view only: the whole story of an incident or a case study in three lines.
const SummaryBox = ({ summary }) => {
  const everyone = useHuman();
  if (!everyone || !summary || !(summary.happened || summary.did || summary.learned)) return null;
  const rows = [
    ["What happened", summary.happened],
    ["What I did", summary.did],
    ["What I learned", summary.learned],
  ].filter(([, t]) => t);
  return (
    <aside className="summary-box" aria-label="In plain words">
      <p className="summary-title">In plain words</p>
      <dl>
        {rows.map(([k, v]) => (
          <div key={k}>
            <dt>{k}</dt>
            <dd>
              <Gloss text={v} />
            </dd>
          </div>
        ))}
      </dl>
    </aside>
  );
};

export default SummaryBox;

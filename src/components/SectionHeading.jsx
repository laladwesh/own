import ExplainButton from "./ExplainButton";
import PencilNote from "./PencilNote";
import AtHome from "./AtHome";
import { Gloss } from "./Gloss";
import { atHome, explain } from "../constants/explain";
import { useHuman } from "../view/store";

// Every section opens the same way: a shell command in the accent colour, then the
// title as an inverted block. Pages use `as="h1"`. `explain` names the plain-English entry for
// this part of the page: a small "?" button always, and in human tuning a plain subtitle, a
// handwritten margin note and, for the main sections, one line "at home".
const SectionHeading = ({ command, title, id, as: Title = "h2", explain: key }) => {
  const human = useHuman();
  return (
    <header className="section-heading">
      <p className="sh-cmd">
        <Gloss text={command} />
      </p>
      <div className="sh-row">
        <Title className="sh-title" id={id}>
          {title}
        </Title>
        {key && <ExplainButton id={key} />}
      </div>
      {key && human && explain[key]?.sub && <p className="sh-sub">{explain[key].sub}</p>}
      {key && <AtHome text={atHome[key]} />}
      {key && <PencilNote id={key} />}
    </header>
  );
};

export default SectionHeading;

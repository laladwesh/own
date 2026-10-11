import { useHuman } from "../view/store";

// "how I'd explain this at home:" and one warm line, in human tuning only.
const AtHome = ({ text }) => {
  const human = useHuman();
  if (!human || !text) return null;
  return (
    <p className="at-home">
      <span className="at-home-label">how I&apos;d explain this at home:</span> {text}
    </p>
  );
};

export default AtHome;

// Every section opens the same way: a shell command in the accent colour, then the
// title as an inverted block.
const SectionHeading = ({ command, title, id }) => (
  <header className="section-heading">
    <p className="sh-cmd">{command}</p>
    <h2 className="sh-title" id={id}>
      {title}
    </h2>
  </header>
);

export default SectionHeading;

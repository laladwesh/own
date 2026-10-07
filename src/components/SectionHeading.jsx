// Every section opens the same way: a shell command in the accent colour, then the
// title as an inverted block. Pages use `as="h1"`.
const SectionHeading = ({ command, title, id, as: Title = "h2" }) => (
  <header className="section-heading">
    <p className="sh-cmd">{command}</p>
    <Title className="sh-title" id={id}>
      {title}
    </Title>
  </header>
);

export default SectionHeading;

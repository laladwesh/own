import { useInvite } from "../lib/follow";

// Wraps one follow invite so that no more than two show in the same viewport at once (the others go
// quiet with visibility: hidden, which keeps the layout where it is). Lower priority is more relevant.
const Invite = ({ priority = 3, as: Tag = "span", className = "", children, ...rest }) => {
  const [ref, quiet] = useInvite(priority);
  return (
    <Tag ref={ref} className={`${className}${quiet ? " invite-quiet" : ""}`.trim()} {...rest}>
      {children}
    </Tag>
  );
};

export default Invite;

import { useDeployText } from "../lib/deploy.js";

// The real last deploy, as the last line of the pretend `deploy`.
export const RealDeployLine = () => <span>the real one: {useDeployText()}</span>;

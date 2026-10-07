import { useDeployText } from "../lib/deploy";

// One line of text: the real last deploy (or, failing that, the build itself).
const DeployLine = () => <span>{useDeployText()}</span>;

export default DeployLine;

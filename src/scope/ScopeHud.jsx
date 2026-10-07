import { useEffect, useRef } from "react";
import { scope } from "./scopeStore";

// Scope readouts in the hero's four corners. RUN/STOP and the frequency/Vpp readout
// are updated straight from the scope loop.
const ScopeHud = () => {
  const run = useRef(null);
  const live = useRef(null);

  useEffect(() => {
    scope.hud = { run: run.current, live: live.current };
    return () => {
      scope.hud = {};
    };
  }, []);

  return (
    <>
      <span className="scope-hud scope-hud--tl">CH1 2.00V/div &nbsp; CH2 1.00V/div</span>
      <span ref={run} className="scope-hud scope-hud--tr">RUN</span>
      <span className="scope-hud scope-hud--bl">5.00ms/div</span>
      <span ref={live} className="scope-hud scope-hud--br">f=120Hz &nbsp; Vpp=2.4V</span>
    </>
  );
};

export default ScopeHud;

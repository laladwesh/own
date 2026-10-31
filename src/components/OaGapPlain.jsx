import AtHome from "./AtHome";
import PencilNote from "./PencilNote";
import { atHomeBySlug } from "../constants/explain";

// Plain-English mode only (both parts hide themselves in technical mode): one "at home" line and a
// margin note for the "Closing the gap" section of the OA Check case study.
const OaGapPlain = () => (
  <>
    <AtHome text={atHomeBySlug["oa-check-gap"]} />
    <div className="pencil-slot">
      <PencilNote id="oaGap" />
    </div>
  </>
);

export default OaGapPlain;

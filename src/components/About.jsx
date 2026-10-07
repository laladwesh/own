import { aboutMe } from "../constants";
import { aboutSpec as spec } from "../lib/data";
import { profilePic, profilePicWebp } from "../assets";
import SectionHeading from "./SectionHeading";
import { Switchable, Wide, yamlLines } from "./Manifest";

const About = () => (
  <section id="about" className="section">
    <SectionHeading command="$ cat avinash.yaml" title="About" />
    <div className="about-grid">
      <Switchable
        label="avinash.yaml"
        yaml={yamlLines(spec)}
        wide={
          <Wide
            rows={[
              ["Name", aboutMe.name],
              ["Role", spec.metadata.labels.role],
              ["Batch", "ece-27"],
              ["Institute", spec.spec.institute],
              ["Degree", spec.spec.degree],
              ["Current role", spec.spec.currentRole],
              ["Focus", "DevOps, full-stack, AI"],
              ["About", aboutMe.intro],
            ]}
          />
        }
      />
      <picture>
        <source srcSet={profilePicWebp} type="image/webp" />
        <img src={profilePic} alt="Avinash Gupta" width={180} height={180} className="about-photo" />
      </picture>
    </div>
  </section>
);

export default About;

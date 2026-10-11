import { educationList } from "../constants";
import { educationSpec as toObject } from "../lib/data";
import SectionHeading from "./SectionHeading";
import { Switchable, Wide, yamlLines } from "./Manifest";

const Education = () => (
  <section id="education" className="section">
    <SectionHeading command="$ cat education.yaml" title="Education" explain="education" />
    {educationList.map((e) => (
      <Switchable
      explain="education"
        key={e.id}
        label="education.yaml"
        yaml={yamlLines(toObject(e))}
        wide={
          <Wide
            rows={[
              ["Institute", e.title],
              ["Degree", e.degree],
              ["Major", e.content1.replace("Major: ", "")],
              ["Duration", e.duration],
            ]}
          />
        }
      />
    ))}
  </section>
);

export default Education;

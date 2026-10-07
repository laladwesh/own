import { aboutMe, socialMedia } from "../constants";
import { ports, serviceSpec as service } from "../lib/data";
import { now } from "../constants/now";
import SectionHeading from "./SectionHeading";
import { Switchable, Wide, yamlLines } from "./Manifest";

const find = (label) => socialMedia.find((s) => s.label === label)?.link;

const mailDraft = `${find("Email (Gmail)")}?subject=${encodeURIComponent("Let us work together")}`;

const Contact = () => (
  <section id="contact" className="section">
    <SectionHeading command="$ cat service.yaml" title="Contact" />
    <Switchable
      label="service.yaml"
      yaml={yamlLines(service)}
      wide={
        <>
          {now.lookingFor && <p className="contact-open">Open to opportunities: {now.lookingFor}.</p>}
          <Wide
          rows={ports.map(([name, url]) => [
            name,
            <a key={name} href={url} target={url.startsWith("mailto:") ? undefined : "_blank"} rel="noopener noreferrer">
              {url.replace(/^mailto:|^https?:\/\/(www\.)?/, "")}
            </a>,
          ])}
          />
        </>
      }
    />
    <p className="contact-cta">
      <span className="describe-cmd">$ hire avinash</span>
      <a className="btn-primary" href={mailDraft}>
        Email {aboutMe.name}
      </a>
    </p>
  </section>
);

export default Contact;

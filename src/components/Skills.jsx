import React from "react";
import { dockerfileLines as dockerfile, skillGroups } from "../lib/data";
import SectionHeading from "./SectionHeading";
import { Switchable } from "./Manifest";

const group = (key) => skillGroups.find((g) => g.key === key);

const List = ({ title, items }) => (
  <div className="skill-list">
    <h3 className="skill-list-title">{title}</h3>
    <ul>
      {items.map((it) => (
        <li key={it.id}>
          {React.createElement(it.icon, { className: "skill-icon", "aria-hidden": true })}
          {it.name}
        </li>
      ))}
    </ul>
  </div>
);

const Skills = () => (
  <section id="skills" className="section">
    <SectionHeading command="$ cat Dockerfile" title="Skills" />
    <Switchable
      label="Dockerfile"
      yaml={dockerfile}
      wide={
        <div className="skill-lists">
          <List title="Languages" items={group("languages").items} />
          <List title="Frameworks & libraries" items={group("frameworks").items} />
          <List title="In production" items={group("production").items} />
          <List title="Learning" items={group("learning").items} />
          <List title="Also used" items={group("other").items} />
        </div>
      }
    />
  </section>
);

export default Skills;

import { useEffect, useState } from "react";
import { agoText, loadStatus } from "../lib/status.js";
import { Cell, Muted } from "./ui.jsx";

// Live status in the terminal: the same numbers as the rack on the page.
const useServices = () => {
  const [state, setState] = useState({ services: null, offline: false });
  useEffect(() => {
    let live = true;
    loadStatus({ force: true })
      .then((services) => live && setState({ services, offline: false }))
      .catch(() => live && setState({ services: null, offline: true }));
    return () => {
      live = false;
    };
  }, []);
  return state;
};

export const StatusTable = () => {
  const { services, offline } = useServices();
  if (offline) return <Muted>monitoring offline</Muted>;
  if (!services) return <Muted>checking…</Muted>;
  return (
    <div className="term-pre">
      <div className="term-muted">
        <Cell w={18}>NAME</Cell>
        <Cell w={10}>STATUS</Cell>
        <Cell w={11}>LATENCY</Cell>
        CHECKED
      </div>
      {services.map((s) => (
        <div key={s.name}>
          <Cell w={18}>{s.name}</Cell>
          <Cell w={10}>{s.status}</Cell>
          <Cell w={11}>{s.latencyMs === null ? "-" : `${s.latencyMs} ms`}</Cell>
          {agoText(s.checkedAt)}
        </div>
      ))}
    </div>
  );
};

export const ServicesLine = () => {
  const { services, offline } = useServices();
  if (offline) return <span>services: monitoring offline</span>;
  if (!services) return <span>services: checking…</span>;
  const up = services.filter((s) => s.status === "up").length;
  return (
    <span>
      services: {up} of {services.length} up
    </span>
  );
};

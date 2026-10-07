import { Children, isValidElement } from "react";
import { Cell } from "./ui.jsx";

const BLOCK = new Set(["div", "p", "li", "pre", "ul", "ol"]);

// Plain text of a rendered output node. Pipes (`ls | wc -l`) feed this to the next command.
const toText = (n) => {
  if (n === null || n === undefined || typeof n === "boolean") return "";
  if (typeof n === "string" || typeof n === "number") return String(n);
  if (Array.isArray(n)) return n.map(toText).join("");
  if (!isValidElement(n)) return "";
  const p = n.props;
  if (Array.isArray(p.lines)) return p.lines.map(toText).join("\n"); // Lines / Reveal
  if (n.type === Cell) return `${toText(p.children)}  `;
  if (typeof n.type === "string") {
    if (n.type === "div" && /term-ls/.test(p.className || "")) {
      return Children.toArray(p.children).map(toText).join("\n");
    }
    const inner = toText(p.children);
    return BLOCK.has(n.type) ? `${inner.replace(/\n+$/, "")}\n` : inner;
  }
  return toText(p.children);
};

export const nodeToText = (node) => toText(node).replace(/ /g, " ").replace(/\n+$/, "");

export const countLines = (node) => {
  const t = nodeToText(node);
  return t ? t.split("\n").length : 0;
};

// A very small markdown -> HTML for the prerendered fallback (what a crawler without JavaScript
// reads). Headings, paragraphs, lists, code blocks, bold, inline code and links. Not for the
// app itself: the app renders markdown with react-markdown.
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const inline = (text) =>
  esc(text)
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, label, href) => `<a href="${href}">${label}</a>`)
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/~~([^~]+)~~/g, "<s>$1</s>");

export const mdToHtml = (md, { baseLevel = 2 } = {}) => {
  const out = [];
  let list = null;
  let para = [];
  let code = null;
  const flushPara = () => {
    if (para.length) out.push(`<p>${inline(para.join(" "))}</p>`);
    para = [];
  };
  const flushList = () => {
    if (list) out.push(`<ul>${list.map((li) => `<li>${inline(li)}</li>`).join("")}</ul>`);
    list = null;
  };
  for (const line of md.split("\n")) {
    if (line.trim().startsWith("```")) {
      if (code) {
        out.push(`<pre>${esc(code.join("\n"))}</pre>`);
        code = null;
      } else {
        flushPara();
        flushList();
        code = [];
      }
      continue;
    }
    if (code) {
      code.push(line);
      continue;
    }
    const h = /^(#{1,6})\s+(.*)$/.exec(line);
    const li = /^\s*(?:[-*]|\d+\.)\s+(.*)$/.exec(line);
    if (h) {
      flushPara();
      flushList();
      const level = Math.min(6, Math.max(baseLevel, h[1].length + baseLevel - 1));
      out.push(`<h${level}>${inline(h[2])}</h${level}>`);
    } else if (li) {
      flushPara();
      (list ??= []).push(li[1]);
    } else if (!line.trim() || /^\[DIAGRAM:/.test(line.trim())) {
      flushPara();
      flushList();
    } else {
      flushList();
      para.push(line.trim());
    }
  }
  flushPara();
  flushList();
  if (code) out.push(`<pre>${esc(code.join("\n"))}</pre>`);
  return out.join("\n");
};

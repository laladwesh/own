import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// Markdown for case studies and notes. Code blocks are small dark terminal devices, like the
// bad command in the incident reports.
const CodeDevice = ({ children }) => {
  const code = children?.props ?? {};
  const lang = (code.className ?? "").replace("language-", "");
  const text = String(code.children ?? "").replace(/\n$/, "");
  return (
    <div className="inc-term cs-code" role="group" aria-label={`${lang || "code"} example`}>
      <div className="inc-term-bar">
        <span className="inc-term-dot" aria-hidden="true" />
        <span className="inc-term-dot" aria-hidden="true" />
        <span className="inc-term-dot" aria-hidden="true" />
        {lang && <span className="cs-code-lang">{lang}</span>}
      </div>
      <div className="inc-term-body">
        <pre className="cs-pre">{text}</pre>
      </div>
    </div>
  );
};

const components = {
  pre: CodeDevice,
  code: ({ className, children }) => <code className={className ?? "inc-code"}>{children}</code>,
  a: ({ href, children }) => (
    <a href={href} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  ),
};

export const Md = ({ text }) => (
  <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
    {text}
  </ReactMarkdown>
);

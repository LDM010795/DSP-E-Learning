import React from "react";
import { ContentCodeProps } from "./types";
import Prism from "prismjs";
// Prism-Sprachen laden (für korrektes Highlighting)
import "prismjs/components/prism-sql";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-python";
import "prismjs/components/prism-css";
import "prismjs/components/prism-markup"; // HTML/XML
import "prismjs/components/prism-bash";
import "prismjs/components/prism-json";
// Dunkles Prism-Theme (ähnlich zum Screenshot)
// Orange-lastiges Dark-Theme (wenn verfügbar)
import "prismjs/themes/prism-tomorrow.css";

const LANG_MAP: Record<string, string> = {
  js: "javascript",
  ts: "typescript",
  py: "python",
  html: "markup",
  xml: "markup",
};

const normalizeLang = (lang?: string) => {
  const l = (lang || "").toLowerCase();
  return LANG_MAP[l] || l || "sql";
};

const ContentCode: React.FC<ContentCodeProps> = ({
  text,
  language,
  filename,
  lineNumbers = false,
}) => {
  const [copied, setCopied] = React.useState(false);

  const cleanText = React.useMemo(
    () => text.replace(/^(sql\$|js\$|ts\$|py\$|css\$|html\$)\s*/i, "").trim(),
    [text]
  );

  const prismLang = normalizeLang(language);
  const codeRef = React.useRef<HTMLElement>(null);

  React.useEffect(() => {
    if (codeRef.current) Prism.highlightElement(codeRef.current);
  }, [cleanText, prismLang]);

  const label = filename || prismLang.toUpperCase();

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(cleanText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      /* noop */
    }
  };

  return (
    <figure className="not-prose my-4 overflow-hidden rounded-xl border border-neutral-800 bg-neutral-800 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 border-b border-[#2b3643] bg-[#2b3643] px-3 py-2 text-xs text-slate-200">
        <div className="flex items-center gap-2">
          <span className="rounded bg-slate-700/70 px-2 py-1 font-medium tracking-wide">
            {label}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onCopy}
            className="rounded px-2 py-1 transition hover:bg-slate-700/60"
            aria-label="Code kopieren"
          >
            {copied ? "Kopiert" : "Kopieren"}
          </button>
        </div>
      </div>

      {/* Code */}
      <div className="bg-neutral-800">
        <pre
          className={[
            "m-0 max-h-[60vh] overflow-auto p-4 text-sm leading-6 !bg-transparent !shadow-none",
            lineNumbers ? "line-numbers" : "",
            "whitespace-pre",
            "scrollbar-thin scrollbar-track-neutral-900 scrollbar-thumb-neutral-700",
          ].join(" ")}
        >
          <code
            ref={codeRef}
            className={`language-${prismLang} block font-mono !bg-transparent !shadow-none !m-0 !p-0`}
          >
            {cleanText}
          </code>
        </pre>
      </div>
    </figure>
  );
};

export default ContentCode;

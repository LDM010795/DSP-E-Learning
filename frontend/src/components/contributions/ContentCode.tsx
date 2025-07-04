import React, { useState, useEffect } from "react";
import Prism from "prismjs";

// Importiere die gewünschten Sprachen und Themes
import "prismjs/themes/prism-tomorrow.css"; // Dunkles Theme
import "prismjs/components/prism-sql";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-python";
import "prismjs/components/prism-java";
import "prismjs/components/prism-csharp";
import "prismjs/components/prism-css";
import "prismjs/components/prism-markup"; // Für HTML
import "prismjs/components/prism-json";

interface ContentCodeProps {
  content: string;
  language?: string;
  className?: string;
}

const ContentCode: React.FC<ContentCodeProps> = ({
  content,
  language = "",
  className = "",
}) => {
  const [copied, setCopied] = useState(false);
  const [highlightedCode, setHighlightedCode] = useState("");

  // Sprach-Mapping für Prism
  const languageMap: { [key: string]: string } = {
    sql: "sql",
    javascript: "javascript",
    js: "javascript",
    typescript: "typescript",
    ts: "typescript",
    python: "python",
    py: "python",
    java: "java",
    csharp: "csharp",
    "c#": "csharp",
    css: "css",
    html: "markup", // Prism verwendet 'markup' für HTML
    json: "json",
  };

  const prismLanguage = languageMap[language.toLowerCase()] || "sql";

  useEffect(() => {
    // Syntax-Highlighting anwenden
    try {
      const grammar = Prism.languages[prismLanguage];
      if (grammar) {
        const highlighted = Prism.highlight(content, grammar, prismLanguage);
        setHighlightedCode(highlighted);
      } else {
        // Fallback falls Sprache nicht verfügbar
        setHighlightedCode(content);
      }
    } catch (error) {
      console.warn("Prism highlighting failed:", error);
      setHighlightedCode(content); // Fallback auf unformattierten Text
    }
  }, [content, prismLanguage]);

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy code:", err);
    }
  };

  // Sprach-Label für Anzeige
  const getLanguageLabel = (lang: string): string => {
    const labels: { [key: string]: string } = {
      sql: "SQL",
      javascript: "JavaScript",
      js: "JavaScript",
      typescript: "TypeScript",
      ts: "TypeScript",
      python: "Python",
      py: "Python",
      java: "Java",
      csharp: "C#",
      "c#": "C#",
      css: "CSS",
      html: "HTML",
      json: "JSON",
    };
    return labels[lang.toLowerCase()] || lang.toUpperCase();
  };

  return (
    <div className={`bg-gray-900 rounded-lg overflow-hidden my-4 ${className}`}>
      {/* Header mit Sprache und Copy Button */}
      <div className="flex justify-between items-center px-4 py-2 bg-gray-800 border-b border-gray-700">
        <span className="text-xs text-gray-300 uppercase font-medium tracking-wide">
          {getLanguageLabel(language)}
        </span>
        <button
          onClick={handleCopyCode}
          className="flex items-center gap-2 text-xs text-gray-300 hover:text-white transition-colors duration-200 px-2 py-1 rounded hover:bg-gray-700"
          aria-label="Code kopieren"
        >
          {copied ? (
            <>
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              Kopiert!
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M8 2a1 1 0 000 2h2a1 1 0 100-2H8z" />
                <path d="M3 5a2 2 0 012-2 3 3 0 003 3h6a3 3 0 003-3 2 2 0 012 2v6h-4.586l1.293-1.293a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L14.586 13H19v3a2 2 0 01-2 2H5a2 2 0 01-2-2V5zM15 11.586V9H9v2.586l3-3 3 3z" />
              </svg>
              Kopieren
            </>
          )}
        </button>
      </div>

      {/* Code Content mit Prism Syntax-Highlighting */}
      <div className="p-4 overflow-x-auto">
        <pre className="text-sm leading-relaxed">
          <code
            className={`language-${prismLanguage}`}
            dangerouslySetInnerHTML={{ __html: highlightedCode }}
          />
        </pre>
      </div>
    </div>
  );
};

export default ContentCode;

import React from "react";
import { ContentTextProps } from "./types";
import { renderLink } from "./linkUtils";
import { sectionizeFallback } from "./utils";

const ContentText: React.FC<ContentTextProps> = ({ text }) => {
  // Debug: Text-Block Inhalt loggen
  console.log("📄 ContentText received:", { text });

  // Bereinige Text (entferne Titel-Marker und fälschliche "Text$"-Tags)
  const cleanText = text
    .replace(/Titel[23]?\$\s*/g, "")
    .replace(/Text\$\s*/gi, "")
    .trim();

  // Verarbeite Text-Highlighting und Links: ==text== → <mark>text</mark> und URLs → Links
  const processTextContent = (textContent: string) => {
    // Erste Stufe: URLs extrahieren
    const urlRegex = /(https?:\/\/[^\s,;]+)/g;
    const urlParts = textContent.split(urlRegex);

    return urlParts.map((urlPart, urlIndex) => {
      // Prüfe ob dieser Teil eine URL ist
      const isUrl = /^https?:\/\//.test(urlPart);

      if (isUrl) {
        return renderLink(urlPart, `url-${urlIndex}`);
      }

      // Zweite Stufe: Highlighting in Nicht-URL-Text verarbeiten
      const highlightParts = urlPart.split(/(==.*?==)/g);
      return highlightParts.map((highlightPart, highlightIndex) => {
        if (highlightPart.startsWith("==") && highlightPart.endsWith("==")) {
          const highlightedText = highlightPart.slice(2, -2); // Entferne == am Anfang und Ende
          return (
            <mark
              key={`highlight-${urlIndex}-${highlightIndex}`}
              className="inline-block align-baseline whitespace-nowrap px-1 py-px rounded bg-slate-100 text-inherit border border-slate-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] leading-[inherit]"
            >
              {highlightedText}
            </mark>
          );
        }
        return (
          <span key={`text-${urlIndex}-${highlightIndex}`}>
            {highlightPart}
          </span>
        );
      });
    });
  };

  // Unterstützt mehrzeilige Texte (durch \n\n getrennte Paragraphen)
  // Fallback: Falls ein Absatz extrem lang ist, automatisch segmentieren (Backup gegen "Textwände")
  const rawParas = cleanText.split("\n\n").filter((p) => p.trim().length > 0);
  const paragraphs = rawParas.flatMap((p) => sectionizeFallback(p, 150));

  if (paragraphs.length === 1) {
    return (
      <p
        data-bm-anchor="true"
        className="text-gray-800 leading-7 mb-4 text-pretty"
      >
        {processTextContent(cleanText)}
      </p>
    );
  }

  return (
    <div className="mb-4">
      {paragraphs.map((paragraph, index) => (
        <p
          key={index}
          data-bm-anchor="true"
          className="text-gray-800 leading-7 mb-3 last:mb-0 text-pretty"
        >
          {processTextContent(paragraph.trim())}
        </p>
      ))}
    </div>
  );
};

export default ContentText;

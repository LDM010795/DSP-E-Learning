import React from "react";
import { ContentSourcesProps } from "./types";
import { processLinksInText } from "./linkUtils";

const ContentSources: React.FC<ContentSourcesProps> = ({ text, items }) => {
  // Parse sources from text (legacy format - falls back to old behavior)
  const parseSources = (sourceText: string): string[] => {
    return sourceText
      .split(/[\n;]/)
      .map((source) => source.trim())
      .filter((source) => source.length > 0);
  };

  // Funktion zum Rendern einer einzelnen Quelle mit Link-Erkennung
  const renderSource = (source: string, index: number) => {
    // Erkenne verschiedene Formate:
    // 1. "Titel, URL"
    // 2. "Titel: URL"
    // 3. "Titel - URL"
    // 4. "Titel URL" (URL am Ende)
    // 5. Nur URL (dann URL als Titel verwenden)

    const urlRegex = /(https?:\/\/[^\s,;]+)/;
    const urlMatch = source.match(urlRegex);

    if (urlMatch && urlMatch.index !== undefined) {
      const url = urlMatch[0];
      const beforeUrl = source.substring(0, urlMatch.index).trim();
      const afterUrl = source.substring(urlMatch.index + url.length).trim();

      // Bereinige Titel (entferne Trennzeichen am Ende)
      let title = beforeUrl.replace(/[,:;-]\s*$/, "").trim();

      // Wenn kein Titel vor der URL, versuche nach der URL zu schauen
      if (!title && afterUrl) {
        title = afterUrl.replace(/^[,:;-]\s*/, "").trim();
      }

      // Fallback: Wenn immer noch kein Titel, verwende Domain als Titel
      if (!title) {
        try {
          const urlObj = new URL(url);
          title = urlObj.hostname;
        } catch {
          title = "Externe Quelle";
        }
      }

      return (
        <li key={index} className="leading-relaxed break-words">
          <span className="font-medium text-gray-900 mr-2">{title}:</span>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 underline hover:no-underline transition-colors duration-200 text-sm break-words"
            title={url}
          >
            {url.length > 50 ? `${url.substring(0, 47)}...` : url}
          </a>
        </li>
      );
    }

    // Kein Link gefunden - normaler Text mit automatischer Link-Erkennung
    return (
      <li key={index} className="leading-relaxed break-words">
        {processLinksInText(source)}
      </li>
    );
  };

  // Bestimme die Quellen: Verwende items falls vorhanden, sonst parse text
  const sources = items || (text ? parseSources(text) : []);

  if (sources.length === 0) {
    return null; // Keine Quellen vorhanden
  }

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 my-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-3">Quellen</h3>
      <ul className="list-disc pl-5 space-y-2 text-gray-700">
        {sources.map((source, index) => renderSource(source, index))}
      </ul>
    </div>
  );
};

export default ContentSources;

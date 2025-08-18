import React from "react";
import type { JsonContentBlock } from "./types";
import {
  ContentTitle,
  ContentText,
  ContentImage,
  ContentCode,
  ContentImportant,
  ContentNote,
  ContentTip,
  ContentHint,
  ContentList,
  ContentLearningObjectives,
  ContentTableOfContents,
  ContentSources,
  ContentMetadata,
} from ".";
import ContentTable from "./ContentTable";

interface ContentRendererProps {
  content: JsonContentBlock[];
  imageMap?: Record<string, string>; // image_name -> cloud_url
}

const ContentRenderer: React.FC<ContentRendererProps> = ({
  content,
  imageMap,
}) => {
  // Debug: Content-Array loggen
  console.log("🔍 ContentRenderer: Received content array:", content);
  console.log("🔍 ContentRenderer: Content length:", content?.length);
  console.log("🔍 ContentRenderer: ImageMap:", imageMap);

  const skipIndices = new Set<number>();

  const renderBlock = (block: JsonContentBlock, index: number) => {
    if (skipIndices.has(index)) {
      return null;
    }
    console.log(`🎯 Rendering block ${index}:`, block);

    const { type, ...props } = block;
    console.log(`🏷️ Block ${index} - Type: "${type}", Props:`, props);

    // Robustere Tag-Map (Backwards-compat): unterstützt alternative/legacy-Namen
    switch (String(type).toLowerCase()) {
      case "title":
        return (
          <ContentTitle
            key={index}
            text={props.text || ""}
            level={props.level || 1}
          />
        );

      case "title2":
        return <ContentTitle key={index} text={props.text || ""} level={2} />;

      case "title3":
        return <ContentTitle key={index} text={props.text || ""} level={3} />;

      case "text": {
        // WICHTIG: JSON nutzt "paragraphs" Array, nicht "text" String!
        const textContent = props.paragraphs
          ? props.paragraphs.join("\n\n")
          : props.text || "";

        // Spezielle Behandlung für Titel-Marker in Text-Blöcken
        // Wenn Text nur "Titel2$ ... Titel2$" enthält, als Title rendern
        const titleMatch = textContent.match(
          /^Titel([23]?)\$\s*(.*?)\s*Titel[23]?\$$/
        );
        if (titleMatch) {
          const level = titleMatch[1] ? parseInt(titleMatch[1]) : 2;
          const titleText = titleMatch[2].trim();
          console.log(
            `🔄 Converting text to title: level=${level}, text="${titleText}"`
          );
          return <ContentTitle key={index} text={titleText} level={level} />;
        }

        return <ContentText key={index} text={textContent} />;
      }

      case "image": {
        // Falls nur ein Bildname mitgegeben wird, versuche via imageMap auf echte Cloud-URL zu mappen
        const src = props.src || "";
        let resolvedSrc = src;
        if (imageMap && src && !/^https?:\/\//i.test(src)) {
          // Normalisierungen für häufige Inkonsistenzen (Leerzeichen/Underscores)
          const candidates = [
            src,
            src.replace(/\s+/g, ""),
            src.replace(/\s+/g, "_"),
          ];
          for (const name of candidates) {
            if (imageMap[name]) {
              resolvedSrc = imageMap[name] as string;
              break;
            }
          }
        }

        // Versuche, einen nachfolgenden Source-/Quelle-Text direkt unter dem Bild zu platzieren
        const nextBlock = content[index + 1] as JsonContentBlock | undefined;
        const isNextText =
          nextBlock && String(nextBlock.type).toLowerCase() === "text";
        let sourceLine: string | null = null;
        if (isNextText) {
          const nb: { paragraphs?: string[]; text?: string } =
            nextBlock as unknown as {
              paragraphs?: string[];
              text?: string;
            };
          const nextText = nb.paragraphs
            ? nb.paragraphs.join("\n\n")
            : nb.text || "";
          const m = nextText
            .trim()
            .match(/^\s*(?:source|quelle)\s*[:-]\s*(.*)$/i);
          if (m) {
            sourceLine = (m[0] || nextText).trim();
          }
        }

        if (sourceLine) {
          // Unterdrücke den folgenden Text-Block (Source) und rendere ihn als kleine Caption
          skipIndices.add(index + 1);
          return (
            <React.Fragment key={`image-${index}`}>
              <div className="flex justify-center">
                <div className="inline-block max-w-[820px] align-top">
                  <ContentImage
                    src={resolvedSrc}
                    alt={props.alt || ""}
                    caption={props.caption}
                  />
                  <p className="mt-1 text-xs text-gray-500 text-left">
                    {sourceLine}
                  </p>
                </div>
              </div>
            </React.Fragment>
          );
        }

        return (
          <ContentImage
            key={index}
            src={resolvedSrc}
            alt={props.alt || ""}
            caption={props.caption}
          />
        );
      }

      case "code": {
        // WICHTIG: JSON nutzt "code" Property, nicht "text"!
        const codeContent = props.code || props.text || "";

        // Spezielle Behandlung: Manche Titel sind fälschlicherweise als code-Blöcke markiert
        // Prüfe ob Code-Block nur Titel-Marker enthält
        const codeTitleMatch = codeContent.match(
          /^\s*Titel([23]?)\$\s*(.*?)\s*Titel[23]?\$\s*$/
        );
        if (codeTitleMatch) {
          const level = codeTitleMatch[1] ? parseInt(codeTitleMatch[1]) : 2;
          const titleText = codeTitleMatch[2].trim();
          console.log(
            `🔄 Converting code to title: level=${level}, text="${titleText}"`
          );
          return <ContentTitle key={index} text={titleText} level={level} />;
        }

        // Prüfe auch ob es ein leerer Code-Block mit nur Titel-Marker ist
        if (codeContent.trim().match(/^Titel[23]?\$\s*$/)) {
          console.log(
            `🔄 Ignoriere leeren Code-Titel-Marker: "${codeContent.trim()}"`
          );
          return null; // Rendere nichts
        }

        return (
          <ContentCode
            key={index}
            text={codeContent}
            language={props.language || ""}
          />
        );
      }
      case "important":
        return <ContentImportant key={index} text={props.text || ""} />;

      case "note":
        return <ContentNote key={index} text={props.text || ""} />;

      case "tip":
        return <ContentTip key={index} text={props.text || ""} />;

      case "hint":
        return <ContentHint key={index} text={props.text || ""} />;

      case "list": {
        // Verarbeite List-Block - kann auch Titel enthalten
        const listItems = props.items || [];

        // Prüfe ob erstes Item ein Titel ist
        if (listItems.length > 0) {
          const firstItem = listItems[0];
          const titleMatch = firstItem.match(/^Titel([23]?)\$/);
          if (titleMatch) {
            const level = titleMatch[1] ? parseInt(titleMatch[1]) : 3;
            // Wenn nur "Titel3$" allein steht, ignoriere es
            if (firstItem.trim() === `Titel${titleMatch[1] || ""}$`) {
              console.log(
                `🔄 List: Ignoriere leeren Titel-Marker: "${firstItem}"`
              );
              return <ContentList key={index} items={listItems.slice(1)} />;
            } else {
              // Titel mit Inhalt
              const titleText = firstItem
                .replace(/^Titel[23]?\$\s*/, "")
                .trim();
              console.log(
                `🔄 List mit Titel gefunden: level=${level}, title="${titleText}"`
              );
              return (
                <React.Fragment key={index}>
                  <ContentTitle text={titleText} level={level} />
                  <ContentList items={listItems.slice(1)} />
                </React.Fragment>
              );
            }
          }
        }

        return <ContentList key={index} items={listItems} />;
      }

      case "learning_objectives":
      case "learningobjectives":
      case "lernziele": {
        // Verarbeite Learning Objectives - können auch Titel enthalten
        const objItems = props.items || [];

        // Prüfe ob erstes Item ein Titel ist und filtere leere Titel-Marker
        const filteredItems = objItems.filter((item) => {
          const trimmed = item.trim();
          return (
            trimmed !== "Titel2$" &&
            trimmed !== "Titel3$" &&
            trimmed !== "Titel$"
          );
        });

        return <ContentLearningObjectives key={index} items={filteredItems} />;
      }

      case "table_of_contents":
      case "tableofcontents":
      case "inhalt":
        return <ContentTableOfContents key={index} items={props.items || []} />;

      case "table": {
        // Erwartet: { type: "table", headers: string[], rows: (string|number|null)[][] }
        const tableBlock = props as JsonContentBlock;
        const safeHeaders: string[] = Array.isArray(tableBlock.headers)
          ? (tableBlock.headers as string[])
          : [];
        const safeRows: (string | number | null)[][] = Array.isArray(
          tableBlock.rows
        )
          ? (tableBlock.rows as (string | number | null)[][])
          : [];
        if (!safeHeaders.length) {
          return null;
        }
        return (
          <ContentTable key={index} headers={safeHeaders} rows={safeRows} />
        );
      }

      case "sources":
      case "quellen": {
        // Verarbeite Sources-Block - kann auch Titel enthalten oder NUR ein Titel sein
        const sourcesText = props.text || "";

        // 1. Prüfe ob Sources-Block NUR ein Titel-Marker ist (fälschlich als Sources markiert)
        const onlyTitleMatch = sourcesText.match(
          /^\s*Titel([23]?)\$\s*(.*?)\s*Titel[23]?\$\s*$/
        );
        if (onlyTitleMatch) {
          const level = onlyTitleMatch[1] ? parseInt(onlyTitleMatch[1]) : 2;
          const titleText = onlyTitleMatch[2].trim();
          console.log(
            `🔄 Converting sources to title: level=${level}, text="${titleText}"`
          );
          return <ContentTitle key={index} text={titleText} level={level} />;
        }

        // 2. Prüfe ob es ein leerer Sources-Block mit nur Titel-Marker ist
        if (sourcesText.trim().match(/^Titel[23]?\$\s*$/)) {
          console.log(
            `🔄 Ignoriere leeren Sources-Titel-Marker: "${sourcesText.trim()}"`
          );
          return null; // Rendere nichts
        }

        // 3. Wenn Sources-Block einen Titel enthält (Titel2$ ... Titel2$), separiere ihn
        const sourceTitleMatch = sourcesText.match(
          /^(Titel[23]?\$\s*.*?\s*Titel[23]?\$)(.*)/s
        );
        if (sourceTitleMatch) {
          const titlePart = sourceTitleMatch[1];
          const contentPart = sourceTitleMatch[2].trim();

          // Extrahiere Titel
          const titleTextMatch = titlePart.match(
            /Titel([23]?)\$\s*(.*?)\s*Titel[23]?\$/
          );
          if (titleTextMatch) {
            const level = titleTextMatch[1] ? parseInt(titleTextMatch[1]) : 2;
            const titleText = titleTextMatch[2].trim();

            console.log(
              `🔄 Sources mit Titel gefunden: level=${level}, title="${titleText}", content="${contentPart}"`
            );

            return (
              <React.Fragment key={index}>
                <ContentTitle text={titleText} level={level} />
                {contentPart && <ContentSources text={contentPart} />}
              </React.Fragment>
            );
          }
        }

        return (
          <ContentSources key={index} text={sourcesText} items={props.items} />
        );
      }

      case "metadata":
      case "meta":
        return (
          <ContentMetadata
            key={index}
            title={props.title || ""}
            author={props.author || ""}
            date={props.date || ""}
            tags={props.tags || []}
          />
        );

      default:
        console.warn(`❌ Unknown content type: "${type}"`, block);
        return (
          <div
            key={index}
            className="my-4 p-4 bg-red-50 border border-red-200 rounded-lg"
          >
            <p className="text-red-600">Unbekannter Content-Typ: "{type}"</p>
            <p className="text-xs text-gray-500 mt-1">
              Verfügbare Typen: title, title2, title3, text, image, code,
              important, note, tip, hint, list, learning_objectives,
              table_of_contents, sources, metadata
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Für type="{type}" verfügbare Props:{" "}
              {Object.keys(props).join(", ")}
            </p>
            <pre className="text-xs text-gray-500 mt-2">
              {JSON.stringify(block, null, 2)}
            </pre>
          </div>
        );
    }
  };

  return (
    <div className="space-y-4">
      {content.map((block, index) => renderBlock(block, index))}
    </div>
  );
};

export default ContentRenderer;

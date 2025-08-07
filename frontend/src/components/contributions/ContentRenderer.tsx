import React from "react";
import { JsonContentBlock } from "./types";
import ContentTitle from "./ContentTitle";
import ContentText from "./ContentText";
import ContentImage from "./ContentImage";
import ContentCode from "./ContentCode";
import ContentImportant from "./ContentImportant";
import ContentNote from "./ContentNote";
import ContentTip from "./ContentTip";
import ContentHint from "./ContentHint";
import ContentList from "./ContentList";
import ContentLearningObjectives from "./ContentLearningObjectives";
import ContentTableOfContents from "./ContentTableOfContents";
import ContentSources from "./ContentSources";
import ContentMetadata from "./ContentMetadata";

interface ContentRendererProps {
  content: JsonContentBlock[];
}

const ContentRenderer: React.FC<ContentRendererProps> = ({ content }) => {
  const renderBlock = (block: JsonContentBlock, index: number) => {
    const { type, ...props } = block;

    switch (type) {
      case "title":
        return (
          <ContentTitle
            key={index}
            text={props.text || ""}
            level={props.level || 1}
          />
        );

      case "text":
        return <ContentText key={index} text={props.text || ""} />;

      case "image":
        return (
          <ContentImage
            key={index}
            src={props.src || ""}
            alt={props.alt || ""}
            caption={props.caption}
          />
        );

      case "code":
        return (
          <ContentCode
            key={index}
            text={props.text || ""}
            language={props.language || ""}
          />
        );

      case "important":
        return <ContentImportant key={index} text={props.text || ""} />;

      case "note":
        return <ContentNote key={index} text={props.text || ""} />;

      case "tip":
        return <ContentTip key={index} text={props.text || ""} />;

      case "hint":
        return <ContentHint key={index} text={props.text || ""} />;

      case "list":
        return <ContentList key={index} items={props.items || []} />;

      case "learning_objectives":
        return (
          <ContentLearningObjectives key={index} items={props.items || []} />
        );

      case "table_of_contents":
        return <ContentTableOfContents key={index} items={props.items || []} />;

      case "sources":
        return <ContentSources key={index} text={props.text || ""} />;

      case "metadata":
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
        console.warn(`Unbekannter Content-Typ: ${type}`);
        return (
          <div key={index} className="text-red-500">
            Unbekannter Typ: {type}
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

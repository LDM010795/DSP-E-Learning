import React from "react";
import ContentHint from "./ContentHint";
import ContentImportant from "./ContentImportant";
import ContentCode from "./ContentCode";
import ContentImage from "./ContentImage";
import ContentTitle from "./ContentTitle";

import ContentText from "./ContentText";
import ContentNote from "./ContentNote";
import ContentTip from "./ContentTip";
import ContentList from "./ContentList";
import ContentMetadata from "./ContentMetadata";
import ContentLearningObjectives from "./ContentLearningObjectives";
import ContentTableOfContents from "./ContentTableOfContents";
import ContentSources from "./ContentSources";

interface ContentBlockData {
  content?: string;
  title?: string;
  level?: 1 | 2 | 3;
  language?: string;
  src?: string;
  alt?: string;
  caption?: string;
  author?: string;
  version?: string;
  date?: string;
  objectives?: string[];
  items?: Array<{ title: string; level?: number }>;
  listItems?: string[];
  sources?: Array<{ title: string; url?: string }>;
}

export interface ContentBlock {
  type:
    | "hint"
    | "important"
    | "code"
    | "image"
    | "title"
    | "text"
    | "note"
    | "tip"
    | "list"
    | "metadata"
    | "learningObjectives"
    | "tableOfContents"
    | "sources";
  data: ContentBlockData;
}

interface ContentRendererProps {
  content: ContentBlock[];
  className?: string;
}

const ContentRenderer: React.FC<ContentRendererProps> = ({
  content,
  className = "",
}) => {
  const renderBlock = (block: ContentBlock, index: number) => {
    const key = `content-block-${index}`;

    switch (block.type) {
      case "hint":
        return <ContentHint key={key} content={block.data.content || ""} />;

      case "important":
        return (
          <ContentImportant key={key} content={block.data.content || ""} />
        );

      case "code":
        return (
          <ContentCode
            key={key}
            content={block.data.content || ""}
            language={block.data.language}
          />
        );

      case "image":
        return (
          <ContentImage
            key={key}
            src={block.data.src || ""}
            alt={block.data.alt}
            caption={block.data.caption}
          />
        );

      case "title":
        return (
          <ContentTitle
            key={key}
            content={block.data.content || ""}
            level={block.data.level}
          />
        );

      case "text":
        return <ContentText key={key} content={block.data.content || ""} />;

      case "note":
        return <ContentNote key={key} content={block.data.content || ""} />;

      case "tip":
        return <ContentTip key={key} content={block.data.content || ""} />;

      case "list":
        return <ContentList key={key} items={block.data.listItems || []} />;

      case "metadata":
        return (
          <ContentMetadata
            key={key}
            author={block.data.author}
            version={block.data.version}
            date={block.data.date}
          />
        );

      case "learningObjectives":
        return (
          <ContentLearningObjectives
            key={key}
            objectives={block.data.objectives || []}
          />
        );

      case "tableOfContents":
        return (
          <ContentTableOfContents key={key} items={block.data.items || []} />
        );

      case "sources":
        return <ContentSources key={key} sources={block.data.sources || []} />;

      default:
        console.warn(`Unknown content block type: ${block.type}`);
        return <ContentText key={key} content={block.data?.content || ""} />;
    }
  };

  return (
    <div className={`content-renderer ${className}`}>
      {content.map((block, index) => renderBlock(block, index))}
    </div>
  );
};

export default ContentRenderer;

// Content Components für Lernbeiträge
export { default as ContentHint } from "./ContentHint";
export { default as ContentImportant } from "./ContentImportant";
export { default as ContentCode } from "./ContentCode";
export { default as ContentImage } from "./ContentImage";
export { default as ContentTitle } from "./ContentTitle";
export { default as ContentText } from "./ContentText";
export { default as ContentNote } from "./ContentNote";
export { default as ContentTip } from "./ContentTip";
export { default as ContentList } from "./ContentList";
export { default as ContentMetadata } from "./ContentMetadata";
export { default as ContentLearningObjectives } from "./ContentLearningObjectives";
export { default as ContentTableOfContents } from "./ContentTableOfContents";
export { default as ContentSources } from "./ContentSources";

// Master Renderer Component
export { default as ContentRenderer } from "./ContentRenderer";
export type { ContentBlock } from "./ContentRenderer";

// Re-export für einfache Verwendung
export * from "./ContentRenderer";

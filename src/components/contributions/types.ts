// TypeScript interfaces für Content-Komponenten

export interface JsonContentBlock {
  type: string;
  text?: string;
  paragraphs?: string[]; // Für text-Blöcke - JSON nutzt "paragraphs" Array
  items?: string[];
  src?: string;
  alt?: string;
  caption?: string;
  language?: string;
  code?: string; // Für code-Blöcke - JSON nutzt "code" statt "text"
  level?: number;
  title?: string;
  author?: string;
  date?: string;
  tags?: string[];
  // Tabellen-Unterstützung
  headers?: string[];
  rows?: (string | number | null)[][];
}

export interface ContentTitleProps {
  text: string;
  level?: number;
}

export interface ContentTextProps {
  text: string;
}

export interface ContentImageProps {
  src: string;
  alt: string;
  caption?: string;
}

export interface ContentCodeProps {
  text: string;
  language: string;
  filename?: string;
  lineNumbers?: boolean;
  wrap?: boolean;
}

export interface ContentImportantProps {
  text: string;
}

export interface ContentNoteProps {
  text: string;
}

export interface ContentTipProps {
  text: string;
}

export interface ContentHintProps {
  text: string;
}

export interface ContentListProps {
  items: string[];
}

export interface ContentLearningObjectivesProps {
  items: string[];
}

export interface ContentTableOfContentsProps {
  items: string[];
}

export interface ContentSourcesProps {
  text?: string; // Legacy support for old format
  items?: string[]; // New format: array of source items
}

export interface ContentMetadataProps {
  title: string;
  author: string;
  date: string;
  tags: string[];
}

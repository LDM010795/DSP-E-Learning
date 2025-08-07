// TypeScript interfaces für Content-Komponenten

export interface JsonContentBlock {
  type: string;
  text?: string;
  items?: string[];
  src?: string;
  alt?: string;
  caption?: string;
  language?: string;
  level?: number;
  title?: string;
  author?: string;
  date?: string;
  tags?: string[];
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
  text: string;
}

export interface ContentMetadataProps {
  title: string;
  author: string;
  date: string;
  tags: string[];
}

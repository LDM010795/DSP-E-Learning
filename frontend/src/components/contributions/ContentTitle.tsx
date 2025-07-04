import React from "react";

interface ContentTitleProps {
  content: string;
  level?: 1 | 2 | 3;
}

const ContentTitle: React.FC<ContentTitleProps> = ({ content, level = 1 }) => {
  const getTitleClasses = () => {
    switch (level) {
      case 1:
        return "text-2xl font-semibold text-gray-800 mb-4 mt-8";
      case 2:
        return "text-xl font-semibold text-gray-800 mb-3 mt-6";
      case 3:
        return "text-lg font-semibold text-gray-800 mb-2 mt-4";
      default:
        return "text-2xl font-semibold text-gray-800 mb-4 mt-8";
    }
  };

  switch (level) {
    case 1:
      return <h1 className={getTitleClasses()}>{content}</h1>;
    case 2:
      return <h2 className={getTitleClasses()}>{content}</h2>;
    case 3:
      return <h3 className={getTitleClasses()}>{content}</h3>;
    default:
      return <h1 className={getTitleClasses()}>{content}</h1>;
  }
};

export default ContentTitle;

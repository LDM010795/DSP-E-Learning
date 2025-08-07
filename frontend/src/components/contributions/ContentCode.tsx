import React, { useEffect } from "react";
import { ContentCodeProps } from "./types";
import Prism from "prismjs";
import "prismjs/themes/prism.css";

const ContentCode: React.FC<ContentCodeProps> = ({ text, language }) => {
  useEffect(() => {
    Prism.highlightAll();
  }, [text]);

  return (
    <div className="my-6">
      <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
        <code className={`language-${language}`}>{text}</code>
      </pre>
    </div>
  );
};

export default ContentCode;

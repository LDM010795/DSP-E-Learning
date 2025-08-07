import React from "react";
import { ContentTextProps } from "./types";

const ContentText: React.FC<ContentTextProps> = ({ text }) => {
  return <p className="text-gray-700 leading-relaxed mb-4">{text}</p>;
};

export default ContentText;

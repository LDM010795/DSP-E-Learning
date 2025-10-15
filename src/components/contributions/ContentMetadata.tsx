import React from "react";
import { ContentMetadataProps } from "./types";

const ContentMetadata: React.FC<ContentMetadataProps> = ({
  title,
  author,
  date,
  tags,
}) => {
  return (
    <div className="bg-gray-100 border border-gray-300 rounded-lg p-4 my-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-3">Metadaten</h3>
      <div className="space-y-2 text-gray-700">
        <div>
          <strong>Titel:</strong> {title}
        </div>
        <div>
          <strong>Autor:</strong> {author}
        </div>
        <div>
          <strong>Datum:</strong> {date}
        </div>
        {tags && tags.length > 0 && (
          <div>
            <strong>Tags:</strong>
            <div className="flex flex-wrap gap-2 mt-1">
              {tags.map((tag, index) => (
                <span
                  key={index}
                  className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContentMetadata;

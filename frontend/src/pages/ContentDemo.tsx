import React, { useState, useEffect } from "react";
import ContentRenderer from "../components/contributions/ContentRenderer";
import {
  loadContentChapter,
  validateContentData,
  getAvailableChapters,
} from "../util/apis/contentApi";
import type { ContentData } from "../util/apis/contentApi";

const ContentDemo: React.FC = () => {
  const [selectedChapter, setSelectedChapter] = useState<"1.1" | "1.2">("1.1");
  const [contentData, setContentData] = useState<ContentData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);

  const availableChapters = getAvailableChapters();

  const loadContent = async (chapter: "1.1" | "1.2") => {
    setLoading(true);
    setError(null);
    setWarnings([]);

    try {
      const result = await loadContentChapter(chapter);

      if (result.success) {
        setContentData(result.data);
        const validationWarnings = validateContentData(result.data);
        setWarnings(validationWarnings);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError(`Fehler beim Laden der Daten: ${err}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContent(selectedChapter);
  }, [selectedChapter]);

  const handleChapterChange = (chapter: "1.1" | "1.2") => {
    setSelectedChapter(chapter);
  };

  const handleRetry = () => {
    loadContent(selectedChapter);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Content Demo
          </h1>

          {/* Navigation */}
          <div className="mb-6">
            <div className="flex space-x-2">
              {availableChapters.map((chapter) => (
                <button
                  key={chapter}
                  onClick={() => handleChapterChange(chapter as "1.1" | "1.2")}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    selectedChapter === chapter
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  Kapitel {chapter}
                </button>
              ))}
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Lade Inhalte...</span>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-red-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    Fehler beim Laden der Daten
                  </h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>{error}</p>
                  </div>
                  <div className="mt-4">
                    <button
                      onClick={handleRetry}
                      className="bg-red-100 text-red-800 px-3 py-1 rounded-md text-sm font-medium hover:bg-red-200"
                    >
                      Erneut versuchen
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Warnings */}
          {warnings.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-yellow-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">
                    Warnungen
                  </h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <ul className="list-disc list-inside space-y-1">
                      {warnings.map((warning, index) => (
                        <li key={index}>{warning}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Content */}
          {contentData && !loading && !error && (
            <div className="space-y-6">
              <div className="border-b border-gray-200 pb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  Kapitel {selectedChapter}
                </h2>
                <p className="text-gray-600 mt-1">
                  {contentData.content.length} Content-Blöcke geladen
                </p>
              </div>

              <ContentRenderer content={contentData.content} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContentDemo;

import React, { useMemo, useState } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import Breadcrumbs from "../components/ui_elements/breadcrumbs";
import SubBackground from "../components/layouts/SubBackground";
import {
  useModules,
  Module,
  Article as ModuleArticle,
} from "../context/ModuleContext";
import ContentRenderer from "../components/contributions/ContentRenderer";
import BackToTopButton from "../components/ui_elements/buttons/BackToTopButton";
import BookmarkButton from "../components/ui_elements/buttons/BookmarkButton";
import BookmarkLayer from "../components/ui_elements/BookmarkLayer";

const ArticlePage: React.FC = () => {
  const { modules, loading } = useModules();
  const { moduleId } = useParams<{ moduleId: string }>();
  // const navigate = useNavigate();
  const [params, setParams] = useSearchParams();

  const module: Module | undefined = useMemo(() => {
    if (!moduleId) return undefined;
    const id = parseInt(moduleId, 10);
    if (Number.isNaN(id)) return undefined;
    return modules.find((m) => m.id === id);
  }, [modules, moduleId]);

  const articles: ModuleArticle[] = useMemo(
    () => module?.articles || [],
    [module]
  );
  const total = articles.length;

  const activeIndex = useMemo(() => {
    const aParam = params.get("a");
    const idx = aParam ? parseInt(aParam, 10) : 0;
    if (Number.isNaN(idx) || idx < 0) return 0;
    if (idx >= total) return Math.max(0, total - 1);
    return idx;
  }, [params, total]);

  const currentArticle = total > 0 ? articles[activeIndex] : undefined;
  const [showJson, setShowJson] = useState(false);
  const [bookmarks] = useState<
    import("../components/ui_elements/BookmarkLayer").Bookmark[]
  >([]);

  const breadcrumbItems = useMemo(
    () => [
      { label: "Dashboard", path: "/dashboard" },
      { label: "Module", path: "/modules" },
      { label: module?.title || "Modul" },
      { label: "Lernbeiträge" },
    ],
    [module?.title]
  );

  const handlePrev = () => {
    if (activeIndex > 0) setParams({ a: String(activeIndex - 1) });
  };
  const handleNext = () => {
    if (activeIndex < total - 1) setParams({ a: String(activeIndex + 1) });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <SubBackground>
          <div className="text-gray-600">Lade Lernbeiträge…</div>
        </SubBackground>
      </div>
    );
  }

  // Debug: Module-Daten loggen
  console.log("📦 ArticlePage: Module found:", module);
  console.log("📄 ArticlePage: Articles in module:", module?.articles);
  console.log(
    "🖼️ ArticlePage: Article images in module:",
    module?.article_images
  );

  if (!module) {
    console.warn("❌ ArticlePage: Module not found for moduleId:", moduleId);
    return (
      <div className="min-h-screen">
        <div className="px-4 py-8">
          <div className="max-w-[95vw] mx-auto">
            <SubBackground className="max-w-2xl mx-auto">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-700 mb-3">
                  Modul nicht gefunden
                </h2>
                <Link to="/modules" className="text-[#ff863d] hover:underline">
                  Zur Modulübersicht
                </Link>
              </div>
            </SubBackground>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="px-3 pt-3 pb-6">
        <div className="max-w-[95vw] mx-auto">
          <Breadcrumbs items={breadcrumbItems} className="mb-3" />

          {/* Header */}
          <SubBackground className="mb-6 max-w-[1100px] mx-auto">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-700">
                  {module.title} – Lernbeiträge
                </h1>
                <p className="text-gray-600">
                  Artikel {total === 0 ? 0 : activeIndex + 1} von {total}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrev}
                  disabled={activeIndex === 0 || total === 0}
                  className="px-4 py-2 rounded-lg border border-gray-200 bg-white/90 backdrop-blur-sm text-gray-700 hover:bg-gray-50 hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer"
                >
                  Zurück
                </button>
                <button
                  onClick={handleNext}
                  disabled={activeIndex >= total - 1 || total === 0}
                  className="px-4 py-2 rounded-lg border border-gray-200 bg-white/90 backdrop-blur-sm text-gray-700 hover:bg-gray-50 hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer"
                >
                  Weiter
                </button>
                {currentArticle?.json_content && (
                  <button
                    onClick={() => setShowJson(true)}
                    className="px-4 py-2 rounded-lg border border-gray-200 bg-white/90 backdrop-blur-sm text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 cursor-pointer"
                  >
                    JSON ansehen
                  </button>
                )}
              </div>
            </div>
          </SubBackground>

          {/* Content */}
          <SubBackground className="max-w-[1100px] mx-auto">
            {currentArticle && currentArticle.json_content?.content ? (
              <>
                {/* Debug: Aktueller Artikel */}
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm font-semibold text-blue-800">
                    🔍 Debug Info:
                  </p>
                  <p className="text-xs text-blue-600">
                    Artikel Titel: {currentArticle.title}
                  </p>
                  <p className="text-xs text-blue-600">
                    JSON Content Keys:{" "}
                    {Object.keys(currentArticle.json_content || {}).join(", ")}
                  </p>
                  <p className="text-xs text-blue-600">
                    Content Array Length:{" "}
                    {Array.isArray(currentArticle.json_content?.content)
                      ? currentArticle.json_content.content.length
                      : "Not an array"}
                  </p>
                  <details className="mt-2">
                    <summary className="text-xs text-blue-600 cursor-pointer">
                      Raw JSON Content (click to expand)
                    </summary>
                    <pre className="text-xs text-gray-600 mt-1 overflow-auto max-h-40">
                      {JSON.stringify(currentArticle.json_content, null, 2)}
                    </pre>
                  </details>
                </div>
                <ContentRenderer
                  content={
                    (currentArticle.json_content.content as unknown as Array<{
                      type: string;
                    }>) || []
                  }
                  imageMap={module.article_images || {}}
                />
              </>
            ) : (
              <div className="text-center py-12 text-gray-600">
                {total === 0
                  ? "Für dieses Modul sind keine Lernbeiträge vorhanden."
                  : "Dieser Beitrag enthält noch keinen Inhalt."}
              </div>
            )}
          </SubBackground>
        </div>
      </div>

      {/* Floating controls (global on page) */}
      <BackToTopButton threshold={200} className="z-50" />
      <BookmarkButton className="z-50" />
      <BookmarkLayer bookmarks={bookmarks} containerMaxWidth={1100} />

      {/* Fullscreen JSON Viewer */}
      {showJson && currentArticle?.json_content && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center">
          <div className="bg-white w-[95vw] h-[90vh] rounded-2xl shadow-xl flex flex-col">
            <div className="p-3 border-b flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">
                  JSON Viewer
                </h3>
                <p className="text-xs text-gray-500">{currentArticle.title}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    navigator.clipboard.writeText(
                      JSON.stringify(
                        currentArticle.json_content as Record<string, unknown>,
                        null,
                        2
                      )
                    )
                  }
                  className="px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 transition-all duration-200 cursor-pointer text-sm"
                >
                  Kopieren
                </button>
                <button
                  onClick={() => setShowJson(false)}
                  className="px-3 py-1.5 rounded-lg bg-gray-800 text-white hover:bg-gray-700 transition-all duration-200 cursor-pointer text-sm"
                >
                  Schließen
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-auto p-3">
              <pre className="text-xs text-gray-800 whitespace-pre-wrap">
                {JSON.stringify(currentArticle.json_content, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ArticlePage;

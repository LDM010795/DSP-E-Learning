import React, { useMemo, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Breadcrumbs, {
  BreadcrumbItem,
} from "../components/ui_elements/breadcrumbs";
import SubBackground from "../components/layouts/SubBackground";
import { useModules, Module, Chapter } from "../context/ModuleContext";
import ContentRenderer from "../components/contributions/ContentRenderer";
import BackToTopButton from "../components/ui_elements/buttons/BackToTopButton";
import BookmarkButton from "../components/ui_elements/buttons/BookmarkButton";
import BookmarkLayer from "../components/ui_elements/BookmarkLayer";

const ArticleDetail: React.FC = () => {
  const { modules, loading } = useModules();
  const { moduleId, chapterId, articleId } = useParams() as {
    moduleId: string;
    chapterId: string;
    articleId: string;
  };

  const navigate = useNavigate();

  const module: Module | undefined = useMemo(() => {
    if (!moduleId) return undefined;
    const id = parseInt(moduleId, 10);
    if (Number.isNaN(id)) return undefined;
    return modules.find((module) => module.id === id);
  }, [modules, moduleId]);

  const chapter: Chapter | undefined = useMemo(() => {
    if (!chapterId) return undefined;
    const id = parseInt(chapterId, 10);
    if (Number.isNaN(id)) return undefined;
    return module?.chapters.find((chapter) => chapter.id === id);
  }, [module, chapterId]);

  const chapterArticles = chapter?.articles || []; // hält alle Artikel dieses Kapitels
  const currentArticleIndex = chapterArticles.findIndex(
    (article) => article.id === parseInt(articleId, 10),
  );
  const currentArticle =
    currentArticleIndex >= 0 ? chapterArticles[currentArticleIndex] : undefined;

  const [showJson, setShowJson] = useState(false);
  const [bookmarks] = useState<
    import("../components/ui_elements/BookmarkLayer").Bookmark[]
  >([]);

  const breadcrumbItems = useMemo(() => {
    const items = [
      { label: "Dashboard", path: "/dashboard" },
      { label: "Module", path: "/modules" },
    ] as BreadcrumbItem[];

    if (!module) return items;

    items.push({ label: module.title, path: `/modules/${module.id}` });
    if (!chapter) return items;

    items.push({
      label: chapter.title,
      path: `/modules/${module.id}/chapters/${chapter.id}`,
    });
    if (!currentArticle) return items;

    items.push({ label: currentArticle.title });
    return items;
  }, [module, chapter, currentArticle]);

  console.log(breadcrumbItems);

  const handlePrev = () => {
    if (currentArticleIndex <= 0) return;

    const prevArticle = chapterArticles[currentArticleIndex - 1];
    navigate(
      `/modules/${moduleId}/chapters/${chapterId}/articles/${prevArticle.id}`,
    );
  };

  const handleNext = () => {
    if (
      currentArticleIndex < 0 ||
      currentArticleIndex === chapterArticles.length - 1
    )
      return;

    const nextArticle = chapterArticles[currentArticleIndex + 1];
    navigate(
      `/modules/${moduleId}/chapters/${chapterId}/articles/${nextArticle.id}`,
    );
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
  console.log(
    "📦 ArticleDetail: Module found:",
    module?.title,
    "Chapter found:",
    chapter?.title,
  );
  console.log("📄 ArticleDetail: Articles in chapter:", chapterArticles.length);
  console.log(
    "🖼️ ArticleDetail: Article images in module:",
    module?.article_images,
  );

  const NotFoundMessage = ({
    title,
    link,
    linkText,
  }: {
    title: string;
    link: string;
    linkText: string;
  }) => (
    <div className="min-h-screen px-4 py-8 max-w-[95vw] mx-auto">
      <SubBackground className="max-w-2xl mx-auto">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-700 mb-3">{title}</h2>
          <Link to={link} className="text-dsp-orange hover:underline">
            {linkText}
          </Link>
        </div>
      </SubBackground>
    </div>
  );

  if (!module)
    return (
      <NotFoundMessage
        title="Modul nicht gefunden"
        link="/modules"
        linkText="Zur Modulübersicht"
      />
    );
  if (!chapter)
    return (
      <NotFoundMessage
        title="Kapitel nicht gefunden"
        link={`/modules/${module.id}`}
        linkText="Zur Kapitelübersicht"
      />
    );
  if (!currentArticle)
    return (
      <NotFoundMessage
        title="Artikel nicht gefunden"
        link={`/modules/${module.id}/chapters/${chapter.id}`}
        linkText="Zum Kapitel"
      />
    );

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
                  Artikel {currentArticleIndex + 1} von {chapterArticles.length}
                </p>
              </div>
              {chapterArticles.length > 0 && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePrev}
                    disabled={
                      currentArticleIndex === 0 || chapterArticles.length === 0
                    }
                    className="px-4 py-2 rounded-lg border border-gray-200 bg-white/90 backdrop-blur-sm text-gray-700 hover:bg-gray-50 hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer"
                  >
                    Zurück
                  </button>
                  <button
                    onClick={handleNext}
                    disabled={
                      currentArticleIndex >= chapterArticles.length - 1 ||
                      chapterArticles.length === 0
                    }
                    className="px-4 py-2 rounded-lg border border-gray-200 bg-white/90 backdrop-blur-sm text-gray-700 hover:bg-gray-50 hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer"
                  >
                    Weiter
                  </button>
                  {currentArticle.json_content && (
                    <button
                      onClick={() => setShowJson(true)}
                      className="px-4 py-2 rounded-lg border border-gray-200 bg-white/90 backdrop-blur-sm text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 cursor-pointer"
                    >
                      JSON ansehen
                    </button>
                  )}
                </div>
              )}
            </div>
          </SubBackground>

          {/* Content */}
          <SubBackground className="max-w-[1100px] mx-auto">
            {currentArticleIndex >= 0 &&
            currentArticle.json_content?.content ? (
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
                {chapterArticles.length === 0
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
                        2,
                      ),
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

export default ArticleDetail;

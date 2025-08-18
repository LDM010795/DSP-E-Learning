import React, { useState, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import TagDifficulty from "../components/tags/tag_difficulty";
import type { DifficultyLevel } from "../components/tags/tag_difficulty";
import {
  IoCheckmarkCircleOutline,
  IoPlayCircleOutline,
  IoArrowBackOutline,
  IoBookOutline,
  IoTimeOutline,
  IoAlertCircleOutline,
  IoListOutline,
  IoVideocamOutline,
  IoCheckmarkCircle,
  IoPlayOutline,
} from "react-icons/io5";
import Breadcrumbs from "../components/ui_elements/breadcrumbs";
import LearningContentVideoLayout from "../components/layouts/learning_content_video";
import SubBackground from "../components/layouts/SubBackground";
import LoadingSpinner from "../components/ui_elements/loading_spinner";
import {
  useModules,
  Module,
  Task,
  Content,
  Chapter,
} from "../context/ModuleContext";

function ChapterDetail() {
  const { modules, loading, error } = useModules();
  const { moduleId, chapterId } = useParams<{
    moduleId: string;
    chapterId: string;
  }>();
  const navigate = useNavigate();
  const [selectedVideo, setSelectedVideo] = useState<Content | null>(null);

  const module: Module | undefined = useMemo(() => {
    if (!moduleId) return undefined;
    const numericModuleId = parseInt(moduleId, 10);
    if (isNaN(numericModuleId)) return undefined;
    return modules.find((mod) => mod.id === numericModuleId);
  }, [modules, moduleId]);

  const chapter: Chapter | undefined = useMemo(() => {
    if (!chapterId || !module?.chapters) return undefined;
    const numericChapterId = parseInt(chapterId, 10);
    if (isNaN(numericChapterId)) return undefined;
    return module.chapters.find((chap) => chap.id === numericChapterId);
  }, [module, chapterId]);

  const handleVideoSelect = (video: Content) => {
    setSelectedVideo(video);
  };

  const handleBackToModule = () => {
    navigate(`/modules/${moduleId}`);
  };

  // Calculate chapter progress
  const chapterProgress = useMemo(() => {
    if (!chapter || chapter.tasks.length === 0) return 0;
    const completedTasks = chapter.tasks.filter(
      (task) => task.completed
    ).length;
    return Math.round((completedTasks / chapter.tasks.length) * 100);
  }, [chapter]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <LoadingSpinner
          message="Lade Kapitel..."
          size="lg"
          variant="pulse"
          showBackground={true}
        />
      </div>
    );
  }

  if (error || !module || !chapter) {
    const errorBreadcrumbs = [
      { label: "Dashboard", path: "/dashboard" },
      { label: "Module", path: "/modules" },
      { label: module?.title || "Modul", path: `/modules/${moduleId}` },
      { label: "Fehler" },
    ];
    return (
      <div className="min-h-screen">
        <div className="px-4 py-8">
          <div className="max-w-[95vw] mx-auto">
            <Breadcrumbs items={errorBreadcrumbs} className="mb-6" />

            <div className="text-center mb-6">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-700 mb-4">
                Kapitel nicht gefunden
              </h1>
            </div>

            <SubBackground className="max-w-2xl mx-auto">
              <div className="text-center">
                <IoAlertCircleOutline className="text-6xl text-red-500 mb-6 mx-auto" />
                <h2 className="text-2xl font-bold text-red-700 mb-4">
                  Kapitel konnte nicht geladen werden!
                </h2>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Das angeforderte Kapitel existiert nicht oder ist nicht
                  verfügbar.
                </p>
                <button
                  onClick={handleBackToModule}
                  className="px-6 py-3 bg-[#ff863d] text-white rounded-xl hover:bg-[#fa8c45] transition-all duration-200 font-medium shadow-md hover:shadow-lg hover:scale-105"
                >
                  Zurück zum Modul
                </button>
              </div>
            </SubBackground>
          </div>
        </div>
      </div>
    );
  }

  const breadcrumbs = [
    { label: "Dashboard", path: "/dashboard" },
    { label: "Module", path: "/modules" },
    { label: module.title, path: `/modules/${moduleId}` },
    { label: chapter.title },
  ];

  return (
    <div className="min-h-screen">
      <div className="px-3 pt-3 pb-6">
        <div className="max-w-[95vw] mx-auto">
          <Breadcrumbs items={breadcrumbs} className="mb-3" />

          {/* Header */}
          <div className="mb-8">
            {/* Zurück-zum-Modul Button entfernt */}

            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-700 mb-2">
                  Kapitel: {chapter.title}
                </h1>
                {chapter.description && (
                  <p className="text-gray-600 text-lg leading-relaxed max-w-3xl">
                    {chapter.description}
                  </p>
                )}
              </div>

              {/* Progress entfernt (nur in Kapitelübersicht anzeigen) */}
            </div>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 gap-8">
            {/* Videos */}
            <div>
              {selectedVideo ? (
                // Video Player View
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <LearningContentVideoLayout
                    videoUrl={selectedVideo.video_url || ""}
                    title={selectedVideo.title}
                    description={selectedVideo.description}
                    supplementaryContent={selectedVideo.supplementary_contents}
                    currentLessonIndex={chapter.contents.findIndex(
                      (c) => c.id === selectedVideo.id
                    )}
                    totalLessons={chapter.contents.length}
                    contentId={selectedVideo.id}
                    relatedVideos={chapter.contents.map((c) => ({
                      id: c.id,
                      title: c.title,
                      video_url: c.video_url,
                    }))}
                    onSelectContent={(id) => {
                      const target = chapter.contents.find((c) => c.id === id);
                      if (target) setSelectedVideo(target);
                    }}
                  />
                </motion.div>
              ) : (
                // Video List View
                <SubBackground>
                  <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <IoVideocamOutline className="h-5 w-5 text-[#ff863d]" />
                    Lernvideos ({chapter.contents.length})
                  </h2>

                  <div className="space-y-3">
                    {chapter.contents.map((video, index) => (
                      <motion.div
                        key={video.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        className="bg-white/80 backdrop-blur-sm rounded-lg border border-white/60 p-4 hover:border-[#ff863d]/30 hover:bg-[#ffe7d4]/80 transition-all cursor-pointer shadow-sm hover:shadow-md"
                        onClick={() => handleVideoSelect(video)}
                      >
                        <div className="flex items-center gap-4">
                          <div className="flex-shrink-0 w-12 h-12 bg-[#ff863d] rounded-lg flex items-center justify-center">
                            <IoPlayCircleOutline className="h-6 w-6 text-white" />
                          </div>
                          <div className="flex-grow">
                            <h3 className="font-semibold text-gray-900 mb-1">
                              {video.title}
                            </h3>
                            {video.description && (
                              <p className="text-sm text-gray-600 line-clamp-2">
                                {video.description}
                              </p>
                            )}
                          </div>
                          <div className="flex-shrink-0 text-gray-400">
                            <IoPlayOutline className="h-4 w-4" />
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </SubBackground>
              )}
            </div>

            {/* Aufgaben-Liste entfernt (nur in Kapitelübersicht anzeigen) */}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChapterDetail;

import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  IoPlayCircleOutline,
  IoAlertCircleOutline,
  IoVideocamOutline,
  IoPlayOutline,
  IoListOutline,
  IoCheckmarkCircleOutline,
  IoReaderOutline,
} from "react-icons/io5";
import Breadcrumbs from "../components/ui_elements/breadcrumbs";
import LearningContentVideoLayout from "../components/layouts/learning_content_video";
import SubBackground from "../components/layouts/SubBackground";
import LoadingSpinner from "../components/ui_elements/loading_spinner";
import {
  useModules,
  Module,
  Content,
  Chapter,
  Task,
} from "../context/ModuleContext";
import TagDifficulty, {
  DifficultyLevel,
} from "@/components/tags/tag_difficulty";

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

  // Calculate chapter progress (commented out as not used)
  // const chapterProgress = useMemo(() => {
  //   if (!chapter || chapter.tasks.length === 0) return 0;
  //   const completedTasks = chapter.tasks.filter(
  //     (task) => task.completed
  //   ).length;
  //   return Math.round((completedTasks / chapter.tasks.length) * 100);
  // }, [chapter]);

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
                  className="px-6 py-3 bg-dsp-orange text-white rounded-xl hover:bg-dsp-orange transition-all duration-200 font-medium shadow-md hover:shadow-lg hover:scale-105"
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
            </div>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              {/* Videos */}
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
                      (c) => c.id === selectedVideo.id,
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
                    <IoVideocamOutline className="h-5 w-5 text-dsp-orange" />
                    Lernvideos ({chapter.contents.length})
                  </h2>

                  <div className="space-y-3 mb-8">
                    {chapter.contents.map((video, index) => (
                      <motion.div
                        key={video.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        className="bg-white/80 backdrop-blur-sm rounded-lg border border-white/60 p-4 hover:border-dsp-orange/30 hover:bg-dsp-orange_light/80 transition-all cursor-pointer shadow-sm hover:shadow-md"
                        onClick={() => handleVideoSelect(video)}
                      >
                        <div className="flex items-center gap-4">
                          <div className="flex-shrink-0 w-12 h-12 bg-dsp-orange rounded-lg flex items-center justify-center">
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

                  <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <IoReaderOutline className="h-5 w-5 text-dsp-orange" />
                    Lernbeiträge ({chapter.articles.length})
                  </h2>

                  <div className="space-y-3 mb-8">
                    {chapter.articles.map((article, index) => (
                      <motion.div
                        key={article.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        className="bg-white/80 backdrop-blur-sm rounded-lg border border-white/60 p-4 hover:border-dsp-orange/30 hover:bg-dsp-orange_light/80 transition-all cursor-pointer shadow-sm hover:shadow-md"
                        onClick={() =>
                          navigate(
                            `/modules/${module.id}/chapters/${chapter.id}/articles/${article.id}`,
                          )
                        }
                      >
                        <div className="flex items-center gap-4">
                          <div className="flex-shrink-0 w-12 h-12 bg-dsp-orange rounded-lg flex items-center justify-center">
                            <IoReaderOutline className="h-6 w-6 text-white" />
                          </div>
                          <div className="flex-grow">
                            <h3 className="font-semibold text-gray-900 mb-1">
                              {article.title}
                            </h3>
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

            {/* Task Sidebar */}
            <div className="lg:col-span-1">
              <SubBackground>
                <div className="sticky top-8">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="p-2 rounded-lg bg-dsp-orange_light">
                      <IoListOutline className="w-5 h-5 text-dsp-orange" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-800">
                      Aufgaben ({chapter.tasks.length})
                    </h2>
                  </div>

                  {chapter.tasks.length > 0 ? (
                    <div className="space-y-3">
                      {chapter.tasks.map((task: Task, index: number) => (
                        <motion.div
                          key={task.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          whileHover={{ y: -2 }}
                          className="group cursor-pointer"
                          onClick={() =>
                            navigate(`/modules/${module?.id}/tasks/${task.id}`)
                          }
                        >
                          <div
                            className={`p-4 rounded-xl border transition-all duration-200 ${
                              task.completed
                                ? "border-green-200 bg-green-50/50 hover:bg-green-50"
                                : "border-gray-200 bg-white/50 hover:bg-white/80 hover:border-dsp-orange/30"
                            }`}
                          >
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center space-x-3 flex-1">
                                <div
                                  className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                                    task.completed
                                      ? "bg-green-500"
                                      : "bg-gray-200 group-hover:bg-dsp-orange/20"
                                  }`}
                                >
                                  {task.completed ? (
                                    <IoCheckmarkCircleOutline className="w-5 h-5 text-white" />
                                  ) : (
                                    <IoPlayCircleOutline
                                      className={`w-5 h-5 ${
                                        task.completed
                                          ? "text-white"
                                          : "text-gray-500 group-hover:text-dsp-orange"
                                      }`}
                                    />
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h3
                                    className={`font-medium text-sm leading-tight ${
                                      task.completed
                                        ? "text-gray-700"
                                        : "text-gray-800 group-hover:text-dsp-orange"
                                    }`}
                                  >
                                    {task.title}
                                  </h3>
                                  <p
                                    className={`text-xs mt-1 ${
                                      task.completed
                                        ? "text-green-600"
                                        : "text-gray-500"
                                    }`}
                                  >
                                    {task.completed ? "Abgeschlossen" : "Offen"}
                                  </p>
                                </div>
                              </div>
                              <div className="flex-shrink-0 ml-2">
                                <TagDifficulty
                                  difficulty={
                                    task.difficulty as DifficultyLevel
                                  }
                                />
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <IoListOutline className="mx-auto text-4xl text-gray-400 mb-3" />
                      <p className="text-gray-500 text-sm">
                        Keine Aufgaben für dieses Modul verfügbar.
                      </p>
                    </div>
                  )}
                </div>
              </SubBackground>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChapterDetail;

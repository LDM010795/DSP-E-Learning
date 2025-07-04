import { useRef, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperClass } from "swiper";
import "swiper/swiper-bundle.css";
import { motion } from "framer-motion";
import TagDifficulty from "../components/tags/tag_difficulty";
import type { DifficultyLevel } from "../components/tags/tag_difficulty";
import { TbTriangleInvertedFilled } from "react-icons/tb";
import { 
  IoCheckmarkCircleOutline,
  IoPlayCircleOutline,
  IoArrowBackOutline,
  IoBookOutline,
  IoTimeOutline,
  IoAlertCircleOutline,
  IoListOutline
} from "react-icons/io5";
import Breadcrumbs from "../components/ui_elements/breadcrumbs";
import LearningContentVideoLayout from "../components/layouts/learning_content_video";
import ButtonSwipe from "../components/ui_elements/buttons/button_swipe";
import SubBackground from "../components/layouts/SubBackground";
import LoadingSpinner from "../components/ui_elements/loading_spinner";
import { useModules, Module, Task, Content } from "../context/ModuleContext";

function ModuleDetail() {
  const { modules, loading, error, fetchModules } = useModules();
  const swiperRef = useRef<SwiperClass | null>(null);
  const { moduleId } = useParams<{ moduleId: string }>();
  const navigate = useNavigate();

  const module: Module | undefined = useMemo(() => {
    if (!moduleId) return undefined;
    const numericModuleId = parseInt(moduleId, 10);
    if (isNaN(numericModuleId)) return undefined;
    return modules.find((mod) => mod.id === numericModuleId);
  }, [modules, moduleId]);

  const tasks: Task[] = useMemo(() => module?.tasks || [], [module]);
  const contents: Content[] = useMemo(() => module?.contents || [], [module]);

  const handleNext = () => {
    swiperRef.current?.slideNext();
  };

  const handlePrev = () => {
    swiperRef.current?.slidePrev();
  };

  // Calculate module progress
  const moduleProgress = useMemo(() => {
    if (tasks.length === 0) return 0;
    const completedTasks = tasks.filter(task => task.completed).length;
    return Math.round((completedTasks / tasks.length) * 100);
  }, [tasks]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <LoadingSpinner
          message="Lade Moduldetails..."
          size="lg"
          variant="pulse"
          showBackground={true}
        />
      </div>
    );
  }

  if (error) {
    const errorBreadcrumbs = [
      { label: "Dashboard", path: "/dashboard" },
      { label: "Module", path: "/modules" },
      { label: "Fehler" },
    ];
    return (
      <div className="min-h-screen">
        <div className="px-4 py-8">
          <div className="max-w-[95vw] mx-auto">
            <Breadcrumbs items={errorBreadcrumbs} className="mb-6" />
            
            <div className="text-center mb-6">
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-800 via-gray-700 to-[#ff863d] bg-clip-text text-transparent mb-4">
                Fehler beim Laden
              </h1>
            </div>

            <SubBackground className="max-w-2xl mx-auto">
              <div className="text-center">
                <IoAlertCircleOutline className="text-6xl text-red-500 mb-6 mx-auto" />
                <h2 className="text-2xl font-bold text-red-700 mb-4">
                  Fehler beim Laden der Module!
                </h2>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  {error.message}
                </p>
                <button
                  onClick={fetchModules}
                  className="px-6 py-3 bg-[#ff863d] text-white rounded-xl hover:bg-[#fa8c45] transition-all duration-200 font-medium shadow-md hover:shadow-lg hover:scale-105"
                >
                  Erneut versuchen
                </button>
              </div>
            </SubBackground>
          </div>
        </div>
      </div>
    );
  }

  if (!module) {
    const notFoundBreadcrumbs = [
      { label: "Dashboard", path: "/dashboard" },
      { label: "Module", path: "/modules" },
      { label: "Nicht gefunden" },
    ];
    return (
      <div className="min-h-screen">
        <div className="px-4 py-8">
          <div className="max-w-[95vw] mx-auto">
            <Breadcrumbs items={notFoundBreadcrumbs} className="mb-6" />
            
            <div className="text-center mb-6">
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-800 via-gray-700 to-[#ff863d] bg-clip-text text-transparent mb-4">
                Modul nicht gefunden
              </h1>
            </div>

            <SubBackground className="max-w-2xl mx-auto">
              <div className="text-center">
                <IoBookOutline className="text-6xl text-gray-400 mb-6 mx-auto" />
                <h2 className="text-2xl font-bold text-gray-600 mb-4">
                  Modul nicht gefunden
                </h2>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Das angeforderte Modul konnte nicht gefunden werden.
                </p>
                <Link
                  to="/modules"
                  className="inline-flex items-center space-x-2 px-6 py-3 bg-[#ff863d] text-white rounded-xl hover:bg-[#fa8c45] transition-all duration-200 font-medium shadow-md hover:shadow-lg hover:scale-105"
                >
                  <IoArrowBackOutline className="w-5 h-5" />
                  <span>Zurück zur Modulübersicht</span>
                </Link>
              </div>
            </SubBackground>
          </div>
        </div>
      </div>
    );
  }

  const totalLessons = contents.length;

  const breadcrumbItems = [
    { label: "Dashboard", path: "/dashboard" },
    { label: "Module", path: "/modules" },
    { label: module.title },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="relative px-4 py-8">
          <div className="max-w-[95vw] mx-auto">
            <Breadcrumbs items={breadcrumbItems} className="mb-6" />

            <SubBackground className="mb-8">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="p-3 rounded-xl bg-[#ffe7d4]">
                      <IoBookOutline className="w-6 h-6 text-[#ff863d]" />
                    </div>
                    <div>
                      <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-800 via-gray-700 to-[#ff863d] bg-clip-text text-transparent">
                        {module.title}
                      </h1>
                      <p className="text-lg text-gray-600 mt-1">
                        Vertiefe dein Wissen mit Videos, Texten und Aufgaben.
                      </p>
                    </div>
                  </div>

                  {/* Module Stats */}
                  <div className="flex flex-wrap items-center gap-4 text-sm">
                    <div className="flex items-center space-x-2 px-3 py-1 bg-white/60 rounded-full border border-white/40">
                      <IoListOutline className="w-4 h-4 text-[#ff863d]" />
                      <span className="font-medium text-gray-700">
                        {tasks.length} Aufgaben
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 px-3 py-1 bg-white/60 rounded-full border border-white/40">
                      <IoTimeOutline className="w-4 h-4 text-[#ff863d]" />
                      <span className="font-medium text-gray-700">
                        {totalLessons} Lektionen
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 px-3 py-1 bg-white/60 rounded-full border border-white/40">
                      <div className={`w-2 h-2 rounded-full ${
                        moduleProgress === 100 ? 'bg-green-500' : 
                        moduleProgress > 0 ? 'bg-[#ff863d]' : 'bg-gray-400'
                      }`}></div>
                      <span className="font-medium text-gray-700">
                        {moduleProgress}% abgeschlossen
                      </span>
                    </div>
                  </div>
                </div>

                {/* Navigation Controls */}
                <div className="flex gap-3 flex-shrink-0">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <ButtonSwipe
                      onClick={handlePrev}
                      icon={<TbTriangleInvertedFilled />}
                      classNameIcon="rotate-90"
                    />
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <ButtonSwipe
                      onClick={handleNext}
                      icon={<TbTriangleInvertedFilled />}
                      classNameIcon="rotate-270"
                    />
                  </motion.div>
                </div>
              </div>
            </SubBackground>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 pb-8">
        <div className="max-w-[95vw] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Content Area */}
            <div className="lg:col-span-2">
              <SubBackground>
                {contents.length > 0 ? (
                  <Swiper
                    spaceBetween={20}
                    slidesPerView={1}
                    onSwiper={(swiper) => {
                      swiperRef.current = swiper;
                    }}
                    className="rounded-xl overflow-hidden"
                  >
                    {contents.map((contentItem: Content, index: number) => (
                      <SwiperSlide key={contentItem.id}>
                        <LearningContentVideoLayout
                          title={contentItem.title}
                          description={contentItem.description}
                          videoUrl={contentItem.video_url || ""}
                          currentLessonIndex={index}
                          totalLessons={totalLessons}
                          tasks={tasks}
                          supplementaryContent={contentItem.supplementary_contents}
                        />
                      </SwiperSlide>
                    ))}
                  </Swiper>
                ) : (
                  <div className="text-center py-12">
                    <IoBookOutline className="mx-auto text-6xl text-gray-400 mb-4" />
                    <h3 className="text-xl font-bold text-gray-600 mb-2">
                      Kein Lerninhalt verfügbar
                    </h3>
                    <p className="text-gray-500">
                      Für dieses Modul ist noch kein Lerninhalt verfügbar.
                    </p>
                  </div>
                )}
              </SubBackground>
            </div>

            {/* Task Sidebar */}
            <div className="lg:col-span-1">
              <SubBackground>
                <div className="sticky top-8">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="p-2 rounded-lg bg-[#ffe7d4]">
                      <IoListOutline className="w-5 h-5 text-[#ff863d]" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-800">
                      Aufgaben ({tasks.length})
                    </h2>
                  </div>

                  {tasks.length > 0 ? (
                    <div className="space-y-3">
                      {tasks.map((task: Task, index: number) => (
                        <motion.div
                          key={task.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          whileHover={{ y: -2 }}
                          className="group cursor-pointer"
                          onClick={() => navigate(`/modules/${module?.id}/tasks/${task.id}`)}
                        >
                          <div className={`p-4 rounded-xl border transition-all duration-200 ${
                            task.completed
                              ? "border-green-200 bg-green-50/50 hover:bg-green-50"
                              : "border-gray-200 bg-white/50 hover:bg-white/80 hover:border-[#ff863d]/30"
                          }`}>
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center space-x-3 flex-1">
                                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                                  task.completed 
                                    ? "bg-green-500" 
                                    : "bg-gray-200 group-hover:bg-[#ff863d]/20"
                                }`}>
                                  {task.completed ? (
                                    <IoCheckmarkCircleOutline className="w-5 h-5 text-white" />
                                  ) : (
                                    <IoPlayCircleOutline className={`w-5 h-5 ${
                                      task.completed ? "text-white" : "text-gray-500 group-hover:text-[#ff863d]"
                                    }`} />
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h3 className={`font-medium text-sm leading-tight ${
                                    task.completed 
                                      ? "text-gray-700" 
                                      : "text-gray-800 group-hover:text-[#ff863d]"
                                  }`}>
                                    {task.title}
                                  </h3>
                                  <p className={`text-xs mt-1 ${
                                    task.completed ? "text-green-600" : "text-gray-500"
                                  }`}>
                                    {task.completed ? "Abgeschlossen" : "Offen"}
                                  </p>
                                </div>
                              </div>
                              <div className="flex-shrink-0 ml-2">
                                <TagDifficulty
                                  difficulty={task.difficulty as DifficultyLevel}
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

export default ModuleDetail;

import { useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import "swiper/swiper-bundle.css";
import { motion } from "framer-motion";
import {
  IoArrowBackOutline,
  IoBookOutline,
  IoTimeOutline,
  IoAlertCircleOutline,
  IoListOutline,
  IoPlayOutline,
} from "react-icons/io5";
import Breadcrumbs from "../components/ui_elements/breadcrumbs";
import SubBackground from "../components/layouts/SubBackground";
import LoadingSpinner from "../components/ui_elements/loading_spinner";
import {
  useModules,
  Module,
  Task,
  Content,
  Chapter,
  Article,
} from "../context/ModuleContext";

function ModuleDetail() {
  const {
    modules,
    loading,
    error,
    fetchModules,
    getAllModuleTasks,
    getAllModuleContents,
  } = useModules();
  const { moduleId } = useParams<{ moduleId: string }>();
  const navigate = useNavigate();

  const module: Module | undefined = useMemo(() => {
    if (!moduleId) return undefined;
    const numericModuleId = parseInt(moduleId, 10);
    if (isNaN(numericModuleId)) return undefined;
    return modules.find((mod) => mod.id === numericModuleId);
  }, [modules, moduleId]);

  const chapters: Chapter[] = useMemo(() => module?.chapters || [], [module]);
  const articles: Article[] = useMemo(() => module?.articles || [], [module]);
  const tasks: Task[] = module?.id != null ? getAllModuleTasks(module.id) : [];
  const contents: Content[] =
    module?.id != null ? getAllModuleContents(module.id) : [];

  // Calculate module progress
  const moduleProgress = useMemo(() => {
    if (tasks.length === 0) return 0;

    const completedTasks = tasks.filter((task) => task.completed).length;
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
        <div className="px-3 pt-3 pb-6">
          <div className="max-w-[95vw] mx-auto">
            <Breadcrumbs items={errorBreadcrumbs} className="mb-6" />

            <div className="text-center mb-6">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-700 mb-4">
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
                  className="px-6 py-3 bg-dsp-orange text-white rounded-xl hover:bg-dsp-orange transition-all duration-200 font-medium shadow-md hover:shadow-lg hover:scale-105"
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
              <h1 className="text-4xl md:text-5xl font-bold text-gray-700 mb-4">
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
                  className="inline-flex items-center space-x-2 px-6 py-3 bg-dsp-orange text-white rounded-xl hover:bg-dsp-orange transition-all duration-200 font-medium shadow-md hover:shadow-lg hover:scale-105"
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
            <Breadcrumbs items={breadcrumbItems} className="mb-3" />

            <SubBackground className="mb-8">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="p-3 rounded-xl bg-dsp-orange_light">
                      <IoBookOutline className="w-6 h-6 text-dsp-orange" />
                    </div>
                    <div>
                      <h1 className="text-3xl md:text-4xl font-bold text-gray-700">
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
                      <IoListOutline className="w-4 h-4 text-dsp-orange" />
                      <span className="font-medium text-gray-700">
                        {tasks.length} Aufgabe
                        {tasks.length !== 1 ? "n" : ""}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 px-3 py-1 bg-white/60 rounded-full border border-white/40">
                      <IoTimeOutline className="w-4 h-4 text-dsp-orange" />
                      <span className="font-medium text-gray-700">
                        {contents.length} Lektion
                        {contents.length !== 1 ? "en" : ""}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 px-3 py-1 bg-white/60 rounded-full border border-white/40">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          moduleProgress === 100
                            ? "bg-green-500"
                            : moduleProgress > 0
                              ? "bg-dsp-orange"
                              : "bg-gray-400"
                        }`}
                      ></div>
                      <span className="font-medium text-gray-700">
                        {moduleProgress}% abgeschlossen
                      </span>
                    </div>
                  </div>
                </div>

                {/* Chapter Navigation */}
                {chapters.length > 0 && (
                  <div className="flex gap-3 flex-shrink-0">
                    <div className="text-sm text-gray-600">
                      {chapters.length} Kapitel verfügbar
                    </div>
                  </div>
                )}
              </div>
            </SubBackground>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 pb-8">
        <div className="max-w-[95vw] mx-auto">
          <div className="grid grid-cols-1">
            {/* Content Area */}
            <SubBackground>
              {/* Lernbeiträge CTA */}
              {articles && articles.length > 0 && (
                <div className="mb-6 flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    {articles.length} Lernbeitr
                    {articles.length === 1 ? "ag" : "äge"} verfügbar
                  </div>
                  <button
                    onClick={() => navigate(`/modules/${module.id}/articles`)}
                    className="group flex items-center justify-center space-x-2 rounded-lg px-4 py-2.5
                        bg-white/60 hover:bg-white/80 backdrop-blur-sm
                        border border-orange-200/50 hover:border-orange-300/70
                        text-gray-700 hover:text-orange-600
                        shadow-sm hover:shadow-md
                        transition-all duration-200 ease-in-out
                        focus:outline-none focus:ring-2 focus:ring-orange-200/60 focus:ring-offset-1
                        hover:cursor-pointer active:scale-[0.98]"
                  >
                    {/* Subtle accent bar */}
                    <div className="w-1 h-4 bg-orange-400/70 rounded-full group-hover:bg-orange-500 transition-colors duration-200"></div>

                    {/* Content */}
                    <span className="text-sm font-medium">
                      Lernbeiträge anzeigen
                    </span>
                  </button>
                </div>
              )}
              {chapters.length > 0 ? (
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <IoListOutline className="h-5 w-5 text-dsp-orange" />
                    Kapitel ({chapters.length})
                  </h2>
                  <div className="space-y-3">
                    {chapters.map((chapter, index) => (
                      <motion.div
                        key={chapter.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        className="bg-white rounded-lg border border-gray-200 p-4 hover:border-dsp-orange/30 hover:bg-dsp-orange_light transition-all cursor-pointer"
                        onClick={() =>
                          navigate(
                            `/modules/${moduleId}/chapters/${chapter.id}`,
                          )
                        }
                      >
                        <div className="flex items-center gap-4">
                          <div className="flex-shrink-0 w-12 h-12 bg-dsp-orange rounded-lg flex items-center justify-center">
                            <IoBookOutline className="h-6 w-6 text-white" />
                          </div>
                          <div className="flex-grow">
                            <h3 className="font-semibold text-gray-900 mb-1">
                              Kapitel {chapter.order}: {chapter.title}
                            </h3>
                            {chapter.description && (
                              <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                                {chapter.description}
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
                </div>
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
        </div>
      </div>
    </div>
  );
}

export default ModuleDetail;

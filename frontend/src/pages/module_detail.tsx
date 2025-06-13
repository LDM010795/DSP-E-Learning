import { useRef, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperClass } from "swiper";
import "swiper/swiper-bundle.css";
import TagDifficulty from "../components/tags/tag_difficulty";
import type { DifficultyLevel } from "../components/tags/tag_difficulty";
import { TbTriangleInvertedFilled } from "react-icons/tb";
import { FaCheckCircle } from "react-icons/fa";
import Breadcrumbs from "../components/ui_elements/breadcrumbs";
import LearningContentVideoLayout from "../components/layouts/learning_content_video";
import ButtonSwipe from "../components/ui_elements/buttons/button_swipe";
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

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center h-64">
        <p className="text-lg text-gray-600">Lade Moduldetails...</p>
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
      <div className="p-6">
        <Breadcrumbs items={errorBreadcrumbs} className="mb-6" />
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Fehler</h1>
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
          role="alert"
        >
          <strong className="font-bold">Fehler beim Laden der Module!</strong>
          <span className="block sm:inline"> {error.message}</span>
          <button
            onClick={fetchModules}
            className="ml-4 mt-2 sm:mt-0 px-3 py-1 text-sm bg-red-200 text-red-800 rounded hover:bg-red-300"
          >
            Erneut versuchen
          </button>
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
      <div className="p-6">
        <Breadcrumbs items={notFoundBreadcrumbs} className="mb-6" />
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          Modul nicht gefunden
        </h1>
        <p className="text-gray-600">
          Das angeforderte Modul konnte nicht gefunden werden.
          <Link to="/modules" className="text-blue-600 hover:underline ml-2">
            Zurück zur Modulübersicht
          </Link>
        </p>
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
    <div className="p-6 flex flex-col">
      <Breadcrumbs items={breadcrumbItems} className="mb-6" />

      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">{module.title}</h1>
          <p className="text-base text-gray-600 mt-1">
            Vertiefe dein Wissen mit Videos, Texten und Aufgaben.
          </p>
        </div>
        <div className="flex gap-3 flex-shrink-0">
          <ButtonSwipe
            onClick={handlePrev}
            icon={<TbTriangleInvertedFilled />}
            classNameIcon="rotate-90"
          />
          <ButtonSwipe
            onClick={handleNext}
            icon={<TbTriangleInvertedFilled />}
            classNameIcon="rotate-270"
          />
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="w-full lg:w-2/3 max-w-full overflow-hidden">
          {contents.length > 0 ? (
            <Swiper
              spaceBetween={20}
              slidesPerView={1}
              onSwiper={(swiper) => {
                swiperRef.current = swiper;
              }}
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
            <p className="text-gray-500 p-4 bg-gray-100 rounded-lg">
              Kein Lerninhalt für dieses Modul verfügbar.
            </p>
          )}
        </div>

        <div className="w-full lg:w-1/3 max-w-full overflow-hidden bg-white border border-gray-300 rounded-lg p-4 self-start">
          <h2 className="text-lg font-semibold mb-4">Aufgaben</h2>
          {tasks.length > 0 ? (
            <ul className="space-y-4">
              {tasks.map((task: Task) => (
                <li
                  key={task.id}
                  className={`p-4 border rounded-md cursor-pointer hover:bg-gray-50 transition duration-150 ease-in-out ${
                    task.completed
                      ? "border-green-300 bg-green-50"
                      : "border-gray-200"
                  }`}
                  onClick={() =>
                    navigate(`/modules/${module?.id}/tasks/${task.id}`)
                  }
                >
                  <div className="flex justify-between items-center mb-1">
                    <div className="flex items-center gap-2">
                      {task.completed && (
                        <FaCheckCircle
                          className="text-green-500 flex-shrink-0"
                          title="Abgeschlossen"
                        />
                      )}
                      <h3
                        className={`text-md font-medium ${
                          task.completed ? "text-gray-600" : "text-gray-800"
                        }`}
                      >
                        {task.title}
                      </h3>
                    </div>
                    <TagDifficulty
                      difficulty={task.difficulty as DifficultyLevel}
                    />
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">
              Keine Aufgaben für dieses Modul verfügbar.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default ModuleDetail;

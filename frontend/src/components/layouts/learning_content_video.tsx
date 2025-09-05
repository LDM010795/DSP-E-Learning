import React from "react";
import { VideoPlayer } from "../videos";
import { GoBook } from "react-icons/go";
import { IoPlayOutline } from "react-icons/io5";
import type { Content } from "../../context/ModuleContext";
import SubBackground from "./SubBackground";

interface LearningContentVideoLayoutProps {
  videoUrl: string;
  title: string;
  description: string;
  supplementaryContent?: { label: string; url: string }[];
  currentLessonIndex: number;
  totalLessons: number;
  contentId?: number; // Neue Prop für Content ID
  relatedVideos?: Pick<Content, "id" | "title" | "video_url">[];
  onSelectContent?: (contentId: number) => void;
}

const LearningContentVideoLayout: React.FC<LearningContentVideoLayoutProps> = ({
  videoUrl,
  title,
  description,
  supplementaryContent,
  currentLessonIndex,
  totalLessons,
  contentId,
  relatedVideos,
  onSelectContent,
}) => {
  return (
    <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-start">
      {/* Linke Spalte: Video + Beschreibung */}
      <div className="lg:col-span-8">
        <div className="w-full h-[34vh] sm:h-[40vh] md:h-[46vh] lg:h-[56vh] xl:h-[62vh] 2xl:h-[68vh] rounded-xl overflow-hidden border border-gray-200 bg-transparent">
          <VideoPlayer videoUrl={videoUrl} contentId={contentId} />
        </div>

        <SubBackground className="mt-4 w-full rounded-xl border border-gray-200">
          <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">{title}</h2>

          <div className="mb-4">
            <span className="inline-flex items-center gap-2 text-gray-600 bg-white/60 backdrop-blur-sm border border-gray-300/50 rounded-lg p-1 px-2 text-sm">
              <GoBook className="text-dsp-orange" />
              Lektionen: {currentLessonIndex + 1} von {totalLessons}
            </span>
          </div>

          <p className="text-sm sm:text-base leading-relaxed">{description}</p>
        </SubBackground>

        {supplementaryContent && supplementaryContent.length > 0 && (
          <SubBackground className="mt-4 w-full rounded-xl border border-gray-200">
            <h3 className="text-lg font-semibold mb-1">
              Zusätzliche Ressourcen
            </h3>
            <ul className="list-disc list-inside">
              {supplementaryContent.map((item, index) => (
                <li key={index}>
                  <a
                    target="_blank"
                    rel="noopener noreferrer"
                    href={item.url}
                    className="text-blue-600 hover:underline"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </SubBackground>
        )}
      </div>

      {/* Rechte Spalte: Weitere Videos im Kapitel */}
      <aside className="lg:col-span-4">
        {Array.isArray(relatedVideos) && relatedVideos.length > 0 && (
          <SubBackground className="lg:sticky lg:top-4" padding="sm">
            <h3 className="text-lg font-semibold mb-3">
              Weitere Lernvideos ({relatedVideos.length})
            </h3>
            <div className="max-h-[40vh] sm:max-h-[48vh] lg:max-h-[64vh] overflow-auto pr-1 space-y-2">
              {relatedVideos.map((rv, idx) => {
                const isActive = rv.id === contentId;
                return (
                  <button
                    key={rv.id}
                    type="button"
                    onClick={() => onSelectContent?.(rv.id)}
                    className={`w-full text-left p-2 sm:p-3 rounded-lg border transition-colors flex items-start gap-3 bg-white/60 backdrop-blur-sm ${
                      isActive
                        ? "border-dsp-orange bg-[#ffe7d4]/80"
                        : "border-white/40 hover:border-dsp-orange/40 hover:bg-[#ffe7d4]/50"
                    }`}
                  >
                    <div className="mt-0.5 flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-md bg-dsp-orange/20 text-dsp-orange flex items-center justify-center">
                      <IoPlayOutline className="w-4 h-4 sm:w-4 sm:h-4" />
                    </div>
                    <div className="flex-1">
                      <div
                        className={`font-medium text-sm sm:text-base ${isActive ? "text-dsp-orange" : "text-gray-800"}`}
                      >
                        <span className="text-gray-500 mr-1">{idx + 1}.</span>{" "}
                        {rv.title}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </SubBackground>
        )}
      </aside>
    </div>
  );
};

export default LearningContentVideoLayout;

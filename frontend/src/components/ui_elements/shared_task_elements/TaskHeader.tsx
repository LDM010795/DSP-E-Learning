import { memo } from "react";
import { FaPenToSquare } from "react-icons/fa6";

export const TaskHeader = memo(function TaskHeader({
  title,
}: {
  title: string;
}) {
  return (
    <div className="inline-flex items-center gap-2">
      <div className="p-3 rounded-xl bg-dsp-orange_light">
        <FaPenToSquare className="w-5 h-5 text-dsp-orange" />
      </div>
      <h1 className="text-lg text-gray-600">{title}</h1>
    </div>
  );
});
TaskHeader.displayName = "TaskHeader";

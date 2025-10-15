import React from "react";
import { toast } from "sonner";
import type { JSX } from "react";
import {
  IoCheckmarkCircleOutline,
  IoAlertCircleOutline,
  IoWarningOutline,
  IoInformationCircleOutline,
  IoCloseOutline,
} from "react-icons/io5";
import clsx from "clsx";

// Typdefinitionen für die Props
export type NotificationType = "success" | "error" | "warning" | "info";

interface DspNotificationProps {
  id: string | number; // Wird von sonner übergeben
  type?: NotificationType;
  title?: React.ReactNode;
  message: React.ReactNode;
}

// Farben und Icons basierend auf dem Typ
const notificationStyles: Record<
  NotificationType,
  {
    icon: JSX.Element;
    border: string;
    title: string;
    message: string;
    hoverBg: string;
    hoverText: string;
  }
> = {
  success: {
    icon: <IoCheckmarkCircleOutline className="h-6 w-6 text-green-500" />,
    border: "border-green-500",
    title: "text-green-800",
    message: "text-green-700",
    hoverBg: "hover:bg-green-100",
    hoverText: "hover:text-green-900",
  },
  error: {
    icon: <IoAlertCircleOutline className="h-6 w-6 text-red-500" />,
    border: "border-red-500",
    title: "text-red-800",
    message: "text-red-700",
    hoverBg: "hover:bg-red-100",
    hoverText: "hover:text-red-900",
  },
  warning: {
    icon: <IoWarningOutline className="h-6 w-6 text-blue-500" />,
    border: "border-blue-500",
    title: "text-blue-800",
    message: "text-blue-700",
    hoverBg: "hover:bg-blue-100",
    hoverText: "hover:text-blue-900",
  },
  info: {
    icon: <IoInformationCircleOutline className="h-6 w-6 text-dsp-orange" />,
    border: "border-dsp-orange",
    title: "text-orange-800",
    message: "text-orange-700",
    hoverBg: "hover:bg-orange-100",
    hoverText: "hover:text-dsp-orange",
  },
};

const DspNotification: React.FC<DspNotificationProps> = ({
  id,
  type = "info", // Standardtyp ist jetzt 'info' (Orange)
  title,
  message,
}) => {
  const styles = notificationStyles[type];

  return (
    <div
      className={clsx(
        "pointer-events-auto w-full max-w-sm overflow-hidden rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5 border-l-4",
        styles.border,
      )}
    >
      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">{styles.icon}</div>
          <div className="ml-3 flex-1">
            {title && (
              <p className={clsx("text-sm font-medium", styles.title)}>
                {title}
              </p>
            )}
            <div
              className={clsx("text-sm", styles.message, title ? "mt-1" : "")}
            >
              {message}
            </div>
          </div>
          <div className="ml-4 flex flex-shrink-0">
            <button
              type="button"
              className={clsx(
                "inline-flex rounded-md bg-white text-gray-400 focus:outline-none focus:ring-2 focus:ring-dsp-orange focus:ring-offset-2",
                styles.hoverBg,
                styles.hoverText,
              )}
              onClick={() => toast.dismiss(id)}
            >
              <span className="sr-only">Schließen</span>
              <IoCloseOutline className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DspNotification;

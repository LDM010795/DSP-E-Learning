/**
 *
 * Central export file for all Dashboard UI components.
 * This file re-exports individual component modules to allow
 * cleaner and more maintainable imports throughout the application.
 *
 * Example usage:
 *   import { SectionTitle, StatPill } from "@/components/dashboard";
 *
 * Components exported:
 * - SectionTitle       → Reusable section header with optional icon
 * - StreakBadge        → Displays weekly learning streak
 * - StatPill           → Shows high-level dashboard metrics
 * - ActiveModuleCard   → Displays progress of a specific learning module
 * - UpcomingEventCard  → Displays an upcoming event or deadline
 *
 * Author: DSP development team
 * Date: 29-10-2025
 */

export { default as SectionTitle } from "./SectionTitle";
export { default as StreakBadge } from "./StreakBadge";
export { default as StatPill } from "./StatPill";
export { default as ActiveModuleCard } from "./ActiveModuleCard";
export { default as UpcomingEventCard } from "./UpcomingEventCard";

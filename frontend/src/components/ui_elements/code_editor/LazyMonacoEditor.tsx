/**
 * Performance-Optimized Lazy Monaco Editor
 *
 * Key optimizations:
 * - Lazy loading with React.lazy to reduce initial bundle size
 * - Dynamic monaco import only when component is needed
 * - Performance fallback during loading
 * - Memoized configuration to prevent unnecessary re-renders
 * - Optional preloading for better UX
 */

import React, {
  memo,
  Suspense,
  useRef,
  useEffect,
  useImperativeHandle,
  forwardRef,
} from "react";
import { useShallowMemo } from "../../../util/performance";
import { getDspThemeColorCode } from "../../../util/helpers/color_theme_utils";

// Lazy load Monaco Editor to reduce initial bundle size (~2MB reduction)
const MonacoEditorComponent = React.lazy(async () => {
  // Dynamic import reduces initial bundle by ~2MB
  const monaco = await import("monaco-editor");

  return {
    default: ({
      initialValue,
      onChange,
      className,
      containerRef,
      editorInstanceRef,
    }: any) => {
      useEffect(() => {
        // Define custom theme once
        monaco.editor.defineTheme("orangeTheme", {
          base: "vs",
          inherit: true,
          rules: [{ token: "", foreground: "000000", background: "ffe7d4" }],
          colors: {
            "editor.background": getDspThemeColorCode("dsp-orange_light"),
            "editor.foreground": "#000000",
            "editorCursor.foreground": getDspThemeColorCode("dsp-orange"),
            "editor.lineHighlightBackground": "#FFECB3",
            "editorLineNumber.foreground": getDspThemeColorCode("dsp-orange"),
            "editor.selectionBackground": "#FFD180",
            "editor.inactiveSelectionBackground": "#FFE0B2",
          },
        });

        if (containerRef.current) {
          editorInstanceRef.current = monaco.editor.create(
            containerRef.current,
            {
              value: initialValue,
              language: "python",
              theme: "orangeTheme",
              automaticLayout: true,
              fontSize: 16,
              fontFamily: 'Fira Code, Consolas, "Courier New", monospace',
              wordWrap: "on",
              minimap: { enabled: false },
              smoothScrolling: true,
              scrollBeyondLastLine: false,
              renderLineHighlight: "all",
              roundedSelection: true,
              folding: true,
              renderWhitespace: "all",
            },
          );

          const subscription =
            editorInstanceRef.current.onDidChangeModelContent(() => {
              const currentCode = editorInstanceRef.current?.getValue() || "";
              onChange(currentCode);
            });

          return () => {
            subscription.dispose();
            editorInstanceRef.current?.dispose();
          };
        }
      }, [initialValue, onChange, containerRef, editorInstanceRef]);

      return (
        <div
          style={{
            borderTopLeftRadius: "8px",
            borderBottomLeftRadius: "8px",
            overflow: "hidden",
          }}
          className={className}
          ref={containerRef}
        />
      );
    },
  };
});

// Performance fallback component
const MonacoLoadingFallback = memo(() => (
  <div className="w-full h-64 bg-orange-50 border border-orange-200 rounded-lg flex items-center justify-center">
    <div className="text-center">
      <div className="animate-pulse mb-3">
        <div className="w-16 h-16 bg-orange-300 rounded-lg mx-auto mb-2"></div>
        <div className="h-3 bg-orange-200 rounded w-32 mx-auto mb-1"></div>
        <div className="h-3 bg-orange-200 rounded w-24 mx-auto"></div>
      </div>
      <p className="text-orange-600 text-sm font-medium">Code Editor lädt...</p>
      <p className="text-orange-500 text-xs mt-1">
        Erstmaliges Laden kann etwas dauern
      </p>
    </div>
  </div>
));

MonacoLoadingFallback.displayName = "MonacoLoadingFallback";

// Handle type for imperative methods
export interface LazyMonacoEditorHandle {
  setValue: (newValue: string) => void;
}

interface LazyMonacoEditorProps {
  initialValue?: string;
  onChange: (newCode: string) => void;
  className?: string;
  preload?: boolean; // Optional preloading for better UX
}

// Main lazy Monaco editor component
const LazyMonacoEditor = memo(
  forwardRef<LazyMonacoEditorHandle, LazyMonacoEditorProps>(
    ({ initialValue = "", onChange, className = "", preload = false }, ref) => {
      const editorContainerRef = useRef<HTMLDivElement>(null);
      const editorInstanceRef = useRef<any>(null);

      // Preload Monaco if requested (for better UX on pages where it's likely to be used)
      useEffect(() => {
        if (preload) {
          // Preload Monaco in the background without rendering
          import("monaco-editor").catch(console.warn);
        }
      }, [preload]);

      // Expose setValue method via ref
      useImperativeHandle(
        ref,
        () => ({
          setValue: (newValue: string) => {
            editorInstanceRef.current?.setValue(newValue);
          },
        }),
        [],
      );

      // Memoize props to prevent unnecessary re-renders
      const memoizedProps = useShallowMemo(
        () => ({
          initialValue,
          onChange,
          className,
          containerRef: editorContainerRef,
          editorInstanceRef,
        }),
        [initialValue, onChange, className],
      );

      return (
        <Suspense fallback={<MonacoLoadingFallback />}>
          <MonacoEditorComponent {...memoizedProps} />
        </Suspense>
      );
    },
  ),
);

LazyMonacoEditor.displayName = "LazyMonacoEditor";

// Export types and component
export default LazyMonacoEditor;
export type { LazyMonacoEditorProps };

// Utility for preloading Monaco Editor
export const preloadMonacoEditor = () => {
  return import("monaco-editor").catch(console.warn);
};

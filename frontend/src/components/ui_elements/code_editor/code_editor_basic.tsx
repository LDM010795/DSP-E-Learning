import { useRef, useEffect, useImperativeHandle, forwardRef } from "react";
import * as monaco from "monaco-editor";

// Handle-Typ definieren
export interface CodeEditorBasicHandle {
  setValue: (newValue: string) => void;
}

interface CodeEditorBasicProps {
  initialValue?: string;
  onChange: (newCode: string) => void;
  className?: string;
}

// Komponente mit forwardRef umschließen
const CodeEditorBasic = forwardRef<CodeEditorBasicHandle, CodeEditorBasicProps>(
  ({ initialValue = "", onChange, className }, ref) => {
    const editorContainerRef = useRef<HTMLDivElement>(null);
    const editorInstance = useRef<monaco.editor.IStandaloneCodeEditor | null>(
      null
    );

    // useImperativeHandle verwenden, um setValue verfügbar zu machen
    useImperativeHandle(ref, () => ({
      setValue: (newValue: string) => {
        editorInstance.current?.setValue(newValue);
      },
    }));

    useEffect(() => {
      monaco.editor.defineTheme("orangeTheme", {
        base: "vs",
        inherit: true,
        rules: [{ token: "", foreground: "000000", background: "ffe7d4" }],
        colors: {
          "editor.background": "#ffe7d4", // Leicht oranger Hintergrund
          "editor.foreground": "#000000",
          "editorCursor.foreground": "#ff863d",
          "editor.lineHighlightBackground": "#FFECB3",
          "editorLineNumber.foreground": "#ff863d",
          "editor.selectionBackground": "#FFD180",
          "editor.inactiveSelectionBackground": "#FFE0B2",
        },
      });

      if (editorContainerRef.current) {
        editorInstance.current = monaco.editor.create(
          editorContainerRef.current,
          {
            value: initialValue,
            language: "python",
            theme: "orangeTheme", // Verwende das benutzerdefinierte, oranger Theme
            automaticLayout: true,
            fontSize: 16,
            fontFamily: 'Fira Code, Consolas, "Courier New", monospace',
            wordWrap: "on", // Automatischer Zeilenumbruch
            minimap: { enabled: false }, // Minimap deaktivieren für ein cleanes Layout
            smoothScrolling: true, // Weiches Scrollen
            scrollBeyondLastLine: false,
            renderLineHighlight: "all", // Hebt die gesamte Zeile hervor
            roundedSelection: true,
            folding: true,
            renderWhitespace: "all",
          }
        );

        const subscription = editorInstance.current.onDidChangeModelContent(
          () => {
            const currentCode = editorInstance.current?.getValue() || "";
            onChange(currentCode);
          }
        );

        return () => {
          subscription.dispose();
          editorInstance.current?.dispose();
        };
      }
    }, []); // Dependency Array bleibt leer für einmalige Initialisierung

    return (
      <div
        style={{
          borderTopLeftRadius: "8px",
          borderBottomLeftRadius: "8px",
          overflow: "hidden",
        }}
        className={`${className}`}
        ref={editorContainerRef}
      ></div>
    );
  }
);

export default CodeEditorBasic;

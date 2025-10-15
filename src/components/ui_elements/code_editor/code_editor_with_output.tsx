// CodeEditorWithOutput.tsx
import React, { useState, useRef, useEffect, useCallback } from "react";
import CodeEditorBasic from "./code_editor_basic";
import type { CodeEditorBasicHandle } from "./code_editor_basic";
import api from "../../../util/apis/api";
import ButtonPrimary from "../buttons/button_primary";
import ButtonSecondary from "../buttons/button_secondary";
import { IoChevronDown, IoChevronUp, IoRefresh } from "react-icons/io5";
import { motion, useAnimation } from "framer-motion";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import axios, { AxiosResponse } from "axios";
import { useDebounce } from "../../../util/performance";

// Ergebnis der Testläufe
interface TestResultDetails {
  runs: number;
  success: boolean;
  errors: [string, string][]; // [test_name, error_message]
  failures: [string, string][]; // [test_name, failure_message]
}

// Komplette Backend-Antwort
interface ExecutionResponse {
  stdout: string;
  stderr: string;
  execution_error: string | null;
  test_results: TestResultDetails | null;
}

// Interface for the component's props
interface CodeEditorWithOutputProps {
  initialCode?: string;
  taskId: number | null; // Allow null if no task is associated
  className?: string;
  onSuccess?: () => void;
}

const CodeEditorWithOutput: React.FC<CodeEditorWithOutputProps> = ({
  initialCode = "# Schreibe hier deinen Code rein...",
  taskId,
  className = "",
  onSuccess,
}) => {
  const [currentCode, setCurrentCode] = useState<string>(initialCode);
  const [output, setOutput] = useState<string>("");
  const [testSummary, setTestSummary] = useState<React.ReactNode | null>(null); // For displaying test results summary
  const [isOutputVisible, setIsOutputVisible] = useState<boolean>(true);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const editorBasicRef = useRef<CodeEditorBasicHandle>(null);
  const resetIconControls = useAnimation();

  // Debounced Code für Auto-Syntax-Checking (1000ms Verzögerung)
  const debouncedCode = useDebounce(currentCode, 1000);

  // Reset editor if initialCode or taskId changes
  useEffect(() => {
    setCurrentCode(initialCode);
    editorBasicRef.current?.setValue(initialCode);
    setOutput("");
    setTestSummary(null);
    setIsOutputVisible(true); // Show output on reset/change
  }, [initialCode, taskId]);

  // Optional: Auto-Syntax-Checking bei Code-Änderungen
  useEffect(() => {
    if (debouncedCode && debouncedCode !== initialCode) {
      // Hier könnte Syntax-Checking implementiert werden
      console.log(
        "Code changed for syntax checking:",
        debouncedCode.length,
        "characters",
      );
    }
  }, [debouncedCode, initialCode]);

  const handleCodeChange = (newCode: string) => {
    setCurrentCode(newCode);
    // Output nur bei explizitem Run löschen, nicht bei Code-Änderungen
  };

  const handleRunCode = useCallback(async () => {
    if (taskId === null) {
      setOutput("Keine Aufgabe ausgewählt, um den Code zu testen.");
      setTestSummary(null);
      setIsOutputVisible(true);
      return;
    }

    setIsRunning(true);
    setOutput("Code wird ausgeführt und getestet...");
    setTestSummary(null);

    const payload = { code: currentCode, task_id: taskId };

    try {
      const response: AxiosResponse<ExecutionResponse> = await api.post(
        "/modules/execute/",
        payload,
      );
      const { stdout, stderr, execution_error, test_results } = response.data;

      let combinedOutput = stdout;
      if (stderr) {
        combinedOutput += `\n\n--- stderr ---\n${stderr}`;
      }
      if (execution_error) {
        combinedOutput += `\n\n--- Ausführungsfehler ---\n${execution_error}`;
      }

      let testDetails = "";
      let wasSuccessful = false;

      if (test_results) {
        const errorCount = test_results.errors.length;
        const failureCount = test_results.failures.length;
        wasSuccessful = test_results.success;

        if (wasSuccessful) {
          setTestSummary(
            <span className="flex items-center text-green-600">
              <FaCheckCircle className="mr-2" />
              Alle {test_results.runs} Tests erfolgreich bestanden!
            </span>,
          );

          if (onSuccess) {
            console.log("Rufe onSuccess Callback auf (öffnet Modal)...");
            onSuccess();
          }
        } else {
          setTestSummary(
            <span className="flex items-center text-red-600">
              <FaTimesCircle className="mr-2" />
              Tests fehlgeschlagen ({errorCount} Fehler, {failureCount}{" "}
              Fehlschläge in {test_results.runs} Läufen).
            </span>,
          );
          if (errorCount > 0) {
            testDetails += "\n\n--- Test Fehler ---";
            test_results.errors.forEach(([test, err]: [string, string]) => {
              testDetails += `\nError in ${test}:\n${err}`;
            });
          }
          if (failureCount > 0) {
            testDetails += "\n\n--- Test Fehlschläge ---";
            test_results.failures.forEach(([test, fail]: [string, string]) => {
              testDetails += `\nFailure in ${test}:\n${fail}`;
            });
          }
        }
      } else if (!execution_error) {
        setTestSummary("Keine Testergebnisse zurückgegeben.");
      } else {
        setTestSummary(null); // Error already shown in output
      }

      setOutput((combinedOutput + testDetails).trim() || "Keine Ausgabe.");
      setIsOutputVisible(true);
    } catch (error) {
      console.error("Error code execution:", error);
      let errorMsg = "Unbekannter Fehler";
      if (axios.isAxiosError(error) && error.response?.data?.error) {
        errorMsg = error.response.data.error;
      } else if (error instanceof Error) {
        errorMsg = error.message;
      }

      setOutput(`Fehler bei der Anfrage: ${errorMsg}`);
      setTestSummary(
        <span className="flex items-center text-red-600">
          <FaTimesCircle className="mr-2" /> Fehler bei der Code-Ausführung.
        </span>,
      );
      setIsOutputVisible(true);
    } finally {
      setIsRunning(false);
    }
  }, [currentCode, taskId, onSuccess]);

  const handleResetCode = () => {
    setCurrentCode(initialCode); // Use initialCode prop
    editorBasicRef.current?.setValue(initialCode); // Use initialCode prop
    setOutput("");
    setTestSummary(null);
  };

  const handleResetHoverStart = () => {
    resetIconControls.start({
      rotate: 360,
      transition: { duration: 0.4, ease: "easeInOut" },
    });
  };

  const handleResetHoverEnd = () => {
    resetIconControls.start({
      rotate: 0,
      transition: { duration: 0 },
    });
  };

  // Corrected main container structure
  return (
    <div
      className={`w-full h-full flex flex-col rounded-lg bg-white p-6 border border-gray-300 shadow-sm gap-4 ${className}`}
    >
      {/* Top bar with title and buttons */}
      <div className="flex justify-between items-center border-b border-gray-200 pb-3">
        <h1 className="text-lg font-semibold">Code-Editor</h1>
        <div className="flex gap-3">
          <ButtonSecondary
            title="Zurücksetzen"
            icon={
              <motion.span
                style={{ display: "inline-block" }}
                animate={resetIconControls}
              >
                <IoRefresh size={18} />
              </motion.span>
            }
            onClick={handleResetCode}
            onHoverStart={handleResetHoverStart}
            onHoverEnd={handleResetHoverEnd}
            classNameButton="text-xs px-3 py-1"
            iconPosition="left"
          />
          <ButtonPrimary
            title={isRunning ? "Wird ausgeführt..." : "Code ausführen & testen"}
            onClick={handleRunCode}
            disabled={isRunning || taskId === null} // Disable if no task ID
            classNameButton="text-xs px-3 py-1"
          />
        </div>
      </div>
      {/* Code Editor Area */}
      <div className="flex-grow min-h-[200px]">
        <CodeEditorBasic
          ref={editorBasicRef}
          className="w-full h-full rounded-lg border border-gray-300 overflow-hidden"
          initialValue={currentCode}
          onChange={handleCodeChange}
        />
      </div>
      {/* Output Area */}
      <div className="border-t border-gray-200 pt-3">
        <div className="flex justify-between items-center mb-2">
          <div className="flex flex-col">
            <h3 className="text-base font-semibold">Output & Ergebnisse</h3>
            {/* Display Test Summary */}
            {testSummary && <div className="text-sm mt-1">{testSummary}</div>}
          </div>
          <button
            onClick={() => setIsOutputVisible(!isOutputVisible)}
            className="p-1 rounded hover:bg-gray-100 text-gray-500 self-start" // Align top
            aria-label={
              isOutputVisible ? "Output ausblenden" : "Output einblenden"
            }
          >
            {isOutputVisible ? (
              <IoChevronUp size={20} />
            ) : (
              <IoChevronDown size={20} />
            )}
          </button>
        </div>
        <div
          className={`transition-all duration-300 ease-in-out overflow-hidden ${
            isOutputVisible ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          {/* Adjusted output display area */}
          <div className="max-h-[300px] overflow-y-auto h-auto p-3 border border-gray-300 bg-gray-50 rounded-lg">
            <pre className="text-sm whitespace-pre-wrap break-words">
              {output || " "} {/* Ensure some content to prevent collapse */}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodeEditorWithOutput;

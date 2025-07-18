import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import fs from "fs";

// Plugin, um fehlende Monaco Editor Source Maps zu ignorieren
function ignoreMonacoMarkedSourceMap() {
  const mapFileName = "marked.umd.js.map";
  return {
    name: "ignore-monaco-marked-sourcemap",
    load(id: string) {
      if (id.endsWith(mapFileName) && id.includes("monaco-editor")) {
        // Liefere eine leere Source Map, um Fehler zu vermeiden
        return {
          code: "{}",
          map: null,
        };
      }
      // Für die JS-Datei selbst entfernen wir die SourceMappingURL-Zeile
      if (id.endsWith("/marked.js") && id.includes("monaco-editor")) {
        const original = fs.readFileSync(id, "utf-8");
        const filtered = original.replace(/\/\/# sourceMappingURL=.*/gm, "");
        return {
          code: filtered,
          map: null,
        };
      }
      return null;
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), ignoreMonacoMarkedSourceMap()],
  server: {
    preTransformRequests: true,
  },

  build: {
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          "vendor-react": ["react", "react-dom", "react-router-dom"],
          "vendor-charts": ["echarts", "echarts-for-react"],
          "vendor-monaco": ["monaco-editor", "@monaco-editor/react"],
          "vendor-ui": ["framer-motion", "clsx", "lucide-react", "react-icons"],
          "vendor-utils": ["axios", "jwt-decode", "sonner"],
        },
      },
      onwarn(warning, warn) {
        // Ignoriere Source Map Warnungen für Monaco Editor
        if (
          warning.code === "SOURCEMAP_ERROR" &&
          warning.message.includes("monaco-editor")
        ) {
          return;
        }
        warn(warning);
      },
    },
    minify: "esbuild",
    chunkSizeWarningLimit: 2000,
  },

  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "react-router-dom",
      "clsx",
      "framer-motion",
      "axios",
      "jwt-decode",
    ],
    exclude: ["monaco-editor", "echarts", "pyodide"],
  },

  esbuild: {
    treeShaking: true,
    drop: ["console", "debugger"],
  },

  css: {
    devSourcemap: false,
    preprocessorOptions: {
      // Add any CSS optimizations here
    },
  },

  // Monaco Editor spezifische Konfiguration
  resolve: {
    alias: {
      // Verhindere Source Map Probleme für Monaco Editor
      "monaco-editor": "monaco-editor/esm/vs/editor/editor.api",
    },
  },

  // Source Map Konfiguration
  define: {
    // Deaktiviere Source Maps für Monaco Editor
    "process.env.NODE_ENV": JSON.stringify(
      process.env.NODE_ENV || "development",
    ),
  },

  // Spezifische Regeln für Monaco Editor
  assetsInclude: ["**/*.wasm"],
});

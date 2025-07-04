import React from "react";
import { ContentRenderer } from "../components/contributions";
import type { ContentBlock } from "../components/contributions/ContentRenderer";

const ContentDemo: React.FC = () => {
  const demoContent: ContentBlock[] = [
    // Metadaten
    {
      type: "metadata",
      data: {
        author: "Dr. Maria Schmidt",
        version: "1.0",
        date: "15.12.2024",
      },
    },

    // Haupttitel
    {
      type: "title",
      data: {
        content: "Beispiel-Kurs: Alle verfügbaren Komponenten",
      },
    },

    // Lernziele
    {
      type: "learningObjectives",
      data: {
        objectives: [
          "Sie lernen alle verfügbaren Content-Komponenten kennen",
          "Sie verstehen die standardisierten Titel für Hinweise, Tipps und wichtige Informationen",
          "Sie sehen die einheitliche Gestaltung aller Elemente",
        ],
      },
    },

    // Inhaltsverzeichnis
    {
      type: "tableOfContents",
      data: {
        items: [
          { title: "Text-Komponenten" },
          { title: "Hervorhebungs-Komponenten" },
          { title: "Code und Medien" },
          { title: "Strukturelle Elemente" },
        ],
      },
    },

    // Beispiel: Einfache Liste
    {
      type: "list",
      data: {
        listItems: ["Auflistung 1", "Auflistung 2", "Auflistung 3"],
      },
    },

    // Beispiele für Titel-Level
    {
      type: "title",
      data: {
        content: "Titel Level 1 (Standard) - Hauptüberschrift",
        level: 1,
      },
    },

    {
      type: "title",
      data: {
        content: "Titel Level 2 - Kapitelüberschrift",
        level: 2,
      },
    },

    {
      type: "title",
      data: {
        content: "Titel Level 3 - Unterkapitel",
        level: 3,
      },
    },

    // Zeige alle Level in Aktion
    {
      type: "title",
      data: {
        content: "Text-Komponenten",
        level: 1,
      },
    },

    {
      type: "title",
      data: {
        content: "Standardtext und Formatierungen",
        level: 2,
      },
    },

    {
      type: "title",
      data: {
        content: "Inline-Markierungen",
        level: 3,
      },
    },

    // Normaler Text
    {
      type: "text",
      data: {
        content:
          "Dies ist ein Beispiel für normalen Fließtext. Hier können längere Erklärungen und Beschreibungen stehen, die den Hauptinhalt des Kurses bilden.",
      },
    },

    // Text mit inline-Markierungen
    {
      type: "text",
      data: {
        content:
          "Dies ist ein zusammenhängender Text mit ==markierten Wörtern== und ==wichtigen Begriffen==. Die Markierungen helfen dabei, ==Schlüsselkonzepte== hervorzuheben, ohne den Lesefluss zu unterbrechen. So können Sie ==zentrale Informationen== auf einen Blick erkennen.",
      },
    },

    // Titel Level 2
    {
      type: "title",
      data: {
        content: "2. Hervorhebungs-Komponenten (Standardisiert)",
        level: 2,
      },
    },

    // Hinweis (standardisiert)
    {
      type: "hint",
      data: {
        content:
          "Dies ist ein standardisierter Hinweis. Der Titel 'Hinweis:' wird automatisch gesetzt.",
      },
    },

    // Wichtig (standardisiert)
    {
      type: "important",
      data: {
        content:
          "Dies ist eine standardisierte wichtige Information. Der Titel 'Wichtig!' wird automatisch gesetzt.",
      },
    },

    // Tipp (standardisiert)
    {
      type: "tip",
      data: {
        content:
          "Dies ist ein standardisierter Tipp. Der Titel 'Tipp:' wird automatisch gesetzt.",
      },
    },

    // Exkurs
    {
      type: "note",
      data: {
        content:
          "Dies ist ein Exkurs mit automatischem 'Exkurs:' Titel. Hier können zusätzliche Informationen oder Hintergründe erläutert werden.",
      },
    },

    {
      type: "title",
      data: {
        content: "3. Code und Medien (Level 2)",
        level: 2,
      },
    },

    // Code-Block
    {
      type: "code",
      data: {
        content: `SELECT members_name FROM members;`,
        language: "sql",
      },
    },

    // Bild
    {
      type: "image",
      data: {
        src: "/src/assets/example_module.png",
        alt: "Beispiel Modul Screenshot",
        caption: "Beispiel-Darstellung eines Lernmoduls",
      },
    },

    {
      type: "title",
      data: {
        content: "4. Referenzen und Quellen (Level 2)",
        level: 2,
      },
    },

    // Quellen
    {
      type: "sources",
      data: {
        sources: [
          {
            title: "JavaScript: The Definitive Guide",
          },
          {
            title: "MDN Web Docs",
            url: "https://developer.mozilla.org",
          },
          {
            title: "W3Schools JavaScript Tutorial",
            url: "https://www.w3schools.com/js/",
          },
          {
            title: "JavaScript Grundlagen - Videokurs",
          },
        ],
      },
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <ContentRenderer content={demoContent} />
        </div>
      </div>
    </div>
  );
};

export default ContentDemo;

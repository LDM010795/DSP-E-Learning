# E-Learning DSP Frontend - Entwickler-Onboarding & Projekt-Guide

## 📋 Inhaltsverzeichnis

1. [Projekt-Übersicht](#projekt-übersicht)
2. [Architektur & Struktur](#architektur--struktur)
3. [Entwicklungsumgebung & Workflow](#entwicklungsumgebung--workflow)
4. [React Components im Detail](#react-components-im-detail)
5. [API-Integration & Services](#api-integration--services)
6. [Code-Standards & Best Practices](#code-standards--best-practices)
7. [Debugging & Troubleshooting](#debugging--troubleshooting)
8. [Projektaufgaben & Management](#projektaufgaben--management)

---

## 🎯 Projekt-Übersicht

**E-Learning DSP Frontend** ist eine **moderne React-Anwendung** für die digitale Lernplattform. Die Anwendung bietet eine intuitive Benutzeroberfläche für Lernende, Dozenten und Administratoren mit umfassenden E-Learning-Funktionen.

### 🏢 Anwendungsbereiche

- **Lernende**: Module durcharbeiten, Aufgaben lösen, Prüfungen ablegen
- **Dozenten**: Inhalte erstellen, Fortschritte verfolgen, Bewertungen durchführen
- **Administratoren**: Benutzerverwaltung, Systemkonfiguration, Statistiken

### 🏗️ Design-Prinzipien

- **Moderne React-Architektur**: React 19, TypeScript, Vite
- **Responsive Design**: Mobile-First Ansatz mit TailwindCSS
- **Performance-Optimierung**: Lazy Loading, Code Splitting, Prefetching
- **Enterprise-Ready**: Microsoft OAuth Integration, JWT Authentication
- **Developer Experience**: TypeScript, ESLint, moderne Tooling

---

## 🏗️ Architektur & Struktur

### 📁 Projektstruktur

```
E-Learning DSP/
├── frontend/                 # React-Anwendung
│   ├── src/                 # Quellcode
│   │   ├── components/      # Wiederverwendbare Komponenten
│   │   │   ├── layouts/     # Layout-Komponenten
│   │   │   ├── common/      # Gemeinsame UI-Komponenten
│   │   │   ├── ui_elements/ # Basis-UI-Elemente
│   │   │   ├── charts/      # Diagramm-Komponenten
│   │   │   ├── cards/       # Karten-Komponenten
│   │   │   ├── tables/      # Tabellen-Komponenten
│   │   │   ├── forms/       # Formular-Komponenten
│   │   │   └── messages/    # Nachrichten-Komponenten
│   │   ├── pages/           # Seiten-Komponenten
│   │   │   ├── admin_panel/ # Admin-Bereich
│   │   │   ├── final_exam/  # Prüfungsbereich
│   │   │   ├── statistics/  # Statistik-Seiten
│   │   │   └── user_settings/ # Benutzereinstellungen
│   │   ├── context/         # React Context
│   │   ├── hooks/           # Custom Hooks
│   │   ├── util/            # Utilities und Services
│   │   │   ├── apis/        # API-Integration
│   │   │   ├── performance/ # Performance-Optimierung
│   │   │   └── helpers/     # Hilfsfunktionen
│   │   └── assets/          # Statische Assets
│   ├── public/              # Öffentliche Dateien
│   ├── package.json         # Dependencies
│   ├── vite.config.ts       # Vite-Konfiguration
│   └── tsconfig.json        # TypeScript-Konfiguration
├── requirements.txt         # Python-Dependencies (Backend)
└── performance-optimization-report.md # Performance-Report
```

### 🔄 Datenfluss-Architektur

```
User Interface → React Components → Context/State → API Services → DSP Backend
     ↓              ↓                    ↓              ↓              ↓
  TailwindCSS   TypeScript         React Context   Axios/HTTP    Django REST
     ↓              ↓                    ↓              ↓              ↓
  Responsive    Type Safety         State Mgmt     JWT Auth      Database
```

---

## 🚀 Entwicklungsumgebung & Workflow

### 1. Repository Setup

```bash
# Repository klonen
git clone <repository-url>
cd "E-Learning DSP"

# Auf develop Branch wechseln (Hauptentwicklungsbranch)
git checkout develop
git pull origin develop
```

### 2. Entwicklungsumgebung einrichten

```bash
# Node.js Version prüfen (mindestens 18.x)
node --version

# Dependencies installieren
cd frontend
npm install

# Environment-Konfiguration
# .env Datei wird vom Team zur Verfügung gestellt
```

### 3. Entwicklungsserver starten

```bash
# Entwicklungsserver starten (Port 5173)
npm run dev

# Anwendung öffnen: http://localhost:5173
```

### 4. Build und Deployment

```bash
# Production Build
npm run build

# Build Preview
npm run preview

# Linting
npm run lint
```

---

## 🔄 Git-Workflow

### 📋 Branch-Strategie

#### Wichtige Branches:

- **`main`**: Live-Zustand (gesperrt für direkte Pushes)
- **`develop`**: Hauptentwicklungsbranch (alle Entwickler arbeiten hierauf)
- **`feature/*`**: Feature-Branches für neue Entwicklungen
- **`bugfix/*`**: Bugfix-Branches für Fehlerbehebungen
- **`hotfix/*`**: Hotfix-Branches für kritische Live-Fixes

#### Branch-Namenskonvention:

```bash
# Feature-Branches
feature/CCS-123-neue-komponente
feature/CCS-456-dashboard-verbesserung

# Bugfix-Branches
bugfix/CCS-789-login-problem
bugfix/CCS-101-responsive-issue

# Hotfix-Branches
hotfix/CCS-999-critical-ui-fix
```

**Hinweis:** Der Prefix (`feature/`, `bugfix/`, `hotfix/`) ist nur zur Kategorisierung. Es existiert kein `feature` Branch - das ist nur eine Namenskonvention.

#### Workflow für Entwickler:

```bash
# 1. Feature-Branch erstellen (von develop)
git checkout develop
git pull origin develop
git checkout -b feature/neue-komponente

# 2. Entwicklung und lokales Testen
# - Code entwickeln
# - Lokal testen (visuell und funktional)
# - Commits machen

# 3. Feature-Branch pushen
git add .
git commit -m "feat: neue Dashboard-Komponente"
git push origin feature/neue-komponente

# 4. Pull Request auf GitHub erstellen
# - GitHub Repository öffnen
# - "Compare & pull request" klicken
# - Base: develop, Compare: feature/neue-komponente
# - Beschreibung schreiben, Reviewer zuweisen
# - "Create pull request" klicken

# 5. Review-Prozess
# - Lead Developer reviewed den Code
# - Nach Approval: Merge durch Lead
# - Feature-Branch wird automatisch gelöscht

# 6. Nächstes Feature (während Review läuft)
git checkout develop
git pull origin develop
git checkout -b feature/naechste-komponente
```

### 🎯 Beispiel-Arbeitsablauf

#### Szenario: Neue Dashboard-Komponente

```bash
# 1. Repository klonen (falls noch nicht geschehen)
git clone <repository-url>
cd "E-Learning DSP"

# 2. Auf develop Branch
git checkout develop
git pull origin develop

# 3. Feature-Branch erstellen
git checkout -b feature/dashboard-stats

# 4. Entwicklungsumgebung starten
cd frontend
npm install
npm run dev

# 5. Entwicklung und Testen
# - Neue Komponente implementieren
# - Lokal testen im Browser
# - Responsive Design prüfen
# - Performance testen

# 6. Commits machen
git add .
git commit -m "feat: add statistics dashboard component"
git commit -m "test: add unit tests for dashboard"

# 7. Feature-Branch pushen
git push origin feature/dashboard-stats

# 8. Pull Request auf GitHub erstellen
# - GitHub Repository öffnen: [Repository-URL]
# - "Compare & pull request" für feature/dashboard-stats klicken
# - Base branch: develop, Compare branch: feature/dashboard-stats
# - Titel: "feat: add statistics dashboard component"
# - Beschreibung: Details zur Dashboard-Komponente
# - Reviewer: @LinoDeMarco zuweisen
# - "Create pull request" klicken
```

---

## 📦 React Components im Detail

### 🔧 Layout Components

#### `components/layouts/` - Layout-Management

**Zweck**: Grundlegende Layout-Strukturen und Navigation

**Wichtige Komponenten:**

- `header.tsx` - Hauptnavigation mit Microsoft OAuth
- `DSPBackground.tsx` - Hintergrund-Design
- `SubBackground.tsx` - Untergeordnete Hintergründe

**Verwendung:**

```tsx
import HeaderNavigation from "./components/layouts/header.tsx";
import DSPBackground from "./components/layouts/DSPBackground.tsx";

// Navigation mit OAuth-Integration
<HeaderNavigation
  logo={<img src={LogoDSP} alt="Logo" className="h-12" />}
  links={mainNav}
  rightContent={rightNav}
  isAuthenticated={isAuthenticated}
/>;
```

### 🎨 UI Components

#### `components/ui_elements/` - Basis-UI-Elemente

**Zweck**: Wiederverwendbare UI-Komponenten

**Kategorien:**

- `buttons/` - Button-Komponenten (Primary, Secondary, Microsoft Login)
- `forms/` - Formular-Komponenten
- `modals/` - Modal-Dialoge
- `progress/` - Fortschrittsbalken
- `loading_spinner.tsx` - Lade-Animationen

#### `components/charts/` - Diagramm-Komponenten

**Zweck**: Datenvisualisierung mit ECharts und Recharts

**Verfügbare Charts:**

- `chart_gauge.tsx` - Gauge-Diagramme
- `ComparisonBar.tsx` - Vergleichsbalken
- `ExercisePerformanceChart.tsx` - Übungs-Performance
- `LearningTimeChart.tsx` - Lernzeit-Diagramme
- `ProgressOverTimeChart.tsx` - Fortschritt über Zeit

### 📊 Business Components

#### `components/cards/` - Karten-Komponenten

**Zweck**: Informationsdarstellung in Karten-Format

**Verfügbare Cards:**

- `card_badge.tsx` - Badge-Karten
- `card_modules_small.tsx` - Modul-Vorschau
- `card_preview_small.tsx` - Inhalts-Vorschau

#### `components/tables/` - Tabellen-Komponenten

**Zweck**: Daten-Tabellen für Admin-Bereich

**Verfügbare Tables:**

- `table_exams_assessed.tsx` - Bewertete Prüfungen
- `table_modules.tsx` - Modul-Übersicht
- `table_user_list.tsx` - Benutzerliste

### 🎓 E-Learning Components

#### `components/contributions/` - Lerninhalte

**Zweck**: Rendering verschiedener Lerninhalte

**Content-Typen:**

- `ContentCode.tsx` - Code-Beispiele
- `ContentHint.tsx` - Hinweise
- `ContentImage.tsx` - Bilder
- `ContentText.tsx` - Text-Inhalte
- `ContentVideo.tsx` - Video-Inhalte

#### `components/videos/` - Video-Integration

**Zweck**: YouTube-Video-Integration

**Features:**

- `render_youtube_video.tsx` - YouTube-Video-Rendering
- Automatische ID-Extraktion
- Responsive Design

---

## 🔌 API-Integration & Services

### 📋 API-Struktur

#### Authentication Services

```typescript
// util/apis/microsoft_auth.ts
export const useMicrosoftAuth = () => {
  // Microsoft OAuth 2.0 Integration
  // JWT Token Management
  // User Session Handling
};

// util/apis/api.ts
export const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  headers: {
    Authorization: `Bearer ${token}`,
  },
});
```

#### Module Services

```typescript
// util/apis/modules.ts
export const moduleApi = {
  getModules: () => apiClient.get("/elearning/modules/"),
  getModule: (id: string) => apiClient.get(`/elearning/modules/${id}/`),
  executePythonCode: (code: string) =>
    apiClient.post("/elearning/execute-python/", { code }),
};
```

#### User Services

```typescript
// util/apis/userAdminApi.ts
export const userAdminApi = {
  getUsers: () => apiClient.get("/elearning/users/admin/users/"),
  createUser: (userData: UserData) =>
    apiClient.post("/elearning/users/admin/users/", userData),
  updateUser: (id: string, userData: UserData) =>
    apiClient.put(`/elearning/users/admin/users/${id}/`, userData),
};
```

### 🔐 Authentication Flow

#### Microsoft OAuth Integration

```typescript
// hooks/use_microsoft_auth.ts
const { login, logout, isLoading } = useMicrosoftAuth();

// OAuth-Flow starten
const handleLogin = () => {
  login("e-learning"); // Tool-Slug für DSP-Backend
};

// JWT Token Management
const { user, isAuthenticated } = useAuth();
```

---

## 📏 Code-Standards & Best Practices

### ⚛️ React/TypeScript Standards

#### 1. Komponenten-Struktur

```tsx
// ✅ Korrekt
interface DashboardProps {
  userId: string;
  onDataLoad?: (data: DashboardData) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ userId, onDataLoad }) => {
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    // Data fetching logic
  }, [userId]);

  return <div className="dashboard-container">{/* Component content */}</div>;
};

// ❌ Falsch
const dashboard = (props) => {
  // Keine TypeScript-Typen
  // Keine React.FC Verwendung
};
```

#### 2. Custom Hooks

```tsx
// ✅ Korrekt
export const useModuleData = (moduleId: string) => {
  const [module, setModule] = useState<Module | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchModule = async () => {
      try {
        setLoading(true);
        const response = await moduleApi.getModule(moduleId);
        setModule(response.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchModule();
  }, [moduleId]);

  return { module, loading, error };
};
```

#### 3. Context Usage

```tsx
// ✅ Korrekt
const { user, login, logout } = useAuth();
const { modules, loading } = useModules();

// Context Provider Setup
<AuthProvider>
  <ModuleProvider>
    <ExamProvider>
      <App />
    </ExamProvider>
  </ModuleProvider>
</AuthProvider>;
```

### 🎨 Styling Standards

#### 1. TailwindCSS Usage

```tsx
// ✅ Korrekt
<div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200">
  <h2 className="text-xl font-semibold text-gray-800">Dashboard</h2>
  <button className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500">
    Aktion
  </button>
</div>

// ❌ Falsch
<div style={{ display: 'flex', padding: '16px', backgroundColor: 'white' }}>
  {/* Inline Styles vermeiden */}
</div>
```

#### 2. Responsive Design

```tsx
// ✅ Korrekt
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  <div className="p-4 bg-white rounded-lg">
    <h3 className="text-lg font-medium mb-2">Modul 1</h3>
    <p className="text-gray-600 text-sm">Beschreibung</p>
  </div>
</div>
```

### 🔒 Performance Standards

#### 1. Lazy Loading

```tsx
// ✅ Korrekt
const Dashboard = lazy(() => import("./pages/dashboard"));
const ModuleDetail = lazy(() => import("./pages/module_detail"));

// Mit Loading-Fallback
<Suspense fallback={<LoadingSpinner />}>
  <Dashboard />
</Suspense>;
```

#### 2. Memoization

```tsx
// ✅ Korrekt
const ExpensiveComponent = memo(({ data }: { data: ComplexData }) => {
  return (
    <div>
      {/* Expensive rendering logic */}
    </div>
  );
});

// Custom Hook mit useMemo
const useProcessedData = (rawData: RawData[]) => {
  return useMemo(() => {
    return rawData.map(item => ({
      ...item,
      processed: complexProcessing(item)
    }));
  }, [rawData]);
```

---

## 🐛 Debugging & Troubleshooting

### 🔍 Häufige Probleme

#### 1. TypeScript Errors

```bash
# TypeScript-Kompilierung prüfen
npm run build

# TypeScript-Konfiguration
# tsconfig.json anpassen bei Modul-Problemen
```

#### 2. API-Integration Probleme

```typescript
// API-Client Debugging
const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

// Request/Response Interceptors
apiClient.interceptors.request.use(
  (config) => {
    console.log("Request:", config);
    return config;
  },
  (error) => {
    console.error("Request Error:", error);
    return Promise.reject(error);
  }
);
```

#### 3. Microsoft OAuth Probleme

```typescript
// OAuth State Debugging
const { login, isLoading, error } = useMicrosoftAuth();

useEffect(() => {
  if (error) {
    console.error("OAuth Error:", error);
    // Error handling
  }
}, [error]);
```

### 🛠️ Debug-Tools

#### 1. React Developer Tools

- Browser Extension installieren
- Component Tree inspizieren
- Props und State überwachen
- Performance Profiling

#### 2. Network Tab

- API-Calls überwachen
- Request/Response Headers prüfen
- JWT Token Validierung
- CORS-Probleme identifizieren

#### 3. Console Debugging

```typescript
// Development-only Logging
if (process.env.NODE_ENV === "development") {
  console.log("Debug Info:", { user, modules, loading });
}
```

---

## 📋 Projektaufgaben & Management

### 🎯 Aufgabenverwaltung

Alle konkreten Projektaufgaben, Features und Bugs werden über **Jira** verwaltet:

- **Jira Board**: [https://dsp-software.atlassian.net/jira/software/projects/CCS/boards/1?atlOrigin=eyJpIjoiZDk5ZWUyNmIyMTcxNDMxNWExODIyNzg1ZDM5ZTc2YzAiLCJwIjoiaiJ9]
- Hier finden Sie alle aktuellen Aufgaben, Sprints und Projektplanung
- Neue Features und Bugs werden hier erstellt und zugewiesen
- Entwickler arbeiten an den ihnen zugewiesenen Jira-Tickets

**Workflow:**

1. Jira-Ticket erstellen/zuweisen
2. Feature-Branch basierend auf Ticket-Nummer/Namen erstellen
3. Entwicklung und lokales Testen
4. Pull Request mit Ticket-Referenz
5. Review und Merge durch Lead

---

## 📞 Support & Kontakt

### 🆘 Hilfe bekommen

#### 2. Team-Kontakte

- **Lead**: [Lino De Marco] - [Email]

#### 3. Nützliche Links

- **GitHub Repository**: [https://github.com/LDM010795/DSP-Backend]
- **Jira Board**: [https://dsp-software.atlassian.net/jira/software/projects/CCS/boards/1?atlOrigin=eyJpIjoiZDk5ZWUyNmIyMTcxNDMxNWExODIyNzg1ZDM5ZTc2YzAiLCJwIjoiaiJ9]

---

## 📈 Nächste Schritte

### 🎯 Onboarding-Checkliste

- [ ] Repository geklont und auf develop Branch
- [ ] Entwicklungsumgebung eingerichtet
- [ ] Erste Komponente entwickelt
- [ ] Git-Workflow verstanden
- [ ] Erste Feature entwickelt
- [ ] Pull Request erstellt

### 🚀 Weiterführende Ressourcen

1. **React Documentation**: https://react.dev/
2. **TypeScript Handbook**: https://www.typescriptlang.org/docs/
3. **TailwindCSS**: https://tailwindcss.com/docs
4. **Vite**: https://vitejs.dev/guide/
5. **ECharts**: https://echarts.apache.org/en/index.html

---

**Viel Erfolg beim Entwickeln! 🚀**

_Letzte Aktualisierung: 10.07.2025_

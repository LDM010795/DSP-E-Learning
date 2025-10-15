# Video Components

## 📁 Struktur

```
src/components/videos/
├── VideoPlayer.tsx          # 🎯 Haupt-Komponente (verwendet automatisch den richtigen Player)
├── YouTubePlayer.tsx        # 📺 YouTube-spezifischer Player
├── WasabiPlayer.tsx         # ☁️ Wasabi Cloud Storage Player
├── index.ts                 # 📦 Zentrale Exports
└── README.md               # 📖 Diese Datei
```

## 🚀 Verwendung

### Einfache Verwendung (Empfohlen)

```tsx
import { VideoPlayer } from "../components/videos";

// Automatisch erkennt YouTube oder Wasabi URLs
<VideoPlayer videoUrl="https://youtube.com/watch?v=..." contentId={123} />;
```

### Spezifische Player

```tsx
import { YouTubePlayer, WasabiPlayer } from '../components/videos';

// YouTube
<YouTubePlayer videoUrl="https://youtube.com/watch?v=..." />

// Wasabi
<WasabiPlayer
  contentId={123}
  dbUrl="https://s3.wasabisys.com/..."
/>
```

## 🔧 Features

### VideoPlayer (Haupt-Komponente)

- ✅ **Automatische URL-Erkennung** (YouTube/Wasabi)
- ✅ **Presigned URL Management** für Wasabi
- ✅ **Error Handling** mit benutzerfreundlichen Meldungen
- ✅ **Loading States** mit Debug-Informationen

### WasabiPlayer

- ✅ **Presigned URL Fetching** via React Query
- ✅ **S3 Key Extraction** aus URLs
- ✅ **Buffer-Optimierung** für smoothe Wiedergabe
- ✅ **Custom Controls** (Speed, Fullscreen)
- ✅ **Authentication** via Bearer Token

### YouTubePlayer

- ✅ **Video ID Extraction** aus verschiedenen YouTube URL-Formaten
- ✅ **Secure Embed URLs** (youtube-nocookie.com)
- ✅ **Responsive Design** (aspect-video)

## 🔗 Abhängigkeiten

### Utilities

```tsx
import {
  isYouTubeUrl,
  isWasabiUrl,
  extractVideoId,
  toWasabiKey,
} from "../../util/videoUtils";
```

### APIs

```tsx
import {
  getPresignedUrlById,
  getPresignedUrlByKey,
} from "../../util/apis/videoApi";
```

### Hooks

```tsx
import {
  usePresignedById,
  usePresignedByKey,
} from "../../hooks/useVideoPresignedUrl";
```

## 🎯 Best Practices

1. **Verwende VideoPlayer** für neue Implementierungen
2. **Gib contentId** für Wasabi Videos an
3. **Nutze die Utilities** für URL-Validierung
4. **Beachte die Error States** in der UI

## 🔄 Migration

### Migration von alten Komponenten

```tsx
// Alt (nicht mehr verfügbar)
import RenderVideo from "./render_video";

// Neu
import { VideoPlayer } from "./videos";
```

### Von verstreuten Utilities

```tsx
// Alt
import { isWasabiUrl } from "../../util/wasabi";
import { isYouTubeUrl } from "../../util/videoUtils/video_utils";

// Neu
import { isWasabiUrl, isYouTubeUrl } from "../../util/videoUtils";
```

## 🐛 Debugging

Alle Komponenten haben umfangreiche Console-Logs:

- `🔍 DEBUG: VideoPlayer - Eingang: ...`
- `🔍 DEBUG: WasabiPlayer - contentId: ...`
- `🔍 DEBUG: Hook - Request presigned URL für ...`

## 📝 TODO

- [ ] HLS/DASH Support für adaptive Qualität
- [ ] Video-Thumbnails
- [ ] Playback-Progress Tracking
- [ ] Offline-Support

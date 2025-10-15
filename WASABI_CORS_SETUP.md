# Wasabi CORS-Konfiguration für DSP E-Learning

## 🚨 Problem: 403 Forbidden Fehler

Wenn du diesen Fehler siehst:

```
GET https://s3.eu-central-2.wasabisys.com/dsp-e-learning/Lerninhalte/SQL/Videos/Einf%C3%BChrung_Grundlagen_MS_Power_BI.mp4 403 (Forbidden)
```

Dann ist die CORS-Konfiguration in Wasabi nicht korrekt eingerichtet.

## ✅ Lösung: CORS in Wasabi konfigurieren

### Schritt 1: Wasabi Console öffnen

1. Gehe zu [Wasabi Console](https://console.wasabisys.com/)
2. Melde dich mit deinen Credentials an

### Schritt 2: Bucket auswählen

1. Wähle deinen Bucket `dsp-e-learning` aus
2. Klicke auf den Bucket-Namen

### Schritt 3: CORS-Konfiguration hinzufügen

1. Gehe zu **"Settings"** → **"CORS"**
2. Klicke auf **"Add CORS rule"**

### Schritt 4: CORS-Regel konfigurieren

```json
{
  "AllowedOrigins": [
    "https://dsp-e-learning.onrender.com",
    "http://localhost:3000",
    "http://localhost:5173"
  ],
  "AllowedMethods": ["GET", "HEAD", "OPTIONS"],
  "AllowedHeaders": ["*"],
  "ExposeHeaders": ["Accept-Ranges", "Content-Range", "Content-Length", "ETag"],
  "MaxAgeSeconds": 3000
}
```

### Schritt 5: Speichern

1. Klicke auf **"Save"**
2. Warte 1-2 Minuten bis die Änderungen aktiv werden

## 🔧 Alternative: AWS CLI verwenden

Falls du AWS CLI installiert hast:

```bash
# CORS-Konfiguration setzen
aws s3api put-bucket-cors \
  --bucket dsp-e-learning \
  --cors-configuration file://cors-config.json \
  --endpoint-url https://s3.eu-central-2.wasabisys.com
```

Mit `cors-config.json`:

```json
{
  "CORSRules": [
    {
      "AllowedOrigins": [
        "https://dsp-e-learning.onrender.com",
        "http://localhost:3000",
        "http://localhost:5173"
      ],
      "AllowedMethods": ["GET", "HEAD", "OPTIONS"],
      "AllowedHeaders": ["*"],
      "ExposeHeaders": [
        "Accept-Ranges",
        "Content-Range",
        "Content-Length",
        "ETag"
      ],
      "MaxAgeSeconds": 3000
    }
  ]
}
```

## 🎯 Wichtige Punkte

### AllowedOrigins

- **Produktion**: `https://dsp-e-learning.onrender.com`
- **Entwicklung**: `http://localhost:3000`, `http://localhost:5173`

### AllowedMethods

- `GET`: Video-Dateien laden
- `HEAD`: Metadaten prüfen
- `OPTIONS`: CORS Preflight Requests

### ExposeHeaders

- `Accept-Ranges`: Für stückweises Laden
- `Content-Range`: Für Range Requests
- `Content-Length`: Video-Größe
- `ETag`: Caching

## 🧪 Testen

Nach der Konfiguration:

1. **Browser-Cache leeren** (Ctrl+F5)
2. **Video neu laden**
3. **Browser-Entwicklertools prüfen**:
   - Network Tab → Video-Request → Status 200
   - Keine CORS-Fehler in Console

## 🚨 Troubleshooting

### Fehler bleibt bestehen?

1. **Warte 2-3 Minuten** - CORS-Änderungen brauchen Zeit
2. **Browser-Cache leeren**
3. **Prüfe Bucket-Permissions** (sollte öffentlich lesbar sein)
4. **Teste URL direkt** im Browser

### Bucket-Permissions prüfen

```bash
# Bucket-Policy für öffentlichen Lesezugriff
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::dsp-e-learning/*"
    }
  ]
}
```

## ✅ Erfolg

Nach der Konfiguration sollten Videos sofort abspielbar sein mit:

- ✅ Stückweisem Laden
- ✅ Sofortigem Start
- ✅ Scrubbing-Funktionalität
- ✅ Keine CORS-Fehler

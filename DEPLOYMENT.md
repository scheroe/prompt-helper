# 🚀 Deployment-Anleitung für Prompt-Helper

## GitHub Repository erstellen

### Option 1: Über GitHub Website
1. Gehen Sie zu [GitHub](https://github.com) und loggen Sie sich ein
2. Klicken Sie auf "New repository" (grüner Button)
3. Repository-Details eingeben:
   - **Repository name**: `prompt-helper`
   - **Description**: `🚀 Interaktiver Prompt-Helper für die Erstellung effektiver KI-Prompts mit bewährten Prompt-Engineering-Techniken`
   - **Public** auswählen
   - **NICHT** "Add a README file" ankreuzen (wir haben bereits einen)
   - **NICHT** .gitignore oder License hinzufügen (bereits vorhanden)
4. Klicken Sie "Create repository"

### Option 2: Mit GitHub CLI (falls installiert)
```bash
gh repo create prompt-helper --public \
  --description "🚀 Interaktiver Prompt-Helper für die Erstellung effektiver KI-Prompts mit bewährten Prompt-Engineering-Techniken" \
  --homepage "https://scheroe.github.io/prompt-helper/"
```

## Lokales Repository mit GitHub verbinden

```bash
# In das Projekt-Verzeichnis wechseln
cd prompt-helper

# Remote origin hinzufügen
git remote add origin https://github.com/scheroe/prompt-helper.git

# Branch auf main setzen
git branch -M main

# Code zum Repository pushen
git push -u origin main
```

## GitHub Pages aktivieren

1. Gehen Sie zu Ihrem Repository: https://github.com/scheroe/prompt-helper
2. Klicken Sie auf "Settings" (Tab oben rechts)
3. Scrollen Sie runter zu "Pages" (linke Seitenleiste)
4. Bei "Source" wählen Sie "GitHub Actions"
5. Der GitHub Actions Workflow wird automatisch ausgeführt

## Deployment-Status überprüfen

1. Gehen Sie zum "Actions" Tab in Ihrem Repository
2. Sie sollten einen Workflow namens "Deploy to GitHub Pages" sehen
3. Klicken Sie darauf, um den Status zu überprüfen
4. Nach erfolgreichem Deployment ist Ihre App verfügbar unter:
   **https://scheroe.github.io/prompt-helper/**

## Troubleshooting

### GitHub Actions schlägt fehl
- Überprüfen Sie die Workflow-Logs im Actions Tab
- Stellen Sie sicher, dass alle Dateien korrekt committet wurden
- Prüfen Sie, ob GitHub Pages in den Repository-Settings aktiviert ist

### 404 Fehler nach Deployment
- Warten Sie 5-10 Minuten nach dem ersten Deployment
- Überprüfen Sie, ob `index.html` im Root-Verzeichnis liegt
- Stellen Sie sicher, dass alle CSS/JS-Pfade relativ sind

### Lokaler Test vor Deployment
```bash
# Lokalen Server starten
python -m http.server 8000
# oder
npx serve .

# Dann öffnen: http://localhost:8000
```

## Repository-URLs

- **Repository**: https://github.com/scheroe/prompt-helper
- **Live-Demo**: https://scheroe.github.io/prompt-helper/
- **Issues**: https://github.com/scheroe/prompt-helper/issues
- **Discussions**: https://github.com/scheroe/prompt-helper/discussions

## Nächste Schritte nach Deployment

1. ✅ Repository erstellt und gepusht
2. ✅ GitHub Pages aktiviert
3. ✅ Automatisches Deployment läuft
4. 🎯 Live-URL testen: https://scheroe.github.io/prompt-helper/
5. 📢 Repository mit Freunden und Kollegen teilen
6. ⭐ Erste GitHub-Sterne sammeln!

---

**🎉 Ihr Prompt-Helper ist bereit für die Welt!**
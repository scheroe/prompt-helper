# 🚀 Prompt-Helper

Ein interaktives Tool zur Erstellung optimierter AI-Prompts mit bewährten Prompt-Engineering-Techniken.

## ✨ Features

### 🎯 Prompt-Erstellung
- **Intuitive Benutzeroberfläche** - Einfache Prompt-Erstellung ohne Programmierkenntnisse
- **Wissenschaftlich fundierte Techniken** - Über 20 bewährte Prompt-Engineering-Methoden
- **Strukturierte Eingabe** - Getrennte Felder für Rolle, Aufgabe und Ausgabeformat
- **Live-Vorschau** - Sofortige Anzeige des generierten Prompts

### 💾 Speichern & Verwalten
- **Browser-Speicherung** - Prompts werden lokal im Browser gespeichert (localStorage)
- **Prompt-Verwaltung** - Speichern, Laden, Bearbeiten und Löschen von Prompts
- **Persistente Daten** - Prompts bleiben auch nach Browser-Neustart erhalten
- **Keine Cloud-Abhängigkeit** - Funktioniert vollständig offline

### 📤 Export-Funktionen
- **Mehrere Formate** - Export als Text (.txt), Markdown (.md) oder XML (.xml)
- **Strukturierte Ausgabe** - Alle Formularfelder werden sauber formatiert exportiert
- **Metadaten inklusive** - Zeitstempel und verwendete Techniken werden mitgespeichert
- **Ein-Klick-Download** - Automatischer Download der exportierten Dateien

### 🛠️ Techniken-Bibliothek
- **Chain-of-Thought** - Schrittweises Denken für komplexe Aufgaben
- **Few-Shot Learning** - Lernen durch Beispiele
- **Role Prompting** - Rollenzuweisung für spezifische Expertise
- **Tree-of-Thoughts** - Exploration mehrerer Denkpfade
- **Self-Correction** - Selbstreflexion und Verbesserung
- **Und viele mehr...** - Über 20 weitere bewährte Techniken

## 🚀 Verwendung

### Erste Schritte
1. **Techniken auswählen** - Wählen Sie passende Prompt-Engineering-Techniken aus
2. **Formular ausfüllen** - Geben Sie Rolle, Aufgabe und Ausgabeformat ein
3. **Vorschau generieren** - Klicken Sie auf "Vorschau anzeigen"
4. **Prompt verwenden** - Kopieren Sie den generierten Prompt oder exportieren Sie ihn

### Demo-Modus
- Klicken Sie auf **"Demo erstellen"** für einen Beispiel-Prompt
- Testen Sie die Export-Funktionen mit dem Demo-Inhalt
- Experimentieren Sie mit verschiedenen Techniken-Kombinationen

### Prompt-Management
- **Speichern**: Geben Sie einen Namen ein und klicken Sie "Speichern"
- **Laden**: Wählen Sie einen Prompt aus dem Dropdown und klicken Sie "Laden"
- **Bearbeiten**: Wählen Sie einen Prompt aus und klicken Sie "Bearbeiten"
- **Exportieren**: Verwenden Sie die Export-Dropdown-Menüs für verschiedene Formate

## 📱 GitHub Pages Deployment

Diese Anwendung ist für GitHub Pages optimiert:

- ✅ **Statisches Hosting** - Keine Server-Konfiguration erforderlich
- ✅ **HTTPS-kompatibel** - Funktioniert perfekt mit GitHub Pages HTTPS
- ✅ **Responsive Design** - Funktioniert auf Desktop und Mobile
- ✅ **Offline-Fähig** - Läuft nach dem ersten Laden auch offline

### Deployment-Schritte
1. Repository auf GitHub erstellen/forken
2. GitHub Pages in den Repository-Einstellungen aktivieren
3. Branch `main` als Quelle wählen
4. Fertig! Die App ist unter `https://username.github.io/repository-name` verfügbar

## 🔧 Technische Details

### Browser-Kompatibilität
- **Moderne Browser** - Chrome, Firefox, Safari, Edge (neueste Versionen)
- **localStorage** - Für persistente Speicherung
- **File API** - Für Export-Funktionalität
- **Clipboard API** - Für Kopieren-Funktion

### Architektur
- **Modulares Design** - Getrennte Manager für verschiedene Funktionalitäten
- **Event-basiert** - Saubere Trennung von UI und Logik
- **Erweiterbar** - Einfaches Hinzufügen neuer Techniken und Features

### Datenschutz
- **Lokale Speicherung** - Keine Daten verlassen den Browser
- **Keine Tracking** - Keine Analytics oder Telemetrie
- **DSGVO-konform** - Keine Cloud-Speicherung oder Datenübertragung

## 📖 Dokumentation

- **[STORAGE_AND_EXPORT.md](STORAGE_AND_EXPORT.md)** - Detaillierte Dokumentation der Speicher- und Export-Funktionen
- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Deployment-Anleitung für GitHub Pages

## 🤝 Beitragen

Beiträge sind willkommen! Hier sind einige Möglichkeiten:

- **Neue Techniken hinzufügen** - Erweitern Sie die Techniken-Bibliothek
- **UI-Verbesserungen** - Verbessern Sie das Benutzererlebnis
- **Bugfixes** - Melden oder beheben Sie Probleme
- **Dokumentation** - Verbessern Sie die Dokumentation

### Entwicklung lokal
```bash
# Repository klonen
git clone https://github.com/yourusername/prompt-helper.git
cd prompt-helper

# Lokalen Server starten
python3 -m http.server 8000

# Browser öffnen
open http://localhost:8000
```

## 📄 Lizenz

Dieses Projekt ist unter der MIT-Lizenz veröffentlicht. Siehe [LICENSE](LICENSE) für Details.

## 🙏 Danksagungen

- **Prompt-Engineering-Community** - Für die Entwicklung und Dokumentation der implementierten Techniken
- **Open-Source-Community** - Für die verwendeten Libraries und Tools

---

**Erstellt für die AI-Community** 🤖✨

*Verbessern Sie Ihre AI-Interaktionen mit wissenschaftlich fundierten Prompt-Engineering-Techniken!*

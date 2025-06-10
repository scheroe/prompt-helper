# 🚀 Prompt-Helper

Ein interaktiver Prompt-Helper für die Erstellung effektiver KI-Prompts mit bewährten Prompt-Engineering-Techniken.

## ✨ Features

- 🎯 **Technik-basierte Prompt-Erstellung** - Wählen Sie aus einer Vielzahl bewährter Prompt-Engineering-Techniken
- 🔗 **Interaktive Dropdown-Navigation** - Entdecken Sie verwandte Techniken mit einem Klick
- ⚡ **Echtzeit-Prompt-Generierung** - Sehen Sie sofort, wie sich Ihre Eingaben auf den finalen Prompt auswirken
- 📊 **Token-Berechnung** - Überwachen Sie die Länge Ihres Prompts
- 💾 **Export & Speichern** - Speichern und exportieren Sie Ihre Prompts in verschiedenen Formaten
- 📱 **Responsive Design** - Funktioniert auf Desktop, Tablet und Mobil

## 🚀 Live Demo

[**➤ Prompt-Helper öffnen**](https://scheroe.github.io/prompt-helper/)

## 🛠️ Verwendung

### 1. Techniken auswählen
- Durchsuchen Sie die verfügbaren Prompt-Engineering-Techniken in der linken Seitenleiste
- Klicken Sie auf eine Technik-Karte, um Details und verwandte Techniken anzuzeigen
- Navigieren Sie zwischen verwandten Techniken mit den interaktiven Tags

### 2. Prompt-Details eingeben
- **Basis-Prompt**: Definieren Sie die Rolle oder den Kontext (optional)
- **Aufgabenbeschreibung**: Beschreiben Sie, was die KI tun soll
- **Ausgabeformat**: Spezifizieren Sie das gewünschte Antwortformat (optional)

### 3. Prompt generieren
- Klicken Sie auf "Prompt generieren & Vorschau anzeigen"
- Überprüfen Sie den generierten Prompt
- Kopieren Sie ihn in die Zwischenablage oder exportieren Sie ihn

## 🎯 Verfügbare Techniken

### Grundkonzepte
- Zero-Shot Prompting
- Few-Shot Prompting
- Chain-of-Thought Prompting

### Erweiterte Techniken
- Self-Consistency
- Tree of Thoughts
- ReAct (Reasoning + Acting)
- Self-Correction

### Spezialisierte Ansätze
- Role Prompting
- Output Constraints
- Retrieval-Augmented Generation

*...und viele weitere*

## 🔧 Lokale Entwicklung

### Voraussetzungen
- Moderner Webbrowser mit JavaScript-Unterstützung
- Lokaler Webserver (empfohlen für Entwicklung)

### Installation
```bash
# Repository klonen
git clone https://github.com/scheroe/prompt-helper.git
cd prompt-helper

# Lokalen Server starten (Python 3)
python -m http.server 8000

# Oder mit Node.js
npx serve .

# Dann öffnen: http://localhost:8000
```

### Projektstruktur
```
prompt-helper/
├── index.html              # Hauptseite
├── assets/
│   ├── css/                # Styles
│   └── js/                 # Asset-Scripts
├── js/
│   ├── modules/            # Kern-Module
│   │   └── ui/            # UI-Module
│   └── PromptBuilder.js   # Haupt-Controller
├── data/
│   └── processed/         # Technik-Datenbank
└── README.md
```

## 📚 Technik-Referenz

### Dropdown-Navigation
- **Klick auf Technik-Karte**: Zeigt Details und verwandte Techniken
- **Verwandte Techniken**: Als klickbare Tags dargestellt
- **Smooth-Navigation**: Automatisches Scrollen und Öffnen verwandter Techniken

### Prompt-Generierung
- **Modularer Aufbau**: Jede Technik trägt spezifische Elemente bei
- **Flexible Kombination**: Mehrere Techniken können kombiniert werden
- **Intelligente Formatierung**: Automatische Strukturierung des finalen Prompts

## 🤝 Beitragen

Beiträge sind willkommen! Bitte beachten Sie:

1. Fork des Repositories
2. Feature-Branch erstellen (`git checkout -b feature/amazing-feature`)
3. Änderungen committen (`git commit -m 'Add amazing feature'`)
4. Branch pushen (`git push origin feature/amazing-feature`)
5. Pull Request öffnen

## 📄 Lizenz

Dieses Projekt steht unter der MIT Lizenz - siehe [LICENSE](LICENSE) für Details.

## 🙏 Danksagungen

- Basiert auf bewährten Prompt-Engineering-Forschung und -Praktiken
- Inspiriert von der wissenschaftlichen Community im Bereich KI und NLP
- UI/UX-Design orientiert an modernen Web-Standards

## 📞 Support

- 🐛 **Issues**: [GitHub Issues](https://github.com/scheroe/prompt-helper/issues)
- 💬 **Diskussionen**: [GitHub Discussions](https://github.com/scheroe/prompt-helper/discussions)
- 📧 **Kontakt**: edgar@example.com

---

**⭐ Gefällt Ihnen der Prompt-Helper? Geben Sie uns einen Stern auf GitHub!**
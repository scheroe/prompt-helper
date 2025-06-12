# Speicherung und Export-Funktionalitäten

## 📦 Lokale Speicherung (Browser Cache)

Der Prompt-Helper verwendet **localStorage** für die persistente Speicherung von Prompts im Browser. Dies funktioniert vollständig clientseitig und ist perfekt für GitHub Pages geeignet.

### Vorteile:
- ✅ **Keine Server-Infrastruktur erforderlich** - funktioniert auf statischen Hosting-Plattformen wie GitHub Pages
- ✅ **Persistente Speicherung** - Prompts bleiben auch nach Browser-Neustart erhalten
- ✅ **Schneller Zugriff** - Keine Netzwerk-Latenz bei Laden/Speichern
- ✅ **Privat und sicher** - Daten verlassen niemals den Browser des Benutzers

### Speicherstruktur:
```javascript
{
  "id": "unique-prompt-id",
  "name": "Benutzerdefinierter Name",
  "prompt": "Generierter Prompt-Text",
  "basePrompt": "Rollenzuweisung",
  "taskDescription": "Aufgabenbeschreibung", 
  "outputFormat": "Gewünschtes Ausgabeformat",
  "techniques": ["technik-1", "technik-2"],
  "templates": ["template-1"],
  "templateFields": {...},
  "timestamp": "2025-06-12T10:30:00.000Z"
}
```

## 📤 Export-Funktionalitäten

### Verfügbare Export-Formate:

#### 1. **Text (.txt)**
Einfaches Textformat mit strukturierter Darstellung:
```
ROLLE:
[Rollenzuweisung falls vorhanden]

AUFGABE:
[Aufgabenbeschreibung]

AUSGABEFORMAT:
[Gewünschtes Ausgabeformat]

GENERIERTER PROMPT:
[Vollständiger Prompt]

---
ERSTELLT AM: 12.06.2025, 10:30:00
VERWENDETE TECHNIKEN: Chain-of-Thought, Few-Shot Learning
```

#### 2. **Markdown (.md)**
Markdown-Format für bessere Lesbarkeit und Dokumentation:
```markdown
# Prompt Export

## Rolle
[Rollenzuweisung falls vorhanden]

## Aufgabe
[Aufgabenbeschreibung]

## Ausgabeformat
[Gewünschtes Ausgabeformat]

## Generierter Prompt
```
[Vollständiger Prompt]
```

## Metadaten
- **Erstellt am:** 12.06.2025, 10:30:00
- **Verwendete Techniken:** Chain-of-Thought, Few-Shot Learning
```

#### 3. **XML (.xml)**
Strukturiertes XML-Format für maschinelle Verarbeitung:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<prompt>
  <metadaten>
    <erstellt_am>2025-06-12T10:30:00.000Z</erstellt_am>
    <verwendete_techniken>
      <technik>Chain-of-Thought</technik>
      <technik>Few-Shot Learning</technik>
    </verwendete_techniken>
  </metadaten>
  <rolle><![CDATA[Rollenzuweisung]]></rolle>
  <aufgabe><![CDATA[Aufgabenbeschreibung]]></aufgabe>
  <ausgabeformat><![CDATA[Ausgabeformat]]></ausgabeformat>
  <generierter_prompt><![CDATA[Vollständiger Prompt]]></generierter_prompt>
</prompt>
```

## 🚀 Verwendung

### Prompt speichern:
1. Prompt erstellen und Vorschau generieren
2. Namen in das Eingabefeld "Prompt-Name eingeben..." eintragen
3. "Speichern" klicken
4. Prompt wird automatisch im Browser localStorage gespeichert

### Prompt exportieren:
1. Prompt erstellen oder gespeicherten Prompt laden
2. "Exportieren" Button klicken
3. Gewünschtes Format auswählen (Text, Markdown, XML)
4. Datei wird automatisch heruntergeladen

### Prompt laden:
1. Dropdown "Gespeicherte Prompts" öffnen
2. Gewünschten Prompt auswählen
3. "Laden" klicken
4. Alle Formularfelder und Techniken werden wiederhergestellt

## 🔧 Technische Details

### Browser-Kompatibilität:
- **localStorage**: Unterstützt von allen modernen Browsern
- **File Download**: Verwendet Blob API und URL.createObjectURL()
- **Clipboard API**: Für Kopieren-Funktionalität

### Speicher-Limits:
- **localStorage**: Typischerweise 5-10MB pro Domain
- **Automatische Bereinigung**: Browser können bei Speicherplatz-Problemen Daten löschen
- **Backup-Empfehlung**: Wichtige Prompts regelmäßig als Datei exportieren

### GitHub Pages Kompatibilität:
- ✅ **Vollständig clientseitig** - keine Server-Konfiguration erforderlich
- ✅ **Statisches Hosting** - funktioniert mit Jekyll/GitHub Pages
- ✅ **HTTPS-kompatibel** - localStorage funktioniert über HTTPS
- ✅ **Cross-Browser** - einheitliche Funktionalität

## 🛡️ Datenschutz und Sicherheit

- **Lokale Speicherung**: Daten verlassen niemals den Browser des Benutzers
- **Keine Cloud-Abhängigkeit**: Funktioniert komplett offline nach dem ersten Laden
- **Keine Tracking**: Keine Telemetrie oder Analytics der gespeicherten Inhalte
- **Benutzer-Kontrolle**: Benutzer kann localStorage jederzeit löschen

## 💡 Best Practices

### Für Benutzer:
1. **Regelmäßige Backups**: Wichtige Prompts als Dateien exportieren
2. **Aussagekräftige Namen**: Prompts mit beschreibenden Namen speichern
3. **Browser-Wartung**: Bei Problemen Browser-Cache leeren und neu laden

### Für Entwickler:
1. **Error Handling**: Robust gegen localStorage-Ausfälle
2. **Migration**: Automatische ID-Erstellung für bestehende Prompts
3. **Validation**: Eingabe-Validation vor Speicherung
4. **Feedback**: Benutzer-Feedback bei allen Aktionen

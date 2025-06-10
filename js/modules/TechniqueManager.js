/**
 * TechniqueManager - Verwaltet Techniken-Daten und Auswahl
 */
class TechniqueManager {
    constructor() {
        this.selectedTechniques = [];
        this.techniqueData = {};
        this.initialized = false;

        // Load techniques data on construction to avoid CORS issues
        this.loadTechniquesData();
    }

    /**
     * Load techniques data from embedded JSON structure
     */
    loadTechniquesData() {
        // Comprehensive technique data (embedded to avoid CORS issues)
        const techniquesData = {
            "categories": [
                {
                    "id": "basic-concepts",
                    "name": "Grundkonzepte",
                    "description": "Grundlegende Prompt-Strukturen und konzeptuelle Rahmenwerke",
                    "techniques": [
                        {
                            "id": "basic-prompting",
                            "name": "Basic Prompting",
                            "aliases": ["Standard Prompting", "Vanilla Prompting"],
                            "description": "Die einfachste Form, normalerweise Anweisung + Eingabe, ohne Beispiele oder komplexe Denkschritte.",
                            "sources": ["Vatsal & Dubey", "Schulhoff et al.", "Wei et al."],
                            "relatedTechniques": ["instructed-prompting", "zero-shot-learning"],
                            "useCase": "Direkte Aufgaben mit klaren Anweisungen.",
                            "example": "Übersetze den folgenden englischen Text ins Französische: 'Hello, how are you?'"
                        },
                        {
                            "id": "few-shot-learning",
                            "name": "Few-Shot Learning/Prompting",
                            "description": "Einige Beispiele im Prompt bereitstellen, um das Modell anzuleiten.",
                            "sources": ["Brown et al.", "Wei et al.", "Schulhoff et al."],
                            "relatedTechniques": ["one-shot-learning", "zero-shot-learning", "in-context-learning"],
                            "useCase": "Aufgaben, bei denen eine kleine Anzahl von Beispielen die Absicht verdeutlichen kann.",
                            "example": "Klassifiziere die Stimmung der folgenden Restaurant-Bewertungen als positiv oder negativ:\\n\\nBeispiel 1: 'Das Essen war köstlich.' Stimmung: positiv\\nBeispiel 2: 'Schrecklicher Service und kaltes Essen.' Stimmung: negativ\\n\\nNeue Bewertung: 'Die Atmosphäre war schön, aber die Wartezeit war zu lang.'"
                        },
                        {
                            "id": "zero-shot-learning",
                            "name": "Zero-Shot Learning/Prompting",
                            "description": "Das Modell bitten, eine Aufgabe ohne Beispiele auszuführen.",
                            "sources": ["Brown et al.", "Vatsal & Dubey", "Schulhoff et al."],
                            "relatedTechniques": ["few-shot-learning", "one-shot-learning", "instructed-prompting"],
                            "useCase": "Allzweckaufgaben, bei denen keine Beispiele verfügbar sind.",
                            "example": "Fasse die Hauptpunkte des folgenden Artikels in 3 Stichpunkten zusammen: [Artikeltext]"
                        },
                        {
                            "id": "chain-of-thought",
                            "name": "Chain-of-Thought (CoT) Prompting",
                            "description": "Schrittweises Denken vor der endgültigen Antwort hervorrufen.",
                            "sources": ["Wei et al.", "Schulhoff et al."],
                            "relatedTechniques": ["zero-shot-cot", "few-shot-cot", "self-consistency"],
                            "useCase": "Komplexe Denk- oder mehrstufige Probleme.",
                            "example": "Denken wir Schritt für Schritt darüber nach..."
                        },
                        {
                            "id": "role-prompting",
                            "name": "Role Prompting",
                            "description": "Dem Modell eine bestimmte Rolle oder Persona zuweisen.",
                            "sources": ["Nori et al."],
                            "relatedTechniques": ["instructed-prompting"],
                            "useCase": "Aufgaben, die Fachkenntnisse oder einen bestimmten Ton/Stil erfordern.",
                            "example": "Du bist ein erfahrener Steuerberater..."
                        },
                        {
                            "id": "instructed-prompting",
                            "name": "Instructed Prompting",
                            "description": "Klare und spezifische Anweisungen für das Modell.",
                            "sources": ["OpenAI Best Practices"],
                            "relatedTechniques": ["basic-prompting", "role-prompting"],
                            "useCase": "Aufgaben mit spezifischen Anforderungen und Formaten.",
                            "example": "Folge diesen spezifischen Schritten: 1) Analysiere, 2) Bewerte, 3) Empfehle..."
                        },
                        {
                            "id": "context-stuffing",
                            "name": "Context Stuffing",
                            "description": "Relevante Informationen in den Prompt einbetten.",
                            "sources": ["Practical Prompting"],
                            "relatedTechniques": ["few-shot-learning", "in-context-learning"],
                            "useCase": "Bereitstellung spezifischer Informationen für bessere Antworten.",
                            "example": "Hier sind die relevanten Unternehmensdaten: [Daten]. Basierend auf diesen Informationen..."
                        }
                    ]
                },
                {
                    "id": "reasoning-frameworks",
                    "name": "Denkrahmen",
                    "description": "Techniken, die das Modell durch explizite Denkschritte führen",
                    "techniques": [
                        {
                            "id": "tree-of-thoughts",
                            "name": "Tree-of-Thoughts (ToT)",
                            "description": "Mehrere Denkpfade in einer Baumstruktur erforschen.",
                            "sources": ["Yao et al.", "Vatsal & Dubey"],
                            "relatedTechniques": ["chain-of-thought", "self-consistency"],
                            "useCase": "Komplexe Probleme mit mehreren möglichen Ansätzen.",
                            "example": "Lass uns verschiedene Ansätze für dieses Problem erkunden..."
                        },
                        {
                            "id": "self-consistency",
                            "name": "Self-Consistency",
                            "description": "Mehrere Denkwege generieren und die konsistenteste Antwort wählen.",
                            "sources": ["Wang et al."],
                            "relatedTechniques": ["chain-of-thought", "tree-of-thoughts"],
                            "useCase": "Komplexe Denkprobleme, bei denen Konsistenz wichtig ist.",
                            "example": "Lass uns das Schritt für Schritt durchgehen..."
                        },
                        {
                            "id": "few-shot-cot",
                            "name": "Few-Shot Chain-of-Thought",
                            "description": "CoT mit Beispielen für schrittweises Denken.",
                            "sources": ["Wei et al., 2022"],
                            "relatedTechniques": ["chain-of-thought", "few-shot-learning"],
                            "useCase": "Komplexe Probleme mit verfügbaren Denkbeispielen.",
                            "example": "Beispiel: Problem X → Schritt 1... Schritt 2... Antwort. Jetzt löse Problem Y..."
                        }
                    ]
                },
                {
                    "id": "self-improvement",
                    "name": "Selbstverbesserung",
                    "description": "Techniken, die das Modell anleiten, seine eigenen Ausgaben zu verfeinern",
                    "techniques": [
                        {
                            "id": "self-correction",
                            "name": "Self-Correction",
                            "description": "Modell überprüft und überarbeitet seine eigene Ausgabe.",
                            "sources": ["Madaan et al., 2023"],
                            "relatedTechniques": ["self-critique", "self-evaluation"],
                            "useCase": "Fehlerreduzierung, schrittweise Verbesserung.",
                            "example": "Überprüfe nach dem Generieren deiner Antwort auf Fehler..."
                        },
                        {
                            "id": "self-critique",
                            "name": "Self-Critique",
                            "description": "Modell bewertet kritisch seine eigene Ausgabe.",
                            "sources": ["Constitutional AI"],
                            "relatedTechniques": ["self-correction", "constitutional-ai"],
                            "useCase": "Qualitätsbewertung und Verbesserung der Ausgaben.",
                            "example": "Bewerte deine Antwort kritisch und identifiziere Verbesserungsmöglichkeiten..."
                        }
                    ]
                },
                {
                    "id": "agent-tool-use",
                    "name": "Agent & Tool Use",
                    "description": "Techniken für den Einsatz von KI-Agenten und externen Tools",
                    "techniques": [
                        {
                            "id": "tool-use",
                            "name": "Tool Use",
                            "description": "KI-Modell nutzt externe Tools und APIs.",
                            "sources": ["Function Calling", "ReAct"],
                            "relatedTechniques": ["react-prompting", "plan-and-execute"],
                            "useCase": "Aufgaben, die externe Ressourcen oder Berechnungen erfordern.",
                            "example": "Verwende das Wetter-Tool, um die aktuelle Temperatur zu ermitteln..."
                        },
                        {
                            "id": "react-prompting",
                            "name": "ReAct (Reasoning + Acting)",
                            "description": "Kombination aus Denken und Handeln in einer Schleife.",
                            "sources": ["Yao et al., 2022"],
                            "relatedTechniques": ["tool-use", "chain-of-thought"],
                            "useCase": "Komplexe Aufgaben, die sowohl Denken als auch Aktionen erfordern.",
                            "example": "Thought: Ich muss das Wetter überprüfen. Action: weather_api('Berlin')..."
                        }
                    ]
                }
            ]
        };

        // Process the techniques data into the flat map
        techniquesData.categories.forEach(category => {
            category.techniques.forEach(technique => {
                this.techniqueData[technique.id] = {
                    ...technique,
                    categoryId: category.id,
                    categoryName: category.name
                };
            });
        });
    }

    /**
     * Initialize the TechniqueManager
     */
    async init() {
        try {
            console.log('TechniqueManager: Initialisierung gestartet...');
            // Technique data is already loaded in constructor
            this.initialized = true;
            console.log('TechniqueManager: Erfolgreich initialisiert');
        } catch (error) {
            console.error('TechniqueManager: Initialisierungsfehler:', error);
            throw error;
        }
    }

    /**
     * Set references to other managers (if needed)
     */
    setManagers(managers) {
        // TechniqueManager is self-contained for now
        // Can add references if needed later
    }

    /**
     * Add a technique to the selected techniques
     */
    addTechnique(techniqueId) {
        if (!this.selectedTechniques.includes(techniqueId)) {
            this.selectedTechniques.push(techniqueId);
            return true;
        }
        return false;
    }

    /**
     * Remove a technique from the selected techniques
     */
    removeTechnique(techniqueId) {
        const index = this.selectedTechniques.indexOf(techniqueId);
        if (index > -1) {
            this.selectedTechniques.splice(index, 1);
            return true;
        }
        return false;
    }

    /**
     * Get technique data by ID
     */
    getTechnique(techniqueId) {
        return this.techniqueData[techniqueId];
    }

    /**
     * Get all techniques by category
     */
    getTechniquesByCategory() {
        const categories = {};
        Object.values(this.techniqueData).forEach(technique => {
            if (!categories[technique.categoryId]) {
                categories[technique.categoryId] = {
                    id: technique.categoryId,
                    name: technique.categoryName,
                    techniques: []
                };
            }
            categories[technique.categoryId].techniques.push(technique);
        });
        return categories;
    }

    /**
     * Clear all selected techniques
     */
    clearSelectedTechniques() {
        this.selectedTechniques = [];
    }

    /**
     * Add technique from taxonomy data (if not in local data)
     */
    addTechniqueFromTaxonomy(technique, categoryName) {
        // Add to local technique data if not already present
        if (!this.techniqueData[technique.id]) {
            this.techniqueData[technique.id] = {
                id: technique.id,
                name: technique.name,
                description: technique.description,
                categoryId: technique.categoryId || 'taxonomy-loaded',
                categoryName: categoryName || 'Taxonomy Loaded',
                sources: technique.sources || [],
                relatedTechniques: technique.relatedTechniques || [],
                useCase: technique.useCase || '',
                example: technique.example || ''
            };
        }
        
        // Add to selected techniques
        return this.addTechnique(technique.id);
    }
}

// Make TechniqueManager available globally
window.TechniqueManager = TechniqueManager;

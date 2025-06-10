/**
 * PromptGenerator - Generiert Prompts basierend auf Techniken und Templates
 */
class PromptGenerator {
    constructor(promptBuilder = null) {
        this.promptBuilder = promptBuilder;
        this.techniqueManager = null;
        this.templateManager = null;
        this.initialized = false;
    }

    /**
     * Initialize the PromptGenerator
     */
    async init() {
        try {
            console.log('PromptGenerator: Initialisierung gestartet...');
            this.initialized = true;
            console.log('PromptGenerator: Erfolgreich initialisiert');
        } catch (error) {
            console.error('PromptGenerator: Initialisierungsfehler:', error);
            throw error;
        }
    }

    /**
     * Set references to other managers
     */
    setManagers(managers) {
        this.techniqueManager = managers.techniqueManager;
        this.templateManager = managers.templateManager;
    }

    /**
     * Generate the final prompt
     * @param {Object|string} options - Either options object or task description string
     * @param {string} basePrompt - Base prompt (when called with string parameters)
     * @param {string} outputFormat - Output format (when called with string parameters)
     */
    generatePrompt(options = {}, basePrompt = '', outputFormat = '') {
        let finalPrompt = "";
        
        // Handle both object and string parameter styles
        let taskDescription, selectedTemplates, templateFields;
        
        if (typeof options === 'object' && options !== null) {
            taskDescription = options.taskDescription || '';
            selectedTemplates = options.selectedTemplates || this.templateManager?.selectedTemplates || [];
            templateFields = options.templateFields || this.templateManager?.currentTemplateFields || {};
            basePrompt = options.basePrompt || basePrompt;
            outputFormat = options.outputFormat || outputFormat;
        } else {
            taskDescription = options || '';
            selectedTemplates = this.templateManager?.selectedTemplates || [];
            templateFields = this.templateManager?.currentTemplateFields || {};
        }
        
        // If using templates (multi-template support)
        if (selectedTemplates.length > 0) {
            finalPrompt = this.templateManager.generateCombinedTemplateText(taskDescription, outputFormat);
        } else {
            // Add selected techniques guidance
            if (this.techniqueManager?.selectedTechniques?.length > 0) {
                finalPrompt += this.constructTechniquePrompt();
            }
            
            // Add user inputs
            if (basePrompt) {
                finalPrompt += basePrompt + "\n\n";
            }
            
            if (taskDescription) {
                finalPrompt += "Aufgabe: " + taskDescription + "\n\n";
            }
            
            if (outputFormat) {
                finalPrompt += "Ausgabeformat: " + outputFormat + "\n";
            }
        }
        
        // Add placeholder if prompt is empty
        if (!finalPrompt.trim()) {
            finalPrompt = "Ihr Prompt wird hier angezeigt. Wählen Sie Techniken aus und füllen Sie die Eingabefelder aus, um Ihren Prompt zu erstellen.";
        }
        
        return finalPrompt;
    }

    /**
     * Construct a prompt based on selected techniques
     */
    constructTechniquePrompt() {
        let prompt = "";
        const selectedTechniques = this.techniqueManager.selectedTechniques;
        
        // Add role context if Chain-of-Thought is selected
        if (selectedTechniques.includes('chain-of-thought')) {
            prompt += "Ich möchte, dass Sie dieses Problem Schritt für Schritt durchdenken und Ihren Denkprozess zeigen.\n\n";
        }
        
        // Add self-consistency if selected
        if (selectedTechniques.includes('self-consistency')) {
            prompt += "Generieren Sie mehrere verschiedene Denkwege, um dieses Problem zu lösen, und wählen Sie dann die konsistenteste Antwort.\n\n";
        }
        
        // Add Zero-Shot CoT if selected
        if (selectedTechniques.includes('zero-shot-cot')) {
            prompt += "Denken wir Schritt für Schritt darüber nach.\n\n";
        }
        
        // Add Tree-of-Thoughts if selected
        if (selectedTechniques.includes('tree-of-thoughts')) {
            prompt += "Erkunden Sie für dieses Problem mehrere mögliche Ansätze. Denken Sie für jeden Ansatz über die nächsten Schritte nach und bewerten Sie, ob der Ansatz wahrscheinlich erfolgreich sein wird.\n\n";
        }
        
        // Add ReAct if selected
        if (selectedTechniques.includes('react-prompting')) {
            prompt += "Lassen Sie uns dieses Problem aufschlüsseln:\n1. Gedanke: Überlegen, was wir tun müssen\n2. Aktion: Bestimmen, welche Informationen oder Schritte wir benötigen\n3. Beobachtung: Ergebnisse notieren\n\nWiederholen Sie diesen Prozess, bis wir eine Lösung erreichen.\n\n";
        }
        
        // Add self-evaluation prompt if selected
        if (selectedTechniques.includes('self-correction')) {
            prompt += "Überprüfen Sie nach der Erstellung Ihrer ersten Antwort diese auf Fehler oder Verbesserungsmöglichkeiten, und stellen Sie dann eine überarbeitete Version bereit.\n\n";
        }
        
        // Add role prompting if selected
        if (selectedTechniques.includes('role-prompting')) {
            prompt += "Sie sind ein Experte mit tiefgreifendem Wissen und Erfahrung in diesem Bereich. Gehen Sie diese Aufgabe mit professionellen Erkenntnissen an.\n\n";
        }
        
        // Add few-shot learning if selected
        if (selectedTechniques.includes('few-shot-learning')) {
            prompt += "Hier sind einige Beispiele, die Ihren Ansatz leiten sollen:\n\nBeispiel 1: [Eingabe: Einfache Frage] [Ausgabe: Klare Antwort]\nBeispiel 2: [Eingabe: Komplexe Frage] [Ausgabe: Detaillierte Antwort]\n\n";
        }
        
        // Add one-shot learning if selected
        if (selectedTechniques.includes('one-shot-learning')) {
            prompt += "Hier ist ein Beispiel dafür, wie Sie dies angehen können: [Eingabe: Beispielfrage] [Ausgabe: Beispielantwort]\n\n";
        }
        
        // Add basic prompting if selected
        if (selectedTechniques.includes('basic-prompting')) {
            prompt += "Bitte geben Sie eine direkte und klare Antwort auf die folgende Aufgabe.\n\n";
        }
        
        return prompt;
    }

    /**
     * Generate suggestions based on selected techniques
     */
    generateSuggestions() {
        const suggestions = [];
        const selectedTechniques = this.techniqueManager.selectedTechniques;
        
        // Check for complementary techniques
        if (selectedTechniques.includes('basic-prompting') &&
            !selectedTechniques.includes('role-prompting')) {
            suggestions.push("Fügen Sie Role Prompting hinzu, um einen Expertenkontext für bessere Ergebnisse zu etablieren.");
        }
        
        // Check for missing key elements
        if (!selectedTechniques.includes('role-prompting')) {
            suggestions.push("Fügen Sie eine Rollenbeschreibung im Basis-Prompt hinzu (z.B. 'Sie sind ein Experte...').");
        }
        
        if (selectedTechniques.includes('few-shot-learning') && 
            !selectedTechniques.includes('chain-of-thought')) {
            suggestions.push("Erwägen Sie, Chain-of-Thought hinzuzufügen, um das Denken in Ihren Beispielen zu zeigen.");
        }
        
        if (selectedTechniques.includes('tree-of-thoughts') && 
            !selectedTechniques.includes('self-consistency')) {
            suggestions.push("Self-Consistency funktioniert gut mit Tree-of-Thoughts, um die beste Lösung auszuwählen.");
        }
        
        // Check for output format
        if (selectedTechniques.length > 0) {
            suggestions.push("Geben Sie ein Ausgabeformat an, um konsistentere Ergebnisse zu erhalten.");
        }
        
        // If no specific suggestions, add generic ones
        if (suggestions.length === 0) {
            if (selectedTechniques.length === 1) {
                const technique = this.techniqueManager.getTechnique(selectedTechniques[0]);
                suggestions.push(`Versuchen Sie, komplementäre Techniken zu "${technique.name}" hinzuzufügen, um bessere Ergebnisse zu erzielen.`);
            } else {
                suggestions.push("Ihr Prompt sieht gut aus! Erwägen Sie, spezifischere Ausgabebeschränkungen hinzuzufügen, falls erforderlich.");
            }
        }
        
        return suggestions;
    }

    /**
     * Apply syntax highlighting to the preview
     */
    highlightPrompt(promptText) {
        // Apply highlighting
        let highlighted = promptText;
        
        // Highlight task directives
        highlighted = highlighted.replace(/^Aufgabe:.*$/gm, match =>
            `<span class="highlight-directive">${match}</span>`);
            
        // Highlight output format
        highlighted = highlighted.replace(/^Ausgabeformat:.*$/gm, match =>
            `<span class="highlight-format">${match}</span>`);
            
        // Highlight technique-specific phrases
        this.techniqueManager.selectedTechniques.forEach(techniqueId => {
            const technique = this.techniqueManager.getTechnique(techniqueId);
            if (technique && technique.example) {
                // Extract key phrases from the example
                const keyPhrases = technique.example
                    .split('\n')
                    .filter(line => line.trim().length > 5 && !line.includes("Example"))
                    .map(line => line.trim())
                    .filter(phrase => phrase.length > 8);
                
                keyPhrases.forEach(phrase => {
                    // Only highlight exact key phrases that appear in the final prompt
                    if (promptText.includes(phrase)) {
                        highlighted = highlighted.replace(
                            new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'),
                            `<span class="highlight-technique">${phrase}</span>`
                        );
                    }
                });
            }
        });
        
        return highlighted;
    }

    /**
     * Estimate token count for a text
     */
    estimateTokenCount(text) {
        if (!text || 
            text === "Ihr Prompt wird hier erscheinen. Wählen Sie Techniken aus und füllen Sie die Eingabefelder aus, um Ihren Prompt zu erstellen." || 
            text === "Ihr Prompt wird hier angezeigt. Wählen Sie Techniken aus und füllen Sie die Eingabefelder aus, um Ihren Prompt zu erstellen.") {
            return 0;
        }
        
        // Simple estimation: ~4 characters = 1 token
        return Math.ceil(text.length / 4);
    }
}

// Make PromptGenerator available globally
window.PromptGenerator = PromptGenerator;

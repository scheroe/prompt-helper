/**
 * StorageManager - Verwaltet LocalStorage für gespeicherte Prompts
 */
class StorageManager {
    constructor() {
        this.savedPrompts = JSON.parse(localStorage.getItem('savedPrompts') || '[]');
        this.initialized = false;
    }

    /**
     * Initialize the StorageManager
     */
    async init() {
        try {
            console.log('StorageManager: Initialisierung gestartet...');
            this.initialized = true;
            console.log('StorageManager: Erfolgreich initialisiert');
        } catch (error) {
            console.error('StorageManager: Initialisierungsfehler:', error);
            throw error;
        }
    }

    /**
     * Set references to other managers (if needed)
     */
    setManagers(managers) {
        // StorageManager is self-contained for now
        // Can add references if needed later
    }

    /**
     * Save current prompt to localStorage
     */
    savePrompt(promptData) {
        const promptName = prompt("Geben Sie einen Namen für diesen Prompt ein:", "");
        if (promptName === null) return false; // User canceled

        const newSavedPrompt = {
            name: promptName || `Gespeicherter Prompt ${this.savedPrompts.length + 1}`,
            prompt: promptData.promptText,
            techniques: [...promptData.selectedTechniques],
            basePrompt: promptData.basePrompt,
            taskDescription: promptData.taskDescription,
            outputFormat: promptData.outputFormat,
            templates: [...promptData.selectedTemplates],
            templateFields: {...promptData.templateFields},
            timestamp: new Date().toISOString()
        };

        this.savedPrompts.push(newSavedPrompt);
        localStorage.setItem('savedPrompts', JSON.stringify(this.savedPrompts));
        
        return true;
    }

    /**
     * Load a saved prompt by index
     */
    loadPrompt(index) {
        if (index < 0 || index >= this.savedPrompts.length) return null;
        return this.savedPrompts[index];
    }

    /**
     * Get all saved prompts
     */
    getAllSavedPrompts() {
        return this.savedPrompts;
    }

    /**
     * Delete a saved prompt
     */
    deletePrompt(index) {
        if (index < 0 || index >= this.savedPrompts.length) return false;
        
        this.savedPrompts.splice(index, 1);
        localStorage.setItem('savedPrompts', JSON.stringify(this.savedPrompts));
        return true;
    }

    /**
     * Export prompt data
     */
    exportPrompt(promptData) {
        // Create export data
        const exportData = {
            prompt: promptData.promptText,
            techniques: promptData.selectedTechniques.map(id => {
                const technique = promptData.techniqueData[id];
                return {
                    id,
                    name: technique?.name,
                    description: technique?.description
                };
            }),
            basePrompt: promptData.basePrompt,
            taskDescription: promptData.taskDescription,
            outputFormat: promptData.outputFormat,
            templates: promptData.selectedTemplates.map(templateId => {
                const template = promptData.templateData[templateId];
                return {
                    id: templateId,
                    name: template?.name
                };
            }),
            templateFields: promptData.templateFields,
            metadata: {
                timestamp: new Date().toISOString(),
                version: "1.0",
                tokenEstimate: Math.ceil(promptData.promptText.length / 4)
            }
        };

        // Create and download file
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `prompt_${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    /**
     * Import prompt data from file
     */
    importPrompt(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const importData = JSON.parse(e.target.result);
                    resolve(importData);
                } catch (error) {
                    reject(new Error('Ungültige JSON-Datei'));
                }
            };
            reader.onerror = () => reject(new Error('Fehler beim Lesen der Datei'));
            reader.readAsText(file);
        });
    }

    /**
     * Create saved prompts dropdown in UI
     */
    createSavedPromptsDropdown() {
        const promptActionsContainer = document.querySelector('.prompt-actions');
        if (!promptActionsContainer) return;

        const actionsRight = document.querySelector('.prompt-actions-right');

        // Add saved prompts dropdown if there are saved prompts
        if (this.savedPrompts.length > 0) {
            let savedPromptsSelect = document.getElementById('saved-prompts-select');

            if (!savedPromptsSelect) {
                savedPromptsSelect = document.createElement('select');
                savedPromptsSelect.id = 'saved-prompts-select';
                savedPromptsSelect.className = 'saved-prompts-select';

                // Add to the DOM
                if (actionsRight) {
                    actionsRight.insertBefore(savedPromptsSelect, actionsRight.firstChild);
                } else {
                    promptActionsContainer.insertBefore(savedPromptsSelect, promptActionsContainer.firstChild);
                }
            }

            // Clear existing options
            savedPromptsSelect.innerHTML = '';

            // Add default option
            const defaultOption = document.createElement('option');
            defaultOption.value = '';
            defaultOption.textContent = '-- Gespeicherten Prompt laden --';
            savedPromptsSelect.appendChild(defaultOption);

            // Add saved prompts with timestamps
            this.savedPrompts.forEach((savedPrompt, index) => {
                const option = document.createElement('option');
                option.value = index.toString();

                // Format timestamp if available
                let timeDisplay = '';
                if (savedPrompt.timestamp) {
                    try {
                        const date = new Date(savedPrompt.timestamp);
                        timeDisplay = ` (${date.toLocaleDateString()})`;
                    } catch (e) {
                        timeDisplay = '';
                    }
                }

                option.textContent = savedPrompt.name + timeDisplay;
                savedPromptsSelect.appendChild(option);
            });

            return savedPromptsSelect;
        }

        return null;
    }
}

// Make StorageManager available globally
window.StorageManager = StorageManager;

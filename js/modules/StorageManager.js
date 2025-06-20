/**
 * StorageManager - Verwaltet LocalStorage für gespeicherte Prompts
 */
class StorageManager {
    constructor() {
        this.savedPrompts = JSON.parse(localStorage.getItem('savedPrompts') || '[]');
        // Ensure all saved prompts have IDs
        this.ensurePromptIds();
        this.initialized = false;
    }

    /**
     * Ensure all saved prompts have unique IDs
     */
    ensurePromptIds() {
        let needsUpdate = false;
        this.savedPrompts.forEach(prompt => {
            if (!prompt.id) {
                prompt.id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
                needsUpdate = true;
            }
        });
        if (needsUpdate) {
            localStorage.setItem('savedPrompts', JSON.stringify(this.savedPrompts));
        }
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
     * Save current prompt to localStorage with given name
     */
    savePromptWithName(promptData, promptName) {
        if (!promptName || promptName.trim() === '') {
            return false;
        }

        const newSavedPrompt = {
            id: Date.now().toString(), // Simple ID generation
            name: promptName.trim(),
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
     * Update an existing saved prompt
     */
    updatePrompt(promptId, updatedData) {
        const index = this.savedPrompts.findIndex(p => p.id === promptId);
        if (index === -1) return false;

        this.savedPrompts[index] = {
            ...this.savedPrompts[index],
            ...updatedData,
            timestamp: new Date().toISOString()
        };

        localStorage.setItem('savedPrompts', JSON.stringify(this.savedPrompts));
        return true;
    }

    /**
     * Delete a saved prompt by ID
     */
    deletePromptById(promptId) {
        const index = this.savedPrompts.findIndex(p => p.id === promptId);
        if (index === -1) return false;
        
        this.savedPrompts.splice(index, 1);
        localStorage.setItem('savedPrompts', JSON.stringify(this.savedPrompts));
        return true;
    }

    /**
     * Get a saved prompt by ID
     */
    getPromptById(promptId) {
        return this.savedPrompts.find(p => p.id === promptId) || null;
    }

    /**
     * Get all saved prompts
     */
    getAllSavedPrompts() {
        return this.savedPrompts;
    }

    /**
     * Get saved prompts (alias for compatibility)
     */
    getSavedPrompts() {
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

    /**
     * Export prompt as plain text
     */
    exportPromptAsText(promptData) {
        if (!promptData) return '';

        let textContent = '';
        
        // Add role assignment if present
        if (promptData.basePrompt && promptData.basePrompt.trim()) {
            textContent += `ROLLE:\n${promptData.basePrompt}\n\n`;
        }
        
        // Add task description
        if (promptData.taskDescription && promptData.taskDescription.trim()) {
            textContent += `AUFGABE:\n${promptData.taskDescription}\n\n`;
        }
        
        // Add output format
        if (promptData.outputFormat && promptData.outputFormat.trim()) {
            textContent += `AUSGABEFORMAT:\n${promptData.outputFormat}\n\n`;
        }
        
        // Add final prompt
        textContent += `GENERIERTER PROMPT:\n${promptData.promptText}\n\n`;
        
        // Add metadata
        textContent += `---\nERSTELLT AM: ${new Date().toLocaleString('de-DE')}\n`;
        if (promptData.selectedTechniques && promptData.selectedTechniques.length > 0) {
            textContent += `VERWENDETE TECHNIKEN: ${promptData.selectedTechniques.join(', ')}\n`;
        }
        
        return textContent;
    }

    /**
     * Export prompt as Markdown
     */
    exportPromptAsMarkdown(promptData) {
        if (!promptData) return '';

        let markdownContent = `# Prompt Export\n\n`;
        
        // Add role assignment if present
        if (promptData.basePrompt && promptData.basePrompt.trim()) {
            markdownContent += `## Rolle\n\n${promptData.basePrompt}\n\n`;
        }
        
        // Add task description
        if (promptData.taskDescription && promptData.taskDescription.trim()) {
            markdownContent += `## Aufgabe\n\n${promptData.taskDescription}\n\n`;
        }
        
        // Add output format
        if (promptData.outputFormat && promptData.outputFormat.trim()) {
            markdownContent += `## Ausgabeformat\n\n${promptData.outputFormat}\n\n`;
        }
        
        // Add final prompt
        markdownContent += `## Generierter Prompt\n\n\`\`\`\n${promptData.promptText}\n\`\`\`\n\n`;
        
        // Add metadata
        markdownContent += `## Metadaten\n\n`;
        markdownContent += `- **Erstellt am:** ${new Date().toLocaleString('de-DE')}\n`;
        if (promptData.selectedTechniques && promptData.selectedTechniques.length > 0) {
            markdownContent += `- **Verwendete Techniken:** ${promptData.selectedTechniques.join(', ')}\n`;
        }
        
        return markdownContent;
    }

    /**
     * Export prompt as XML
     */
    exportPromptAsXML(promptData) {
        if (!promptData) return '';

        let xmlContent = `<?xml version="1.0" encoding="UTF-8"?>\n`;
        xmlContent += `<prompt>\n`;
        xmlContent += `  <metadaten>\n`;
        xmlContent += `    <erstellt_am>${new Date().toISOString()}</erstellt_am>\n`;
        if (promptData.selectedTechniques && promptData.selectedTechniques.length > 0) {
            xmlContent += `    <verwendete_techniken>\n`;
            promptData.selectedTechniques.forEach(technique => {
                xmlContent += `      <technik>${this.escapeXML(technique)}</technik>\n`;
            });
            xmlContent += `    </verwendete_techniken>\n`;
        }
        xmlContent += `  </metadaten>\n`;
        
        // Add role assignment if present
        if (promptData.basePrompt && promptData.basePrompt.trim()) {
            xmlContent += `  <rolle><![CDATA[${promptData.basePrompt}]]></rolle>\n`;
        }
        
        // Add task description
        if (promptData.taskDescription && promptData.taskDescription.trim()) {
            xmlContent += `  <aufgabe><![CDATA[${promptData.taskDescription}]]></aufgabe>\n`;
        }
        
        // Add output format
        if (promptData.outputFormat && promptData.outputFormat.trim()) {
            xmlContent += `  <ausgabeformat><![CDATA[${promptData.outputFormat}]]></ausgabeformat>\n`;
        }
        
        // Add final prompt
        xmlContent += `  <generierter_prompt><![CDATA[${promptData.promptText}]]></generierter_prompt>\n`;
        xmlContent += `</prompt>`;
        
        return xmlContent;
    }

    /**
     * Escape XML special characters
     */
    escapeXML(text) {
        return text.replace(/[<>&'"]/g, function (char) {
            switch (char) {
                case '<': return '&lt;';
                case '>': return '&gt;';
                case '&': return '&amp;';
                case '"': return '&quot;';
                case "'": return '&#39;';
                default: return char;
            }
        });
    }

    /**
     * Download content as file
     */
    downloadAsFile(content, filename, mimeType = 'text/plain') {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }
}

// Make StorageManager available globally
window.StorageManager = StorageManager;

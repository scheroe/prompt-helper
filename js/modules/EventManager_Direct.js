/**
 * EventManager - Handles all event listeners for direct form layout
 * Updated to work with FormManager instead of WizardManager
 */
class EventManager {
    constructor(promptBuilder) {
        this.promptBuilder = promptBuilder;
        this.uiManager = null;
        this.formManager = null;
        this.templateManager = null;
        this.techniqueManager = null;
        this.promptGenerator = null;
        this.storageManager = null;
        this.initialized = false;
    }

    /**
     * Initialize the EventManager
     */
    async init() {
        try {
            console.log('EventManager: Initialisierung gestartet...');
            this.setupAllEventListeners();
            this.initialized = true;
            console.log('EventManager: Erfolgreich initialisiert');
        } catch (error) {
            console.error('EventManager: Initialisierungsfehler:', error);
            throw error;
        }
    }

    /**
     * Set references to other managers
     */
    setManagers(managers) {
        this.uiManager = managers.uiManager;
        this.formManager = managers.formManager;
        this.templateManager = managers.templateManager;
        this.techniqueManager = managers.techniqueManager;
        this.promptGenerator = managers.promptGenerator;
        this.storageManager = managers.storageManager;
    }

    /**
     * Initialize all event listeners
     */
    setupAllEventListeners() {
        this.addFormEventListeners();
        this.addTechniqueEventListeners();
        this.addTemplateEventListeners();
        this.addPromptEventListeners();
        this.addStorageEventListeners();
        this.addUtilityEventListeners();
    }

    /**
     * Add form input event listeners
     */
    addFormEventListeners() {
        // Task description input
        const taskDescInput = document.getElementById('task-description');
        if (taskDescInput) {
            taskDescInput.addEventListener('input', (e) => {
                this.promptBuilder.taskDescription = e.target.value;
                if (this.formManager && this.formManager.previewVisible) {
                    this.promptGenerator.updatePromptPreview();
                }
            });
        }

        // Base prompt input
        const basePromptInput = document.getElementById('base-prompt');
        if (basePromptInput) {
            basePromptInput.addEventListener('input', (e) => {
                this.promptBuilder.basePrompt = e.target.value;
                if (this.formManager && this.formManager.previewVisible) {
                    this.promptGenerator.updatePromptPreview();
                }
            });
        }

        // Output format input
        const outputFormatInput = document.getElementById('output-format');
        if (outputFormatInput) {
            outputFormatInput.addEventListener('input', (e) => {
                this.promptBuilder.outputFormat = e.target.value;
                if (this.formManager && this.formManager.previewVisible) {
                    this.promptGenerator.updatePromptPreview();
                }
            });
        }
    }

    /**
     * Add technique selection event listeners
     */
    addTechniqueEventListeners() {
        // Technique selection checkboxes
        document.addEventListener('change', (e) => {
            if (e.target.matches('input[name="techniques"]')) {
                const techniqueId = e.target.value;
                if (e.target.checked) {
                    this.promptBuilder.addSelectedTechnique(techniqueId);
                } else {
                    this.promptBuilder.removeSelectedTechnique(techniqueId);
                }
                
                // Update UI - no longer show selected techniques panel
                // Dynamic fields are handled by FormManager
                
                // Update dynamic fields through FormManager
                if (this.formManager) {
                    this.formManager.updateDynamicTechniqueFields();
                }
                
                // Auto-update preview if visible
                if (this.formManager && this.formManager.previewVisible) {
                    this.promptGenerator.updatePromptPreview();
                }
            }
        });

        // Technique category filters
        document.addEventListener('click', (e) => {
            if (e.target.matches('.technique-category-btn')) {
                const category = e.target.dataset.category;
                this.techniqueManager.filterByCategory(category);
                
                // Update active filter button
                document.querySelectorAll('.technique-category-btn').forEach(btn => {
                    btn.classList.remove('active');
                });
                e.target.classList.add('active');
            }
        });

        // Technique info/details buttons
        document.addEventListener('click', (e) => {
            if (e.target.matches('.technique-details-button, .technique-info-icon')) {
                const techniqueItem = e.target.closest('.technique-selector-item');
                if (techniqueItem) {
                    const techniqueId = techniqueItem.dataset.id;
                    if (this.uiManager && this.uiManager.techniqueUIManager) {
                        this.uiManager.techniqueUIManager.showTechniqueDetails(techniqueId);
                    }
                }
            }
        });

        // Clear all techniques
        const clearAllBtn = document.getElementById('clear-all-techniques');
        if (clearAllBtn) {
            clearAllBtn.addEventListener('click', () => {
                this.clearAllTechniques();
            });
        }

        // Select all techniques
        const selectAllBtn = document.getElementById('select-all-techniques');
        if (selectAllBtn) {
            selectAllBtn.addEventListener('click', () => {
                this.selectAllVisibleTechniques();
            });
        }
    }

    /**
     * Add template selection event listeners (now minimal since templates removed from UI)
     */
    addTemplateEventListeners() {
        // Template functionality is now minimal since template selection UI was removed
        // Keep basic functionality in case templates are used programmatically
        
        console.log('EventManager: Template selection UI removed - minimal template support active');
    }

    /**
     * Add prompt action event listeners
     */
    addPromptEventListeners() {
        // Copy prompt button
        const copyBtn = document.getElementById('copy-prompt-button');
        if (copyBtn) {
            copyBtn.addEventListener('click', () => {
                this.copyPromptToClipboard();
            });
        }

        // Save prompt button
        const saveBtn = document.getElementById('save-prompt-button');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => {
                this.saveCurrentPrompt();
            });
        }

        // Export prompt button
        const exportBtn = document.getElementById('export-prompt-button');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                this.exportPrompt();
            });
        }

        // Clear prompt button
        const clearBtn = document.getElementById('clear-prompt-button');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                this.clearPrompt();
            });
        }

        // Token info button removed - no longer in UI
    }

    /**
     * Add storage-related event listeners
     */
    addStorageEventListeners() {
        // These would be for loading/saving prompts functionality
        // Implementation depends on StorageManager
    }

    /**
     * Add utility event listeners
     */
    addUtilityEventListeners() {
        // Modal close buttons (token-info-close removed)
        document.addEventListener('click', (e) => {
            if (e.target.matches('.modal-close')) {
                this.closeAllModals();
            }
        });

        // Escape key to close modals
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeAllModals();
            }
        });

        // Example usage buttons
        document.addEventListener('click', (e) => {
            if (e.target.matches('.use-example-button')) {
                const exampleId = e.target.dataset.example;
                this.loadExample(exampleId);
            }
        });
    }

    /**
     * Load example configuration with automatic technique selection
     */
    loadExample(exampleId) {
        const examples = {
            'complex-reasoning': {
                name: 'Komplexe Problemlösung',
                techniques: ['chain-of-thought-prompting', 'self-consistency'],
                basePrompt: 'Du bist ein logischer Problemlöser mit ausgezeichneten analytischen Fähigkeiten.',
                taskDescription: 'Löse das folgende komplexe Problem Schritt für Schritt und verwende dabei verschiedene Denkansätze zur Validierung deiner Lösung.',
                outputFormat: 'Strukturierte Antwort mit: 1) Problemanalyse, 2) Lösungsschritte, 3) Alternative Ansätze, 4) Finale Lösung'
            },
            'creative-content': {
                name: 'Kreative Inhaltsgenerierung',
                techniques: ['few-shot-prompting', 'zero-shot-prompting'],
                basePrompt: 'Du bist ein kreativer Content-Creator mit jahrelanger Erfahrung in verschiedenen Branchen.',
                taskDescription: 'Erstelle ansprechende und originelle Inhalte basierend auf den gegebenen Parametern.',
                outputFormat: 'Kreativer Text mit: Headline, Haupttext, Call-to-Action (maximal 500 Wörter)'
            },
            'text-analysis-mindmap': {
                name: 'Text-Analyse & Mindmap',
                techniques: ['chain-of-thought-prompting', 'self-refine-prompting'],
                basePrompt: 'Du bist ein erfahrener Textanalyst und Visualisierungsexperte mit der Fähigkeit, komplexe Texte zu strukturieren und als Mindmaps darzustellen.',
                taskDescription: 'Analysiere den gegebenen Text gründlich und erstelle basierend auf der Analyse eine übersichtliche Mindmap in Mermaid-Code.',
                outputFormat: 'Strukturierte Ausgabe mit: 1) Kurze Textanalyse (Hauptthemen, Kernpunkte), 2) Vollständiger Mermaid-Code für die Mindmap, 3) Erklärung der Mindmap-Struktur'
            },
            'critical-idea-analysis': {
                name: 'Kritische Ideenbewertung',
                techniques: ['chain-of-thought-prompting', 'self-consistency'],
                basePrompt: 'Du bist ein kritischer Analyst mit der Fähigkeit, Ideen aus verschiedenen Perspektiven zu bewerten. Du gibst ehrliche, differenzierte Kritik ohne Schmeicheleien.',
                taskDescription: 'Bewerte die gegebene Idee kritisch aus drei Perspektiven: Pro-Argumente, Gegenargumente und problematische Annahmen.',
                outputFormat: 'Strukturierte Bewertung mit: 1) Pro-Argumente (was spricht dafür), 2) Contra-Argumente (logische, ethische, praktische Einwände), 3) Problematische Annahmen (was könnte falsch oder verkürzt sein), 4) Gegenposition und deren Begründung'
            }
        };

        const example = examples[exampleId];
        if (!example) {
            this.showNotification('Beispiel nicht gefunden', 'error');
            return;
        }

        // Clear current selections
        this.clearAllTechniques();
        this.clearAllTemplates();

        // Select the techniques for this example
        example.techniques.forEach(techniqueId => {
            const checkbox = document.querySelector(`input[name="techniques"][value="${techniqueId}"]`);
            if (checkbox) {
                checkbox.checked = true;
                checkbox.dispatchEvent(new Event('change'));
            }
        });

        // Fill form fields
        const basePromptField = document.getElementById('base-prompt');
        if (basePromptField) basePromptField.value = example.basePrompt;

        const taskDescField = document.getElementById('task-description');
        if (taskDescField) taskDescField.value = example.taskDescription;

        const outputFormatField = document.getElementById('output-format');
        if (outputFormatField) outputFormatField.value = example.outputFormat;

        // Show notification
        this.showNotification(`Beispiel "${example.name}" wurde geladen`, 'success');

        // Do NOT auto-generate preview - let user decide when to generate
        // User can click "Prompt generieren & Vorschau anzeigen" button manually
    }

    /**
     * Show notification message
     */
    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <span class="notification-message">${message}</span>
            <button class="notification-close">&times;</button>
        `;

        // Add to notification container
        let container = document.getElementById('notification-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'notification-container';
            container.className = 'notification-container';
            document.body.appendChild(container);
        }

        container.appendChild(notification);

        // Auto-remove after 3 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 3000);

        // Add close button functionality
        notification.querySelector('.notification-close').addEventListener('click', () => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        });
    }

    /**
     * Clear all selected techniques
     */
    clearAllTechniques() {
        document.querySelectorAll('input[name="techniques"]:checked').forEach(checkbox => {
            checkbox.checked = false;
            checkbox.dispatchEvent(new Event('change'));
        });
    }

    /**
     * Select all visible techniques
     */
    selectAllVisibleTechniques() {
        document.querySelectorAll('input[name="techniques"]:not(:checked)').forEach(checkbox => {
            const techniqueItem = checkbox.closest('.technique-item');
            if (techniqueItem && techniqueItem.style.display !== 'none') {
                checkbox.checked = true;
                checkbox.dispatchEvent(new Event('change'));
            }
        });
    }

    /**
     * Clear all templates (minimal implementation)
     */
    clearAllTemplates() {
        // Clear any programmatically selected templates
        if (this.promptBuilder && this.promptBuilder.selectedTemplates) {
            this.promptBuilder.selectedTemplates = [];
        }
    }

    /**
     * Copy prompt to clipboard
     */
    async copyPromptToClipboard() {
        try {
            const promptText = document.getElementById('prompt-preview')?.textContent || '';
            await navigator.clipboard.writeText(promptText);
            this.showNotification('Prompt erfolgreich in die Zwischenablage kopiert!', 'success');
        } catch (err) {
            console.error('Fehler beim Kopieren:', err);
            this.showNotification('Fehler beim Kopieren in die Zwischenablage', 'error');
        }
    }

    /**
     * Save current prompt
     */
    saveCurrentPrompt() {
        const promptName = prompt('Geben Sie einen Namen für diesen Prompt ein:');
        if (promptName && promptName.trim()) {
            if (this.storageManager) {
                this.storageManager.savePrompt(promptName.trim());
                this.showNotification('Prompt erfolgreich gespeichert!', 'success');
            }
        }
    }

    /**
     * Export prompt as file
     */
    exportPrompt() {
        const promptText = document.getElementById('prompt-preview')?.textContent || '';
        const blob = new Blob([promptText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `prompt_${new Date().toISOString().slice(0, 10)}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showNotification('Prompt erfolgreich exportiert!', 'success');
    }

    /**
     * Clear prompt and form
     */
    clearPrompt() {
        if (confirm('Sind Sie sicher, dass Sie alles zurücksetzen möchten?')) {
            if (this.formManager) {
                this.formManager.startOver();
            }
        }
    }

    /**
     * Token info modal removed - no longer needed
     */

    /**
     * Close all modals
     */
    closeAllModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.style.display = 'none';
        });
    }
}

// Make EventManager available globally
window.EventManager = EventManager;

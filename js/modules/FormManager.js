/**
 * FormManager - Verwaltet das direkte Formular ohne Wizard-Navigation
 * Ersetzt den alten WizardManager
 */
class FormManager {
    constructor() {
        this.previewVisible = false;
        this.initialized = false;
    }

    /**
     * Initialize the FormManager
     */
    async init() {
        try {
            console.log('FormManager: Initialisierung gestartet...');
            this.initFormNavigation();
            this.initialized = true;
            console.log('FormManager: Erfolgreich initialisiert');
        } catch (error) {
            console.error('FormManager: Initialisierungsfehler:', error);
            throw error;
        }
    }

    /**
     * Set references to other managers
     */
    setManagers(managers) {
        this.promptGenerator = managers.promptGenerator;
        this.uiManager = managers.uiManager;
        this.techniqueManager = managers.techniqueManager;
    }

    /**
     * Initialize form navigation and controls
     */
    initFormNavigation() {
        // Generate preview button
        const generateButton = document.getElementById('generate-preview-button');
        if (generateButton) {
            generateButton.addEventListener('click', () => this.generateAndShowPreview());
        }

        // Collapse/expand preview button
        const collapseButton = document.getElementById('collapse-preview-button');
        if (collapseButton) {
            collapseButton.addEventListener('click', () => this.togglePreview());
        }

        // Start over button
        const startOverButton = document.getElementById('start-over-button');
        if (startOverButton) {
            startOverButton.addEventListener('click', () => {
                if (confirm('Sind Sie sicher, dass Sie neu beginnen möchten? Dies wird alle Ihre aktuellen Auswahlen löschen.')) {
                    this.startOver();
                }
            });
        }

        // Auto-update preview when form changes (debounced)
        this.setupAutoPreview();
    }

    /**
     * Generate prompt and show preview section
     */
    async generateAndShowPreview() {
        try {
            // Generate the prompt
            if (this.promptGenerator) {
                await this.promptGenerator.generatePrompt();
            }

            // Show preview section
            this.showPreview();

            // Scroll to preview
            const previewSection = document.getElementById('preview-section');
            if (previewSection) {
                previewSection.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'start'
                });
            }

            // Update button text
            const generateButton = document.getElementById('generate-preview-button');
            if (generateButton) {
                generateButton.innerHTML = '<i class="fas fa-sync"></i> Prompt aktualisieren';
            }

        } catch (error) {
            console.error('FormManager: Fehler beim Generieren der Vorschau:', error);
            // Show error message to user
            if (this.uiManager && this.uiManager.showNotification) {
                this.uiManager.showNotification('Fehler beim Generieren der Vorschau', 'error');
            }
        }
    }

    /**
     * Show the preview section
     */
    showPreview() {
        const previewSection = document.getElementById('preview-section');
        if (previewSection) {
            previewSection.style.display = 'block';
            this.previewVisible = true;

            // Update collapse button
            const collapseButton = document.getElementById('collapse-preview-button');
            if (collapseButton) {
                collapseButton.innerHTML = '<i class="fas fa-chevron-up"></i> Vorschau ausblenden';
            }
        }
    }

    /**
     * Hide the preview section
     */
    hidePreview() {
        const previewSection = document.getElementById('preview-section');
        if (previewSection) {
            previewSection.style.display = 'none';
            this.previewVisible = false;

            // Update collapse button
            const collapseButton = document.getElementById('collapse-preview-button');
            if (collapseButton) {
                collapseButton.innerHTML = '<i class="fas fa-chevron-down"></i> Vorschau anzeigen';
            }

            // Reset generate button text
            const generateButton = document.getElementById('generate-preview-button');
            if (generateButton) {
                generateButton.innerHTML = '<i class="fas fa-magic"></i> Prompt generieren & Vorschau anzeigen';
            }
        }
    }

    /**
     * Toggle preview visibility
     */
    togglePreview() {
        if (this.previewVisible) {
            this.hidePreview();
        } else {
            this.generateAndShowPreview();
        }
    }

    /**
     * Setup automatic preview updates (debounced)
     */
    setupAutoPreview() {
        let debounceTimer;
        const debounceDelay = 1000; // 1 second

        // Watch for form input changes
        const formInputs = [
            'base-prompt',
            'task-description', 
            'output-format'
        ];

        formInputs.forEach(inputId => {
            const input = document.getElementById(inputId);
            if (input) {
                input.addEventListener('input', () => {
                    // Only auto-update if preview is visible
                    if (this.previewVisible) {
                        clearTimeout(debounceTimer);
                        debounceTimer = setTimeout(() => {
                            this.generateAndShowPreview();
                        }, debounceDelay);
                    }
                });
            }
        });

        // Watch for technique selection changes
        document.addEventListener('change', (e) => {
            if (e.target.matches('input[name="techniques"]')) {
                this.onTechniqueSelectionChange();
            }
        });
    }

    /**
     * Handle technique selection changes
     */
    onTechniqueSelectionChange() {
        // Update dynamic technique fields
        this.updateDynamicTechniqueFields();

        // Auto-update preview if visible
        if (this.previewVisible) {
            this.generateAndShowPreview();
        }
    }

    /**
     * Update dynamic technique-specific fields
     */
    updateDynamicTechniqueFields() {
        const container = document.getElementById('dynamic-technique-fields');
        if (!container) return;

        // Get selected techniques
        const selectedTechniques = Array.from(document.querySelectorAll('input[name="techniques"]:checked'))
            .map(input => input.value);

        // Clear existing fields
        container.innerHTML = '';

        // Add technique-specific fields
        selectedTechniques.forEach(techniqueId => {
            const fields = this.getTechniqueSpecificFields(techniqueId);
            if (fields) {
                container.appendChild(fields);
            }
        });
    }

    /**
     * Get technique-specific input fields
     */
    getTechniqueSpecificFields(techniqueId) {
        const fieldsConfig = {
            'few-shot': {
                title: 'Few-Shot Examples',
                fields: [
                    {
                        id: 'few-shot-examples',
                        label: 'Beispiele (ein Beispiel pro Zeile):',
                        type: 'textarea',
                        placeholder: 'Beispiel 1: Input -> Output\nBeispiel 2: Input -> Output\n...'
                    }
                ]
            },
            'chain-of-thought': {
                title: 'Chain-of-Thought',
                fields: [
                    {
                        id: 'cot-instructions',
                        label: 'Spezifische Denkschritte:',
                        type: 'textarea',
                        placeholder: 'z.B. "Denke Schritt für Schritt durch das Problem..."'
                    }
                ]
            },
            'role-prompting': {
                title: 'Role Prompting',
                fields: [
                    {
                        id: 'role-description',
                        label: 'Rollenbeschreibung:',
                        type: 'textarea',
                        placeholder: 'z.B. "Du bist ein erfahrener Software-Entwickler mit 10 Jahren Erfahrung..."'
                    }
                ]
            }
            // Add more technique-specific fields as needed
        };

        const config = fieldsConfig[techniqueId];
        if (!config) return null;

        const fieldGroup = document.createElement('div');
        fieldGroup.className = 'input-group technique-specific-group';
        fieldGroup.innerHTML = `
            <h4><i class="fas fa-cog"></i> ${config.title}</h4>
            ${config.fields.map(field => `
                <div class="input-field">
                    <label for="${field.id}">${field.label}</label>
                    ${field.type === 'textarea' 
                        ? `<textarea id="${field.id}" placeholder="${field.placeholder}"></textarea>`
                        : `<input type="${field.type}" id="${field.id}" placeholder="${field.placeholder}">`
                    }
                </div>
            `).join('')}
        `;

        return fieldGroup;
    }

    /**
     * Start over - reset form
     */
    startOver() {
        // Clear all form inputs
        const formInputs = document.querySelectorAll('input, textarea, select');
        formInputs.forEach(input => {
            if (input.type === 'checkbox' || input.type === 'radio') {
                input.checked = false;
            } else {
                input.value = '';
            }
        });

        // Hide preview
        this.hidePreview();

        // Clear dynamic technique fields
        const dynamicFields = document.getElementById('dynamic-technique-fields');
        if (dynamicFields) {
            dynamicFields.innerHTML = '';
        }

        // Clear prompt preview
        const promptPreview = document.getElementById('prompt-preview');
        if (promptPreview) {
            promptPreview.textContent = 'Ihr Prompt wird hier angezeigt. Wählen Sie Techniken aus und füllen Sie die Eingabefelder aus, um Ihren Prompt zu erstellen.';
        }

        // Show success message
        if (this.uiManager && this.uiManager.showNotification) {
            this.uiManager.showNotification('Formular wurde zurückgesetzt', 'success');
        }

        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    /**
     * Check if form has content
     */
    hasFormContent() {
        const inputs = ['base-prompt', 'task-description', 'output-format'];
        return inputs.some(id => {
            const element = document.getElementById(id);
            return element && element.value.trim().length > 0;
        });
    }

    /**
     * Get form data
     */
    getFormData() {
        const data = {
            basePrompt: document.getElementById('base-prompt')?.value || '',
            taskDescription: document.getElementById('task-description')?.value || '',
            outputFormat: document.getElementById('output-format')?.value || '',
            selectedTechniques: Array.from(document.querySelectorAll('input[name="techniques"]:checked')).map(input => input.value),
            techniqueSpecificData: {}
        };

        // Collect technique-specific data
        const dynamicFields = document.querySelectorAll('#dynamic-technique-fields input, #dynamic-technique-fields textarea');
        dynamicFields.forEach(field => {
            if (field.value.trim()) {
                data.techniqueSpecificData[field.id] = field.value;
            }
        });

        return data;
    }
}

// For backward compatibility, create an alias
class WizardManager extends FormManager {
    constructor() {
        super();
        console.warn('WizardManager is deprecated, use FormManager instead');
    }
}

// Make both available globally
window.FormManager = FormManager;
window.WizardManager = WizardManager;

/**
 * PromptBuilder - Main orchestrator class that coordinates all modules
 * Refactored from monolithic 2000-line class into modular architecture
 */
class PromptBuilder {
    constructor() {
        // Core application state
        this.selectedTechniques = [];
        this.selectedTemplates = [];
        this.taskDescription = "";
        this.outputFormat = "";
        this.skillLevel = "intermediate";
        this.currentTemplateFields = {};
        this.rawPromptText = "";
        
        // Initialize all managers
        this.initializeManagers();
        
        // Note: setupManagerReferences() is called in init() after managers are ready
    }

    /**
     * Initialize all manager instances
     */
    initializeManagers() {
        this.techniqueManager = new TechniqueManager(this);
        this.templateManager = new TemplateManager(this);
        this.promptGenerator = new PromptGenerator(this);
        this.uiManager = new UIManager(this);
        this.storageManager = new StorageManager(this);
        this.formManager = new FormManager(this);
        this.eventManager = new EventManager(this);
    }

    /**
     * Set up cross-references between managers
     */
    setupManagerReferences() {
        const managers = {
            techniqueManager: this.techniqueManager,
            templateManager: this.templateManager,
            promptGenerator: this.promptGenerator,
            uiManager: this.uiManager,
            storageManager: this.storageManager,
            formManager: this.formManager,
            eventManager: this.eventManager
        };

        // Give each manager access to others
        Object.values(managers).forEach(manager => {
            if (manager.setManagers) {
                manager.setManagers(managers);
            }
        });
    }

    /**
     * Initialize the entire application
     */
    async init() {
        try {
            console.log('Initializing PromptBuilder application...');

            // Set up cross-manager references BEFORE initialization
            this.setupManagerReferences();

            // Initialize managers in proper order
            await this.techniqueManager.init();
            await this.templateManager.init();
            await this.promptGenerator.init();
            await this.uiManager.init();
            await this.storageManager.init();
            await this.formManager.init();
            await this.eventManager.init();

            // Load saved state
            this.loadApplicationState();

            // No longer start wizard - direct form is always visible
            console.log('PromptBuilder application initialized successfully');
        } catch (error) {
            console.error('Error initializing PromptBuilder:', error);
            this.handleInitializationError(error);
        }
    }

    /**
     * Load saved application state from localStorage
     */
    loadApplicationState() {
        try {
            const savedState = localStorage.getItem('promptBuilderState');
            if (savedState) {
                const state = JSON.parse(savedState);
                
                // Restore application state
                this.selectedTechniques = state.selectedTechniques || [];
                this.selectedTemplates = state.selectedTemplates || [];
                this.taskDescription = state.taskDescription || "";
                this.outputFormat = state.outputFormat || "";
                this.skillLevel = state.skillLevel || "intermediate";
                this.currentTemplateFields = state.currentTemplateFields || {};

                // Update UI with restored state
                this.uiManager.updateFromState(state);
                this.promptGenerator.updatePromptPreview();
            }
        } catch (error) {
            console.warn('Error loading application state:', error);
        }
    }

    /**
     * Save current application state to localStorage
     */
    saveApplicationState() {
        try {
            const state = {
                selectedTechniques: this.selectedTechniques,
                selectedTemplates: this.selectedTemplates,
                taskDescription: this.taskDescription,
                outputFormat: this.outputFormat,
                skillLevel: this.skillLevel,
                currentTemplateFields: this.currentTemplateFields,
                timestamp: new Date().toISOString()
            };

            localStorage.setItem('promptBuilderState', JSON.stringify(state));
        } catch (error) {
            console.warn('Error saving application state:', error);
        }
    }

    /**
     * Handle initialization errors gracefully
     * @param {Error} error - The initialization error
     */
    handleInitializationError(error) {
        const errorMessage = `
            <div class="error-container">
                <h2>Fehler beim Laden der Anwendung</h2>
                <p>Es ist ein Fehler beim Initialisieren des Prompt Builders aufgetreten:</p>
                <pre>${error.message}</pre>
                <button onclick="location.reload()">Seite neu laden</button>
            </div>
        `;
        
        document.body.innerHTML = errorMessage;
    }

    /**
     * Add a technique to the selection
     * @param {string} techniqueId - The ID of the technique to add
     */
    addTechnique(techniqueId) {
        if (!this.selectedTechniques.includes(techniqueId)) {
            this.selectedTechniques.push(techniqueId);
            this.uiManager.updateTechniqueCount();
            this.promptGenerator.updatePromptPreview();
            this.saveApplicationState();
        }
    }

    /**
     * Remove a technique from the selection
     * @param {string} techniqueId - The ID of the technique to remove
     */
    removeTechnique(techniqueId) {
        const index = this.selectedTechniques.indexOf(techniqueId);
        if (index > -1) {
            this.selectedTechniques.splice(index, 1);
            this.uiManager.updateTechniqueCount();
            this.promptGenerator.updatePromptPreview();
            this.saveApplicationState();
        }
    }

    /**
     * Add a template to the selection
     * @param {string} templateId - The ID of the template to add
     */
    addTemplate(templateId) {
        if (!this.selectedTemplates.includes(templateId)) {
            this.selectedTemplates.push(templateId);
            this.templateManager.updateTemplateFields();
            this.promptGenerator.updatePromptPreview();
            this.saveApplicationState();
        }
    }

    /**
     * Remove a template from the selection
     * @param {string} templateId - The ID of the template to remove
     */
    removeTemplate(templateId) {
        const index = this.selectedTemplates.indexOf(templateId);
        if (index > -1) {
            this.selectedTemplates.splice(index, 1);
            this.templateManager.updateTemplateFields();
            this.promptGenerator.updatePromptPreview();
            this.saveApplicationState();
        }
    }

    /**
     * Update task description
     * @param {string} description - The new task description
     */
    setTaskDescription(description) {
        this.taskDescription = description;
        this.promptGenerator.updatePromptPreview();
        this.uiManager.updateNextButtonState();
        this.saveApplicationState();
    }

    /**
     * Update output format
     * @param {string} format - The new output format
     */
    setOutputFormat(format) {
        this.outputFormat = format;
        this.promptGenerator.updatePromptPreview();
        this.saveApplicationState();
    }

    /**
     * Update skill level
     * @param {string} level - The new skill level
     */
    setSkillLevel(level) {
        this.skillLevel = level;
        this.promptGenerator.updatePromptPreview();
        this.saveApplicationState();
    }

    /**
     * Update template field value
     * @param {string} fieldName - The field name
     * @param {string} value - The field value
     */
    setTemplateField(fieldName, value) {
        this.currentTemplateFields[fieldName] = value;
        this.promptGenerator.updatePromptPreview();
        this.saveApplicationState();
    }

    /**
     * Clear all current selections and inputs
     */
    clearPrompt() {
        this.selectedTechniques = [];
        this.selectedTemplates = [];
        this.taskDescription = "";
        this.outputFormat = "";
        this.skillLevel = "intermediate";
        this.currentTemplateFields = {};
        this.rawPromptText = "";

        // Clear UI
        this.uiManager.clearAllSelections();
        this.templateManager.clearTemplateFields();
        this.promptGenerator.updatePromptPreview();
        this.uiManager.updateTechniqueCount();
        
        // Clear saved state
        localStorage.removeItem('promptBuilderState');
        
        console.log('Prompt cleared successfully');
    }

    /**
     * Get current application state
     * @returns {Object} Current state object
     */
    getCurrentState() {
        return {
            selectedTechniques: [...this.selectedTechniques],
            selectedTemplates: [...this.selectedTemplates],
            taskDescription: this.taskDescription,
            outputFormat: this.outputFormat,
            skillLevel: this.skillLevel,
            currentTemplateFields: { ...this.currentTemplateFields },
            rawPromptText: this.rawPromptText
        };
    }

    /**
     * Restore application state
     * @param {Object} state - State object to restore
     */
    restoreState(state) {
        this.selectedTechniques = state.selectedTechniques || [];
        this.selectedTemplates = state.selectedTemplates || [];
        this.taskDescription = state.taskDescription || "";
        this.outputFormat = state.outputFormat || "";
        this.skillLevel = state.skillLevel || "intermediate";
        this.currentTemplateFields = state.currentTemplateFields || {};
        this.rawPromptText = state.rawPromptText || "";

        // Update all UI components
        this.uiManager.updateFromState(state);
        this.templateManager.updateTemplateFields();
        this.promptGenerator.updatePromptPreview();
        this.uiManager.updateTechniqueCount();
        
        console.log('State restored successfully');
    }

    /**
     * Export current configuration as JSON
     * @returns {string} JSON string of current configuration
     */
    exportConfiguration() {
        const config = {
            version: "2.0",
            timestamp: new Date().toISOString(),
            configuration: this.getCurrentState(),
            techniques: this.techniqueManager.getSelectedTechniquesData(),
            templates: this.templateManager.getSelectedTemplatesData()
        };

        return JSON.stringify(config, null, 2);
    }

    /**
     * Import configuration from JSON
     * @param {string} jsonConfig - JSON configuration string
     */
    importConfiguration(jsonConfig) {
        try {
            const config = JSON.parse(jsonConfig);
            
            if (config.version && config.configuration) {
                this.restoreState(config.configuration);
                console.log('Configuration imported successfully');
                return true;
            } else {
                throw new Error('Invalid configuration format');
            }
        } catch (error) {
            console.error('Error importing configuration:', error);
            return false;
        }
    }

    /**
     * Get application statistics
     * @returns {Object} Statistics about current usage
     */
    getStatistics() {
        return {
            techniquesSelected: this.selectedTechniques.length,
            templatesSelected: this.selectedTemplates.length,
            totalTechniques: this.techniqueManager.getTotalTechniqueCount(),
            totalTemplates: this.templateManager.getTotalTemplateCount(),
            promptLength: this.rawPromptText.length,
            templateFieldsCompleted: Object.keys(this.currentTemplateFields).length,
            lastModified: new Date().toISOString()
        };
    }

    /**
     * Validate current configuration
     * @returns {Object} Validation result with warnings and errors
     */
    validateConfiguration() {
        const warnings = [];
        const errors = [];

        // Check for minimum requirements
        if (this.selectedTechniques.length === 0) {
            warnings.push('Keine Techniken ausgewählt');
        }

        if (this.selectedTemplates.length === 0) {
            warnings.push('Keine Templates ausgewählt');
        }

        if (!this.taskDescription.trim()) {
            errors.push('Aufgabenbeschreibung fehlt');
        }

        // Check for template field completion
        const requiredFields = this.templateManager.getRequiredFields();
        const missingFields = requiredFields.filter(field => 
            !this.currentTemplateFields[field] || !this.currentTemplateFields[field].trim()
        );

        if (missingFields.length > 0) {
            warnings.push(`Unvollständige Template-Felder: ${missingFields.join(', ')}`);
        }

        return {
            isValid: errors.length === 0,
            errors,
            warnings,
            score: this.calculateConfigurationScore()
        };
    }

    /**
     * Calculate a quality score for the current configuration
     * @returns {number} Score from 0-100
     */
    calculateConfigurationScore() {
        let score = 0;

        // Base points for having selections
        if (this.selectedTechniques.length > 0) score += 20;
        if (this.selectedTemplates.length > 0) score += 20;
        if (this.taskDescription.trim()) score += 30;

        // Bonus points for completeness
        if (this.outputFormat.trim()) score += 10;
        
        const requiredFields = this.templateManager.getRequiredFields();
        const completedFields = requiredFields.filter(field => 
            this.currentTemplateFields[field] && this.currentTemplateFields[field].trim()
        );
        
        if (requiredFields.length > 0) {
            score += (completedFields.length / requiredFields.length) * 20;
        } else {
            score += 20; // Full points if no fields required
        }

        return Math.round(score);
    }

    /**
     * Clean up and destroy the application
     */
    destroy() {
        // Save current state before destroying
        this.saveApplicationState();

        // Destroy all managers
        if (this.eventManager) this.eventManager.destroy();
        if (this.uiManager) this.uiManager.destroy();
        if (this.storageManager) this.storageManager.destroy();

        console.log('PromptBuilder application destroyed');
    }

    /**
     * Add a selected technique (using more explicit naming)
     * @param {string} techniqueId - The ID of the technique to add
     */
    addSelectedTechnique(techniqueId) {
        this.addTechnique(techniqueId);
    }

    /**
     * Remove a selected technique (using more explicit naming)
     * @param {string} techniqueId - The ID of the technique to remove
     */
    removeSelectedTechnique(techniqueId) {
        this.removeTechnique(techniqueId);
    }

    /**
     * Add a selected template (using more explicit naming)
     * @param {string} templateId - The ID of the template to add
     */
    addSelectedTemplate(templateId) {
        this.addTemplate(templateId);
    }

    /**
     * Remove a selected template (using more explicit naming)
     * @param {string} templateId - The ID of the template to remove
     */
    removeSelectedTemplate(templateId) {
        this.removeTemplate(templateId);
    }

}

// Auto-initialize when DOM is ready
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', async () => {
        try {
            window.promptBuilder = new PromptBuilder();
            await window.promptBuilder.init();
        } catch (error) {
            console.error('Failed to initialize PromptBuilder:', error);
        }
    });
}

// Make PromptBuilder available globally
window.PromptBuilder = PromptBuilder;

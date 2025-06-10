/**
 * UIManager (Refactored) - Hauptkoordinator für alle UI-Module
 * 
 * Diese refaktorierte Version teilt die Verantwortlichkeiten auf mehrere spezialisierte Manager auf:
 * - TechniqueUIManager: Verwaltet Technik-UI-Elemente
 * - TemplateUIManager: Verwaltet Template-UI-Elemente
 * - DynamicFieldManager: Verwaltet dynamische Felder
 * - PromptPreviewManager: Verwaltet Prompt-Preview (Token-Zählung entfernt)
 * - UIEventHandler: Verwaltet alle Event-Listener
 * - UIMessageManager: Verwaltet Nachrichten und Benachrichtigungen
 */
class UIManager {
    constructor(promptBuilder = null) {
        this.promptBuilder = promptBuilder;
        this.techniqueManager = null;
        this.templateManager = null;
        this.promptGenerator = null;
        this.initialized = false;

        // Initialize UI sub-managers
        this.initializeSubManagers();
    }

    /**
     * Initialize UI sub-managers
     */
    initializeSubManagers() {
        // Create message manager first (needed by others)
        this.uiMessageManager = new UIMessageManager();

        // Create other managers
        this.techniqueUIManager = null;  // Will be initialized after setManagers
        this.templateUIManager = null;   // Will be initialized after setManagers
        this.dynamicFieldManager = null; // Will be initialized after setManagers
        this.promptPreviewManager = null; // Will be initialized after setManagers
        this.uiEventHandler = null;      // Will be initialized last
    }

    /**
     * Set references to other managers and complete initialization
     */
    setManagers(managers) {
        this.techniqueManager = managers.techniqueManager;
        this.templateManager = managers.templateManager;
        this.promptGenerator = managers.promptGenerator;

        // Now initialize sub-managers that need these references
        this.techniqueUIManager = new TechniqueUIManager(
            this.techniqueManager, 
            this.uiMessageManager
        );

        this.templateUIManager = new TemplateUIManager(
            this.templateManager, 
            this.uiMessageManager
        );

        this.dynamicFieldManager = new DynamicFieldManager(
            this.templateManager, 
            this.uiMessageManager
        );

        this.promptPreviewManager = new PromptPreviewManager(
            this.promptGenerator, 
            this.uiMessageManager
        );

        // Initialize event handler last (needs all other managers)
        this.uiEventHandler = new UIEventHandler({
            techniqueUIManager: this.techniqueUIManager,
            templateUIManager: this.templateUIManager,
            promptPreviewManager: this.promptPreviewManager,
            dynamicFieldManager: this.dynamicFieldManager,
            uiMessageManager: this.uiMessageManager,
            techniqueManager: this.techniqueManager,
            templateManager: this.templateManager
        });
    }

    /**
     * Initialize the UIManager
     */
    async init() {
        try {
            console.log('UIManager: Initialisierung gestartet...');
            
            if (!this.techniqueUIManager) {
                throw new Error('Managers müssen vor der Initialisierung gesetzt werden');
            }

            // Create UI elements after DOM is ready
            this.techniqueUIManager.createTechniqueSelectors();
            this.templateUIManager.createTemplateBlocks();
            this.uiEventHandler.setupEventListeners();
            // Token info initialization removed
            
            this.initialized = true;
            console.log('UIManager: Erfolgreich initialisiert');
            
            this.uiMessageManager.showMessage('Prompt Builder erfolgreich geladen', 'success');
        } catch (error) {
            console.error('UIManager: Initialisierungsfehler:', error);
            this.uiMessageManager.showError(`Initialisierungsfehler: ${error.message}`);
            throw error;
        }
    }

    /**
     * Update all UI components - main orchestration method
     */
    updateUI() {
        if (!this.initialized) {
            console.warn('UIManager not initialized');
            return;
        }

        try {
            this.techniqueUIManager.updateSelectedTechniques();
            this.techniqueUIManager.updateTechniqueCount();
            this.templateUIManager.updateSelectedTemplatesDescription();
            this.templateUIManager.updateTemplateFields(this.dynamicFieldManager);
            this.promptPreviewManager.updatePromptPreview();
            this.promptPreviewManager.updateNextButtonState(this.techniqueManager);
        } catch (error) {
            console.error('Error updating UI:', error);
            this.uiMessageManager.showError('Fehler beim Aktualisieren der Benutzeroberfläche');
        }
    }

    /**
     * Handle technique selection - delegates to appropriate manager
     */
    onTechniqueSelected(checkbox) {
        const result = this.techniqueUIManager.onTechniqueSelected(checkbox);
        
        // Update related components
        this.promptPreviewManager.updatePromptPreview();
        this.promptPreviewManager.updateNextButtonState(this.techniqueManager);
        this.techniqueUIManager.updateTechniqueCount();
        
        return result;
    }

    /**
     * Handle template selection - delegates to appropriate manager
     */
    onTemplateSelected(checkbox) {
        const result = this.templateUIManager.onTemplateSelected(checkbox, this.techniqueUIManager);
        
        // Update related components
        this.templateUIManager.updateSelectedTemplatesDescription();
        this.templateUIManager.updateTemplateFields(this.dynamicFieldManager);
        this.promptPreviewManager.updatePromptPreview();
        this.promptPreviewManager.updateNextButtonState(this.techniqueManager);
        
        return result;
    }

    /**
     * Public API methods - delegate to appropriate managers
     */

    // Technique-related methods
    updateSelectedTechniques() {
        return this.techniqueUIManager.updateSelectedTechniques();
    }

    filterTechniques(searchTerm = '', category = null) {
        return this.techniqueUIManager.filterTechniques(searchTerm, category);
    }

    showTechniqueDetails(techniqueId) {
        return this.techniqueUIManager.showTechniqueDetails(techniqueId);
    }

    // Template-related methods
    updateTemplateFields() {
        return this.templateUIManager.updateTemplateFields(this.dynamicFieldManager);
    }

    updateSelectedTemplatesDescription() {
        return this.templateUIManager.updateSelectedTemplatesDescription();
    }

    showTemplatePreview(templateId) {
        return this.templateUIManager.showTemplatePreview(templateId);
    }

    // Prompt-related methods
    updatePromptPreview() {
        return this.promptPreviewManager.updatePromptPreview();
    }

    updatePromptPreviewWithValues(taskDescription, basePrompt, outputFormat) {
        return this.promptPreviewManager.updatePromptPreviewWithValues(taskDescription, basePrompt, outputFormat);
    }

    // Token counting methods removed - no longer displayed in UI
    updateTokenCount(text) {
        // Token counter removed from UI
        return;
    }

    updateTokenCountWithColors(text) {
        // Token counter removed from UI
        return;
    }

    copyPromptToClipboard() {
        return this.promptPreviewManager.copyPromptToClipboard();
    }

    updateNextButtonState() {
        return this.promptPreviewManager.updateNextButtonState(this.techniqueManager);
    }

    // Message-related methods
    showMessage(message, type = 'success') {
        return this.uiMessageManager.showMessage(message, type);
    }

    showError(message) {
        return this.uiMessageManager.showError(message);
    }

    showWarning(message) {
        return this.uiMessageManager.showWarning(message);
    }

    showInfo(message) {
        return this.uiMessageManager.showInfo(message);
    }

    showLoading(message) {
        return this.uiMessageManager.showLoading(message);
    }

    showConfirmation(message, onConfirm, onCancel) {
        return this.uiMessageManager.showConfirmation(message, onConfirm, onCancel);
    }

    // Utility methods
    // Token info initialization removed - no longer needed

    updateTechniqueCount() {
        return this.techniqueUIManager.updateTechniqueCount();
    }

    // Legacy methods for backward compatibility
    createTechniqueSelectors() {
        return this.techniqueUIManager.createTechniqueSelectors();
    }

    createTemplateBlocks() {
        return this.templateUIManager.createTemplateBlocks();
    }

    ensureTemplateFieldsContainer() {
        return this.templateUIManager.ensureTemplateFieldsContainer();
    }

    setupEventListeners() {
        return this.uiEventHandler.setupEventListeners();
    }

    handleNextStep() {
        console.log('Moving to next step...');
        // Implement navigation logic here
    }

    showInfoModal() {
        console.log('Showing info modal');
        // Implement info modal here
    }

    /**
     * Cleanup method
     */
    destroy() {
        if (this.uiEventHandler) {
            this.uiEventHandler.removeAllEventListeners();
        }
        
        if (this.uiMessageManager) {
            this.uiMessageManager.clearAllMessages();
        }

        this.initialized = false;
        console.log('UIManager destroyed');
    }

    /**
     * Get current state for debugging
     */
    getState() {
        return {
            initialized: this.initialized,
            selectedTechniques: this.techniqueManager?.selectedTechniques || [],
            selectedTemplates: this.templateManager?.selectedTemplates || [],
            managers: {
                techniqueUIManager: !!this.techniqueUIManager,
                templateUIManager: !!this.templateUIManager,
                dynamicFieldManager: !!this.dynamicFieldManager,
                promptPreviewManager: !!this.promptPreviewManager,
                uiEventHandler: !!this.uiEventHandler,
                uiMessageManager: !!this.uiMessageManager
            }
        };
    }
}

// Make UIManager available globally
window.UIManager = UIManager;

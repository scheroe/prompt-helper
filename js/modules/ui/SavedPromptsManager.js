/**
 * SavedPromptsManager - Verwaltet das Speichern, Laden und Bearbeiten von Prompts
 */
class SavedPromptsManager {
    constructor(storageManager, uiMessageManager) {
        this.storageManager = storageManager;
        this.uiMessageManager = uiMessageManager;
        this.currentEditingId = null;
        this.promptBuilder = null; // Will be set during init
    }

    /**
     * Initialize the SavedPromptsManager
     */
    init() {
        this.promptBuilder = window.promptBuilder;
        this.updateSavedPromptsDropdown();
        console.log('SavedPromptsManager initialized');
    }

    /**
     * Initialize event listeners for saved prompts functionality
     */
    initializeEventListeners() {
        // Save current prompt
        const saveButton = document.getElementById('save-current-prompt');
        if (saveButton) {
            saveButton.addEventListener('click', () => this.saveCurrentPrompt());
        }

        // Copy prompt button
        const copyButton = document.getElementById('copy-prompt-button');
        if (copyButton) {
            copyButton.addEventListener('click', () => this.copyCurrentPrompt());
        }

        // Saved prompts dropdown
        const dropdown = document.getElementById('saved-prompts-select');
        if (dropdown) {
            dropdown.addEventListener('change', () => this.onSavedPromptSelected());
        }

        // Load saved prompt
        const loadButton = document.getElementById('load-saved-prompt');
        if (loadButton) {
            loadButton.addEventListener('click', () => this.loadSelectedPrompt());
        }

        // Edit saved prompt
        const editButton = document.getElementById('edit-saved-prompt');
        if (editButton) {
            editButton.addEventListener('click', () => this.editSelectedPrompt());
        }

        // Delete saved prompt
        const deleteButton = document.getElementById('delete-saved-prompt');
        if (deleteButton) {
            deleteButton.addEventListener('click', () => this.deleteSelectedPrompt());
        }

        // Edit modal buttons
        const saveEditButton = document.getElementById('save-edited-prompt');
        if (saveEditButton) {
            saveEditButton.addEventListener('click', () => this.saveEditedPrompt());
        }

        const cancelEditButton = document.getElementById('cancel-edit-prompt');
        if (cancelEditButton) {
            cancelEditButton.addEventListener('click', () => this.cancelEdit());
        }

        // Modal close handlers
        const editModal = document.getElementById('edit-prompt-modal');
        if (editModal) {
            const closeButtons = editModal.querySelectorAll('.modal-close');
            closeButtons.forEach(button => {
                button.addEventListener('click', () => this.cancelEdit());
            });

            // Close when clicking backdrop
            editModal.addEventListener('click', (e) => {
                if (e.target === editModal) {
                    this.cancelEdit();
                }
            });
        }

        // Enter key in prompt name input
        const nameInput = document.getElementById('prompt-name-input');
        if (nameInput) {
            nameInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.saveCurrentPrompt();
                }
            });
        }
    }

    /**
     * Save the current prompt with a given name
     */
    saveCurrentPrompt() {
        const nameInput = document.getElementById('prompt-name-input');
        const promptPreview = document.getElementById('prompt-preview');
        
        if (!nameInput || !promptPreview) return;

        const name = nameInput.value.trim();
        const content = promptPreview.innerText || '';

        if (!name) {
            this.uiMessageManager.showError('Bitte geben Sie einen Namen für den Prompt ein');
            nameInput.focus();
            return;
        }

        if (!content || content.includes("Ihr Prompt wird hier angezeigt")) {
            this.uiMessageManager.showError('Kein Prompt zum Speichern verfügbar');
            return;
        }

        // Check if name already exists
        const existingPrompts = this.storageManager.getSavedPrompts();
        if (existingPrompts.some(p => p.name === name)) {
            if (!confirm(`Ein Prompt mit dem Namen "${name}" existiert bereits. Überschreiben?`)) {
                return;
            }
        }

        // Save the prompt
        const promptData = {
            id: Date.now().toString(),
            name: name,
            content: content,
            timestamp: new Date().toISOString(),
            // Save current form state for recreation
            formData: this.getCurrentFormData()
        };

        this.storageManager.savePrompt(promptData);
        this.uiMessageManager.showMessage(`Prompt "${name}" erfolgreich gespeichert!`);
        
        // Clear name input
        nameInput.value = '';
        
        // Refresh dropdown
        this.refreshSavedPromptsDropdown();
    }

    /**
     * Copy prompt to clipboard
     */
    copyPromptToClipboard() {
        const currentPromptData = this.getCurrentPromptData();
        if (!currentPromptData || !currentPromptData.promptText.trim() || currentPromptData.promptText.includes("Ihr Prompt wird hier angezeigt")) {
            this.uiMessageManager.showMessage('Kein Prompt zum Kopieren verfügbar', 'error');
            return;
        }

        navigator.clipboard.writeText(currentPromptData.promptText).then(() => {
            this.uiMessageManager.showMessage('Prompt erfolgreich in die Zwischenablage kopiert', 'success');
        }).catch(err => {
            console.error('Fehler beim Kopieren:', err);
            this.uiMessageManager.showMessage('Fehler beim Kopieren in die Zwischenablage', 'error');
        });
    }

    /**
     * Handle saved prompt selection in dropdown
     */
    onSavedPromptSelected() {
        const dropdown = document.getElementById('saved-prompts-select');
        const loadButton = document.getElementById('load-saved-prompt');
        const editButton = document.getElementById('edit-saved-prompt');
        const deleteButton = document.getElementById('delete-saved-prompt');

        const hasSelection = dropdown.value !== '';
        
        if (loadButton) loadButton.disabled = !hasSelection;
        if (editButton) editButton.disabled = !hasSelection;
        if (deleteButton) deleteButton.disabled = !hasSelection;
    }

    /**
     * Load the selected saved prompt
     */
    loadSelectedPrompt() {
        const dropdown = document.getElementById('saved-prompts-select');
        if (!dropdown || !dropdown.value) return;

        const prompt = this.storageManager.getPromptById(dropdown.value);
        if (!prompt) {
            this.uiMessageManager.showMessage('Gespeicherter Prompt nicht gefunden', 'error');
            return;
        }

        // Restore form fields
        if (prompt.basePrompt !== undefined) {
            const basePromptField = document.getElementById('base-prompt');
            if (basePromptField) basePromptField.value = prompt.basePrompt;
        }
        
        if (prompt.taskDescription !== undefined) {
            const taskField = document.getElementById('task-description');
            if (taskField) taskField.value = prompt.taskDescription;
        }
        
        if (prompt.outputFormat !== undefined) {
            const outputField = document.getElementById('output-format');
            if (outputField) outputField.value = prompt.outputFormat;
        }

        // Restore techniques if available
        if (prompt.techniques && this.promptBuilder && this.promptBuilder.techniqueManager) {
            this.promptBuilder.selectedTechniques = [...prompt.techniques];
            this.promptBuilder.techniqueManager.updateTechniqueSelections();
        }

        // Trigger preview update
        if (this.promptBuilder && this.promptBuilder.uiManager && this.promptBuilder.uiManager.promptPreviewManager) {
            this.promptBuilder.uiManager.promptPreviewManager.updatePromptPreview();
        }

        this.uiMessageManager.showMessage(`Prompt "${prompt.name}" wurde geladen`, 'success');
    }

    /**
     * Edit the selected saved prompt
     */
    editSelectedPrompt() {
        const dropdown = document.getElementById('saved-prompts-select');
        if (!dropdown || !dropdown.value) return;

        const prompt = this.storageManager.getPromptById(dropdown.value);
        if (!prompt) {
            this.uiMessageManager.showMessage('Gespeicherter Prompt nicht gefunden', 'error');
            return;
        }

        this.currentEditingId = prompt.id;
        
        // Populate edit modal
        const nameInput = document.getElementById('edit-prompt-name');
        const contentTextarea = document.getElementById('edit-prompt-content');
        
        if (nameInput) nameInput.value = prompt.name;
        if (contentTextarea) contentTextarea.value = prompt.prompt || '';

        // Show modal
        const modal = document.getElementById('edit-prompt-modal');
        if (modal) {
            modal.style.display = 'block';
            nameInput?.focus();
        }
    }

    /**
     * Save the edited prompt
     */
    saveEditedPrompt() {
        const nameInput = document.getElementById('edit-prompt-name');
        const contentTextarea = document.getElementById('edit-prompt-content');
        
        if (!nameInput || !contentTextarea || !this.currentEditingId) return;

        const name = nameInput.value.trim();
        const content = contentTextarea.value.trim();

        if (!name) {
            this.uiMessageManager.showMessage('Bitte geben Sie einen Namen ein', 'error');
            nameInput.focus();
            return;
        }

        if (!content) {
            this.uiMessageManager.showMessage('Prompt-Inhalt darf nicht leer sein', 'error');
            contentTextarea.focus();
            return;
        }

        // Check if name conflicts with other prompts (except current one)
        if (this.storageManager.promptNameExists(name, this.currentEditingId)) {
            this.uiMessageManager.showMessage(`Ein anderer Prompt mit dem Namen "${name}" existiert bereits`, 'error');
            nameInput.focus();
            return;
        }

        // Update the prompt
        const updatedData = {
            name: name,
            prompt: content
        };

        if (this.storageManager.updatePrompt(this.currentEditingId, updatedData)) {
            this.uiMessageManager.showMessage(`Prompt "${name}" wurde aktualisiert`, 'success');
            this.cancelEditPrompt();
            this.updateSavedPromptsDropdown();
        } else {
            this.uiMessageManager.showMessage('Fehler beim Aktualisieren des Prompts', 'error');
        }
    }

    /**
     * Cancel editing
     */
    cancelEditPrompt() {
        const modal = document.getElementById('edit-prompt-modal');
        if (modal) {
            modal.style.display = 'none';
        }
        this.currentEditingId = null;
    }

    /**
     * Delete the selected saved prompt
     */
    deleteSelectedPrompt() {
        const dropdown = document.getElementById('saved-prompts-select');
        if (!dropdown || !dropdown.value) return;

        const prompt = this.storageManager.getPromptById(dropdown.value);
        if (!prompt) {
            this.uiMessageManager.showMessage('Gespeicherter Prompt nicht gefunden', 'error');
            return;
        }

        if (!confirm(`Möchten Sie den Prompt "${prompt.name}" wirklich löschen?`)) {
            return;
        }

        if (this.storageManager.deletePromptById(prompt.id)) {
            this.uiMessageManager.showMessage(`Prompt "${prompt.name}" wurde gelöscht`, 'success');
            this.updateSavedPromptsDropdown();
        } else {
            this.uiMessageManager.showMessage('Fehler beim Löschen des Prompts', 'error');
        }
    }

    /**
     * Refresh the saved prompts dropdown
     */
    refreshSavedPromptsDropdown() {
        const dropdown = document.getElementById('saved-prompts-select');
        if (!dropdown) return;

        const prompts = this.storageManager.getSavedPrompts();
        
        // Clear existing options
        dropdown.innerHTML = '<option value="">-- Gespeicherten Prompt wählen --</option>';
        
        // Add saved prompts
        prompts.forEach(prompt => {
            const option = document.createElement('option');
            option.value = prompt.id;
            option.textContent = prompt.name;
            dropdown.appendChild(option);
        });

        // Reset selection and button states
        dropdown.value = '';
        this.onSavedPromptSelected();
    }

    /**
     * Get current prompt data from the application
     */
    getCurrentPromptData() {
        if (!this.promptBuilder) {
            console.warn('PromptBuilder not available');
            return null;
        }

        const promptPreview = document.getElementById('prompt-preview');
        const promptText = promptPreview ? promptPreview.textContent : '';

        return {
            promptText: promptText,
            selectedTechniques: this.promptBuilder.selectedTechniques || [],
            selectedTemplates: this.promptBuilder.selectedTemplates || [],
            basePrompt: document.getElementById('base-prompt')?.value || '',
            taskDescription: document.getElementById('task-description')?.value || '',
            outputFormat: document.getElementById('output-format')?.value || '',
            templateFields: this.promptBuilder.currentTemplateFields || {}
        };
    }

    /**
     * Update the saved prompts dropdown
     */
    updateSavedPromptsDropdown() {
        const dropdown = document.getElementById('saved-prompts-select');
        if (!dropdown) return;

        const savedPrompts = this.storageManager.getAllSavedPrompts();
        
        // Clear existing options
        dropdown.innerHTML = '<option value="">-- Gespeicherten Prompt wählen --</option>';
        
        // Add saved prompts
        savedPrompts.forEach((prompt, index) => {
            const option = document.createElement('option');
            option.value = prompt.id || index.toString();
            
            // Format display name with date
            let displayName = prompt.name;
            if (prompt.timestamp) {
                try {
                    const date = new Date(prompt.timestamp);
                    displayName += ` (${date.toLocaleDateString()})`;
                } catch (e) {
                    // Ignore date formatting errors
                }
            }
            
            option.textContent = displayName;
            dropdown.appendChild(option);
        });

        // Update button states
        this.onSavedPromptSelectionChange();
    }

    /**
     * Handle saved prompt selection change
     */
    onSavedPromptSelectionChange() {
        const dropdown = document.getElementById('saved-prompts-select');
        const loadButton = document.getElementById('load-saved-prompt');
        const editButton = document.getElementById('edit-saved-prompt');
        const deleteButton = document.getElementById('delete-saved-prompt');

        const hasSelection = dropdown && dropdown.value !== '';
        
        if (loadButton) loadButton.disabled = !hasSelection;
        if (editButton) editButton.disabled = !hasSelection;
        if (deleteButton) deleteButton.disabled = !hasSelection;
    }

    /**
     * Restore form data from saved prompt
     */
    restoreFormData(formData) {
        if (!formData) return;

        const basePromptField = document.getElementById('base-prompt');
        const taskDescriptionField = document.getElementById('task-description');
        const outputFormatField = document.getElementById('output-format');

        if (basePromptField) basePromptField.value = formData.basePrompt || '';
        if (taskDescriptionField) taskDescriptionField.value = formData.taskDescription || '';
        if (outputFormatField) outputFormatField.value = formData.outputFormat || '';

        // Trigger form update to regenerate preview
        const event = new Event('input', { bubbles: true });
        if (taskDescriptionField) taskDescriptionField.dispatchEvent(event);
    }

    /**
     * Initialize the saved prompts dropdown on startup
     */
    initialize() {
        this.refreshSavedPromptsDropdown();
    }
}

// Make SavedPromptsManager available globally
window.SavedPromptsManager = SavedPromptsManager;

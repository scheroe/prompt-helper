/**
 * SavedPromptsManager - Optimierte UI für konsolidierte Prompt-Verwaltung
 * Improved UX with contextual actions and streamlined interface
 */
class SavedPromptsManager {
    constructor(storageManager, uiMessageManager) {
        this.storageManager = storageManager;
        this.uiMessageManager = uiMessageManager;
        this.currentEditingId = null;
        this.promptBuilder = null;
        this.selectedPromptId = null;
        this.dropdownVisible = false;
        this.exportDropdownVisible = false;
        this.currentEditingId = null;
        this.formFieldChangeTimeout = null;
        
        // UI state
        this.currentState = 'empty'; // empty, new, selected, editing
        this.initialized = false;
    }

    /**
     * Initialize the SavedPromptsManager
     */
    init() {
        if (this.initialized) {
            return;
        }
        
        this.promptBuilder = window.promptBuilder;
        this.updateUI();
        this.initializeEventListeners();
        this.initializeInputField();
        this.initialized = true;
    }

    /**
     * Update UI when prompt content changes (called from external managers)
     */
    onPromptContentChanged() {
        this.updateUI();
    }

    /**
     * Initialize input field with auto-generated name
     */
    initializeInputField() {
        const input = document.getElementById('unified-prompt-input');
        if (input && !input.value.trim()) {
            const nextName = this.getNextPromptName();
            input.value = nextName;
            this.currentState = 'new';
        }
        
        // Set up MutationObserver to watch for prompt preview changes
        this.setupPromptContentObserver();
    }

    /**
     * Set up observer to watch for prompt content changes
     */
    setupPromptContentObserver() {
        const promptPreview = document.getElementById('prompt-preview');
        if (!promptPreview) return;

        const observer = new MutationObserver((mutations) => {
            const hasChanges = mutations.some(mutation => 
                mutation.type === 'childList' || 
                mutation.type === 'characterData'
            );
            
            if (hasChanges) {
                // Throttle updates to avoid excessive calls
                setTimeout(() => this.updateUI(), 100);
            }
        });

        observer.observe(promptPreview, {
            childList: true,
            subtree: true,
            characterData: true
        });
        
        this.promptContentObserver = observer;
    }

    /**
     * Initialize all event listeners
     */
    initializeEventListeners() {
        // Unified input field
        const unifiedInput = document.getElementById('unified-prompt-input');
        if (unifiedInput) {
            unifiedInput.addEventListener('input', () => this.handleInputChange());
            unifiedInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.handlePrimaryAction();
                }
            });
            unifiedInput.addEventListener('focus', () => this.handleInputFocus());
        }

        // Dropdown toggle
        const dropdownToggle = document.getElementById('prompt-dropdown-toggle');
        if (dropdownToggle) {
            dropdownToggle.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleDropdown();
            });
        }

        // Action buttons
        this.setupActionButtons();

        // Export dropdown
        this.setupExportDropdown();

        // Click outside handlers
        document.addEventListener('click', (e) => this.handleOutsideClick(e));

        // Setup form field listeners for auto UI updates
        this.setupFormFieldListeners();

        // Update UI on initial load
        this.updateUI();
    }

    /**
     * Setup action button event listeners
     */
    setupActionButtons() {
        // Primary action button (Save/Update)
        const saveBtn = document.getElementById('save-prompt-btn');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => this.handlePrimaryAction());
        }

        // Edit button (now inside input field)
        const editBtn = document.getElementById('edit-prompt-btn');
        if (editBtn) {
            editBtn.addEventListener('click', () => this.editSelectedPrompt());
        }

        // Delete button
        const deleteBtn = document.getElementById('delete-prompt-btn');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', () => this.deleteSelectedPrompt());
        }

        // Copy button
        const copyBtn = document.getElementById('copy-prompt-btn');
        if (copyBtn) {
            copyBtn.addEventListener('click', () => this.copyCurrentPrompt());
        }
    }

    /**
     * Setup export dropdown
     */
    setupExportDropdown() {
        const exportBtn = document.getElementById('export-dropdown-btn');
        const exportDropdown = document.getElementById('export-options-dropdown');
        
        if (exportBtn && exportDropdown) {
            exportBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleExportDropdown();
            });

            // Export options
            const exportOptions = exportDropdown.querySelectorAll('.export-option');
            exportOptions.forEach(option => {
                option.addEventListener('click', (e) => {
                    const format = option.dataset.format;
                    this.exportCurrentPrompt(format);
                    this.hideExportDropdown();
                });
            });
        }
    }

    /**
     * Setup form field listeners for automatic UI updates
     */
    setupFormFieldListeners() {
        const formFields = [
            'base-prompt',
            'task-description', 
            'output-format'
        ];

        formFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field) {
                // Listen for input changes
                field.addEventListener('input', () => {
                    this.onFormFieldChange();
                });
                
                // Listen for focus/blur events
                field.addEventListener('focus', () => {
                    this.onFormFieldChange();
                });
                
                field.addEventListener('blur', () => {
                    this.onFormFieldChange();
                });
            }
        });
        
        // Also listen for technique/template changes (these might trigger events)
        document.addEventListener('promptContentChanged', () => {
            this.onFormFieldChange();
        });

        // Listen for any changes in the prompt builder state
        if (window.promptBuilder) {
            const checkForChanges = () => {
                this.onFormFieldChange();
            };
            
            // Set up periodic check for changes (fallback)
            setInterval(checkForChanges, 1000);
        }
    }

    /**
     * Handle form field changes
     */
    onFormFieldChange() {
        // Throttle updates to avoid excessive calls
        clearTimeout(this.formFieldChangeTimeout);
        this.formFieldChangeTimeout = setTimeout(() => {
            this.updateUI();
        }, 200);
    }

    /**
     * Handle input field changes with smart state detection
     */
    handleInputChange() {
        const input = document.getElementById('unified-prompt-input');
        const value = input.value.trim();
        
        if (!value) {
            // If empty, set next auto-name and mark as new
            const nextName = this.getNextPromptName();
            input.value = nextName;
            this.currentState = 'new';
            this.selectedPromptId = null;
        } else {
            // Check if input matches existing prompt name
            const savedPrompts = this.storageManager.getSavedPrompts();
            const matchingPrompt = savedPrompts.find(p => p.name === value);
            
            if (matchingPrompt) {
                this.currentState = 'selected';
                this.selectedPromptId = matchingPrompt.id;
            } else {
                this.currentState = 'new';
                this.selectedPromptId = null;
            }
        }
        
        this.updateUI();
    }

    /**
     * Handle input field focus
     */
    handleInputFocus() {
        const savedPrompts = this.storageManager.getSavedPrompts();
        if (savedPrompts.length > 0 && !this.dropdownVisible) {
            this.showDropdown();
        }
    }

    /**
     * Handle primary action based on current state
     */
    handlePrimaryAction() {
        switch (this.currentState) {
            case 'editing':
                this.saveRenamedPrompt();
                break;
            case 'selected':
                this.updateExistingPrompt();
                break;
            case 'new':
            case 'empty':
            default:
                // For saving, we don't need prompt content check here since auto-naming handles it
                this.saveNewPromptWithAutoName();
                break;
        }
    }

    /**
     * Toggle dropdown visibility
     */
    toggleDropdown() {
        if (this.dropdownVisible) {
            this.hideDropdown();
        } else {
            this.showDropdown();
        }
    }

    /**
     * Show dropdown and populate with saved prompts
     */
    showDropdown() {
        const dropdown = document.getElementById('saved-prompts-dropdown');
        const toggleBtn = document.getElementById('prompt-dropdown-toggle');
        
        if (!dropdown || !toggleBtn) return;

        this.populateDropdown();
        dropdown.style.display = 'block';
        toggleBtn.classList.add('open');
        this.dropdownVisible = true;
    }

    /**
     * Hide dropdown
     */
    hideDropdown() {
        const dropdown = document.getElementById('saved-prompts-dropdown');
        const toggleBtn = document.getElementById('prompt-dropdown-toggle');
        
        if (dropdown && toggleBtn) {
            dropdown.style.display = 'none';
            toggleBtn.classList.remove('open');
            this.dropdownVisible = false;
        }
    }

    /**
     * Populate dropdown with saved prompts
     */
    populateDropdown() {
        const dropdownList = document.getElementById('saved-prompts-list');
        const promptsCount = document.getElementById('prompts-count');
        
        if (!dropdownList) return;

        const savedPrompts = this.storageManager.getSavedPrompts();
        
        // Update count
        if (promptsCount) {
            promptsCount.textContent = `${savedPrompts.length} ${savedPrompts.length === 1 ? 'Prompt' : 'Prompts'}`;
        }
        
        if (savedPrompts.length === 0) {
            dropdownList.innerHTML = `
                <div class="empty-prompts-message">
                    <i class="fas fa-info-circle"></i> 
                    <span>Keine gespeicherten Prompts vorhanden</span>
                </div>
            `;
            return;
        }

        dropdownList.innerHTML = savedPrompts.map(prompt => {
            const isSelected = this.selectedPromptId === prompt.id;
            const previewLength = prompt.prompt ? prompt.prompt.length : 0;
            const formattedDate = this.formatDate(prompt.timestamp);
            
            return `
                <div class="saved-prompt-item ${isSelected ? 'selected' : ''}" data-prompt-id="${prompt.id}">
                    <div class="saved-prompt-info">
                        <div class="saved-prompt-name">${this.escapeHtml(prompt.name)}</div>
                        <div class="saved-prompt-meta">
                            ${formattedDate} • ${previewLength} Zeichen
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        // Add click handlers
        dropdownList.querySelectorAll('.saved-prompt-item').forEach(item => {
            item.addEventListener('click', () => {
                this.selectPromptFromDropdown(item.dataset.promptId);
            });
        });
    }

    /**
     * Select a prompt from dropdown - now loads directly
     */
    selectPromptFromDropdown(promptId) {
        const savedPrompts = this.storageManager.getSavedPrompts();
        const prompt = savedPrompts.find(p => p.id === promptId);
        
        if (prompt) {
            const input = document.getElementById('unified-prompt-input');
            if (input) {
                input.value = prompt.name;
                this.selectedPromptId = promptId;
                this.currentState = 'selected';
                this.updateUI();
            }
            this.hideDropdown();
            
            // Direkt laden
            this.loadSelectedPrompt();
        }
    }

    /**
     * Update UI based on current state
     */
    updateUI() {
        this.updateActionButtons();
        this.updateTooltips();
    }

    /**
     * Update action button visibility and states
     */
    updateActionButtons() {
        const saveBtn = document.getElementById('save-prompt-btn');
        const editBtn = document.getElementById('edit-prompt-btn'); // Now inside input field
        const deleteBtn = document.getElementById('delete-prompt-btn');
        const copyBtn = document.getElementById('copy-prompt-btn');
        const exportBtn = document.getElementById('export-dropdown-btn');

        // Reset all button states
        const buttons = [saveBtn, editBtn, deleteBtn, copyBtn, exportBtn];
        buttons.forEach(btn => {
            if (btn) {
                btn.style.display = 'none';
                btn.disabled = false;
            }
        });

        // Show buttons based on current state
        switch (this.currentState) {
            case 'empty':
                // Always show save button, but disable if no content
                if (saveBtn) saveBtn.style.display = 'flex';
                if (copyBtn) copyBtn.style.display = 'flex';
                if (exportBtn) exportBtn.style.display = 'flex';
                break;
                
            case 'new':
                if (saveBtn) saveBtn.style.display = 'flex';
                if (copyBtn) copyBtn.style.display = 'flex';
                if (exportBtn) exportBtn.style.display = 'flex';
                break;
                
            case 'editing':
                // Show save button for renaming, keep edit button visible during editing
                if (saveBtn) saveBtn.style.display = 'flex';
                if (editBtn) editBtn.style.display = 'flex';
                if (copyBtn) copyBtn.style.display = 'flex';
                if (exportBtn) exportBtn.style.display = 'flex';
                break;
                
            case 'selected':
                if (saveBtn) saveBtn.style.display = 'flex';
                if (editBtn) editBtn.style.display = 'flex'; // Show edit button in input field
                if (deleteBtn) deleteBtn.style.display = 'flex';
                if (copyBtn) copyBtn.style.display = 'flex';
                if (exportBtn) exportBtn.style.display = 'flex';
                break;
        }

        // Check if we have current prompt content for save/copy/export
        const hasPromptContent = this.hasCurrentPromptContent();
        
        // Save button activation logic depends on state
        if (saveBtn) {
            if (this.currentState === 'editing') {
                // For editing, always enable save button (for renaming)
                saveBtn.disabled = false;
            } else {
                // For other states, require prompt content
                saveBtn.disabled = !hasPromptContent;
            }
        }
        
        if (copyBtn) copyBtn.disabled = !hasPromptContent;
        if (exportBtn) exportBtn.disabled = !hasPromptContent;
    }

    /**
     * Update button tooltips based on current state
     */
    updateTooltips() {
        const saveBtn = document.getElementById('save-prompt-btn');
        
        if (saveBtn) {
            switch (this.currentState) {
                case 'new':
                    saveBtn.title = 'Neuen Prompt speichern';
                    break;
                case 'editing':
                    saveBtn.title = 'Umbenennung speichern';
                    break;
                case 'selected':
                    saveBtn.title = 'Ausgewählten Prompt aktualisieren';
                    break;
                default:
                    saveBtn.title = 'Prompt speichern';
            }
        }
    }

    /**
     * Get the next available prompt name with automatic numbering
     */
    getNextPromptName() {
        const existingPrompts = this.storageManager.getSavedPrompts();
        let nextNumber = 1;
        
        // Find the highest number in existing "Prompt #X" names
        existingPrompts.forEach(prompt => {
            const match = prompt.name.match(/^Prompt #(\d+)$/);
            if (match) {
                const number = parseInt(match[1]);
                if (number >= nextNumber) {
                    nextNumber = number + 1;
                }
            }
        });
        
        return `Prompt #${nextNumber}`;
    }

    /**
     * Check if current prompt content exists
     */
    hasCurrentPromptContent() {
        const promptPreview = document.getElementById('prompt-preview');
        if (!promptPreview) {
            return false;
        }
        
        const content = promptPreview.textContent || promptPreview.innerText || '';
        const hasContent = content.trim() && 
                          !content.includes("Ihr Prompt wird hier angezeigt") && 
                          !content.includes("wird hier angezeigt") &&
                          content.length > 10; // Minimum content length
        
        return hasContent;
    }

    /**
     * Save new prompt with automatic name generation
     */
    saveNewPromptWithAutoName() {
        // Check if we have content to save
        if (!this.hasCurrentPromptContent()) {
            this.uiMessageManager.showMessage('Kein Prompt zum Speichern verfügbar', 'error');
            return;
        }

        const input = document.getElementById('unified-prompt-input');
        let name = input.value.trim();
        
        // If no name provided or it's the auto-generated name, use auto-naming
        if (!name || name.match(/^Prompt #\d+$/)) {
            name = this.getNextPromptName();
        }

        const promptData = this.getCurrentPromptData();
        if (this.storageManager.savePromptWithName(promptData, name)) {
            this.uiMessageManager.showMessage(`Prompt "${name}" erfolgreich gespeichert!`, 'success');
            
            // Update input field with next auto-name for next prompt
            const nextName = this.getNextPromptName();
            input.value = nextName;
            
            this.currentState = 'new';
            this.selectedPromptId = null;
            this.updateUI();
            this.updateSavedPromptsDropdown();
        }
    }

    /**
     * Save new prompt (legacy method, now calls auto-name version)
     */
    saveNewPrompt() {
        this.saveNewPromptWithAutoName();
    }

    /**
     * Update existing prompt
     */
    updateExistingPrompt() {
        if (!this.selectedPromptId) return;
        
        const input = document.getElementById('unified-prompt-input');
        const name = input.value.trim();
        
        if (!confirm(`Prompt "${name}" mit aktuellen Daten überschreiben?`)) {
            return;
        }

        const promptData = this.getCurrentPromptData();
        const updatedData = {
            name: name,
            prompt: promptData.promptText,
            techniques: promptData.selectedTechniques,
            basePrompt: promptData.basePrompt,
            taskDescription: promptData.taskDescription,
            outputFormat: promptData.outputFormat,
            templates: promptData.selectedTemplates,
            templateFields: promptData.templateFields
        };

        if (this.storageManager.updatePrompt(this.selectedPromptId, updatedData)) {
            this.uiMessageManager.showMessage(`Prompt "${name}" erfolgreich aktualisiert!`, 'success');
        }
    }

    /**
     * Load selected prompt
     */
    loadSelectedPrompt() {
        if (!this.selectedPromptId) return;

        const prompt = this.storageManager.getPromptById(this.selectedPromptId);
        if (!prompt) {
            this.uiMessageManager.showMessage('Gespeicherter Prompt nicht gefunden', 'error');
            return;
        }

        this.restorePromptToForm(prompt);
        this.uiMessageManager.showMessage(`Prompt "${prompt.name}" wurde geladen`, 'success');
    }

    /**
     * Edit selected prompt - enhanced for inline renaming
     */
    editSelectedPrompt() {
        if (!this.selectedPromptId) return;

        const prompt = this.storageManager.getPromptById(this.selectedPromptId);
        if (!prompt) {
            this.uiMessageManager.showMessage('Gespeicherter Prompt nicht gefunden', 'error');
            return;
        }

        // Enable inline renaming in the input field
        const input = document.getElementById('unified-prompt-input');
        if (input) {
            input.value = prompt.name;
            input.focus();
            input.select(); // Select all text for easy replacement
            
            // Change state to indicate we're editing
            this.currentState = 'editing';
            this.currentEditingId = prompt.id;
            this.updateUI();
            
            this.uiMessageManager.showMessage('Name bearbeiten und Enter drücken zum Speichern', 'info');
        }
    }

    /**
     * Save renamed prompt
     */
    saveRenamedPrompt() {
        if (!this.currentEditingId) return;

        const input = document.getElementById('unified-prompt-input');
        const newName = input.value.trim();
        
        if (!newName) {
            this.uiMessageManager.showMessage('Bitte geben Sie einen Namen ein', 'error');
            return;
        }

        // Check if name conflicts with other prompts (except current one)
        const existingPrompts = this.storageManager.getSavedPrompts();
        const conflict = existingPrompts.find(p => p.name === newName && p.id !== this.currentEditingId);
        
        if (conflict) {
            this.uiMessageManager.showMessage(`Ein anderer Prompt mit dem Namen "${newName}" existiert bereits`, 'error');
            return;
        }

        // Update the prompt name
        const updatedData = { name: newName };
        if (this.storageManager.updatePrompt(this.currentEditingId, updatedData)) {
            this.uiMessageManager.showMessage(`Prompt in "${newName}" umbenannt`, 'success');
            
            // Reset editing state
            this.currentEditingId = null;
            this.currentState = 'selected';
            this.updateUI();
            this.updateSavedPromptsDropdown();
        } else {
            this.uiMessageManager.showMessage('Fehler beim Umbenennen des Prompts', 'error');
        }
    }

    /**
     * Delete selected prompt
     */
    deleteSelectedPrompt() {
        if (!this.selectedPromptId) return;

        const prompt = this.storageManager.getPromptById(this.selectedPromptId);
        if (!prompt) {
            this.uiMessageManager.showMessage('Gespeicherter Prompt nicht gefunden', 'error');
            return;
        }

        if (!confirm(`Möchten Sie den Prompt "${prompt.name}" wirklich löschen?`)) {
            return;
        }

        if (this.storageManager.deletePromptById(this.selectedPromptId)) {
            this.uiMessageManager.showMessage(`Prompt "${prompt.name}" wurde gelöscht`, 'success');
            
            // Reset UI state
            const input = document.getElementById('unified-prompt-input');
            if (input) input.value = '';
            this.selectedPromptId = null;
            this.currentState = 'empty';
            this.updateUI();
        }
    }

    /**
     * Copy current prompt to clipboard
     */
    copyCurrentPrompt() {
        if (!this.hasCurrentPromptContent()) {
            this.uiMessageManager.showMessage('Kein Prompt zum Kopieren verfügbar', 'error');
            return;
        }

        const promptPreview = document.getElementById('prompt-preview');
        const promptText = promptPreview.textContent;

        navigator.clipboard.writeText(promptText).then(() => {
            this.uiMessageManager.showMessage('Prompt erfolgreich in die Zwischenablage kopiert', 'success');
        }).catch(err => {
            console.error('Fehler beim Kopieren:', err);
            this.uiMessageManager.showMessage('Fehler beim Kopieren in die Zwischenablage', 'error');
        });
    }

    /**
     * Toggle export dropdown
     */
    toggleExportDropdown() {
        const dropdown = document.getElementById('export-options-dropdown');
        if (!dropdown) return;

        if (this.exportDropdownVisible) {
            this.hideExportDropdown();
        } else {
            this.showExportDropdown();
        }
    }

    /**
     * Show export dropdown
     */
    showExportDropdown() {
        const dropdown = document.getElementById('export-options-dropdown');
        if (dropdown) {
            dropdown.classList.add('show');
            dropdown.style.display = 'block';
            this.exportDropdownVisible = true;
        }
    }

    /**
     * Hide export dropdown
     */
    hideExportDropdown() {
        const dropdown = document.getElementById('export-options-dropdown');
        if (dropdown) {
            dropdown.classList.remove('show');
            dropdown.style.display = 'none';
            this.exportDropdownVisible = false;
        }
    }

    /**
     * Export current prompt in specified format
     */
    exportCurrentPrompt(format) {
        if (!this.hasCurrentPromptContent()) {
            this.uiMessageManager.showMessage('Kein Prompt zum Exportieren verfügbar', 'error');
            return;
        }

        const currentPromptData = this.getCurrentPromptData();
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
        
        switch (format) {
            case 'markdown':
                const markdownContent = this.storageManager.exportPromptAsMarkdown(currentPromptData);
                this.storageManager.downloadAsFile(markdownContent, `prompt-export-${timestamp}.md`, 'text/markdown');
                break;
            case 'xml':
                const xmlContent = this.storageManager.exportPromptAsXML(currentPromptData);
                this.storageManager.downloadAsFile(xmlContent, `prompt-export-${timestamp}.xml`, 'application/xml');
                break;
            default:
                const textContent = this.storageManager.exportPromptAsText(currentPromptData);
                this.storageManager.downloadAsFile(textContent, `prompt-export-${timestamp}.txt`, 'text/plain');
                break;
        }
        
        this.uiMessageManager.showMessage(`Prompt als ${format.toUpperCase()}-Datei exportiert`, 'success');
    }

    /**
     * Handle clicks outside dropdowns
     */
    handleOutsideClick(e) {
        const dropdown = document.getElementById('saved-prompts-dropdown');
        const container = document.querySelector('.prompt-selector-container');
        const exportDropdown = document.getElementById('export-options-dropdown');
        const exportContainer = document.querySelector('.export-dropdown-container');
        
        if (dropdown && !container?.contains(e.target)) {
            this.hideDropdown();
        }
        
        if (exportDropdown && !exportContainer?.contains(e.target)) {
            this.hideExportDropdown();
        }
    }

    /**
     * Restore prompt data to form
     */
    restorePromptToForm(prompt) {
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
     * Update the saved prompts dropdown (refresh the list)
     */
    updateSavedPromptsDropdown() {
        if (this.dropdownVisible) {
            this.populateDropdown();
        }
    }

    /**
     * Format date for display
     */
    formatDate(timestamp) {
        if (!timestamp) return 'Unbekannt';
        
        try {
            return new Date(timestamp).toLocaleDateString('de-DE', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
        } catch (e) {
            return 'Unbekannt';
        }
    }

    /**
     * Escape HTML for safe display
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Make SavedPromptsManager available globally
window.SavedPromptsManager = SavedPromptsManager;
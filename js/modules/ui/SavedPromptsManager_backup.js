/**
 * SavedPromptsManager - Verwaltet das Speichern, Laden und Bearbeiten von Prompts
 * Updated for unified UI interface
 */
class SavedPromptsManager {
    constructor(storageManager, uiMessageManager) {
        this.storageManager = storageManager;
        this.uiMessageManager = uiMessageManager;
        this.currentEditingId = null;
        this.promptBuilder = null; // Will be set during init
        this.selectedPromptId = null;
        this.dropdownVisible = false;
    }

    /**
     * Initialize the SavedPromptsManager
     */
    init() {
        this.promptBuilder = window.promptBuilder;
        this.updateSavedPromptsDropdown();
        this.initializeUnifiedEventListeners();
        console.log('SavedPromptsManager initialized with unified UI');
    }

    /**
     * Initialize event listeners for unified UI
     */
    initializeUnifiedEventListeners() {
        // Unified input field
        const unifiedInput = document.getElementById('unified-prompt-input');
        if (unifiedInput) {
            unifiedInput.addEventListener('input', () => this.onUnifiedInputChange());
            unifiedInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.saveCurrentPrompt();
                }
            });
        }

        // Dropdown toggle button
        const dropdownToggle = document.getElementById('prompt-dropdown-toggle');
        if (dropdownToggle) {
            dropdownToggle.addEventListener('click', () => this.toggleDropdown());
        }

        // Action buttons
        this.setupActionButtons();

        // Export dropdown
        this.setupExportDropdown();

        // Click outside to close dropdown
        document.addEventListener('click', (e) => this.handleOutsideClick(e));

        // Legacy event listeners for backward compatibility
        this.initializeLegacyEventListeners();
    }

    /**
     * Setup action buttons
     */
    setupActionButtons() {
        // Save button
        const saveBtn = document.getElementById('save-prompt-btn');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => this.saveCurrentPrompt());
        }

        // Load button
        const loadBtn = document.getElementById('load-prompt-btn');
        if (loadBtn) {
            loadBtn.addEventListener('click', () => this.loadSelectedPrompt());
        }

        // Edit button
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
     * Handle unified input change
     */
    onUnifiedInputChange() {
        const input = document.getElementById('unified-prompt-input');
        const value = input.value.trim();
        
        // Check if a saved prompt is selected
        const savedPrompts = this.storageManager.getSavedPrompts();
        const selectedPrompt = savedPrompts.find(p => p.name === value);
        
        if (selectedPrompt) {
            this.selectedPromptId = selectedPrompt.id;
            this.showContextualButtons(['load', 'edit', 'delete']);
        } else if (value) {
            this.selectedPromptId = null;
            this.showContextualButtons(['save']);
        } else {
            this.selectedPromptId = null;
            this.hideContextualButtons();
        }
    }

    /**
     * Toggle dropdown visibility
     */
    toggleDropdown() {
        const dropdown = document.getElementById('saved-prompts-dropdown');
        const toggleBtn = document.getElementById('prompt-dropdown-toggle');
        
        if (!dropdown || !toggleBtn) return;

        this.dropdownVisible = !this.dropdownVisible;
        
        if (this.dropdownVisible) {
            this.updateSavedPromptsDropdown();
            dropdown.style.display = 'block';
            toggleBtn.classList.add('open');
        } else {
            dropdown.style.display = 'none';
            toggleBtn.classList.remove('open');
        }
    }

    /**
     * Hide dropdown
     */
    hideDropdown() {
        const dropdown = document.getElementById('saved-prompts-dropdown');
        const toggleBtn = document.getElementById('prompt-dropdown-toggle');
        
        if (dropdown && toggleBtn) {
            this.dropdownVisible = false;
            dropdown.style.display = 'none';
            toggleBtn.classList.remove('open');
        }
    }

    /**
     * Show/hide contextual buttons based on state
     */
    showContextualButtons(buttons) {
        const allButtons = ['load', 'edit', 'delete'];
        
        allButtons.forEach(buttonType => {
            const btn = document.getElementById(`${buttonType}-prompt-btn`);
            if (btn) {
                btn.style.display = buttons.includes(buttonType) ? 'flex' : 'none';
            }
        });
    }

    /**
     * Hide all contextual buttons
     */
    hideContextualButtons() {
        this.showContextualButtons([]);
    }

    /**
     * Handle clicks outside dropdown
     */
    handleOutsideClick(e) {
        const dropdown = document.getElementById('saved-prompts-dropdown');
        const container = document.querySelector('.prompt-selector-container');
        const exportDropdown = document.getElementById('export-options-dropdown');
        const exportContainer = document.querySelector('.export-dropdown-container');
        
        if (dropdown && !container.contains(e.target)) {
            this.hideDropdown();
        }
        
        if (exportDropdown && !exportContainer.contains(e.target)) {
            this.hideExportDropdown();
        }
    }

    /**
     * Update saved prompts dropdown with new unified interface
     */
    updateSavedPromptsDropdown() {
        const dropdownList = document.getElementById('saved-prompts-list');
        if (!dropdownList) return;

        const savedPrompts = this.storageManager.getSavedPrompts();
        
        if (savedPrompts.length === 0) {
            dropdownList.innerHTML = `
                <div class="empty-prompts-message">
                    <i class="fas fa-info-circle"></i> Keine gespeicherten Prompts vorhanden
                </div>
            `;
            return;
        }

        dropdownList.innerHTML = savedPrompts.map(prompt => `
            <div class="saved-prompt-item" data-prompt-id="${prompt.id}">
                <div class="saved-prompt-info">
                    <div class="saved-prompt-name">${this.escapeHtml(prompt.name)}</div>
                    <div class="saved-prompt-meta">
                        ${this.formatDate(prompt.timestamp)} • ${this.getPromptPreviewLength(prompt.content)} Zeichen
                    </div>
                </div>
            </div>
        `).join('');

        // Add click handlers to prompt items
        dropdownList.querySelectorAll('.saved-prompt-item').forEach(item => {
            item.addEventListener('click', () => this.selectPromptFromDropdown(item.dataset.promptId));
        });
    }

    /**
     * Select a prompt from dropdown
     */
    selectPromptFromDropdown(promptId) {
        const savedPrompts = this.storageManager.getSavedPrompts();
        const prompt = savedPrompts.find(p => p.id === promptId);
        
        if (prompt) {
            const input = document.getElementById('unified-prompt-input');
            if (input) {
                input.value = prompt.name;
                this.selectedPromptId = promptId;
                this.showContextualButtons(['load', 'edit', 'delete']);
            }
            
            // Update visual selection
            this.updateDropdownSelection(promptId);
            this.hideDropdown();
        }
    }

    /**
     * Update dropdown visual selection
     */
    updateDropdownSelection(selectedId) {
        const items = document.querySelectorAll('.saved-prompt-item');
        items.forEach(item => {
            if (item.dataset.promptId === selectedId) {
                item.classList.add('selected');
            } else {
                item.classList.remove('selected');
            }
        });
    }

    /**
     * Save current prompt (unified interface)
     */
    saveCurrentPrompt() {
        const input = document.getElementById('unified-prompt-input');
        const promptPreview = document.getElementById('prompt-preview');
        
        if (!input || !promptPreview) return;

        const name = input.value.trim();
        const content = promptPreview.innerText || '';

        if (!name) {
            this.uiMessageManager.showError('Bitte geben Sie einen Namen für den Prompt ein');
            input.focus();
            return;
        }

        if (!content || content.includes("Ihr Prompt wird hier angezeigt")) {
            this.uiMessageManager.showError('Kein Prompt zum Speichern verfügbar');
            return;
        }

        // Check if updating existing prompt
        if (this.selectedPromptId) {
            if (!confirm(`Prompt "${name}" überschreiben?`)) {
                return;
            }
            this.updateExistingPrompt(this.selectedPromptId, name, content);
        } else {
            // Check if name already exists
            const existingPrompts = this.storageManager.getSavedPrompts();
            if (existingPrompts.some(p => p.name === name)) {
                if (!confirm(`Ein Prompt mit dem Namen "${name}" existiert bereits. Überschreiben?`)) {
                    return;
                }
            }
            this.saveNewPrompt(name, content);
        }

        // Clear selection state
        this.selectedPromptId = null;
        input.value = '';
        this.hideContextualButtons();
        this.updateSavedPromptsDropdown();
    }
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
        const exportButton = document.getElementById('export-saved-prompt-dropdown-toggle');

        const hasSelection = dropdown && dropdown.value !== '';
        
        if (loadButton) loadButton.disabled = !hasSelection;
        if (editButton) editButton.disabled = !hasSelection;
        if (deleteButton) deleteButton.disabled = !hasSelection;
        if (exportButton) exportButton.disabled = !hasSelection;
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

    /**
     * Export current prompt as text file
     */
    exportCurrentPromptAsText() {
        const currentPromptData = this.getCurrentPromptData();
        if (!currentPromptData || !currentPromptData.promptText.trim() || currentPromptData.promptText.includes("Ihr Prompt wird hier angezeigt")) {
            this.uiMessageManager.showMessage('Kein Prompt zum Exportieren verfügbar', 'error');
            return;
        }

        const textContent = this.storageManager.exportPromptAsText(currentPromptData);
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
        const filename = `prompt-export-${timestamp}.txt`;
        
        this.storageManager.downloadAsFile(textContent, filename, 'text/plain');
        this.uiMessageManager.showMessage('Prompt als Text-Datei exportiert', 'success');
    }

    /**
     * Export current prompt as Markdown file
     */
    exportCurrentPromptAsMarkdown() {
        const currentPromptData = this.getCurrentPromptData();
        if (!currentPromptData || !currentPromptData.promptText.trim() || currentPromptData.promptText.includes("Ihr Prompt wird hier angezeigt")) {
            this.uiMessageManager.showMessage('Kein Prompt zum Exportieren verfügbar', 'error');
            return;
        }

        const markdownContent = this.storageManager.exportPromptAsMarkdown(currentPromptData);
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
        const filename = `prompt-export-${timestamp}.md`;
        
        this.storageManager.downloadAsFile(markdownContent, filename, 'text/markdown');
        this.uiMessageManager.showMessage('Prompt als Markdown-Datei exportiert', 'success');
    }

    /**
     * Export current prompt as XML file
     */
    exportCurrentPromptAsXML() {
        const currentPromptData = this.getCurrentPromptData();
        if (!currentPromptData || !currentPromptData.promptText.trim() || currentPromptData.promptText.includes("Ihr Prompt wird hier angezeigt")) {
            this.uiMessageManager.showMessage('Kein Prompt zum Exportieren verfügbar', 'error');
            return;
        }

        const xmlContent = this.storageManager.exportPromptAsXML(currentPromptData);
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
        const filename = `prompt-export-${timestamp}.xml`;
        
        this.storageManager.downloadAsFile(xmlContent, filename, 'application/xml');
        this.uiMessageManager.showMessage('Prompt als XML-Datei exportiert', 'success');
    }

    /**
     * Export saved prompt by ID in specified format
     */
    exportSavedPrompt(promptId, format = 'text') {
        const prompt = this.storageManager.getPromptById(promptId);
        if (!prompt) {
            this.uiMessageManager.showMessage('Gespeicherter Prompt nicht gefunden', 'error');
            return;
        }

        // Convert saved prompt to current prompt data format
        const promptData = {
            promptText: prompt.prompt || '',
            basePrompt: prompt.basePrompt || '',
            taskDescription: prompt.taskDescription || '',
            outputFormat: prompt.outputFormat || '',
            selectedTechniques: prompt.techniques || []
        };

        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
        const safeName = prompt.name.replace(/[^a-zA-Z0-9-_]/g, '_');

        switch (format) {
            case 'markdown':
                const markdownContent = this.storageManager.exportPromptAsMarkdown(promptData);
                this.storageManager.downloadAsFile(markdownContent, `${safeName}-${timestamp}.md`, 'text/markdown');
                break;
            case 'xml':
                const xmlContent = this.storageManager.exportPromptAsXML(promptData);
                this.storageManager.downloadAsFile(xmlContent, `${safeName}-${timestamp}.xml`, 'application/xml');
                break;
            default:
                const textContent = this.storageManager.exportPromptAsText(promptData);
                this.storageManager.downloadAsFile(textContent, `${safeName}-${timestamp}.txt`, 'text/plain');
                break;
        }

        this.uiMessageManager.showMessage(`Prompt "${prompt.name}" als ${format.toUpperCase()}-Datei exportiert`, 'success');
    }

    /**
     * Create a demo prompt for testing export functionality
     */
    createDemoPrompt() {
        // Fill form fields with demo data
        const basePromptField = document.getElementById('base-prompt');
        const taskField = document.getElementById('task-description');
        const outputField = document.getElementById('output-format');

        if (basePromptField) {
            basePromptField.value = 'Du bist ein erfahrener AI-Prompt-Engineer mit umfassendem Wissen über Best Practices im Prompt Engineering.';
        }

        if (taskField) {
            taskField.value = 'Erstelle einen strukturierten Leitfaden für die Optimierung von AI-Prompts. Der Leitfaden soll sowohl für Anfänger als auch für Fortgeschrittene geeignet sein.';
        }

        if (outputField) {
            outputField.value = 'Erstelle eine strukturierte Anleitung mit: 1) Einführung, 2) Grundprinzipien, 3) Praktische Beispiele, 4) Häufige Fehler, 5) Fortgeschrittene Techniken. Verwende Markdown-Formatierung mit Überschriften, Listen und Code-Blöcken.';
        }

        // Trigger form updates
        if (taskField) {
            taskField.dispatchEvent(new Event('input', { bubbles: true }));
        }

        // Select some demo techniques
        setTimeout(() => {
            const demoTechniques = ['chain-of-thought', 'few-shot-learning', 'role-prompting'];
            demoTechniques.forEach(techniqueId => {
                const techniqueCard = document.querySelector(`[data-id="${techniqueId}"]`);
                if (techniqueCard && this.promptBuilder && this.promptBuilder.techniqueManager) {
                    techniqueCard.classList.add('selected');
                    this.promptBuilder.techniqueManager.addTechnique(techniqueId);
                }
            });

            // Update UI to show the preview
            if (this.promptBuilder && this.promptBuilder.uiManager && this.promptBuilder.uiManager.promptPreviewManager) {
                this.promptBuilder.uiManager.promptPreviewManager.updatePromptPreview();
            }

            this.uiMessageManager.showMessage('Demo-Prompt erstellt! Sie können nun die Export-Funktionen testen.', 'success');
        }, 500);
    }
}

// Make SavedPromptsManager available globally
window.SavedPromptsManager = SavedPromptsManager;

/**
 * UIEventHandler - Verwaltet alle Event-Listener für die UI
 */
class UIEventHandler {
    constructor(managers) {
        this.techniqueUIManager = managers.techniqueUIManager;
        this.templateUIManager = managers.templateUIManager;
        this.promptPreviewManager = managers.promptPreviewManager;
        this.dynamicFieldManager = managers.dynamicFieldManager;
        this.savedPromptsManager = managers.savedPromptsManager;
        this.uiMessageManager = managers.uiMessageManager;
        this.techniqueManager = managers.techniqueManager;
        this.templateManager = managers.templateManager;
        this.storageManager = managers.storageManager;
        
        // Debouncing for technique card clicks
        this.lastClickTime = 0;
        this.debounceDelay = 300; // 300ms debounce
        this.processingClick = false;
    }

    /**
     * Setup all event listeners
     */
    setupEventListeners() {
        this.setupTechniqueEventListeners();
        this.setupTemplateEventListeners();
        this.setupPromptEventListeners();
        this.setupPromptManagementEventListeners();
        this.setupFormEventListeners();
        this.setupNavigationEventListeners();
        this.setupCustomEventListeners();
    }

    /**
     * Setup technique-related event listeners
     */
    setupTechniqueEventListeners() {
        // Technique selection (legacy checkbox support)
        document.addEventListener('change', (e) => {
            if (e.target.matches('input[type="checkbox"][id^="technique-"]')) {
                const result = this.techniqueUIManager.onTechniqueSelected(e.target);
                this.promptPreviewManager.updatePromptPreview();
                this.promptPreviewManager.updateNextButtonState(this.techniqueManager);
                this.techniqueUIManager.updateTechniqueCount();
            }
        });

        // Technique card clicks - entire card toggles dropdown
        document.addEventListener('click', (e) => {
            const techniqueCard = e.target.closest('.technique-card-item');
            if (techniqueCard) {
                e.preventDefault();
                e.stopPropagation();
                
                const techniqueId = techniqueCard.dataset.id;
                console.log('🎯 Technique card clicked for dropdown toggle:', techniqueId);
                
                // Toggle dropdown functionality
                this.techniqueUIManager.toggleTechniqueDropdown(techniqueId);
            }
        });

        // Remove technique buttons
        document.addEventListener('click', (e) => {
            if (e.target.closest('.remove-technique-button')) {
                const techniqueItem = e.target.closest('.selected-technique-item');
                const techniqueId = techniqueItem.querySelector('.technique-name').textContent;
                
                // Find and uncheck the corresponding checkbox
                const checkbox = document.querySelector(`input[value="${techniqueId}"]`);
                if (checkbox) {
                    checkbox.checked = false;
                    checkbox.dispatchEvent(new Event('change'));
                }
            }
        });
    }

    /**
     * Setup template-related event listeners
     */
    setupTemplateEventListeners() {
        // Template selection
        document.addEventListener('change', (e) => {
            if (e.target.matches('.template-checkbox')) {
                const result = this.templateUIManager.onTemplateSelected(e.target, this.techniqueUIManager);
                this.templateUIManager.updateSelectedTemplatesDescription();
                this.templateUIManager.updateTemplateFields(this.dynamicFieldManager);
                this.promptPreviewManager.updatePromptPreview();
                this.promptPreviewManager.updateNextButtonState(this.techniqueManager);
            }
        });

        // Template preview buttons
        document.addEventListener('click', (e) => {
            if (e.target.closest('.template-preview-btn')) {
                const templateItem = e.target.closest('.template-checkbox-item');
                const templateId = templateItem.querySelector('input').value;
                this.templateUIManager.showTemplatePreview(templateId);
            }
        });
    }

    /**
     * Setup prompt-related event listeners
     */
    setupPromptEventListeners() {
        // Copy prompt button
        const copyButton = document.getElementById('copy-prompt-button');
        if (copyButton) {
            copyButton.addEventListener('click', () => {
                this.promptPreviewManager.copyPromptToClipboard();
            });
        }

        // Input field changes
        const inputFields = ['task-description', 'base-prompt'];
        inputFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field) {
                field.addEventListener('input', () => {
                    this.promptPreviewManager.updatePromptPreview();
                    this.promptPreviewManager.updateNextButtonState(this.techniqueManager);
                });
            }
        });

        // Output format dropdown
        const outputFormatSelect = document.getElementById('output-format');
        if (outputFormatSelect) {
            outputFormatSelect.addEventListener('change', () => {
                this.promptPreviewManager.updatePromptPreview();
            });
        }
    }

    /**
     * Setup prompt management event listeners
     */
    setupPromptManagementEventListeners() {
        // Save current prompt
        const savePromptBtn = document.getElementById('save-current-prompt');
        if (savePromptBtn) {
            savePromptBtn.addEventListener('click', () => {
                this.savedPromptsManager.saveCurrentPrompt();
            });
        }

        // Load saved prompt
        const loadPromptBtn = document.getElementById('load-saved-prompt');
        if (loadPromptBtn) {
            loadPromptBtn.addEventListener('click', () => {
                this.savedPromptsManager.loadSelectedPrompt();
            });
        }

        // Edit saved prompt
        const editPromptBtn = document.getElementById('edit-saved-prompt');
        if (editPromptBtn) {
            editPromptBtn.addEventListener('click', () => {
                this.savedPromptsManager.editSelectedPrompt();
            });
        }

        // Delete saved prompt
        const deletePromptBtn = document.getElementById('delete-saved-prompt');
        if (deletePromptBtn) {
            deletePromptBtn.addEventListener('click', () => {
                this.savedPromptsManager.deleteSelectedPrompt();
            });
        }

        // Saved prompts dropdown change
        const savedPromptsSelect = document.getElementById('saved-prompts-select');
        if (savedPromptsSelect) {
            savedPromptsSelect.addEventListener('change', () => {
                this.savedPromptsManager.onSavedPromptSelectionChange();
            });
        }

        // Copy prompt button
        const copyPromptBtn = document.getElementById('copy-prompt-button');
        if (copyPromptBtn) {
            copyPromptBtn.addEventListener('click', () => {
                this.savedPromptsManager.copyPromptToClipboard();
            });
        }

        // Edit prompt modal handlers
        const saveEditedPromptBtn = document.getElementById('save-edited-prompt');
        if (saveEditedPromptBtn) {
            saveEditedPromptBtn.addEventListener('click', () => {
                this.savedPromptsManager.saveEditedPrompt();
            });
        }

        const cancelEditPromptBtn = document.getElementById('cancel-edit-prompt');
        if (cancelEditPromptBtn) {
            cancelEditPromptBtn.addEventListener('click', () => {
                this.savedPromptsManager.cancelEditPrompt();
            });
        }

        // Modal close handlers
        const editModal = document.getElementById('edit-prompt-modal');
        if (editModal) {
            const closeBtn = editModal.querySelector('.modal-close');
            const backdrop = editModal.querySelector('.modal-backdrop');
            
            if (closeBtn) {
                closeBtn.addEventListener('click', () => {
                    this.savedPromptsManager.cancelEditPrompt();
                });
            }
            
            if (backdrop) {
                backdrop.addEventListener('click', () => {
                    this.savedPromptsManager.cancelEditPrompt();
                });
            }
        }
    }

    /**
     * Setup form-related event listeners
     */
    setupFormEventListeners() {
        // Search functionality
        const searchInput = document.getElementById('technique-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.techniqueUIManager.filterTechniques(e.target.value);
            });
        }

        // Category filter
        const categorySelect = document.getElementById('category-filter');
        if (categorySelect) {
            categorySelect.addEventListener('change', (e) => {
                this.techniqueUIManager.filterTechniques('', e.target.value);
            });
        }

        // Form validation
        document.addEventListener('submit', (e) => {
            if (e.target.matches('form')) {
                this.validateForm(e);
            }
        });
    }

    /**
     * Setup navigation event listeners
     */
    setupNavigationEventListeners() {
        // Next step buttons
        document.addEventListener('click', (e) => {
            if (e.target.matches('[id^="next-step-"]')) {
                this.handleNextStep(e.target.id);
            }
        });

        // Previous step buttons
        document.addEventListener('click', (e) => {
            if (e.target.matches('[id^="prev-step-"]')) {
                this.handlePrevStep(e.target.id);
            }
        });

        // Info button
        const infoButton = document.querySelector('.info-button');
        if (infoButton) {
            infoButton.innerHTML = '<i class="fas fa-info-circle"></i>';
            infoButton.title = 'Informationen zu Prompt Engineering';
            infoButton.addEventListener('click', () => {
                this.showInfoModal();
            });
        }
    }

    /**
     * Setup custom event listeners for inter-component communication
     */
    setupCustomEventListeners() {
        // Listen for template field changes
        window.addEventListener('template-field-changed', () => {
            this.promptPreviewManager.updatePromptPreview();
        });

        // Listen for dynamic field changes
        window.addEventListener('dynamic-field-changed', () => {
            this.promptPreviewManager.updatePromptPreview();
        });

        // Listen for technique selection changes
        window.addEventListener('technique-selection-changed', () => {
            this.techniqueUIManager.updateSelectedTechniques();
            this.techniqueUIManager.updateTechniqueCount();
        });
    }

    /**
     * Validate form before submission
     */
    validateForm(event) {
        const form = event.target;
        const formData = new FormData(form);
        const errors = [];

        // Check required fields
        const requiredFields = form.querySelectorAll('[required]');
        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                errors.push(`${field.getAttribute('data-label') || field.name} ist erforderlich`);
            }
        });

        // Check if at least one technique is selected
        if (this.techniqueManager.selectedTechniques.length === 0) {
            errors.push('Mindestens eine Technik muss ausgewählt werden');
        }

        if (errors.length > 0) {
            event.preventDefault();
            errors.forEach(error => {
                this.uiMessageManager.showError(error);
            });
        }
    }

    /**
     * Handle next step navigation
     */
    handleNextStep(buttonId) {
        console.log('Moving to next step from:', buttonId);
        // TODO: Implement step navigation logic
    }

    /**
     * Handle previous step navigation
     */
    handlePrevStep(buttonId) {
        console.log('Moving to previous step from:', buttonId);
        // TODO: Implement step navigation logic
    }

    /**
     * Show info modal
     */
    showInfoModal() {
        console.log('Showing info modal');
        // TODO: Implement info modal
    }

    /**
     * Add event listener with automatic cleanup
     */
    addEventListenerWithCleanup(element, event, handler, options = {}) {
        if (!element) return null;

        element.addEventListener(event, handler, options);
        
        // Return cleanup function
        return () => {
            element.removeEventListener(event, handler, options);
        };
    }

    /**
     * Remove all event listeners (cleanup)
     */
    removeAllEventListeners() {
        // This would be called when the UI is destroyed
        // Implementation depends on how cleanup is managed
        console.log('Removing all event listeners');
    }
}

// Make UIEventHandler available globally
window.UIEventHandler = UIEventHandler;

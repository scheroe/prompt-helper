/**
 * PromptPreviewManager - Verwaltet Prompt-Preview (Token-Zählung entfernt)
 */
class PromptPreviewManager {
    constructor(promptGenerator, uiMessageManager) {
        this.promptGenerator = promptGenerator;
        this.uiMessageManager = uiMessageManager;
        this.tokenInfoInitialized = false;
    }

    /**
     * Update the prompt preview with specific values
     */
    updatePromptPreviewWithValues(taskDescription = '', basePrompt = '', outputFormat = '') {
        const previewContainer = document.getElementById('prompt-preview');
        if (!previewContainer) return;

        const finalPrompt = this.promptGenerator.generatePrompt(taskDescription, basePrompt, outputFormat);
        
        // Set the preview with syntax highlighting
        const highlighted = this.promptGenerator.highlightPrompt(finalPrompt);
        previewContainer.innerHTML = highlighted;

        // Update copy button state (token count no longer displayed)
        const copyButton = document.getElementById('copy-prompt-button');
        if (copyButton) {
            copyButton.disabled = !finalPrompt.trim() || finalPrompt.includes("Ihr Prompt wird hier erscheinen");
        }

        return finalPrompt;
    }

    /**
     * Update prompt preview with current selections
     */
    updatePromptPreview() {
        const taskDescription = document.getElementById('task-description')?.value || '';
        const basePrompt = document.getElementById('base-prompt')?.value || '';
        const outputFormat = document.getElementById('output-format')?.value || '';
        
        return this.updatePromptPreviewWithValues(taskDescription, basePrompt, outputFormat);
    }

    /**
     * Update the token count
     */
    updateTokenCount(text = '') {
        // Token counter removed from UI - no longer updating
        return;
    }

    /**
     * Update token count with color coding
     */
    updateTokenCountWithColors(text = '') {
        // Token counter removed from UI - no longer updating
        return;
    }

    /**
     * Initialize token information display
     */
    initializeTokenInfo() {
        // Token counter removed from UI - no longer initializing
        this.tokenInfoInitialized = true;
        return;
    }

    /**
     * Copy the generated prompt to clipboard
     */
    copyPromptToClipboard() {
        const promptText = document.getElementById('prompt-preview')?.innerText || '';
        
        if (!promptText || promptText.includes("Ihr Prompt wird hier angezeigt")) {
            this.uiMessageManager.showError('Kein Prompt zum Kopieren verfügbar');
            return;
        }

        navigator.clipboard.writeText(promptText).then(() => {
            this.uiMessageManager.showMessage('Prompt erfolgreich in die Zwischenablage kopiert!');
        }).catch(err => {
            console.error('Fehler beim Kopieren:', err);
            this.uiMessageManager.showError('Fehler beim Kopieren in die Zwischenablage');
        });
    }

    /**
     * Update next button state
     */
    updateNextButtonState(techniqueManager) {
        const nextButton = document.getElementById('next-step-2');
        if (nextButton && techniqueManager) {
            const hasSelectedTechniques = techniqueManager.selectedTechniques.length > 0;
            const hasTaskDescription = document.getElementById('task-description')?.value.trim().length > 0;
            
            nextButton.disabled = !hasSelectedTechniques || !hasTaskDescription;
        }
    }
}

// Make PromptPreviewManager available globally
window.PromptPreviewManager = PromptPreviewManager;

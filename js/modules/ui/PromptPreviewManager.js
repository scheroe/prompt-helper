/**
 * PromptPreviewManager - Verwaltet Prompt-Preview und Token-Zählung
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

        // Update token count
        this.updateTokenCount(finalPrompt);

        // Update copy button state
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
        const tokenCountElement = document.getElementById('token-count');
        if (!tokenCountElement) return;

        // Simple token estimation (more sophisticated counting can be added later)
        const tokens = text.split(/\\s+/).filter(word => word.length > 0).length;
        const charCount = text.length;

        tokenCountElement.innerHTML = `
            <span class="token-info">
                <i class="fas fa-calculator"></i>
                ~${tokens} Tokens | ${charCount} Zeichen
            </span>
        `;

        // Add warning for very long prompts
        if (tokens > 2000) {
            tokenCountElement.classList.add('warning');
            const tooltip = document.createElement('div');
            tooltip.className = 'token-warning-tooltip';
            tooltip.textContent = 'Sehr langer Prompt - könnte Modellgrenzen überschreiten';
            tokenCountElement.appendChild(tooltip);
        } else {
            tokenCountElement.classList.remove('warning');
            const existingTooltip = tokenCountElement.querySelector('.token-warning-tooltip');
            if (existingTooltip) {
                existingTooltip.remove();
            }
        }
    }

    /**
     * Update token count with color coding
     */
    updateTokenCountWithColors(text = '') {
        const tokenCountElement = document.getElementById('token-count');
        if (!tokenCountElement) return;

        const tokens = text.split(/\\s+/).filter(word => word.length > 0).length;
        const charCount = text.length;

        // Remove existing color classes
        tokenCountElement.classList.remove('token-low', 'token-medium', 'token-high', 'token-warning');

        // Add color coding based on token count
        if (tokens === 0) {
            tokenCountElement.classList.add('token-low');
        } else if (tokens <= 500) {
            tokenCountElement.classList.add('token-low');
        } else if (tokens <= 1500) {
            tokenCountElement.classList.add('token-medium');
        } else if (tokens <= 3000) {
            tokenCountElement.classList.add('token-high');
        } else {
            tokenCountElement.classList.add('token-warning');
        }

        tokenCountElement.innerHTML = `
            <span class="token-info">
                <i class="fas fa-calculator"></i>
                ~${tokens} Tokens | ${charCount} Zeichen
            </span>
        `;
    }

    /**
     * Initialize token information display
     */
    initializeTokenInfo() {
        if (this.tokenInfoInitialized) return;

        const tokenCountElement = document.getElementById('token-count');
        if (tokenCountElement) {
            tokenCountElement.innerHTML = `
                <span class="token-info">
                    <i class="fas fa-calculator"></i>
                    0 Tokens | 0 Zeichen
                </span>
            `;
            this.tokenInfoInitialized = true;
        }
    }

    /**
     * Copy the generated prompt to clipboard
     */
    copyPromptToClipboard() {
        const promptText = document.getElementById('prompt-preview')?.innerText || '';
        
        if (!promptText || promptText.includes("Ihr Prompt wird hier erscheinen")) {
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

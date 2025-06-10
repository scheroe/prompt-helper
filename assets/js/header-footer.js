/**
 * header-footer.js
 * Standalone header for Prompt Helper
 */

document.addEventListener('DOMContentLoaded', function() {
    // Check if header already has content (from HTML)
    const existingHeader = document.querySelector('header');
    if (existingHeader && existingHeader.innerHTML.trim()) {
        // Header already has content, set up event listeners only
        setupHeaderEventListeners();
        return;
    }
    
    // Inject minimal header if empty
    injectStandaloneHeader();
    setupHeaderEventListeners();
});

/**
 * Injects a minimal standalone header for the prompt builder
 */
function injectStandaloneHeader() {
    const existingHeader = document.querySelector('header');
    if (!existingHeader) return;
    
    const headerHTML = `
        <div class="header-container">
            <div class="header-left">
                <h1><i class="fas fa-magic"></i> Prompt-Helper</h1>
                <span class="header-subtitle">Erstellen Sie effektive KI-Prompts</span>
            </div>
            <div class="header-right">
                <nav class="header-nav">
                    <button class="nav-button" id="about-button">Über</button>
                    <button class="nav-button" id="help-button">Hilfe</button>
                    <a href="https://github.com/scheroe/prompt-helper" class="nav-link" target="_blank">
                        <i class="fab fa-github"></i> GitHub
                    </a>
                </nav>
            </div>
        </div>
    `;
    
    existingHeader.innerHTML = headerHTML;
}

/**
 * Set up event listeners for header elements
 */
function setupHeaderEventListeners() {
    // About button
    const aboutButton = document.getElementById('about-button');
    if (aboutButton) {
        aboutButton.addEventListener('click', showAboutModal);
    }
    
    // Help button
    const helpButton = document.getElementById('help-button');
    if (helpButton) {
        helpButton.addEventListener('click', showHelpModal);
    }
}

/**
 * Show about modal
 */
function showAboutModal() {
    const modal = document.getElementById('help-modal');
    const content = document.getElementById('help-content');
    
    if (modal && content) {
        content.innerHTML = `
            <h3>Über den Prompt-Helper</h3>
            <p>Dieser interaktive Prompt-Helper hilft Ihnen dabei, effektive Prompts für KI-Anwendungen zu erstellen.</p>
            <h4>Features:</h4>
            <ul>
                <li>Bewährte Prompt-Engineering-Techniken</li>
                <li>Interaktive Dropdown-Navigation zwischen verwandten Techniken</li>
                <li>Echtzeit-Prompt-Generierung</li>
                <li>Export und Speicher-Funktionen</li>
            </ul>
            <p><strong>Version:</strong> 1.0.0 (Standalone)</p>
        `;
        modal.style.display = 'block';
    }
}

/**
 * Show help modal
 */
function showHelpModal() {
    const modal = document.getElementById('help-modal');
    const content = document.getElementById('help-content');
    
    if (modal && content) {
        content.innerHTML = `
            <h3>Prompt-Helper Hilfe</h3>
            <p>Dieser Prompt-Helper hilft Ihnen dabei, effektive KI-Prompts zu erstellen:</p>
            <h4>Schritt-für-Schritt Anleitung:</h4>
            <ol>
                <li><strong>Techniken wählen:</strong> Klicken Sie auf Technik-Karten links, um Details anzuzeigen und verwandte Techniken zu entdecken</li>
                <li><strong>Details eingeben:</strong> Beschreiben Sie Ihre Aufgabe und gewünschte Ausgabe in den Formularfeldern</li>
                <li><strong>Prompt generieren:</strong> Klicken Sie auf "Prompt generieren" für einen optimierten Prompt</li>
                <li><strong>Kopieren & verwenden:</strong> Nutzen Sie den generierten Prompt in Ihren KI-Anwendungen</li>
            </ol>
            <h4>Techniken-Navigation:</h4>
            <ul>
                <li>Klicken Sie auf eine Technik-Karte um Details zu sehen</li>
                <li>Verwandte Techniken erscheinen als klickbare Tags</li>
                <li>Smooth-Navigation zwischen verwandten Techniken</li>
            </ul>
        `;
        modal.style.display = 'block';
    }
}
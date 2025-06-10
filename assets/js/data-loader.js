/**
 * Data Loader for Prompt Engineering Taxonomy
 * Handles loading and displaying technique data
 */

class TaxonomyDataLoader {
    constructor() {
        this.categoriesData = null;
        this.techniquesData = null;
        this.currentView = 'cards'; // Default view: 'cards' or 'list'
        this.currentCategory = null; // Selected category
        this.searchTerm = ''; // Current search term
        // Removed activeCardIndex property as we're showing all cards at once
    }

    /**
     * Initialize the data loader
     */
    // Synchronous init, no async/fetch needed
    init() {
        try {
            // Load hardcoded data
            this.loadData();

            // Initialize UI components
            this.initSearch();
            this.initCategoryButtons();
            this.initViewToggle();
            this.initModalHandlers();

            // Display all techniques initially
            this.displayTechniques();

            // Update URL based on initial state
            this.updateURLFromState();

            // Listen for URL changes (history navigation)
            window.addEventListener('popstate', this.handleURLChange.bind(this));
        } catch (error) {
            console.error('Fehler beim Initialisieren der Taxonomiedaten:', error);
            this.showError('Fehler beim Laden der Taxonomiedaten. Bitte aktualisieren Sie die Seite.');
        }
    }

    /**
     * Load techniques and categories data from JSON files
     */
    // Synchronous, hardcoded data loader
    loadData() {
        // --- Hardcoded representative taxonomy data ---
        // === Expanded categories and techniques for full taxonomy ===
        this.categoriesData = {
            categories: [
                { id: "basic-concepts", name: "Grundkonzepte" },
                { id: "reasoning-frameworks", name: "Reasoning" },
                { id: "agent-tool-use", name: "Agent & Werkzeugnutzung" },
                { id: "self-improvement", name: "Selbstverbesserung" },
                { id: "retrieval-augmentation", name: "Abruf & Erweiterung" },
                { id: "prompt-optimization", name: "Prompt-Optimierung" }
            ]
        };

        this.techniquesData = {
            categories: [
                {
                    id: "basic-concepts",
                    techniques: [
                        {
                            id: "zero_shot",
                            name: "Zero-Shot Prompting",
                            description: "Bitten Sie das Modell, eine Aufgabe zu erfüllen, ohne Beispiele zu geben.",
                            aliases: ["Zero Shot", "0S", "No Example Prompting"],
                            sources: ["Brown et al. (2020)", "OpenAI Cookbook"],
                            relatedTechniques: ["few_shot"],
                            example: "Übersetze 'Hallo' ins Französische.",
                            useCase: "Allgemeine Aufgaben, bei denen keine Beispiele verfügbar sind."
                        },
                        {
                            id: "few_shot",
                            name: "Few-Shot Prompting",
                            description: "Geben Sie einige Beispiele im Prompt an, um das Modell zu leiten.",
                            aliases: ["Few Shot", "FS"],
                            sources: ["Brown et al. (2020)"],
                            relatedTechniques: ["zero_shot", "chain_of_thought"],
                            example: "Input und Output als Beispiel angeben",
                            useCase: "Aufgaben, bei denen wenige Beispiele die Absicht verdeutlichen können."
                        },
                        {
                            id: "one_shot",
                            name: "One-Shot Prompting",
                            description: "Geben Sie genau eine Demonstration im Prompt an.",
                            aliases: ["1S", "Single Example"],
                            sources: ["Brown et al. (2020)"],
                            relatedTechniques: ["few_shot", "zero_shot"],
                            example: "Schreibe ein Gedicht über den Sommer, als hätte Shakespeare es geschrieben",
                            useCase: "Wenn ein einziges Beispiel ausreicht, um die Aufgabe zu verdeutlichen."
                        },
                    ]
                },
                {
                    id: "reasoning-frameworks",
                    techniques: [
                        {
                            id: "chain_of_thought",
                            name: "Chain-of-Thought (CoT) Prompting",
                            description: "Erzeugen schrittweiser Argumentation vor der finalen Antwort, normalerweise über Few-Shot-Beispiele.",
                            aliases: ["CoT", "Schritt-für-Schritt-Argumentation"],
                            sources: ["Wei et al. (2022)", "Schulhoff et al."],
                            relatedTechniques: ["few_shot", "zero_shot_cot"],
                            example: "F: Wenn es 3 Autos gibt und jedes Auto einen Ersatzreifen hat, wie viele Räder gibt es insgesamt? Lass uns das Schritt für Schritt denken...",
                            useCase: "Komplexe Argumentation oder mehrstufige Probleme.",
                            tips: "Geben Sie klare, detaillierte Argumentationsschritte in Ihren Beispielen. Zerlegen Sie komplexe Probleme in kleinere, logische Schritte. Verwenden Sie natürliche Sprache, die der Art entspricht, wie Menschen Probleme durchdenken.",
                            commonMistakes: "Überspringen von Zwischenschritten in Argumentationsketten. Verwendung zu komplexer Beispiele, die das Modell verwirren. Nicht anpassen des Argumentationsstils an die spezifische Problemdomäne."
                        },
                        {
                            id: "zero_shot_cot",
                            name: "Zero-Shot CoT",
                            description: "Fügt eine gedankenanregende Phrase zu einem Zero-Shot-Prompt hinzu, um Argumentation hervorzurufen.",
                            aliases: ["Zero-Shot Chain-of-Thought"],
                            sources: ["Schulhoff et al."],
                            relatedTechniques: ["chain_of_thought", "zero_shot"],
                            example: "F: Was ist 17 + 25? A: Lass uns Schritt für Schritt denken.",
                            useCase: "Argumentation ohne Beispiele fördern."
                        },
                    ]
                },
                {
                    id: "agent-tool-use",
                    techniques: [
                        {
                            id: "react",
                            name: "ReAct (Reason + Act)",
                            description: "Agent verschachtelt Argumentation, Aktion und Beobachtungsschritte zur Lösung von Aufgaben.",
                            aliases: ["Reason+Act"],
                            sources: ["Schulhoff et al."],
                            relatedTechniques: ["act", "tool_use_agents"],
                            example: "Gedanke: Ich muss nach X suchen. Aktion: Suche[X]. Beobachtung: ...",
                            useCase: "Aufgaben, die Werkzeugnutzung oder externe Aktionen erfordern.",
                            tips: "Trennen Sie klar die Gedanken-, Aktions- und Beobachtungsschritte. Seien Sie explizit darüber, welche Werkzeuge verfügbar sind. Ermutigen Sie das Modell, über Beobachtungen zu reflektieren, bevor es neue Aktionen durchführt.",
                            commonMistakes: "Nicht genug Kontext über verfügbare Werkzeuge bereitstellen. Dem Modell erlauben, den Argumentationsschritt zu überspringen. Beobachtungen nicht in nachfolgende Argumentation einbeziehen."
                        },
                        {
                            id: "tool_use_agents",
                            name: "Tool Use Agents",
                            description: "Agenten, die externe Werkzeuge über Prompts nutzen.",
                            aliases: ["External Tool Use"],
                            sources: ["Schulhoff et al."],
                            relatedTechniques: ["react"],
                            example: "Ein LLM dazu bringen, eine Taschenrechner-API zu verwenden.",
                            useCase: "Komplexe Aufgaben, die externe Ressourcen benötigen."
                        },
                        {
                            id: "agent_based_prompting",
                            name: "Agent-based Prompting",
                            description: "Verwendung von GenAI-Systemen, die Werkzeuge, Umgebungen, Gedächtnis oder Planung über Prompts einsetzen.",
                            aliases: ["Agent Prompting"],
                            sources: ["Schulhoff et al."],
                            relatedTechniques: ["tool_use_agents"],
                            example: "Ein LLM dazu bringen, einen mehrstufigen Arbeitsablauf zu planen und auszuführen.",
                            useCase: "Autonome oder halbautonome Aufgabenausführung."
                        },
                    ]
                },
                {
                    id: "self-improvement",
                    techniques: [
                        {
                            id: "self_consistency",
                            name: "Self-Consistency",
                            description: "Mehrere Argumentationswege abtasten und Mehrheitsentscheidung für die finale Antwort verwenden.",
                            aliases: ["Majority Vote Reasoning"],
                            sources: ["Wang et al.", "Schulhoff et al."],
                            relatedTechniques: ["chain_of_thought"],
                            example: "Mehrere Lösungen generieren, dann die häufigste Antwort auswählen.",
                            useCase: "Reduzierung von Fehlern bei komplexer Argumentation."
                        },
                    ]
                },
                {
                    id: "prompt-optimization",
                    techniques: [
                        {
                            id: "ape",
                            name: "APE (Automatic Prompt Engineer)",
                            description: "Framework, das ein LLM zur automatischen Generierung und Auswahl effektiver Anweisungen verwendet.",
                            aliases: ["Automatic Prompt Engineering"],
                            sources: ["Zhou et al."],
                            relatedTechniques: ["prompt_optimization"],
                            example: "Mehrere Prompt-Kandidaten generieren und bewerten.",
                            useCase: "Automatisierung des Prompt-Designs."
                        },
                        {
                            id: "prompt_paraphrasing",
                            name: "Prompt Paraphrasing",
                            description: "Prompt-Variationen durch Umformulierung generieren.",
                            aliases: ["Prompt Variation"],
                            sources: ["Schulhoff et al."],
                            relatedTechniques: [],
                            example: "Einen Prompt auf verschiedene Weise umformulieren, um den besten zu finden.",
                            useCase: "Erkundung der Prompt-Vielfalt."
                        },
                        {
                            id: "directional_stimulus_prompting",
                            name: "Directional Stimulus Prompting",
                            description: "Modell-Ausgaben durch Bereitstellung von Richtungshinweisen lenken, die die Generierung in Richtung gewünschter Eigenschaften steuern.",
                            aliases: ["DSP", "Steering Prompts"],
                            sources: ["Li et al. (2023)", "Khattab et al. (2023)"],
                            relatedTechniques: ["prompt_paraphrasing"],
                            example: "Um Text formeller zu machen: 'Schreiben Sie eine Antwort, die professionell ist, anspruchsvolles Vokabular verwendet und Umgangssprache vermeidet.'",
                            useCase: "Kontrolle von Stil, Ton, Komplexität oder anderen qualitativen Aspekten des generierten Inhalts.",
                            tips: "Verwenden Sie konkrete, spezifische Anweisungen anstatt vager Instruktionen. Kombinieren Sie mehrere Steuerungshinweise für präzisere Kontrolle. Testen Sie verschiedene Formulierungen, um optimale Lenkungssprache zu finden.",
                            commonMistakes: "Verwendung widersprüchlicher Anweisungen, die das Modell verwirren. Zu vage in den Richtungshinweisen sein. Überlastung mit zu vielen Steuerungsattributen auf einmal."
                        }
                    ]
                }
            ]
        };

        // Check if URL contains search or category parameters
        this.loadStateFromURL();
    }

    /**
     * Initialize search functionality
     */
    initSearch() {
        const searchInput = document.getElementById('technique-search');
        if (!searchInput) return;
        
        searchInput.addEventListener('input', (e) => {
            this.searchTerm = e.target.value.trim().toLowerCase();
            this.displayTechniques();
            this.updateURLFromState();
            
            // Show/hide clear button
            const clearButton = document.querySelector('.clear-search');
            if (clearButton) {
                clearButton.style.display = this.searchTerm ? 'block' : 'none';
            }
        });
        
        // Clear search button
        const clearButton = document.querySelector('.clear-search');
        if (clearButton) {
            clearButton.addEventListener('click', () => {
                searchInput.value = '';
                this.searchTerm = '';
                this.displayTechniques();
                this.updateURLFromState();
                clearButton.style.display = 'none';
            });
        }
    }

    /**
     * Initialize category filter buttons
     */
    /**
     * Initialize category filter buttons.
     * Ensures that filter buttons' data-category attributes match the category IDs in categoriesData.
     * If a mismatch is detected, a warning is logged to the console.
     */
    initCategoryButtons() {
        const categoryButtons = document.querySelectorAll('.category-button');
        if (categoryButtons.length === 0) return;

        // Build a set of valid category IDs from the loaded data
        const validCategoryIds = new Set(
            (this.categoriesData?.categories || []).map(cat => cat.id)
        );

        // Check for mismatches between button data-category and known category IDs
        categoryButtons.forEach(btn => {
            if (!validCategoryIds.has(btn.dataset.category)) {
                console.warn(
                    `[TaxonomyDataLoader] Kategorie-Button mit data-category="${btn.dataset.category}" stimmt mit keiner bekannten Kategorie-ID überein.`
                );
            }
        });

        // Helper to update active class on all buttons
        const updateActiveCategoryButtons = () => {
            categoryButtons.forEach(btn => {
                if (btn.dataset.category === this.currentCategory) {
                    btn.classList.add('active');
                } else {
                    btn.classList.remove('active');
                }
            });
        };

        categoryButtons.forEach(button => {
            button.addEventListener('click', () => {
                // Toggle current selection
                if (button.dataset.category === this.currentCategory) {
                    this.currentCategory = null; // Deselect
                } else {
                    this.currentCategory = button.dataset.category;
                }
                updateActiveCategoryButtons();
                this.displayTechniques();
                this.updateURLFromState();
            });
        });

        // Set initial active state based on currentCategory
        updateActiveCategoryButtons();

        // Reset filters button
        const resetFiltersButton = document.getElementById('reset-filters');
        if (resetFiltersButton) {
            resetFiltersButton.addEventListener('click', () => {
                // Clear search
                const searchInput = document.getElementById('technique-search');
                if (searchInput) searchInput.value = '';
                this.searchTerm = '';

                // Clear category selection
                this.currentCategory = null;
                updateActiveCategoryButtons();

                this.displayTechniques();
                this.updateURLFromState();

                const clearButton = document.querySelector('.clear-search');
                if (clearButton) clearButton.style.display = 'none';
            });
        }
    }

    /**
     * Initialize view toggle (cards/list)
     */
    initViewToggle() {
        const cardViewButton = document.getElementById('card-view-toggle');
        const listViewButton = document.getElementById('list-view-toggle');
        
        if (!cardViewButton || !listViewButton) return;
        
        // Set initial state
        if (this.currentView === 'cards') {
            cardViewButton.classList.add('active');
        } else {
            listViewButton.classList.add('active');
        }
        
        // Card view toggle
        cardViewButton.addEventListener('click', () => {
            this.currentView = 'cards';
            cardViewButton.classList.add('active');
            listViewButton.classList.remove('active');
            this.displayTechniques();
        });
        
        // List view toggle
        listViewButton.addEventListener('click', () => {
            this.currentView = 'list';
            listViewButton.classList.add('active');
            cardViewButton.classList.remove('active');
            this.displayTechniques();
        });
    }

    /**
     * Initialize modal handlers for technique details
     */
    initModalHandlers() {
        const modal = document.getElementById('technique-modal');
        if (!modal) return;
        
        // Close button
        const closeButton = modal.querySelector('.close');
        if (closeButton) {
            closeButton.addEventListener('click', () => {
                modal.style.display = 'none';
            });
        }
        
        // Close when clicking outside the modal
        window.addEventListener('click', (event) => {
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        });
        
        // Close on escape key
        window.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && modal.style.display === 'block') {
                modal.style.display = 'none';
            }
        });
    }

    /**
     * Get filtered techniques based on current search and category
     */
    getFilteredTechniques() {
        if (!this.techniquesData || !this.categoriesData) return [];
        
        let filteredTechniques = [];
        
        // Start by filtering techniques
        this.categoriesData.categories.forEach(category => {
            // If a category is selected and doesn't match, skip
            if (this.currentCategory && this.currentCategory !== category.id) {
                return;
            }
            
            // Find the corresponding techniques in the techniques data
            const categoryInTechData = this.techniquesData.categories.find(c => c.id === category.id);
            if (!categoryInTechData) return;
            
            // Add techniques from this category
            categoryInTechData.techniques.forEach(technique => {
                // Apply search filter if search term exists
                if (this.searchTerm) {
                    // Search in name, description, and aliases
                    const nameMatch = technique.name.toLowerCase().includes(this.searchTerm);
                    const descMatch = technique.description?.toLowerCase().includes(this.searchTerm);
                    const aliasMatch = technique.aliases?.some(alias => 
                        alias.toLowerCase().includes(this.searchTerm)
                    );
                    
                    if (!(nameMatch || descMatch || aliasMatch)) {
                        return;
                    }
                }
                
                // Add category information to the technique
                filteredTechniques.push({
                    ...technique,
                    categoryId: category.id,
                    categoryName: category.name
                });
            });
        });
        
        return filteredTechniques;
    }

    /**
     * Display techniques based on current filters and view
     */
    /**
     * Display techniques based on current filters and view.
     */
    displayTechniques() {
        const techniquesContainer = document.getElementById('techniques-container');
        if (!techniquesContainer) return;

        // Get filtered techniques
        const filteredTechniques = this.getFilteredTechniques();

        // Show no results message if no techniques found
        if (filteredTechniques.length === 0) {
            techniquesContainer.innerHTML = `
                <div class="no-results">
                    <p>Keine Techniken gefunden, die Ihren Kriterien entsprechen.</p>
                    <button id="reset-filters">Filter zurücksetzen</button>
                </div>
            `;

            // Attach event listener to the newly created reset button
            const resetButton = document.getElementById('reset-filters');
            if (resetButton) {
                resetButton.addEventListener('click', () => {
                    // Clear search
                    const searchInput = document.getElementById('technique-search');
                    if (searchInput) searchInput.value = '';
                    this.searchTerm = '';

                    // Clear category selection
                    document.querySelectorAll('.category-button').forEach(btn =>
                        btn.classList.remove('active')
                    );
                    this.currentCategory = null;

                    this.displayTechniques();
                    this.updateURLFromState();
                });
            }

            return;
        }

        // Clear container
        techniquesContainer.innerHTML = '';

        // Add appropriate class for view type
        techniquesContainer.className = this.currentView === 'cards' ? 'cards-view' : 'list-view';

        // Render techniques based on view type
        if (this.currentView === 'cards') {
            this.renderCardsView(techniquesContainer, filteredTechniques);
        } else {
            this.renderListView(techniquesContainer, filteredTechniques);
        }

        // Add click handlers to technique items
        this.addTechniqueClickHandlers();
    }

    /**
     * Render techniques in cards view
     */
    /**
     * Render techniques in cards view
     * @param {HTMLElement} container
     * @param {Array} techniques
     */
    renderCardsView(container, techniques) {
        // If no cards, nothing to render
        if (techniques.length === 0) return;

        // Render all cards at once (original behavior)
        techniques.forEach(technique => {
            const card = document.createElement('div');
            card.className = 'technique-card';
            card.dataset.id = technique.id;

            // Get icon based on category
            const iconClass = this.getCategoryIcon(technique.categoryId);
            
            // Prepare mini-lesson content if available
            const whenToUse = technique.useCase ? `
                <div class="mini-lesson-section">
                    <h4><i class="fas fa-lightbulb"></i> Wann verwenden</h4>
                    <div class="when-to-use">${technique.useCase}</div>
                </div>
            ` : '';
            
            const example = technique.example ? `
                <div class="mini-lesson-section">
                    <h4><i class="fas fa-code"></i> Beispiel</h4>
                    <div class="example-block">${technique.example}</div>
                </div>
            ` : '';
            
            // Add tips and common mistakes if they exist in the technique data
            const tips = technique.tips ? `
                <div class="mini-lesson-section">
                    <h4><i class="fas fa-check-circle"></i> Tipps</h4>
                    <div class="tips-block">${technique.tips}</div>
                </div>
            ` : '';
            
            const mistakes = technique.commonMistakes ? `
                <div class="mini-lesson-section">
                    <h4><i class="fas fa-exclamation-triangle"></i> Häufige Fehler</h4>
                    <div class="common-mistakes">${technique.commonMistakes}</div>
                </div>
            ` : '';

            card.innerHTML = `
                <div class="card-content">
                    <span class="category-tag">${technique.categoryName}</span>
                    <h3>
                        <div class="technique-icon"><i class="${iconClass}"></i></div>
                        ${technique.name}
                    </h3>
                    <p>${this.truncateText(technique.description, 120)}</p>
                    ${whenToUse}
                    ${example}
                    ${tips}
                    ${mistakes}
                    ${technique.sources ? `
                    <div class="sources">
                        Quellen: ${technique.sources.join(', ')}
                    </div>` : ''}
                </div>
            `;

            container.appendChild(card);
            
            // Add click handler directly to each card
            card.addEventListener('click', () => {
                this.showTechniqueDetails(technique.id);
            });
        });

        // Remove any keyboard navigation handlers from previous renders
        if (this._cardNavKeyHandler) {
            window.removeEventListener('keydown', this._cardNavKeyHandler);
            this._cardNavKeyHandler = null;
        }
    }

    /**
     * Render techniques in list view
     */
    renderListView(container, techniques) {
        techniques.forEach(technique => {
            const listItem = document.createElement('div');
            listItem.className = 'technique-list-item';
            listItem.dataset.id = technique.id;
            
            listItem.innerHTML = `
                <div class="technique-list-info">
                    <h3>${technique.name}</h3>
                    <div class="technique-list-details">
                        <!-- Always use the mapped categoryName for the tag to ensure consistency with filter buttons -->
                        <span class="category-tag">${technique.categoryName}</span>
                        ${technique.sources ? `<span>${technique.sources.length} Quelle${technique.sources.length > 1 ? 'n' : ''}</span>` : ''}
                    </div>
                </div>
                <div class="technique-list-action">
                    <i class="fas fa-chevron-right"></i>
                </div>
            `;
            
            container.appendChild(listItem);
        });
    }

    /**
     * Add click event handlers to technique items
     */
    addTechniqueClickHandlers() {
        // Card view handlers
        document.querySelectorAll('.technique-card').forEach(card => {
            card.addEventListener('click', () => {
                this.showTechniqueDetails(card.dataset.id);
            });
        });
        
        // List view handlers
        document.querySelectorAll('.technique-list-item').forEach(item => {
            item.addEventListener('click', () => {
                this.showTechniqueDetails(item.dataset.id);
            });
        });
    }

    /**
     * Show technique details in modal
     */
    showTechniqueDetails(techniqueId) {
        const modal = document.getElementById('technique-modal');
        if (!modal) return;

        // Get the filtered/visible techniques list
        const filteredTechniques = this.getFilteredTechniques();
        // Find the index of the current technique in the filtered list
        const currentIndex = filteredTechniques.findIndex(t => t.id === techniqueId);

        // Find the technique and category name as before
        let technique = null;
        let categoryName = '';
        let categoryId = '';
        for (const category of this.techniquesData.categories) {
            const found = category.techniques.find(t => t.id === techniqueId);
            if (found) {
                technique = found;
                categoryId = category.id;
                const categoryData = this.categoriesData.categories.find(c => c.id === category.id);
                categoryName = categoryData ? categoryData.name : category.id;
                break;
            }
        }

        if (!technique) {
            console.error('Technik nicht gefunden:', techniqueId);
            return;
        }

        // Get icon based on category
        const iconClass = this.getCategoryIcon(categoryId);

        // Populate modal content
        document.getElementById('modal-technique-name').innerHTML = `
            <span class="modal-technique-icon"><i class="${iconClass}"></i></span>
            ${technique.name}
        `;
        document.getElementById('modal-technique-category').textContent = categoryName;

        // Description
        document.getElementById('modal-technique-description').textContent = technique.description;

        // Aliases (if any)
        const aliasesSection = document.getElementById('modal-aliases-section');
        const aliasesContent = document.getElementById('modal-technique-aliases');
        if (technique.aliases && technique.aliases.length > 0) {
            aliasesContent.textContent = technique.aliases.join(', ');
            aliasesSection.style.display = 'block';
        } else {
            aliasesSection.style.display = 'none';
        }

        // Sources
        const sourcesSection = document.getElementById('modal-sources-section');
        const sourcesContent = document.getElementById('modal-technique-sources');
        if (technique.sources && technique.sources.length > 0) {
            sourcesContent.innerHTML = '';
            technique.sources.forEach(source => {
                const li = document.createElement('li');
                li.textContent = source;
                sourcesContent.appendChild(li);
            });
            sourcesSection.style.display = 'block';
        } else {
            sourcesSection.style.display = 'none';
        }

        // Related techniques
        const relatedSection = document.getElementById('modal-related-section');
        const relatedContent = document.getElementById('modal-related-techniques');
        if (technique.relatedTechniques && technique.relatedTechniques.length > 0) {
            relatedContent.innerHTML = '';
            technique.relatedTechniques.forEach(relatedId => {
                const span = document.createElement('span');
                span.className = 'related-technique';
                span.dataset.id = relatedId;
                // Find the name of the related technique
                let relatedName = relatedId;
                for (const category of this.techniquesData.categories) {
                    const related = category.techniques.find(t => t.id === relatedId);
                    if (related) {
                        relatedName = related.name;
                        break;
                    }
                }
                span.textContent = relatedName;
                relatedContent.appendChild(span);
            });
            relatedSection.style.display = 'block';
            document.querySelectorAll('.related-technique').forEach(item => {
                item.addEventListener('click', () => {
                    this.showTechniqueDetails(item.dataset.id);
                });
            });
        } else {
            relatedSection.style.display = 'none';
        }

        // Example
        const exampleSection = document.getElementById('modal-example-section');
        const exampleContent = document.getElementById('modal-technique-example');
        if (technique.example) {
            exampleContent.textContent = technique.example;
            exampleSection.style.display = 'block';
            exampleSection.querySelector('h4').innerHTML = '<i class="fas fa-code"></i> Beispiel';
        } else {
            exampleSection.style.display = 'none';
        }

        // Use case
        const useCaseSection = document.getElementById('modal-usecase-section');
        const useCaseContent = document.getElementById('modal-technique-usecase');
        if (technique.useCase) {
            useCaseContent.innerHTML = `<div class="modal-when-to-use">${technique.useCase}</div>`;
            useCaseSection.style.display = 'block';
            useCaseSection.querySelector('h4').innerHTML = '<i class="fas fa-lightbulb"></i> Wann verwenden';
        } else {
            useCaseSection.style.display = 'none';
        }

        // Tips
        const tipsSection = document.getElementById('modal-tips-section');
        if (tipsSection) {
            const tipsContent = document.getElementById('modal-technique-tips');
            if (technique.tips) {
                tipsContent.innerHTML = `<div class="modal-tips-block">${technique.tips}</div>`;
                tipsSection.style.display = 'block';
            } else {
                tipsSection.style.display = 'none';
            }
        }

        // Common Mistakes
        const mistakesSection = document.getElementById('modal-mistakes-section');
        if (mistakesSection) {
            const mistakesContent = document.getElementById('modal-technique-mistakes');
            if (technique.commonMistakes) {
                mistakesContent.innerHTML = `<div class="modal-common-mistakes">${technique.commonMistakes}</div>`;
                mistakesSection.style.display = 'block';
            } else {
                mistakesSection.style.display = 'none';
            }
        }

        // --- Modal Navigation Arrows ---
        // Remove any existing nav container to avoid duplicates
        let navContainer = document.getElementById('modal-nav-arrows');
        if (navContainer) {
            navContainer.remove();
        }
        // Only show arrows if there is more than one visible technique
        if (filteredTechniques.length > 1 && currentIndex !== -1) {
            navContainer = document.createElement('div');
            navContainer.id = 'modal-nav-arrows';
            navContainer.style.display = 'flex';
            navContainer.style.justifyContent = 'space-between';
            navContainer.style.alignItems = 'center';
            navContainer.style.margin = '16px 0 0 0';

            // Left arrow
            const leftBtn = document.createElement('button');
            leftBtn.className = 'modal-nav modal-nav-left';
            leftBtn.innerHTML = '&larr;';
            leftBtn.setAttribute('aria-label', 'Vorherige Technik');
            leftBtn.disabled = currentIndex === 0;
            leftBtn.style.fontSize = '1.5em';
            leftBtn.style.padding = '0.5em 1em';
            leftBtn.style.opacity = leftBtn.disabled ? '0.5' : '1.0';
            leftBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (currentIndex > 0) {
                    this.showTechniqueDetails(filteredTechniques[currentIndex - 1].id);
                }
            });

            // Progress indicator
            const progress = document.createElement('span');
            progress.className = 'modal-nav-progress';
            progress.textContent = `Technik ${currentIndex + 1} von ${filteredTechniques.length}`;
            progress.style.flex = '1';
            progress.style.textAlign = 'center';
            progress.style.fontWeight = 'bold';

            // Right arrow
            const rightBtn = document.createElement('button');
            rightBtn.className = 'modal-nav modal-nav-right';
            rightBtn.innerHTML = '&rarr;';
            rightBtn.setAttribute('aria-label', 'Nächste Technik');
            rightBtn.disabled = currentIndex === filteredTechniques.length - 1;
            rightBtn.style.fontSize = '1.5em';
            rightBtn.style.padding = '0.5em 1em';
            rightBtn.style.opacity = rightBtn.disabled ? '0.5' : '1.0';
            rightBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (currentIndex < filteredTechniques.length - 1) {
                    this.showTechniqueDetails(filteredTechniques[currentIndex + 1].id);
                }
            });

            navContainer.appendChild(leftBtn);
            navContainer.appendChild(progress);
            navContainer.appendChild(rightBtn);

            // Insert navContainer at the end of modal-content
            const modalContent = modal.querySelector('.modal-content');
            if (modalContent) {
                modalContent.appendChild(navContainer);
            }
        }

        // Show the modal
        modal.style.display = 'block';
    }

    /**
     * Truncate text to specified length with ellipsis
     */
    truncateText(text, maxLength) {
        if (!text) return '';
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    }

    /**
     * Update URL based on current state (for bookmarking)
     */
    updateURLFromState() {
        const searchParams = new URLSearchParams();
        
        if (this.searchTerm) {
            searchParams.set('q', this.searchTerm);
        }
        
        if (this.currentCategory) {
            searchParams.set('category', this.currentCategory);
        }
        
        if (this.currentView !== 'cards') {
            searchParams.set('view', this.currentView);
        }
        
        const newUrl = window.location.pathname + 
            (searchParams.toString() ? '?' + searchParams.toString() : '');
        
        history.pushState({ 
            searchTerm: this.searchTerm,
            category: this.currentCategory,
            view: this.currentView
        }, '', newUrl);
    }

    /**
     * Load state from URL parameters
     */
    loadStateFromURL() {
        const searchParams = new URLSearchParams(window.location.search);
        
        // Get search term
        const queryParam = searchParams.get('q');
        if (queryParam) {
            this.searchTerm = queryParam.toLowerCase();
            const searchInput = document.getElementById('technique-search');
            if (searchInput) {
                searchInput.value = queryParam;
            }
        }
        
        // Get category
        const categoryParam = searchParams.get('category');
        if (categoryParam) {
            this.currentCategory = categoryParam;
        }
        
        // Get view
        const viewParam = searchParams.get('view');
        if (viewParam && (viewParam === 'cards' || viewParam === 'list')) {
            this.currentView = viewParam;
        }
    }

    /**
     * Handle URL changes (browser history navigation)
     */
    handleURLChange(event) {
        if (event.state) {
            this.searchTerm = event.state.searchTerm || '';
            this.currentCategory = event.state.category || null;
            this.currentView = event.state.view || 'cards';
            
            // Update search input
            const searchInput = document.getElementById('technique-search');
            if (searchInput) {
                searchInput.value = this.searchTerm;
            }
            
            // Update category buttons
            document.querySelectorAll('.category-button').forEach(btn => {
                if (btn.dataset.category === this.currentCategory) {
                    btn.classList.add('active');
                } else {
                    btn.classList.remove('active');
                }
            });
            
            // Update view toggle
            const cardViewButton = document.getElementById('card-view-toggle');
            const listViewButton = document.getElementById('list-view-toggle');
            
            if (cardViewButton && listViewButton) {
                if (this.currentView === 'cards') {
                    cardViewButton.classList.add('active');
                    listViewButton.classList.remove('active');
                } else {
                    listViewButton.classList.add('active');
                    cardViewButton.classList.remove('active');
                }
            }
            
            // Refresh the display
            this.displayTechniques();
        } else {
            // Handle case when there's no state (e.g., initial load)
            this.loadStateFromURL();
            this.displayTechniques();
        }
    }

    /**
     * Fehlermeldung dem Benutzer anzeigen
     */
    showError(message) {
        const container = document.getElementById('techniques-container');
        if (container) {
            container.innerHTML = `
                <div class="error-message">
                    <p><i class="fas fa-exclamation-triangle"></i> ${message}</p>
                </div>
            `;
        } else {
            console.error(message);
        }
    }
    /**
     * Get appropriate icon class based on category ID
     * @param {string} categoryId
     * @returns {string} Font Awesome icon class
     */
    getCategoryIcon(categoryId) {
        const iconMap = {
            'basic-concepts': 'fas fa-book',
            'reasoning-frameworks': 'fas fa-brain',
            'agent-tool-use': 'fas fa-robot',
            'self-improvement': 'fas fa-chart-line',
            'retrieval-augmentation': 'fas fa-database',
            'prompt-optimization': 'fas fa-sliders-h'
        };
        
        return iconMap[categoryId] || 'fas fa-lightbulb';
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const taxonomyLoader = new TaxonomyDataLoader();
    taxonomyLoader.init();
});
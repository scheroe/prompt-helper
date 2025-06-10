/**
 * TechniqueUIManager - Verwaltet UI-Elemente für Techniken
 */
class TechniqueUIManager {
    constructor(techniqueManager, uiMessageManager) {
        this.techniqueManager = techniqueManager;
        this.uiMessageManager = uiMessageManager;
        
        // Initialize taxonomy data loader for rich technique data
        this.taxonomyLoader = null;
        this.initTaxonomyData();
        
        // State management for dropdown operations
        this.dropdownState = new Map(); // techniqueId -> { isOpen, isAnimating }
        this.animationTimeouts = new Map(); // techniqueId -> timeoutId
    }

    /**
     * Initialize taxonomy data from the main data loader
     */
    async initTaxonomyData() {
        try {
            // Use the same data as the index page
            this.taxonomyLoader = new TaxonomyDataLoader();
            this.taxonomyLoader.init();
        } catch (error) {
            console.error('Failed to initialize taxonomy data:', error);
        }
    }

    /**
     * Create technique selector elements
     */
    createTechniqueSelectors() {
        const container = document.getElementById('technique-selector');
        if (!container) {
            console.error('Technique selector container not found');
            return;
        }

        // Use taxonomy data if available, otherwise fallback to technique manager
        if (this.taxonomyLoader && this.taxonomyLoader.categoriesData && this.taxonomyLoader.techniquesData) {
            this.createTechniqueSelectorsFromTaxonomy(container);
        } else {
            // Fallback to original technique manager data
            this.createTechniqueSelectorsFromManager(container);
        }
    }

    /**
     * Create technique selectors using rich taxonomy data
     */
    createTechniqueSelectorsFromTaxonomy(container) {
        const categories = this.taxonomyLoader.categoriesData.categories;
        const techniquesData = this.taxonomyLoader.techniquesData.categories;

        console.log('Creating technique selectors using taxonomy data:', categories.length, 'categories');

        // Clear existing content
        container.innerHTML = '';

        categories.forEach(category => {
            // Find techniques for this category
            const categoryTechniques = techniquesData.find(tc => tc.id === category.id);
            if (!categoryTechniques || !categoryTechniques.techniques.length) {
                return;
            }

            // Create category section
            const categorySection = document.createElement('div');
            categorySection.className = 'technique-category-section';
            categorySection.dataset.categoryId = category.id;

            // Category header
            const categoryHeader = document.createElement('h3');
            categoryHeader.className = 'category-header';
            categoryHeader.textContent = category.name;
            categorySection.appendChild(categoryHeader);

            // Techniques list
            const techniquesList = document.createElement('div');
            techniquesList.className = 'technique-list';

            categoryTechniques.techniques.forEach(technique => {
                const techniqueItem = document.createElement('div');
                techniqueItem.className = 'technique-card-item';
                techniqueItem.dataset.id = technique.id;
                techniqueItem.dataset.category = category.id;

                // Create technique content container
                const techniqueContent = document.createElement('div');
                techniqueContent.className = 'technique-content';
                
                // Technique name (larger, in own line)
                const techniqueName = document.createElement('h4');
                techniqueName.className = 'technique-name';
                techniqueName.textContent = technique.name;
                
                // Technique description (smaller, below name)
                const techniqueDescription = document.createElement('p');
                techniqueDescription.className = 'technique-description';
                techniqueDescription.textContent = this.truncateText(technique.description, 120);

                // Dropdown arrow
                const dropdownArrow = document.createElement('div');
                dropdownArrow.className = 'technique-dropdown-arrow';
                dropdownArrow.innerHTML = '<i class="fas fa-chevron-down"></i>';
                dropdownArrow.setAttribute('aria-label', `Details zu ${technique.name}`);

                techniqueContent.appendChild(techniqueName);
                techniqueContent.appendChild(techniqueDescription);
                
                techniqueItem.appendChild(techniqueContent);
                techniqueItem.appendChild(dropdownArrow);
                
                // Note: Click handlers are managed by UIEventHandler
                
                techniquesList.appendChild(techniqueItem);
            });

            categorySection.appendChild(techniquesList);
            container.appendChild(categorySection);
        });
    }

    /**
     * Fallback: Create technique selectors using technique manager data
     */
    createTechniqueSelectorsFromManager(container) {
        const categories = this.techniqueManager.getTechniquesByCategory();
        console.log('Creating technique selectors for categories:', Object.keys(categories));

        // Clear existing content
        container.innerHTML = '';

        Object.values(categories).forEach(category => {
            // Create category section
            const categorySection = document.createElement('div');
            categorySection.className = 'technique-category-section';
            categorySection.dataset.categoryId = category.id;

            // Category header
            const categoryHeader = document.createElement('h3');
            categoryHeader.className = 'category-header';
            categoryHeader.textContent = category.name;
            categorySection.appendChild(categoryHeader);

            // Techniques list
            const techniquesList = document.createElement('div');
            techniquesList.className = 'technique-list';

            category.techniques.forEach(technique => {
                const techniqueItem = document.createElement('div');
                techniqueItem.className = 'technique-card-item';
                techniqueItem.dataset.id = technique.id;
                techniqueItem.dataset.category = category.id;

                // Create technique content container
                const techniqueContent = document.createElement('div');
                techniqueContent.className = 'technique-content';
                
                // Technique name (larger, in own line)
                const techniqueName = document.createElement('h4');
                techniqueName.className = 'technique-name';
                techniqueName.textContent = technique.name;
                
                // Technique description (smaller, below name)
                const techniqueDescription = document.createElement('p');
                techniqueDescription.className = 'technique-description';
                techniqueDescription.textContent = technique.description;

                // Dropdown arrow
                const dropdownArrow = document.createElement('div');
                dropdownArrow.className = 'technique-dropdown-arrow';
                dropdownArrow.innerHTML = '<i class="fas fa-chevron-down"></i>';
                dropdownArrow.setAttribute('aria-label', `Details zu ${technique.name}`);

                techniqueContent.appendChild(techniqueName);
                techniqueContent.appendChild(techniqueDescription);
                
                techniqueItem.appendChild(techniqueContent);
                techniqueItem.appendChild(dropdownArrow);
                
                // Note: Click handlers are managed by UIEventHandler
                
                techniquesList.appendChild(techniqueItem);
            });

            categorySection.appendChild(techniquesList);
            container.appendChild(categorySection);
        });
    }

    /**
     * Truncate text to specified length
     */
    truncateText(text, maxLength) {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    }

    /**
     * Update the selected techniques list UI
     */
    updateSelectedTechniques() {
        const container = document.getElementById('selected-techniques');
        if (!container) return;

        container.innerHTML = '';

        if (this.techniqueManager.selectedTechniques.length === 0) {
            container.innerHTML = '<p class="empty-state">Keine Techniken ausgewählt. Wählen Sie Techniken aus der Liste, um Ihren Prompt zu erstellen.</p>';
            return;
        }

        // Create list of selected techniques
        const techniqueList = document.createElement('div');
        techniqueList.className = 'selected-techniques-list';

        this.techniqueManager.selectedTechniques.forEach(techniqueId => {
            const technique = this.techniqueManager.getTechnique(techniqueId);
            if (!technique) return;

            const techniqueItem = document.createElement('div');
            techniqueItem.className = 'selected-technique-item';

            // Create remove button
            const removeButton = document.createElement('button');
            removeButton.className = 'remove-technique-button';
            removeButton.innerHTML = '<i class="fas fa-times"></i>';
            removeButton.title = 'Technik entfernen';

            // Create technique info
            const techniqueInfo = document.createElement('div');
            techniqueInfo.className = 'technique-info';
            techniqueInfo.innerHTML = `
                <span class="technique-name">${technique.name}</span>
                <span class="technique-category">${technique.categoryName}</span>
            `;

            techniqueItem.appendChild(removeButton);
            techniqueItem.appendChild(techniqueInfo);
            techniqueList.appendChild(techniqueItem);
        });

        container.appendChild(techniqueList);
        
        // Update visual selection state of technique cards
        this.updateTechniqueCardsSelectionState();
    }
    
    /**
     * Update visual selection state of technique cards
     */
    updateTechniqueCardsSelectionState() {
        // Reset all cards
        document.querySelectorAll('.technique-card-item').forEach(card => {
            card.classList.remove('selected');
        });
        
        // Mark selected techniques
        this.techniqueManager.selectedTechniques.forEach(techniqueId => {
            const card = document.querySelector(`[data-id="${techniqueId}"]`);
            if (card) {
                card.classList.add('selected');
            }
        });
    }

    /**
     * Update auto-selected techniques in UI when template is selected
     */
    updateAutoSelectedTechniques(templateId, templateManager) {
        const relatedTechniques = templateManager.getRelatedTechniques(templateId);
        
        relatedTechniques.forEach(techniqueId => {
            const techniqueElement = document.querySelector(`[data-id="${techniqueId}"]`);
            if (techniqueElement) {
                techniqueElement.classList.add('auto-selected');
                
                // Check the checkbox
                const checkbox = techniqueElement.querySelector('input[type="checkbox"]');
                if (checkbox && !checkbox.checked) {
                    checkbox.checked = true;
                }
            }
        });
        
        // Update the selected techniques display
        this.updateSelectedTechniques();
    }

    /**
     * Update auto-deselected techniques in UI when template is removed
     */
    updateAutoDeselectedTechniques(templateId, templateManager) {
        const relatedTechniques = templateManager.getRelatedTechniques(templateId);
        
        // Check which techniques are still needed by other templates
        const stillNeededTechniques = new Set();
        templateManager.selectedTemplates.forEach(selectedTemplateId => {
            if (selectedTemplateId !== templateId) {
                const techniques = templateManager.getRelatedTechniques(selectedTemplateId);
                techniques.forEach(techniqueId => stillNeededTechniques.add(techniqueId));
            }
        });
        
        // Remove auto-selected marking for techniques no longer needed
        relatedTechniques.forEach(techniqueId => {
            if (!stillNeededTechniques.has(techniqueId)) {
                const techniqueElement = document.querySelector(`[data-id="${techniqueId}"]`);
                if (techniqueElement) {
                    techniqueElement.classList.remove('auto-selected');
                    
                    // Uncheck the checkbox
                    const checkbox = techniqueElement.querySelector('input[type="checkbox"]');
                    if (checkbox) {
                        checkbox.checked = false;
                    }
                }
            }
        });
        
        // Update the selected techniques display
        this.updateSelectedTechniques();
    }

    /**
     * Update technique count badge
     */
    updateTechniqueCount() {
        const countBadge = document.getElementById('technique-count');
        if (countBadge && this.techniqueManager) {
            const count = this.techniqueManager.selectedTechniques.length;
            countBadge.textContent = count;
            countBadge.style.display = count > 0 ? 'inline' : 'none';
        }
    }

    /**
     * Filter techniques based on search and category
     */
    filterTechniques(searchTerm = '', category = null) {
        const techniqueItems = document.querySelectorAll('.technique-card-item');
        
        techniqueItems.forEach(item => {
            const techniqueId = item.dataset.id;
            let technique = null;
            
            // Try to get technique from taxonomy data first
            if (this.taxonomyLoader && this.taxonomyLoader.techniquesData) {
                for (const cat of this.taxonomyLoader.techniquesData.categories) {
                    const found = cat.techniques.find(t => t.id === techniqueId);
                    if (found) {
                        technique = found;
                        technique.categoryId = cat.id;
                        break;
                    }
                }
            }
            
            // Fallback to technique manager
            if (!technique) {
                technique = this.techniqueManager.getTechnique(techniqueId);
            }
            
            if (!technique) return;

            let showItem = true;

            // Apply search filter
            if (searchTerm) {
                const searchLower = searchTerm.toLowerCase();
                const nameMatch = technique.name.toLowerCase().includes(searchLower);
                const descMatch = technique.description.toLowerCase().includes(searchLower);
                showItem = nameMatch || descMatch;
            }

            // Apply category filter
            if (category && category !== 'all') {
                showItem = showItem && technique.categoryId === category;
            }

            item.style.display = showItem ? 'block' : 'none';
        });
    }

    /**
     * Handle technique selection
     */
    onTechniqueSelected(checkbox) {
        const techniqueId = checkbox.value;
        const isChecked = checkbox.checked;

        if (isChecked) {
            // Try to add from taxonomy data first
            if (this.taxonomyLoader && this.taxonomyLoader.techniquesData) {
                let technique = null;
                let categoryName = '';
                
                // Find technique in taxonomy data
                for (const category of this.taxonomyLoader.techniquesData.categories) {
                    const found = category.techniques.find(t => t.id === techniqueId);
                    if (found) {
                        technique = found;
                        const categoryInfo = this.taxonomyLoader.categoriesData.categories.find(c => c.id === category.id);
                        categoryName = categoryInfo ? categoryInfo.name : category.id;
                        break;
                    }
                }
                
                if (technique) {
                    // Add technique with taxonomy data
                    this.techniqueManager.addTechniqueFromTaxonomy(technique, categoryName);
                } else {
                    // Fallback to regular add
                    this.techniqueManager.addTechnique(techniqueId);
                }
            } else {
                this.techniqueManager.addTechnique(techniqueId);
            }
        } else {
            this.techniqueManager.removeTechnique(techniqueId);
        }

        this.updateSelectedTechniques();
        return { techniqueId, isChecked };
    }

    /**
     * Handle technique card click (selection)
     */
    onTechniqueCardClick(techniqueId) {
        const techniqueCard = document.querySelector(`[data-id="${techniqueId}"]`);
        if (!techniqueCard) return;

        const isSelected = techniqueCard.classList.contains('selected');
        
        if (isSelected) {
            // Deselect
            techniqueCard.classList.remove('selected');
            this.techniqueManager.removeTechnique(techniqueId);
        } else {
            // Select
            techniqueCard.classList.add('selected');
            
            // Try to add from taxonomy data first
            if (this.taxonomyLoader && this.taxonomyLoader.techniquesData) {
                let technique = null;
                let categoryName = '';
                
                // Find technique in taxonomy data
                for (const category of this.taxonomyLoader.techniquesData.categories) {
                    const found = category.techniques.find(t => t.id === techniqueId);
                    if (found) {
                        technique = found;
                        const categoryInfo = this.taxonomyLoader.categoriesData.categories.find(c => c.id === category.id);
                        categoryName = categoryInfo ? categoryInfo.name : category.id;
                        break;
                    }
                }
                
                if (technique) {
                    this.techniqueManager.addTechniqueFromTaxonomy(technique, categoryName);
                } else {
                    this.techniqueManager.addTechnique(techniqueId);
                }
            } else {
                this.techniqueManager.addTechnique(techniqueId);
            }
        }

        this.updateSelectedTechniques();
        return { techniqueId, isSelected: !isSelected };
    }

    /**
     * Show technique details as inline dropdown (no longer uses modal)
     */
    showTechniqueDetails(techniqueId) {
        this.toggleTechniqueDropdown(techniqueId);
    }

    /**
     * Toggle technique dropdown - shows/hides details inline
     */
    toggleTechniqueDropdown(techniqueId) {
        const techniqueCard = document.querySelector(`[data-id="${techniqueId}"]`);
        if (!techniqueCard) {
            console.error('Technique card not found for ID:', techniqueId);
            return;
        }

        const existingDropdown = techniqueCard.querySelector('.technique-dropdown');
        const dropdownArrow = techniqueCard.querySelector('.technique-dropdown-arrow i');
        
        if (existingDropdown) {
            // Close dropdown
            existingDropdown.remove();
            if (dropdownArrow) {
                dropdownArrow.className = 'fas fa-chevron-down';
            }
            console.log('🔽 Dropdown closed for:', techniqueId);
        } else {
            // Close any other open dropdowns first
            document.querySelectorAll('.technique-dropdown').forEach(dropdown => {
                dropdown.remove();
            });
            document.querySelectorAll('.technique-dropdown-arrow i').forEach(arrow => {
                arrow.className = 'fas fa-chevron-down';
            });
            
            // Open dropdown
            this.createTechniqueDropdown(techniqueCard, techniqueId);
            if (dropdownArrow) {
                dropdownArrow.className = 'fas fa-chevron-up';
            }
            console.log('🔼 Dropdown opened for:', techniqueId);
        }
    }

    /**
     * Create and insert technique dropdown content
     */
    createTechniqueDropdown(techniqueCard, techniqueId) {
        let technique = null;
        let categoryName = '';
        
        // Get technique data from taxonomy first
        if (this.taxonomyLoader && this.taxonomyLoader.techniquesData) {
            for (const category of this.taxonomyLoader.techniquesData.categories) {
                const found = category.techniques.find(t => t.id === techniqueId);
                if (found) {
                    technique = found;
                    const categoryInfo = this.taxonomyLoader.categoriesData.categories.find(c => c.id === category.id);
                    categoryName = categoryInfo ? categoryInfo.name : category.id;
                    break;
                }
            }
        }
        
        // Fallback to technique manager
        if (!technique) {
            technique = this.techniqueManager.getTechnique(techniqueId);
            categoryName = technique?.categoryName || 'Unbekannt';
        }
        
        if (!technique) {
            console.error('Technique not found:', techniqueId);
            return;
        }

        // Create dropdown element
        const dropdown = document.createElement('div');
        dropdown.className = 'technique-dropdown';
        
        // Build dropdown content (excluding duplicate description and details)
        let dropdownContent = `
            <div class="technique-dropdown-content">
        `;
        
        // Add related techniques section first (priority content)
        if (technique.relatedTechniques && technique.relatedTechniques.length > 0) {
            dropdownContent += `
                <div class="technique-dropdown-section">
                    <h4><i class="fas fa-link"></i> Verwandte Techniken</h4>
                    <div class="related-techniques-list">
            `;
            
            // Find and display related techniques
            technique.relatedTechniques.forEach(relatedId => {
                let relatedName = relatedId;
                
                // Try to find the related technique name in taxonomy data
                if (this.taxonomyLoader && this.taxonomyLoader.techniquesData) {
                    for (const category of this.taxonomyLoader.techniquesData.categories) {
                        const related = category.techniques.find(t => t.id === relatedId);
                        if (related) {
                            relatedName = related.name;
                            break;
                        }
                    }
                }
                
                // Fallback to technique manager
                if (relatedName === relatedId) {
                    const relatedTechnique = this.techniqueManager.getTechnique(relatedId);
                    if (relatedTechnique) {
                        relatedName = relatedTechnique.name;
                    }
                }
                
                dropdownContent += `<span class="related-technique-tag" data-id="${relatedId}">${relatedName}</span>`;
            });
            
            dropdownContent += `
                    </div>
                </div>
            `;
        }
        
        // Add use cases section with icon
        if (technique.anwendungsfall || technique.useCase) {
            const useCase = technique.anwendungsfall || technique.useCase;
            dropdownContent += `
                <div class="technique-dropdown-section">
                    <h4><i class="fas fa-lightbulb"></i> Anwendungsfall</h4>
                    <p>${useCase}</p>
                </div>
            `;
        }
        
        // Add examples if available
        if (technique.beispiel || technique.example) {
            const example = technique.beispiel || technique.example;
            dropdownContent += `
                <div class="technique-dropdown-section">
                    <h4><i class="fas fa-code"></i> Beispiel</h4>
                    <p>${example}</p>
                </div>
            `;
        }
        
        // Add benefits if available
        if (technique.vorteile || technique.benefits) {
            const benefits = technique.vorteile || technique.benefits;
            dropdownContent += `
                <div class="technique-dropdown-section">
                    <h4><i class="fas fa-check-circle"></i> Vorteile</h4>
                    <p>${benefits}</p>
                </div>
            `;
        }
        
        dropdownContent += '</div>';
        dropdown.innerHTML = dropdownContent;
        
        // Insert dropdown after the technique card
        techniqueCard.insertAdjacentElement('afterend', dropdown);
        
        // Add click handlers for related technique tags
        dropdown.querySelectorAll('.related-technique-tag').forEach(tag => {
            tag.addEventListener('click', (e) => {
                e.stopPropagation();
                const relatedId = tag.dataset.id;
                console.log('🔗 Related technique clicked:', relatedId);
                
                // Close current dropdown and open the related technique's dropdown
                dropdown.remove();
                
                // Find the related technique card and toggle its dropdown
                const relatedCard = document.querySelector(`[data-id="${relatedId}"]`);
                if (relatedCard) {
                    // Scroll to the related technique
                    relatedCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    
                    // Open its dropdown after a brief delay
                    setTimeout(() => {
                        this.toggleTechniqueDropdown(relatedId);
                    }, 300);
                } else {
                    console.warn('Related technique card not found:', relatedId);
                }
            });
        });
        
        // Animate dropdown appearance
        requestAnimationFrame(() => {
            dropdown.style.maxHeight = dropdown.scrollHeight + 'px';
            dropdown.style.opacity = '1';
        });
    }

    /**
     * Show modal with content
     */
    showModal(title, content) {
        // Check if modal exists, if not create one
        let modal = document.getElementById('technique-details-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'technique-details-modal';
            modal.className = 'modal';
            modal.innerHTML = `
                <div class="modal-backdrop"></div>
                <div class="modal-content">
                    <div class="modal-header">
                        <h3 class="modal-title"></h3>
                        <button class="modal-close">&times;</button>
                    </div>
                    <div class="modal-body"></div>
                </div>
            `;
            document.body.appendChild(modal);

            // Add close event listeners
            modal.querySelector('.modal-close').addEventListener('click', () => {
                modal.style.display = 'none';
            });
            modal.querySelector('.modal-backdrop').addEventListener('click', () => {
                modal.style.display = 'none';
            });
            
            // ESC key to close
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && modal.style.display === 'block') {
                    modal.style.display = 'none';
                }
            });
        }

        // Set content and show
        modal.querySelector('.modal-title').textContent = title;
        modal.querySelector('.modal-body').innerHTML = content;
        modal.style.display = 'block';
    }
}

// Make TechniqueUIManager available globally
window.TechniqueUIManager = TechniqueUIManager;

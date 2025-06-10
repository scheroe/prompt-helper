/**
 * TemplateUIManager - Verwaltet UI-Elemente für Templates
 */
class TemplateUIManager {
    constructor(templateManager, uiMessageManager) {
        this.templateManager = templateManager;
        this.uiMessageManager = uiMessageManager;
    }

    /**
     * Create template checkbox elements
     */
    createTemplateBlocks() {
        const container = document.getElementById('template-checkboxes-container');
        if (!container) {
            console.error('Template checkboxes container not found');
            return;
        }

        console.log('Creating template blocks:', Object.keys(this.templateManager.templateBlocks));

        // Clear existing content
        container.innerHTML = '';

        // Create checkboxes for each template
        this.templateManager.getAllTemplates().forEach(template => {
            const checkboxWrapper = document.createElement('div');
            checkboxWrapper.className = 'template-checkbox-item';

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = `template-${template.id}`;
            checkbox.value = template.id;
            checkbox.className = 'template-checkbox';

            const label = document.createElement('label');
            label.htmlFor = `template-${template.id}`;
            label.innerHTML = `
                <span class="template-name">${template.name}</span>
                <span class="template-description">${template.description}</span>
            `;

            // Create preview button
            const previewButton = document.createElement('button');
            previewButton.type = 'button';
            previewButton.className = 'template-preview-btn';
            previewButton.innerHTML = '<i class="fas fa-eye"></i>';
            previewButton.title = 'Template Vorschau';

            checkboxWrapper.appendChild(checkbox);
            checkboxWrapper.appendChild(label);
            checkboxWrapper.appendChild(previewButton);
            container.appendChild(checkboxWrapper);
        });

        // Ensure template fields container exists
        this.ensureTemplateFieldsContainer();
    }

    /**
     * Ensure template fields container exists
     */
    ensureTemplateFieldsContainer() {
        let templateFieldsContainer = document.getElementById('template-fields-container');
        if (!templateFieldsContainer) {
            templateFieldsContainer = document.createElement('div');
            templateFieldsContainer.id = 'template-fields-container';
            templateFieldsContainer.className = 'template-fields-container';

            // Find the base-prompt group to insert before
            const basePromptGroup = document.getElementById('base-prompt')?.closest('.input-group');
            if (basePromptGroup && basePromptGroup.parentNode) {
                basePromptGroup.parentNode.insertBefore(templateFieldsContainer, basePromptGroup);
            }
        }
    }

    /**
     * Handle template selection with auto-technique linking
     */
    onTemplateSelected(checkbox, techniqueUIManager) {
        const templateId = checkbox.value;
        const isChecked = checkbox.checked;

        if (isChecked) {
            const success = this.templateManager.addTemplate(templateId);
            if (success) {
                console.log(`TemplateManager: Template ${templateId} ausgewählt`);
                
                // Update UI to show auto-selected techniques
                if (techniqueUIManager) {
                    techniqueUIManager.updateAutoSelectedTechniques(templateId, this.templateManager);
                }
            }
            return { templateId, isChecked, success };
        } else {
            const success = this.templateManager.removeTemplate(templateId);
            if (success) {
                console.log(`TemplateManager: Template ${templateId} entfernt`);
                
                // Update UI to remove auto-selected techniques
                if (techniqueUIManager) {
                    techniqueUIManager.updateAutoDeselectedTechniques(templateId, this.templateManager);
                }
            }
            return { templateId, isChecked, success };
        }
    }

    /**
     * Update selected templates description
     */
    updateSelectedTemplatesDescription() {
        const container = document.getElementById('selected-templates-description');
        if (!container) return;

        const descriptions = this.templateManager.selectedTemplates.map(templateId => {
            const template = this.templateManager.getTemplate(templateId);
            return template ? `<strong>${template.name}:</strong> ${template.description}` : '';
        }).filter(desc => desc);

        container.innerHTML = descriptions.join('<br>');
    }

    /**
     * Update template fields based on selected templates with specialized UI
     */
    updateTemplateFields(dynamicFieldManager) {
        const templateFieldsContainer = document.getElementById('template-fields-container');
        if (!templateFieldsContainer) return;

        // Clear existing fields
        templateFieldsContainer.innerHTML = '';

        if (this.templateManager.selectedTemplates.length === 0) return;

        // Create specialized template field sections
        this.templateManager.selectedTemplates.forEach(templateId => {
            this.createTemplateSection(templateId, templateFieldsContainer, dynamicFieldManager);
        });
    }

    /**
     * Create a specialized template section with its fields
     */
    createTemplateSection(templateId, container, dynamicFieldManager) {
        const template = this.templateManager.getTemplate(templateId);
        if (!template) return;

        // Create section container
        const sectionContainer = document.createElement('div');
        sectionContainer.className = 'template-section';
        sectionContainer.dataset.templateId = templateId;

        // Create section header
        const sectionHeader = document.createElement('div');
        sectionHeader.className = 'template-section-header';
        sectionHeader.innerHTML = `
            <h4 class="template-section-title">
                <i class="fas fa-template"></i> ${template.name}
            </h4>
            <p class="template-section-description">${template.description}</p>
        `;
        sectionContainer.appendChild(sectionHeader);

        // Create fields container
        const fieldsContainer = document.createElement('div');
        fieldsContainer.className = 'template-section-fields';

        // Create regular fields
        const fieldDefinitions = this.templateManager.getTemplateFieldDefinitions(templateId);
        fieldDefinitions.forEach(fieldDef => {
            this.createTemplateFieldInput(templateId, fieldDef, fieldsContainer);
        });

        // Create dynamic fields
        if (dynamicFieldManager) {
            const dynamicFieldDefs = this.templateManager.getTemplateDynamicFieldDefinitions(templateId);
            Object.entries(dynamicFieldDefs).forEach(([fieldType, fieldConfig]) => {
                dynamicFieldManager.createDynamicTemplateField(templateId, fieldType, fieldConfig, fieldsContainer);
            });

            // Create advanced options if available
            if (this.templateManager.hasAdvancedOptions(templateId)) {
                this.createAdvancedOptionsSection(templateId, fieldsContainer, dynamicFieldManager);
            }
        }

        sectionContainer.appendChild(fieldsContainer);
        container.appendChild(sectionContainer);
    }

    /**
     * Create a template field input
     */
    createTemplateFieldInput(templateId, fieldDef, container) {
        const fieldElement = document.createElement('div');
        fieldElement.className = 'input-group template-field';

        const label = document.createElement('label');
        label.textContent = fieldDef.label + (fieldDef.required ? ' *' : '');
        label.className = fieldDef.required ? 'required' : '';
        label.htmlFor = `template-${templateId}-${fieldDef.name}`;

        let inputElement;
        switch (fieldDef.type) {
            case 'textarea':
                inputElement = document.createElement('textarea');
                inputElement.rows = 3;
                break;
            case 'select':
                inputElement = document.createElement('select');
                if (fieldDef.options) {
                    fieldDef.options.forEach(option => {
                        const optionElement = document.createElement('option');
                        optionElement.value = option;
                        optionElement.textContent = option;
                        inputElement.appendChild(optionElement);
                    });
                }
                break;
            case 'number':
                inputElement = document.createElement('input');
                inputElement.type = 'number';
                break;
            default:
                inputElement = document.createElement('input');
                inputElement.type = fieldDef.type || 'text';
        }

        inputElement.id = `template-${templateId}-${fieldDef.name}`;
        inputElement.className = 'template-field-input';
        inputElement.placeholder = fieldDef.placeholder || '';
        inputElement.required = fieldDef.required || false;

        // Set saved value if available
        const savedValue = this.templateManager.getFieldValue(fieldDef.name);
        if (savedValue) {
            inputElement.value = savedValue;
        }

        // Add event listener for value changes
        inputElement.addEventListener('input', () => {
            this.templateManager.setFieldValue(fieldDef.name, inputElement.value);
            // Trigger prompt preview update via event
            window.dispatchEvent(new CustomEvent('template-field-changed'));
        });

        fieldElement.appendChild(label);
        fieldElement.appendChild(inputElement);
        container.appendChild(fieldElement);
    }

    /**
     * Create advanced options section for a template
     */
    createAdvancedOptionsSection(templateId, container, dynamicFieldManager) {
        const advancedOptions = this.templateManager.getAdvancedOptions(templateId);
        
        const advancedContainer = document.createElement('div');
        advancedContainer.className = 'template-advanced-options';
        
        const advancedToggle = document.createElement('button');
        advancedToggle.type = 'button';
        advancedToggle.className = 'template-advanced-toggle';
        advancedToggle.innerHTML = '<i class="fas fa-cog"></i> Erweiterte Optionen';
        
        const advancedContent = document.createElement('div');
        advancedContent.className = 'template-advanced-content';
        advancedContent.style.display = 'none';
        
        // Toggle functionality
        advancedToggle.addEventListener('click', () => {
            const isVisible = advancedContent.style.display !== 'none';
            advancedContent.style.display = isVisible ? 'none' : 'block';
            advancedToggle.innerHTML = isVisible 
                ? '<i class="fas fa-cog"></i> Erweiterte Optionen'
                : '<i class="fas fa-cog"></i> Erweiterte Optionen ausblenden';
        });

        // Create advanced fields
        if (advancedOptions.additionalFields) {
            advancedOptions.additionalFields.forEach(fieldDef => {
                if (fieldDef.type === 'dynamic-list' && dynamicFieldManager) {
                    dynamicFieldManager.createDynamicTemplateField(templateId, fieldDef.name, {
                        label: fieldDef.label,
                        type: 'list',
                        baseField: fieldDef.baseField,
                        minItems: 0,
                        maxItems: 5
                    }, advancedContent);
                } else {
                    this.createTemplateFieldInput(templateId, fieldDef, advancedContent);
                }
            });
        }

        advancedContainer.appendChild(advancedToggle);
        advancedContainer.appendChild(advancedContent);
        container.appendChild(advancedContainer);
    }

    /**
     * Show template preview
     */
    showTemplatePreview(templateId) {
        console.log('Template preview for:', templateId);
        // TODO: Implement template preview modal
    }
}

// Make TemplateUIManager available globally
window.TemplateUIManager = TemplateUIManager;

/**
 * DynamicFieldManager - Verwaltet dynamische Felder für Templates
 */
class DynamicFieldManager {
    constructor(templateManager, uiMessageManager) {
        this.templateManager = templateManager;
        this.uiMessageManager = uiMessageManager;
    }

    /**
     * Create dynamic template field components
     */
    createDynamicTemplateField(templateId, fieldType, fieldConfig, container) {
        const fieldContainer = document.createElement('div');
        fieldContainer.className = 'dynamic-field-container';
        fieldContainer.dataset.templateId = templateId;
        fieldContainer.dataset.fieldType = fieldType;

        // Create header with add button
        const fieldHeader = document.createElement('div');
        fieldHeader.className = 'dynamic-field-header';
        
        const fieldLabel = document.createElement('label');
        fieldLabel.className = 'dynamic-field-label';
        fieldLabel.textContent = fieldConfig.label;
        
        const addButton = document.createElement('button');
        addButton.type = 'button';
        addButton.className = 'dynamic-field-add-btn';
        addButton.innerHTML = '<i class="fas fa-plus"></i> Hinzufügen';
        addButton.title = `${fieldConfig.label} hinzufügen`;
        
        fieldHeader.appendChild(fieldLabel);
        fieldHeader.appendChild(addButton);
        fieldContainer.appendChild(fieldHeader);

        // Create items container
        const itemsContainer = document.createElement('div');
        itemsContainer.className = 'dynamic-field-items';
        fieldContainer.appendChild(itemsContainer);

        // Add click handler for add button
        addButton.addEventListener('click', () => {
            this.addDynamicFieldItem(templateId, fieldType, fieldConfig, itemsContainer);
        });

        // Load existing items
        const existingItems = this.templateManager.getDynamicFields(templateId, fieldType);
        existingItems.forEach((itemData, index) => {
            this.createDynamicFieldItem(templateId, fieldType, fieldConfig, itemsContainer, itemData, index);
        });

        // Add minimum items if specified
        const minItems = fieldConfig.minItems || 0;
        const currentItems = existingItems.length;
        for (let i = currentItems; i < minItems; i++) {
            this.addDynamicFieldItem(templateId, fieldType, fieldConfig, itemsContainer);
        }

        container.appendChild(fieldContainer);
    }

    /**
     * Add a new dynamic field item
     */
    addDynamicFieldItem(templateId, fieldType, fieldConfig, container) {
        const maxItems = fieldConfig.maxItems || 10;
        const currentItems = container.children.length;
        
        if (currentItems >= maxItems) {
            this.uiMessageManager.showError(`Maximal ${maxItems} ${fieldConfig.label} erlaubt`);
            return;
        }

        const itemData = {};
        if (fieldConfig.itemFields) {
            fieldConfig.itemFields.forEach(field => {
                itemData[field.name] = '';
            });
        } else {
            itemData.value = '';
        }

        const itemIndex = this.templateManager.addDynamicField(templateId, fieldType, itemData);
        this.createDynamicFieldItem(templateId, fieldType, fieldConfig, container, itemData, itemIndex);
    }

    /**
     * Create a single dynamic field item
     */
    createDynamicFieldItem(templateId, fieldType, fieldConfig, container, itemData, itemIndex) {
        const itemContainer = document.createElement('div');
        itemContainer.className = 'dynamic-field-item';
        itemContainer.dataset.itemIndex = itemIndex;

        // Create remove button
        const removeButton = document.createElement('button');
        removeButton.type = 'button';
        removeButton.className = 'dynamic-field-remove-btn';
        removeButton.innerHTML = '<i class="fas fa-times"></i>';
        removeButton.title = 'Entfernen';
        
        removeButton.addEventListener('click', () => {
            this.removeDynamicFieldItem(templateId, fieldType, itemIndex, itemContainer);
        });

        itemContainer.appendChild(removeButton);

        // Create input fields based on configuration
        if (fieldConfig.itemFields) {
            // Multiple fields per item
            fieldConfig.itemFields.forEach(field => {
                const fieldWrapper = document.createElement('div');
                fieldWrapper.className = 'dynamic-field-input-wrapper';
                
                const fieldLabel = document.createElement('label');
                fieldLabel.textContent = field.label;
                fieldLabel.className = 'dynamic-field-input-label';
                
                const inputElement = this.createInputElement(field, itemData[field.name] || '');
                inputElement.addEventListener('input', () => {
                    this.updateDynamicFieldValue(templateId, fieldType, itemIndex, field.name, inputElement.value);
                });
                
                fieldWrapper.appendChild(fieldLabel);
                fieldWrapper.appendChild(inputElement);
                itemContainer.appendChild(fieldWrapper);
            });
        } else {
            // Single field
            const inputElement = this.createInputElement(fieldConfig, itemData.value || '');
            inputElement.addEventListener('input', () => {
                this.updateDynamicFieldValue(templateId, fieldType, itemIndex, 'value', inputElement.value);
            });
            itemContainer.appendChild(inputElement);
        }

        container.appendChild(itemContainer);
    }

    /**
     * Create input element based on field configuration
     */
    createInputElement(fieldConfig, value = '') {
        let element;
        
        switch (fieldConfig.type) {
            case 'textarea':
                element = document.createElement('textarea');
                element.rows = fieldConfig.rows || 3;
                break;
            case 'select':
                element = document.createElement('select');
                if (fieldConfig.options) {
                    fieldConfig.options.forEach(option => {
                        const optionElement = document.createElement('option');
                        optionElement.value = option;
                        optionElement.textContent = option;
                        element.appendChild(optionElement);
                    });
                }
                break;
            case 'number':
                element = document.createElement('input');
                element.type = 'number';
                break;
            default:
                element = document.createElement('input');
                element.type = fieldConfig.type || 'text';
        }

        element.className = 'dynamic-field-input';
        element.value = value;
        element.placeholder = fieldConfig.placeholder || '';
        element.required = fieldConfig.required || false;

        return element;
    }

    /**
     * Remove a dynamic field item
     */
    removeDynamicFieldItem(templateId, fieldType, itemIndex, itemContainer) {
        // Remove from data
        this.templateManager.removeDynamicField(templateId, fieldType, itemIndex);
        
        // Remove from UI
        itemContainer.remove();
        
        // Update indices of remaining items
        this.updateDynamicFieldIndices(templateId, fieldType);

        // Trigger prompt preview update
        window.dispatchEvent(new CustomEvent('dynamic-field-changed'));
    }

    /**
     * Update dynamic field value
     */
    updateDynamicFieldValue(templateId, fieldType, itemIndex, fieldName, value) {
        const updateData = {};
        updateData[fieldName] = value;
        this.templateManager.updateDynamicField(templateId, fieldType, itemIndex, updateData);
        
        // Trigger prompt preview update
        window.dispatchEvent(new CustomEvent('dynamic-field-changed'));
    }

    /**
     * Update dynamic field indices after removal
     */
    updateDynamicFieldIndices(templateId, fieldType) {
        const container = document.querySelector(
            `[data-template-id="${templateId}"][data-field-type="${fieldType}"] .dynamic-field-items`
        );
        
        if (container) {
            Array.from(container.children).forEach((item, index) => {
                item.dataset.itemIndex = index;
            });
        }
    }
}

// Make DynamicFieldManager available globally
window.DynamicFieldManager = DynamicFieldManager;

/**
 * TemplateManager - Verwaltet Template-Daten und Multi-Template-Auswahl
 */
class TemplateManager {
    constructor() {
        this.selectedTemplates = [];
        this.currentTemplateFields = {};
        this.initialized = false;
        
        // Erweiterte Template-Definitionen mit Technik-Verknüpfungen und spezialisierten Feldern
        this.templateBlocks = {
            "basic": {
                id: "basic",
                name: "Basic Template",
                description: "Grundlegende Prompt-Struktur für einfache Aufgaben",
                template: "Bitte {task_description}.\n\n{output_format}",
                relatedTechniques: ['zero-shot-prompting'],
                fields: [
                    { name: 'task_description', type: 'textarea', label: 'Aufgabenbeschreibung', required: true },
                    { name: 'output_format', type: 'textarea', label: 'Ausgabeformat (optional)', required: false }
                ]
            },
            "persona": {
                id: "persona",
                name: "Persona Template",
                description: "Expertenpersona mit Rolle und Erfahrung definieren",
                template: "Du bist ein/e {role} mit {experience} Jahren Erfahrung. {task_description}\n\n{output_format}",
                relatedTechniques: ['zero-shot-prompting'],
                fields: [
                    { name: 'role', type: 'text', label: 'Rolle/Expertise', required: true, placeholder: 'z.B. Softwareentwickler, Marketing-Experte' },
                    { name: 'experience', type: 'number', label: 'Jahre Erfahrung', required: true, placeholder: '5' },
                    { name: 'task_description', type: 'textarea', label: 'Aufgabenbeschreibung', required: true },
                    { name: 'output_format', type: 'textarea', label: 'Ausgabeformat (optional)', required: false }
                ],
                advanced: {
                    multiRole: true,
                    additionalFields: [
                        { name: 'additional_roles', type: 'dynamic-list', label: 'Weitere Rollen', baseField: 'role' },
                        { name: 'role_tasks', type: 'dynamic-textarea', label: 'Spezifische Aufgaben pro Rolle' }
                    ]
                }
            },
            "few-shot": {
                id: "few-shot",
                name: "Few-Shot Template", 
                description: "Lernen durch Beispiele - mit dynamischen Example-Feldern",
                template: "Kontext: {context}\n\nBeispiele:\n{examples}\n\nAufgabe: {task_description}\n\n{output_format}",
                relatedTechniques: ['few-shot-prompting'],
                fields: [
                    { name: 'context', type: 'textarea', label: 'Kontext/Hintergrund', required: true },
                    { name: 'task_description', type: 'textarea', label: 'Aufgabenbeschreibung', required: true },
                    { name: 'output_format', type: 'textarea', label: 'Ausgabeformat (optional)', required: false }
                ],
                dynamicFields: {
                    examples: {
                        type: 'expandable-list',
                        label: 'Beispiele',
                        minItems: 1,
                        maxItems: 10,
                        itemFields: [
                            { name: 'example_input', type: 'textarea', label: 'Beispiel-Eingabe' },
                            { name: 'example_output', type: 'textarea', label: 'Beispiel-Ausgabe' }
                        ]
                    }
                }
            },
            "step-by-step": {
                id: "step-by-step",
                name: "Step-by-Step Template",
                description: "Aufgaben in Zwischenschritte unterteilen",
                template: "Löse folgende Aufgabe Schritt für Schritt:\n\n{task_description}\n\n{steps}\n\n{output_format}",
                relatedTechniques: ['chain-of-thought-prompting'],
                fields: [
                    { name: 'task_description', type: 'textarea', label: 'Hauptaufgabe', required: true },
                    { name: 'output_format', type: 'textarea', label: 'Ausgabeformat (optional)', required: false }
                ],
                dynamicFields: {
                    steps: {
                        type: 'expandable-list',
                        label: 'Zwischenschritte',
                        minItems: 0,
                        maxItems: 20,
                        itemFields: [
                            { name: 'step_description', type: 'textarea', label: 'Schritt-Beschreibung' },
                            { name: 'step_goal', type: 'text', label: 'Schritt-Ziel (optional)' }
                        ]
                    }
                }
            },
            "question-answering": {
                id: "question-answering", 
                name: "Question-Answering Template",
                description: "Spezifische Fragen mit Modalitäts-Unterstützung",
                template: "Beantworte folgende Frage: {question}\n\n{context}\n\n{output_format}",
                relatedTechniques: ['zero-shot-prompting'],
                fields: [
                    { name: 'question', type: 'textarea', label: 'Frage', required: true },
                    { name: 'context', type: 'textarea', label: 'Kontext (optional)', required: false },
                    { name: 'output_format', type: 'textarea', label: 'Ausgabeformat (optional)', required: false }
                ],
                modalityHelpers: [
                    { label: 'Text → Text', template: 'Was bedeutet folgender Text: "{input_text}"?' },
                    { label: 'Code → Text', template: 'Erkläre folgenden Code: {code_snippet}' },
                    { label: 'Bild → Text', template: 'Was siehst du in diesem Bild? (Bild wird separat hochgeladen)' }
                ]
            },
            "text-analysis": {
                id: "text-analysis",
                name: "Text-Analyse & Mindmap Template",
                description: "Analysiert Texte und erstellt Mindmaps in Mermaid-Code",
                template: "Analysiere den folgenden Text und erstelle eine Mindmap:\n\nText: {input_text}\n\nFokus: {analysis_focus}\n\nErstelle:\n1. Eine kurze Analyse der Hauptthemen\n2. Eine Mindmap in Mermaid-Code mit den Struktur-Anforderungen: {structure_requirements}\n3. Erklärung der Mindmap-Logik\n\n{output_format}",
                relatedTechniques: ['chain-of-thought-prompting', 'self-refine-prompting'],
                fields: [
                    { name: 'input_text', type: 'textarea', label: 'Zu analysierender Text', required: true },
                    { name: 'analysis_focus', type: 'select', label: 'Analyse-Fokus', required: true, 
                      options: ['Hauptthemen & Struktur', 'Argumentationslinien', 'Konzepte & Beziehungen', 'Prozesse & Abläufe', 'Kategorien & Hierarchien'] },
                    { name: 'output_format', type: 'textarea', label: 'Zusätzliche Anforderungen (optional)', required: false }
                ],
                dynamicFields: {
                    structure_requirements: {
                        type: 'expandable-list',
                        label: 'Mindmap-Struktur Anforderungen',
                        minItems: 1,
                        maxItems: 10,
                        itemFields: [
                            { name: 'requirement', type: 'textarea', label: 'Struktur-Anforderung' }
                        ]
                    }
                }
            },
            "creative": {
                id: "creative",
                name: "Kreative Generierung Template",
                description: "Kreative Inhalte mit charakteristischen Eigenschaften",
                template: "Erstelle {content_type} über {topic} mit folgenden Eigenschaften:\n{characteristics}\n\n{output_format}",
                relatedTechniques: ['few-shot-prompting'],
                fields: [
                    { name: 'content_type', type: 'select', label: 'Content-Typ', required: true,
                      options: ['Artikel', 'Geschichte', 'Gedicht', 'Blogpost', 'Marketing-Text', 'Produktbeschreibung', 'Social Media Post'] },
                    { name: 'topic', type: 'text', label: 'Thema', required: true },
                    { name: 'output_format', type: 'textarea', label: 'Ausgabeformat (optional)', required: false }
                ],
                dynamicFields: {
                    characteristics: {
                        type: 'expandable-list',
                        label: 'Eigenschaften/Charakteristika',
                        minItems: 1,
                        maxItems: 10,
                        itemFields: [
                            { name: 'characteristic', type: 'text', label: 'Eigenschaft' }
                        ]
                    }
                }
            },
            "interactive": {
                id: "interactive",
                name: "Interaktiv/Mehrschrittig Template",
                description: "Mehrschrittige Interaktionen mit if-else Requirements",
                template: "Interaktive Aufgabe: {task_description}\n\nErster Schritt: {initial_step}\n\n{requirements}\n\n{output_format}",
                relatedTechniques: ['least-to-most-prompting'],
                fields: [
                    { name: 'task_description', type: 'textarea', label: 'Aufgabenbeschreibung', required: true },
                    { name: 'initial_step', type: 'textarea', label: 'Initialer Schritt', required: true },
                    { name: 'output_format', type: 'textarea', label: 'Ausgabeformat (optional)', required: false }
                ],
                dynamicFields: {
                    requirements: {
                        type: 'conditional-list',
                        label: 'Bedingungen & Anforderungen',
                        minItems: 0,
                        maxItems: 10,
                        itemFields: [
                            { name: 'condition_type', type: 'select', label: 'Typ', options: ['if', 'else-if', 'else'] },
                            { name: 'condition', type: 'textarea', label: 'Bedingung' },
                            { name: 'action', type: 'textarea', label: 'Aktion/Ziel' },
                            { name: 'not_wanted', type: 'textarea', label: 'Was vermieden werden soll (optional)' }
                        ]
                    }
                }
            },
            "critical-analysis": {
                id: "critical-analysis",
                name: "Kritische Ideenbewertung Template",
                description: "Bewertung von Ideen aus multiplen kritischen Perspektiven",
                template: "Bewerte folgende Idee kritisch aus drei Perspektiven:\n\nIdee: {idea_description}\n\nKontext: {context}\n\n1. Was spricht dafür? {pro_focus}\n2. Welche logischen, ethischen oder praktischen Gegenargumente gibt es? {contra_focus}\n3. Welche Annahmen könnten falsch oder verkürzt sein? {assumptions_focus}\n\nZusätzliche kritische Frage: Welche Perspektive widerspricht meiner und warum?\n\n{critical_requirements}\n\nBitte keine Schmeicheleien – ich will differenzierte, ehrliche Kritik.\n\n{output_format}",
                relatedTechniques: ['chain-of-thought-prompting', 'self-consistency'],
                fields: [
                    { name: 'idea_description', type: 'textarea', label: 'Zu bewertende Idee', required: true },
                    { name: 'context', type: 'textarea', label: 'Kontext/Hintergrund', required: false },
                    { name: 'pro_focus', type: 'text', label: 'Pro-Fokus (optional)', required: false },
                    { name: 'contra_focus', type: 'text', label: 'Contra-Fokus (optional)', required: false },
                    { name: 'assumptions_focus', type: 'text', label: 'Annahmen-Fokus (optional)', required: false },
                    { name: 'output_format', type: 'textarea', label: 'Ausgabeformat (optional)', required: false }
                ],
                dynamicFields: {
                    critical_requirements: {
                        type: 'expandable-list',
                        label: 'Spezifische kritische Anforderungen',
                        minItems: 0,
                        maxItems: 8,
                        itemFields: [
                            { name: 'requirement', type: 'textarea', label: 'Kritische Anforderung' }
                        ]
                    }
                }
            }
        };

        // Template-zu-Technik-Mapping für automatische Auswahl
        this.templateTechniqueMapping = {
            'basic': ['zero-shot-prompting'],
            'persona': ['zero-shot-prompting'],
            'few-shot': ['few-shot-prompting'],
            'step-by-step': ['chain-of-thought-prompting'],
            'question-answering': ['zero-shot-prompting'],
            'interactive': ['least-to-most-prompting'],
            'text-analysis': ['chain-of-thought-prompting', 'self-refine-prompting'],
            'creative': ['few-shot-prompting'],
            'critical-analysis': ['chain-of-thought-prompting', 'self-consistency']
        };
    }

    /**
     * Initialize the TemplateManager
     */
    async init() {
        try {
            console.log('TemplateManager: Initialisierung gestartet...');
            // Template data is already loaded in constructor
            this.initialized = true;
            console.log('TemplateManager: Erfolgreich initialisiert');
        } catch (error) {
            console.error('TemplateManager: Initialisierungsfehler:', error);
            throw error;
        }
    }

    /**
     * Set references to other managers
     */
    setManagers(managers) {
        this.techniqueManager = managers.techniqueManager;
        this.uiManager = managers.uiManager;
    }

    /**
     * Add a template to the selected templates array
     */
    addTemplate(templateId) {
        if (!this.selectedTemplates.includes(templateId)) {
            this.selectedTemplates.push(templateId);
            
            // Auto-select related techniques
            this.autoSelectRelatedTechniques(templateId);
            
            return true;
        }
        return false;
    }

    /**
     * Remove a template from the selected templates array
     */
    removeTemplate(templateId) {
        const index = this.selectedTemplates.indexOf(templateId);
        if (index > -1) {
            this.selectedTemplates.splice(index, 1);
            
            // Auto-deselect related techniques that are no longer needed
            this.autoDeselectOrphanedTechniques(templateId);
            
            return true;
        }
        return false;
    }

    /**
     * Auto-select related techniques when a template is selected
     */
    autoSelectRelatedTechniques(templateId) {
        if (!this.techniqueManager) return;
        
        const relatedTechniques = this.getRelatedTechniques(templateId);
        console.log(`TemplateManager: Auto-selecting techniques for template ${templateId}:`, relatedTechniques);
        
        relatedTechniques.forEach(techniqueId => {
            // Only auto-select if not already manually selected
            if (!this.techniqueManager.selectedTechniques.includes(techniqueId)) {
                this.techniqueManager.addTechnique(techniqueId);
                
                // Mark as auto-selected in UI
                if (this.uiManager) {
                    this.markTechniqueAsAutoSelected(techniqueId);
                }
            }
        });
    }

    /**
     * Auto-deselect techniques that are no longer needed when template is removed
     */
    autoDeselectOrphanedTechniques(removedTemplateId) {
        if (!this.techniqueManager) return;
        
        const removedTechniques = this.getRelatedTechniques(removedTemplateId);
        
        // Check which techniques are still needed by other selected templates
        const stillNeededTechniques = new Set();
        this.selectedTemplates.forEach(templateId => {
            const techniques = this.getRelatedTechniques(templateId);
            techniques.forEach(techniqueId => stillNeededTechniques.add(techniqueId));
        });
        
        // Remove techniques that are no longer needed
        removedTechniques.forEach(techniqueId => {
            if (!stillNeededTechniques.has(techniqueId)) {
                this.techniqueManager.removeTechnique(techniqueId);
                
                // Remove auto-selected marking in UI
                if (this.uiManager) {
                    this.unmarkTechniqueAsAutoSelected(techniqueId);
                }
            }
        });
    }

    /**
     * Mark a technique as auto-selected in the UI
     */
    markTechniqueAsAutoSelected(techniqueId) {
        const techniqueElement = document.querySelector(`[data-id="${techniqueId}"]`);
        if (techniqueElement) {
            techniqueElement.classList.add('auto-selected');
            
            // Check the checkbox
            const checkbox = techniqueElement.querySelector('input[type="checkbox"]');
            if (checkbox) {
                checkbox.checked = true;
            }
        }
    }

    /**
     * Remove auto-selected marking from a technique in the UI
     */
    unmarkTechniqueAsAutoSelected(techniqueId) {
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

    /**
     * Get template by ID
     */
    getTemplate(templateId) {
        return this.templateBlocks[templateId];
    }

    /**
     * Get all templates
     */
    getAllTemplates() {
        return Object.values(this.templateBlocks);
    }

    /**
     * Get related techniques for a template
     */
    getRelatedTechniques(templateId) {
        return this.templateTechniqueMapping[templateId] || [];
    }

    /**
     * Extract field placeholders from a template string
     */
    extractFieldsFromTemplate(templateString) {
        const matches = templateString.match(/{([^}]+)}/g);
        if (!matches) return [];
        return matches.map(match => match.slice(1, -1)); // Remove { and }
    }

    /**
     * Get all unique fields from selected templates
     */
    getAllFieldsFromSelectedTemplates() {
        const allFields = [];
        this.selectedTemplates.forEach(templateId => {
            const template = this.templateBlocks[templateId];
            if (template) {
                const fields = this.extractFieldsFromTemplate(template.template);
                fields.forEach(field => {
                    if (!allFields.includes(field) && 
                        field !== 'task_description' && 
                        field !== 'output_format') {
                        allFields.push(field);
                    }
                });
            }
        });
        return allFields;
    }

    /**
     * Get combined template fields with their usage info
     */
    getCombinedTemplateFields() {
        const allFields = {};
        const fieldTemplateUsage = {};

        this.selectedTemplates.forEach(templateId => {
            const template = this.templateBlocks[templateId];
            if (template) {
                const fields = this.extractFieldsFromTemplate(template.template);
                fields.forEach(field => {
                    if (field !== 'task_description' && field !== 'output_format') {
                        allFields[field] = this.formatFieldLabel(field);
                        if (!fieldTemplateUsage[field]) {
                            fieldTemplateUsage[field] = [];
                        }
                        fieldTemplateUsage[field].push(template.name);
                    }
                });
            }
        });

        return { fields: allFields, usage: fieldTemplateUsage };
    }

    /**
     * Format field labels for display
     */
    formatFieldLabel(field) {
        const fieldLabels = {
            'task_description': 'Aufgabenbeschreibung',
            'output_format': 'Ausgabeformat',
            'role': 'Rolle/Expertise',
            'experience': 'Erfahrung',
            'context': 'Kontext',
            'example1': 'Beispiel 1',
            'example2': 'Beispiel 2',
            'initial_step': 'Erster Schritt',
            'creativity_level': 'Kreativitätslevel',
            'code_language': 'Programmiersprache',
            'code_requirements': 'Code-Anforderungen',
            'content_type': 'Content-Typ',
            'topic': 'Thema',
            'characteristic1': 'Eigenschaft 1',
            'characteristic2': 'Eigenschaft 2',
            'characteristic3': 'Eigenschaft 3',
            'additional_constraints': 'Zusätzliche Einschränkungen',
            'language': 'Sprache',
            'function_purpose': 'Funktionszweck',
            'requirement1': 'Anforderung 1',
            'requirement2': 'Anforderung 2',
            'requirement3': 'Anforderung 3'
        };
        
        return fieldLabels[field] || field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }

    /**
     * Set field value
     */
    setFieldValue(field, value) {
        this.currentTemplateFields[field] = value;
    }

    /**
     * Get field value
     */
    getFieldValue(field) {
        return this.currentTemplateFields[field] || '';
    }

    /**
     * Clear all template fields
     */
    clearTemplateFields() {
        this.currentTemplateFields = {};
    }

    /**
     * Clear selected templates
     */
    clearSelectedTemplates() {
        this.selectedTemplates = [];
    }

    /**
     * Generate combined template text from selected templates
     */
    generateCombinedTemplateText(taskDescription = '', outputFormat = '') {
        if (this.selectedTemplates.length === 0) return '';

        const combinedTemplateTexts = this.selectedTemplates.map(templateId => {
            const template = this.templateBlocks[templateId];
            if (!template) return '';

            let templateText = template.template;
            
            // Replace placeholders with values
            templateText = templateText.replace(/{task_description}/g, taskDescription);
            templateText = templateText.replace(/{output_format}/g, outputFormat);
            
            // Replace other template fields
            if (this.currentTemplateFields) {
                Object.keys(this.currentTemplateFields).forEach(field => {
                    const value = this.currentTemplateFields[field] || `[${field}]`;
                    templateText = templateText.replace(new RegExp(`{${field}}`, 'g'), value);
                });
            }
            
            return templateText;
        });
        
        // Join templates with separators
        return combinedTemplateTexts.join('\n\n---\n\n');
    }

    /**
     * Select all templates
     */
    selectAllTemplates() {
        this.getAllTemplates().forEach(template => {
            this.addTemplate(template.id);
        });
        
        // Update checkboxes in UI
        this.getAllTemplates().forEach(template => {
            const checkbox = document.getElementById(`template-${template.id}`);
            if (checkbox) {
                checkbox.checked = true;
            }
        });
        
        this.updateUI();
    }

    /**
     * Clear all templates
     */
    clearAllTemplates() {
        this.selectedTemplates = [];
        this.currentTemplateFields = {};
        
        // Update checkboxes in UI
        this.getAllTemplates().forEach(template => {
            const checkbox = document.getElementById(`template-${template.id}`);
            if (checkbox) {
                checkbox.checked = false;
            }
        });
        
        this.updateUI();
    }

    /**
     * Show template preview modal
     */
    showTemplatePreview(templateId) {
        const template = this.getTemplate(templateId);
        if (!template) return;
        
        // Create preview modal content
        const previewContent = `
            <h3>${template.name}</h3>
            <p><strong>Beschreibung:</strong> ${template.description}</p>
            <h4>Template-Struktur:</h4>
            <pre>${template.template}</pre>
            <h4>Felder:</h4>
            <ul>
                ${this.extractFieldsFromTemplate(template.template).map(field => 
                    `<li><strong>${this.formatFieldLabel(field)}:</strong> {${field}}</li>`
                ).join('')}
            </ul>
        `;
        
        // Show in help modal
        const modal = document.getElementById('help-modal');
        if (modal) {
            modal.querySelector('#help-content').innerHTML = previewContent;
            modal.style.display = 'block';
        }
    }

    /**
     * Update UI elements related to templates
     */
    updateUI() {
        // This will be called by the UIManager
        if (this.uiManager) {
            this.uiManager.updateSelectedTemplatesDescription();
            this.uiManager.updateTemplateFields();
        }
    }

    /**
     * Set UIManager reference
     */
    setUIManager(uiManager) {
        this.uiManager = uiManager;
    }

    /**
     * Add dynamic field management methods
     */
    
    /**
     * Add a dynamic field to a template
     */
    addDynamicField(templateId, fieldType, fieldData) {
        if (!this.currentTemplateFields[templateId]) {
            this.currentTemplateFields[templateId] = {};
        }
        
        if (!this.currentTemplateFields[templateId][fieldType]) {
            this.currentTemplateFields[templateId][fieldType] = [];
        }
        
        this.currentTemplateFields[templateId][fieldType].push(fieldData);
        return this.currentTemplateFields[templateId][fieldType].length - 1; // Return index
    }

    /**
     * Remove a dynamic field from a template
     */
    removeDynamicField(templateId, fieldType, fieldIndex) {
        if (this.currentTemplateFields[templateId] && 
            this.currentTemplateFields[templateId][fieldType] &&
            this.currentTemplateFields[templateId][fieldType][fieldIndex] !== undefined) {
            
            this.currentTemplateFields[templateId][fieldType].splice(fieldIndex, 1);
            return true;
        }
        return false;
    }

    /**
     * Get dynamic fields for a template
     */
    getDynamicFields(templateId, fieldType) {
        if (this.currentTemplateFields[templateId] && 
            this.currentTemplateFields[templateId][fieldType]) {
            return this.currentTemplateFields[templateId][fieldType];
        }
        return [];
    }

    /**
     * Update a specific dynamic field
     */
    updateDynamicField(templateId, fieldType, fieldIndex, fieldData) {
        if (this.currentTemplateFields[templateId] && 
            this.currentTemplateFields[templateId][fieldType] &&
            this.currentTemplateFields[templateId][fieldType][fieldIndex] !== undefined) {
            
            this.currentTemplateFields[templateId][fieldType][fieldIndex] = {
                ...this.currentTemplateFields[templateId][fieldType][fieldIndex],
                ...fieldData
            };
            return true;
        }
        return false;
    }

    /**
     * Get template specialized type
     */
    getTemplateType(templateId) {
        const template = this.templateBlocks[templateId];
        return template ? template.id : 'basic';
    }

    /**
     * Get template field definitions
     */
    getTemplateFieldDefinitions(templateId) {
        const template = this.templateBlocks[templateId];
        return template ? template.fields || [] : [];
    }

    /**
     * Get template dynamic field definitions
     */
    getTemplateDynamicFieldDefinitions(templateId) {
        const template = this.templateBlocks[templateId];
        return template ? template.dynamicFields || {} : {};
    }

    /**
     * Check if template has advanced options
     */
    hasAdvancedOptions(templateId) {
        const template = this.templateBlocks[templateId];
        return template && template.advanced && Object.keys(template.advanced).length > 0;
    }

    /**
     * Get template advanced options
     */
    getAdvancedOptions(templateId) {
        const template = this.templateBlocks[templateId];
        return template ? template.advanced || {} : {};
    }

    /**
     * Validate required fields for a template
     */
    validateTemplateFields(templateId) {
        const template = this.templateBlocks[templateId];
        if (!template || !template.fields) return { valid: true, missingFields: [] };

        const missingFields = [];
        
        template.fields.forEach(field => {
            if (field.required && !this.getFieldValue(field.name)) {
                missingFields.push(field.label || field.name);
            }
        });

        return {
            valid: missingFields.length === 0,
            missingFields
        };
    }

    /**
     * Get all selected template types for UI rendering
     */
    getSelectedTemplateTypes() {
        return this.selectedTemplates.map(templateId => ({
            id: templateId,
            template: this.templateBlocks[templateId],
            type: this.getTemplateType(templateId)
        }));
    }
}

// Make TemplateManager available globally
window.TemplateManager = TemplateManager;

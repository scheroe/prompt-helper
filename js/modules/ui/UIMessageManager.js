/**
 * UIMessageManager - Verwaltet Nachrichten und Benachrichtigungen
 */
class UIMessageManager {
    constructor() {
        this.messageContainer = null;
        this.initializeMessageContainer();
    }

    /**
     * Initialize message container if it doesn't exist
     */
    initializeMessageContainer() {
        this.messageContainer = document.getElementById('ui-messages');
        if (!this.messageContainer) {
            this.messageContainer = document.createElement('div');
            this.messageContainer.id = 'ui-messages';
            this.messageContainer.className = 'ui-messages-container';
            document.body.appendChild(this.messageContainer);
        }
    }

    /**
     * Show success message
     */
    showMessage(message, type = 'success') {
        const messageElement = document.createElement('div');
        messageElement.className = `message message-${type}`;
        messageElement.innerHTML = `
            <i class="fas fa-check-circle"></i>
            <span>${message}</span>
            <button class="message-close" title="Schließen">
                <i class="fas fa-times"></i>
            </button>
        `;

        // Add close functionality
        const closeButton = messageElement.querySelector('.message-close');
        closeButton.addEventListener('click', () => {
            this.removeMessage(messageElement);
        });

        // Add to container
        this.messageContainer.appendChild(messageElement);

        // Auto-remove after 3 seconds
        setTimeout(() => {
            this.removeMessage(messageElement);
        }, 3000);

        return messageElement;
    }

    /**
     * Show error message
     */
    showError(message) {
        const errorElement = document.createElement('div');
        errorElement.className = 'message message-error';
        errorElement.innerHTML = `
            <i class="fas fa-exclamation-triangle"></i>
            <span>${message}</span>
            <button class="message-close" title="Schließen">
                <i class="fas fa-times"></i>
            </button>
        `;

        // Add close functionality
        const closeButton = errorElement.querySelector('.message-close');
        closeButton.addEventListener('click', () => {
            this.removeMessage(errorElement);
        });

        // Add to container
        this.messageContainer.appendChild(errorElement);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            this.removeMessage(errorElement);
        }, 5000);

        return errorElement;
    }

    /**
     * Show warning message
     */
    showWarning(message) {
        return this.showMessage(message, 'warning');
    }

    /**
     * Show info message
     */
    showInfo(message) {
        return this.showMessage(message, 'info');
    }

    /**
     * Remove a message element
     */
    removeMessage(messageElement) {
        if (messageElement && messageElement.parentNode) {
            messageElement.classList.add('message-removing');
            setTimeout(() => {
                if (messageElement.parentNode) {
                    messageElement.parentNode.removeChild(messageElement);
                }
            }, 300); // Animation duration
        }
    }

    /**
     * Clear all messages
     */
    clearAllMessages() {
        if (this.messageContainer) {
            this.messageContainer.innerHTML = '';
        }
    }

    /**
     * Show loading message
     */
    showLoading(message = 'Lädt...') {
        const loadingElement = document.createElement('div');
        loadingElement.className = 'message message-loading';
        loadingElement.innerHTML = `
            <i class="fas fa-spinner fa-spin"></i>
            <span>${message}</span>
        `;

        this.messageContainer.appendChild(loadingElement);
        return loadingElement;
    }

    /**
     * Show confirmation dialog
     */
    showConfirmation(message, onConfirm, onCancel) {
        const confirmElement = document.createElement('div');
        confirmElement.className = 'message message-confirm';
        confirmElement.innerHTML = `
            <i class="fas fa-question-circle"></i>
            <span>${message}</span>
            <div class="message-actions">
                <button class="btn btn-confirm">Bestätigen</button>
                <button class="btn btn-cancel">Abbrechen</button>
            </div>
        `;

        const confirmButton = confirmElement.querySelector('.btn-confirm');
        const cancelButton = confirmElement.querySelector('.btn-cancel');

        confirmButton.addEventListener('click', () => {
            this.removeMessage(confirmElement);
            if (onConfirm) onConfirm();
        });

        cancelButton.addEventListener('click', () => {
            this.removeMessage(confirmElement);
            if (onCancel) onCancel();
        });

        this.messageContainer.appendChild(confirmElement);
        return confirmElement;
    }
}

// Add CSS styles for messages if not already present
if (!document.getElementById('ui-messages-styles')) {
    const styles = document.createElement('style');
    styles.id = 'ui-messages-styles';
    styles.textContent = `
        .ui-messages-container {
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            max-width: 400px;
            pointer-events: none;
        }

        .message {
            background: #fff;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            margin-bottom: 10px;
            padding: 16px;
            display: flex;
            align-items: center;
            gap: 12px;
            pointer-events: auto;
            animation: slideIn 0.3s ease-out;
            border-left: 4px solid #4a6cf7;
        }

        .message.message-removing {
            animation: slideOut 0.3s ease-in forwards;
        }

        .message-success {
            border-left-color: #4a6cf7;
        }

        .message-error {
            border-left-color: #ef4444;
        }

        .message-warning {
            border-left-color: #f59e0b;
        }

        .message-info {
            border-left-color: #64748b;
        }

        .message-loading {
            border-left-color: #6b7280;
        }

        .message-confirm {
            border-left-color: #4a6cf7;
            flex-direction: column;
            align-items: flex-start;
        }

        .message i {
            font-size: 18px;
            flex-shrink: 0;
        }

        .message-success i {
            color: #4a6cf7;
        }

        .message-error i {
            color: #ef4444;
        }

        .message-warning i {
            color: #f59e0b;
        }

        .message-info i {
            color: #64748b;
        }

        .message-loading i {
            color: #6b7280;
        }

        .message-confirm i {
            color: #4a6cf7;
        }

        .message span {
            flex: 1;
            font-size: 14px;
            line-height: 1.4;
        }

        .message-close {
            background: none;
            border: none;
            cursor: pointer;
            padding: 4px;
            opacity: 0.6;
            transition: opacity 0.2s;
        }

        .message-close:hover {
            opacity: 1;
        }

        .message-actions {
            display: flex;
            gap: 8px;
            margin-top: 12px;
            width: 100%;
        }

        .message-actions .btn {
            padding: 6px 12px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 12px;
            transition: background-color 0.2s;
        }

        .btn-confirm {
            background: #4a6cf7;
            color: white;
        }

        .btn-confirm:hover {
            background: #3b5ae0;
        }

        .btn-cancel {
            background: #6b7280;
            color: white;
        }

        .btn-cancel:hover {
            background: #4b5563;
        }

        @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }

        @keyframes slideOut {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(100%);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(styles);
}

// Make UIMessageManager available globally
window.UIMessageManager = UIMessageManager;

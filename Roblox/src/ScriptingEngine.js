export class ScriptingEngine {
    constructor() {
        this.scripts = [];
        this.globalVariables = {};
        this.eventHandlers = {};
    }

    // Simple script execution system
    executeScript(code) {
        try {
            // Create a function from the script code
            const scriptFunc = new Function(
                ...Object.keys(this.globalVariables),
                code
            );

            // Execute with global variables as arguments
            return scriptFunc(...Object.values(this.globalVariables));
        } catch (error) {
            console.error('Script execution error:', error);
            return null;
        }
    }

    // Set a global variable accessible to scripts
    setGlobal(name, value) {
        this.globalVariables[name] = value;
    }

    // Register an event handler
    onEvent(eventName, callback) {
        if (!this.eventHandlers[eventName]) {
            this.eventHandlers[eventName] = [];
        }
        this.eventHandlers[eventName].push(callback);
    }

    // Trigger an event
    triggerEvent(eventName, data) {
        if (this.eventHandlers[eventName]) {
            this.eventHandlers[eventName].forEach(handler => {
                handler(data);
            });
        }
    }

    // Add a reusable function for scripts
    addFunction(name, func) {
        this.setGlobal(name, func);
    }
}

/**
 * @description show debug and deprecation messages.
 *
 */

import nodeDebug from 'debug';
import util from 'util';

export class Logger {
    constructor({ context = 'conditionalize', ...rest } = {}) {
        this.config = {
            context,
            ...rest
        };
    }

    /**
     * Logs a warning in the logger's context.
     *
     * @param message The message of the warning.
     */
    warn(message) {
        console.warn(`(${this.config.context}) Warning: ${message}`);
    }

    /**
     * Uses node's util.inspect to stringify a value.
     *
     * @param value The value which should be inspected.
     * @returns The string of the inspected value.
     */
    inspect(value, options) {
        return util.inspect(value, {
            showHidden: false,
            depth: 2,
            ...options
        });
    }

    /**
     * Gets a debugger for a context.
     *
     * @param name The name of the context.
     * @returns A debugger interace which can be used to debug.
     */
    debugCtx(name) {
        return nodeDebug(`${this.config.context}:${name}`);
    }
}

export const logger = new Logger();

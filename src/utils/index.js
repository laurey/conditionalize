/**
 * @description show debug and deprecation messages.
 *
 */

/**
 *
 * @param {string} props
 * @param {string} instead
 */
export function deprecated(props, instead) {
    if (typeof window !== 'undefined' && window.console && window.console.error) {
        window.console.error(`Warning: ${props} is deprecated, ` + `use [ ${instead} ] instead of it.`);
    }
}

/**
 *
 * @param {string} message
 */
export function warn(message) {
    if (process.env.NODE_ENV !== 'production') {
        if (typeof console !== 'undefined' && console.warn) {
            console.warn(message);
        }
    }
}

export function isUndef(v) {
    return v === undefined || v === null;
}

export function isDef(v) {
    return v !== undefined && v !== null;
}

export function isPrimitive(value) {
    return (
        typeof value === 'string' ||
        typeof value === 'symbol' ||
        typeof value === 'number' ||
        typeof value === 'bigint' ||
        typeof value === 'boolean'
    );
}

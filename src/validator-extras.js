/**
 *
 */

import _ from 'lodash';
import moment from 'moment';

const validator = _.cloneDeep({});

const extensions = {
    extend(name, fn) {
        this[name] = fn;

        return this;
    },
    notEmpty(str) {
        return !str.match(/^[\s\t\r\n]*$/);
    },
    regex(str, pattern, modifiers) {
        str += '';
        if (Object.prototype.toString.call(pattern).slice(8, -1) !== 'RegExp') {
            pattern = new RegExp(pattern, modifiers);
        }
        return str.match(pattern);
    },
    notRegex(str, pattern, modifiers) {
        return !this.regex(str, pattern, modifiers);
    },
    not(str, pattern, modifiers) {
        return this.notRegex(str, pattern, modifiers);
    },
    is(str, pattern, modifiers) {
        return this.regex(str, pattern, modifiers);
    }
};

export const addValidationMethod = (name, method) => {
    if (typeof name !== 'string') {
        throw new Error('Error: name must be string');
    }

    if (typeof method !== 'function') {
        throw new Error('Error: method must be function');
    }

    // extensions[name] = method;
    extensions.extend(name, method);
};

export const addValidationMethods = methods => {
    if (typeof methods !== 'object') {
        throw new Error('Error: methods must be object');
    }

    Object.keys(methods).forEach(name => {
        if (Object.prototype.hasOwnProperty.call(methods, name)) {
            addValidationMethod(name, methods[name]);
        }
    });
};

validator.isNotNull = function (value) {
    return value !== null && value !== undefined;
};

validator.isDate = function (dateString) {
    // by doing a preliminary check on `dateString`
    // to avoid http://momentjs.com/guides/#/warnings/js-date/
    const parsed = Date.parse(dateString);
    if (isNaN(parsed)) {
        return false;
    }
    // otherwise convert to ISO-8601 as moment prefers
    const date = new Date(parsed);
    return moment(date.toISOString()).isValid();
};

_.forEach(extensions, (extend, key) => {
    validator[key] = extend;
});

export { extensions, validator };

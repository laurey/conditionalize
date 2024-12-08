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

const default_time_options = {
    hourFormat: 'hour24',
    mode: 'default'
};
const formats = {
    hour24: {
        default: /^([01]?[0-9]|2[0-3]):([0-5][0-9])$/,
        withSeconds: /^([01]?[0-9]|2[0-3]):([0-5][0-9]):([0-5][0-9])$/
    },
    hour12: {
        default: /^(0?[1-9]|1[0-2]):([0-5][0-9]) (A|P)M$/,
        withSeconds: /^(0?[1-9]|1[0-2]):([0-5][0-9]):([0-5][0-9]) (A|P)M$/
    }
};

function merge() {
    const data = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    const args = arguments.length > 1 ? arguments[1] : undefined;
    for (const key in args) {
        if (typeof data[key] === 'undefined') {
            data[key] = args[key];
        }
    }
    return data;
}

validator.isTime = function (input, options) {
    options = merge(options, default_time_options);
    if (typeof input !== 'string') return false;
    return formats[options.hourFormat][options.mode].test(input);
};

_.forEach(extensions, (extend, key) => {
    validator[key] = extend;
});

export { extensions, validator };

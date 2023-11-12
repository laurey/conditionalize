import _ from 'lodash';
import operators from './operators';

const operatorsSet = new Set(_.values(operators));

export function canTreatArrayAsAnd(arr) {
    return arr.some(arg => _.isPlainObject(arg) || arg instanceof Where);
}

export class ConditionalizeMethod {}

export class Where extends ConditionalizeMethod {
    constructor(attribute, comparator, logic) {
        super();
        if (logic === undefined) {
            logic = comparator;
            comparator = '=';
        }

        this.attribute = attribute;
        this.comparator = comparator;
        this.logic = logic;
    }
}

/**
 * getOperators
 *
 * @param  {Object} obj
 * @returns {Array<Symbol>} All operators properties of obj
 */
export function getOperators(obj) {
    return Object.getOwnPropertySymbols(obj).filter(s => operatorsSet.has(s));
}

/**
 * getComplexKeys
 *
 * @param  {Object} obj
 * @returns {Array<string|Symbol>} All keys including operators
 */
export function getComplexKeys(obj) {
    return getOperators(obj).concat(Object.keys(obj));
}

/**
 * getComplexSize
 *
 * @param  {Object|Array} obj
 * @returns {number}      Length of object properties including operators if obj is array returns its length
 */
export function getComplexSize(obj) {
    return Array.isArray(obj) ? obj.length : getComplexKeys(obj).length;
}

/**
 * Returns true if a where clause is empty, even with Symbols
 *
 * @param  {Object} obj
 * @returns {boolean}
 */
export function isWhereEmpty(obj) {
    return !!obj && _.isEmpty(obj) && getOperators(obj).length === 0;
}

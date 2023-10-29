import _ from 'lodash';

import Op from './operators';
import * as Utils from './utils';
import { logger } from './utils/logger';
import OperatorHelpers from './operatorHelpers';
import { extensions as Validator } from './validator-extras';
import { version } from '../package.json';

class Conditionalize {
    constructor(options) {
        this.options = Object.assign(
            {
                logging: console.log
            },
            options || {}
        );

        if (_.isPlainObject(this.options.operatorsAliases)) {
            this.setOperatorsAliases(this.options.operatorsAliases);
        }

        this.OperatorMap = Object.assign(this.options.operatorsMap || {}, this.OperatorMap);
    }

    update(options) {
        this.options = Object.assign(this.options, options || {});
        if (_.isPlainObject(this.options.operatorsAliases)) {
            this.setOperatorsAliases(this.options.operatorsAliases);
        }

        if (_.isPlainObject(this.options.operatorsMap)) {
            this.updateOperators(this.options.operatorsMap);
        }
    }

    check(options, model) {
        options = Object.assign({}, this.options, options);

        if (Object.prototype.hasOwnProperty.call(options, 'where')) {
            const where = this.getWhereConditions(options.where, options, model);
            return where;
        }

        return true;
    }

    _whereGroupBind(key, value, options) {
        const binding = key === Op.or ? Op.or : Op.and;

        if (Array.isArray(value)) {
            if (value.length > 0) {
                const values = value.map(item => {
                    let itemQuery = this.whereItemsQuery(item, options, Op.and);
                    return itemQuery;
                });
                value = this.getValue(values, binding);
            } else {
                value = false;
            }
        } else {
            value = this.whereItemsQuery(value, options, binding);
        }

        // Op.or: [] should return false.
        // Op.not of no restriction should also return false
        if ((key === Op.or || key === Op.not) && !value) {
            return false;
        }

        if (key === Op.not) {
            return !value;
        }

        return value;
    }

    _whereBind(binding, key, value, options) {
        if (_.isPlainObject(value)) {
            value = Utils.getComplexKeys(value).map(prop => {
                const item = value[prop];
                return this.whereItemQuery(key, { [prop]: item }, options);
            });
        } else {
            value = value.map(item => this.whereItemQuery(key, item, options));
        }

        return this.getValue(value, binding);
    }

    getValue(value, prop) {
        let result = value;
        if (Array.isArray(value)) {
            if (!value.length) {
                return false;
            }

            result = value.reduce((prev, item) => {
                switch (prop) {
                    case Op.and:
                        return prev && item;

                    case Op.or:
                        return prev || item;
                    default:
                        return prev;
                }
            });
        }

        return _.isBoolean(result) ? result : Boolean(result);
    }

    /**
     * Will extract arguments for the validator.
     *
     * @param {*} test The test case.
     * @param {string} validatorType One of known to validators.
     * @param {string} field The field that is being validated.
     */
    _extractValidatorArgs(test, validatorType, field) {
        let validatorArgs = _.get(test, 'args', test);
        const isLocalizedValidator =
            typeof validatorArgs !== 'string' &&
            (validatorType === 'isAlpha' || validatorType === 'isAlphanumeric' || validatorType === 'isMobilePhone');

        if (!Array.isArray(validatorArgs)) {
            if (validatorType === 'isImmutable') {
                validatorArgs = [validatorArgs, field, this.modelInstance];
            } else if (isLocalizedValidator || validatorType === 'isIP') {
                validatorArgs = [];
            } else {
                // @TODO: may support transform SQL Query LIKE condition text (exp: 'see%') to RegexpExp (/^see/)
                validatorArgs = [validatorArgs];
            }
        } else {
            validatorArgs = validatorArgs.slice(0);
        }
        return validatorArgs;
    }

    joinKeyValue(key, value, prop, options) {
        if (!key) {
            return value;
        }

        let comparator = this.OperatorMap[prop] || this.OperatorMap[Op.eq];
        if (comparator === undefined) {
            const msg = `${key} and ${value} has no comparison operator`;
            process.env.NODE_ENV !== 'production' && logger.warn(msg);
            throw new Error(msg);
        }

        return this._joinKeyValue(key, value, prop, options);
    }

    _getEqualValue(value, other) {
        return value == other;
    }

    _getEqualEqualValue(value, other) {
        return value === other;
    }

    _getNotEqualValue(value, other) {
        return value != other;
    }

    _getNotEqualEqualValue(value, other) {
        return value !== other;
    }

    _getLessThanValue(value, other) {
        return value < other;
    }

    _getLessThanEqualValue(value, other) {
        return value <= other;
    }

    _getGreatThanValue(value, other) {
        return value > other;
    }

    _getGreatThanEqualValue(value, other) {
        return value >= other;
    }

    _getInValue(value, target) {
        return _.includes(value, target);
    }

    _getBetweenValue(value, other) {
        return this._getGreatThanEqualValue(other, value[0]) && this._getLessThanEqualValue(other, value[1]);
    }

    _getLikeValue(key, value, prop, options) {
        if (typeof key !== 'string' && !Array.isArray(key)) {
            const msg = `Invalid type of key: ${key}. key should be string or array.`;
            process.env.NODE_ENV !== 'production' && logger.warn(msg);
            throw new Error(msg);
        }
        const targetValue = _.get(options.dataSource, key);

        let validatorType = this.OperatorMap[prop];
        if (prop === Op.is || prop === Op.not) {
            validatorType = this.OperatorMap[prop].toLowerCase();
        }

        if (typeof Validator[validatorType] !== 'function') {
            const msg = `Invalid validator function: ${validatorType}`;
            process.env.NODE_ENV !== 'production' && logger.warn(msg);
            throw new Error(msg);
        }

        const validatorArgs = this._extractValidatorArgs(
            {
                args: value
            },
            validatorType,
            key
        );
        const result = Validator[validatorType](targetValue, ...validatorArgs);
        return Boolean(result);
    }

    _joinKeyValue(key, value, prop, options) {
        const targetValue = _.get(options.dataSource, key);
        if (typeof key !== 'string' && !Array.isArray(key)) {
            const msg = `Expect typeof key to be string or array, but got: "${typeof key}".`;
            process.env.NODE_ENV !== 'production' && logger.warn(msg);
            throw new Error(msg);
        }

        switch (prop) {
            case Op.ne:
            case Op.neq:
            case Op.neqeq:
                return !_.isEqual(targetValue, value);
            case Op.eq:
            case Op.eqeq:
                return _.isEqual(targetValue, value);
            case Op.lt:
                return targetValue < value;
            case Op.lte:
                return targetValue <= value;
            case Op.gt:
                return targetValue > value;
            case Op.gte:
                return targetValue >= value;
            case Op.is:
            case Op.like:
                return this._getLikeValue(key, value, Op.is, options);
            case Op.not:
            case Op.notLike:
                return this._getLikeValue(key, value, Op.not, options);
            case Op.in:
            case Op.notIn:
                return prop === Op.in ? _.includes(value, targetValue) : !_.includes(value, targetValue);
            // case Op.between:
            //     return this._getBetweenValue(value, targetValue);
            // case Op.notBetween:
            //     return !this._getBetweenValue(value, targetValue);
            case Op.startsWith:
                return typeof targetValue === 'string' && typeof value === 'string' && _.startsWith(targetValue, value);
            case Op.endsWith:
                return typeof targetValue === 'string' && typeof value === 'string' && _.endsWith(targetValue, value);
            case Op.substring:
                return typeof targetValue === 'string' && typeof value === 'string' && _.includes(targetValue, value);
            case Op.any:
            case Op.all:
                if (prop === Op.any) {
                    if (Array.isArray(targetValue)) {
                        if (Array.isArray(value)) {
                            return _.isEqual(targetValue, value);
                        }

                        return _.some(targetValue, item => {
                            return _.isEqual(item, value);
                        });
                    }

                    if (!Array.isArray(targetValue)) {
                        if (Array.isArray(value)) {
                            return _.some(value, item => {
                                return _.isEqual(targetValue, item);
                            });
                        }
                        return _.isEqual(targetValue, value);
                    }
                }

                if (Array.isArray(targetValue)) {
                    if (Array.isArray(value)) {
                        return _.isEqual(targetValue, value);
                    }

                    return _.every(targetValue, item => {
                        return _.isEqual(item, value);
                    });
                }

                if (!Array.isArray(targetValue)) {
                    if (Array.isArray(value)) {
                        return _.every(value, item => {
                            return _.isEqual(targetValue, item);
                        });
                    }
                    return _.isEqual(targetValue, value);
                }
        }

        return false;
    }

    _whereParseSingleValueObject(key, prop, value, options) {
        if (prop === Op.not) {
            if (Array.isArray(value)) {
                prop = Op.notIn;
            } else if (value !== null && value !== true && value !== false) {
                prop = Op.ne;
            }
        }

        switch (prop) {
            case Op.any:
            case Op.all:
                if (value[Op.values]) {
                    return this.joinKeyValue(key, value[Op.values], prop, options);
                }
                return this.joinKeyValue(key, this.escape(value), prop, options);
            case Op.col:
                return this.joinKeyValue(key, this.escape(_.get(options.dataSource, value)), Op.eq, options);
        }

        if (_.isPlainObject(value)) {
            if (value[Op.col]) {
                return this.joinKeyValue(key, this.whereItemQuery(null, value, options), prop, options);
            }

            if (value[Op.any]) {
                let binding = Op.or;
                // if (prop === Op.not || prop === Op.notLike || prop === Op.notBetween || prop === Op.notIn) {
                if (prop === Op.not || prop === Op.notLike || prop === Op.notIn) {
                    binding = Op.and;
                }

                if (_.isPlainObject(value)) {
                    value = Utils.getComplexKeys(value).map(propInValue => {
                        const values = value[propInValue];
                        if (!values.length) {
                            return true;
                        }

                        if (prop === Op.in || prop === Op.notIn) {
                            return this.whereItemQuery(key, { [prop]: values }, options);
                        }

                        const result = values.map(item => {
                            return this.whereItemQuery(key, { [prop]: item }, options);
                        });
                        return this.getValue(result, binding);
                    });
                } else {
                    value = value.map(item => this.whereItemQuery(key, item, options));
                }

                return this.getValue(value, Op.or);
            }

            if (value[Op.all]) {
                if (_.isPlainObject(value)) {
                    value = Utils.getComplexKeys(value).map(propInValue => {
                        const values = value[propInValue];
                        const result = values.map(item => {
                            return this.whereItemQuery(key, { [prop]: item }, options);
                        });
                        return this.getValue(result, Op.and);
                    });
                } else {
                    value = value.map(item => this.whereItemQuery(key, item, options));
                }

                return this.getValue(value, Op.and);
            }
        }

        return this.joinKeyValue(key, this.escape(value), prop, options);
    }

    getWhereConditions(smth, options, factory) {
        const where = {};

        options = options || {};

        if (_.isPlainObject(smth)) {
            return this.whereItemsQuery(smth, options);
        }

        if (typeof smth === 'number') {
            let primaryKeys = factory ? Object.keys(factory.primaryKeys) : [];

            if (primaryKeys.length > 0) {
                // assume only the first key
                primaryKeys = primaryKeys[0];
            } else {
                primaryKeys = 'id';
            }

            where[primaryKeys] = smth;

            return this.whereItemsQuery(where, options);
        }

        if (typeof smth === 'string') {
            return this.whereItemsQuery(smth, options);
        }

        if (Array.isArray(smth)) {
            if (smth.length === 0 || (smth.length > 0 && smth[0]?.length === 0)) {
                return true;
            }

            if (Utils.canTreatArrayAsAnd(smth)) {
                const _smth = { [Op.and]: smth };
                return this.getWhereConditions(_smth, options, factory);
            }

            return Boolean(smth);
        }

        if (smth === null || smth === undefined) {
            return this.whereItemsQuery(smth, options);
        }

        return true;
    }

    whereItemsQuery(where, options, prop) {
        if (where === null || where === undefined || Utils.getComplexSize(where) === 0) {
            return true;
        }

        if (typeof where === 'string') {
            const msg = "Not support for `{where: 'raw query'}`.";
            process.env.NODE_ENV !== 'production' && logger.warn(msg);
            throw new Error(msg);
        }

        const items = [];

        prop = prop || Op.and;

        if (_.isPlainObject(where)) {
            Utils.getComplexKeys(where).forEach(whr => {
                const item = where[whr];
                items.push(this.whereItemQuery(whr, item, options));
            });
        } else {
            items.push(this.whereItemQuery(undefined, where, options));
        }

        return this.getValue(items, prop);
    }

    whereItemQuery(key, value, options) {
        const isPlainObject = _.isPlainObject(value);
        const isArray = !isPlainObject && Array.isArray(value);
        key = (this.OperatorsAliasMap && this.OperatorsAliasMap[key]) || key;
        if (isPlainObject) {
            value = this._replaceAliases(value);
        }

        const valueKeys = isPlainObject && Utils.getComplexKeys(value);

        if (key === undefined) {
            if (typeof value === 'string') {
                return Boolean(value);
            }

            if (isPlainObject && valueKeys.length === 1) {
                return this.whereItemQuery(valueKeys[0], value[valueKeys[0]], options);
            }
        }

        if (!value) {
            // const opValue = this.escape(value);
            return this.joinKeyValue(key, value, Op.eq, options);
        }

        // Convert where: [] to Op.and if possible, else treat as literal/replacements
        if (key === undefined && isArray) {
            if (Utils.canTreatArrayAsAnd(value)) {
                key = Op.and;
            } else {
                const msg = 'Literal replacements in the `where` object is not supported.';
                process.env.NODE_ENV !== 'production' && logger.warn(msg);
                throw new Error(msg);
            }
        }

        if (key === Op.or || key === Op.and || key === Op.not) {
            return this._whereGroupBind(key, value, options);
        }

        if (value[Op.or]) {
            return this._whereBind(Op.or, key, value[Op.or], options);
        }

        if (value[Op.and]) {
            return this._whereBind(Op.and, key, value[Op.and], options);
        }

        // If multiple keys then combine the different logic conditions
        if (isPlainObject && valueKeys.length > 1) {
            return this._whereBind(Op.and, key, value, options);
        }

        if (isArray) {
            return this._whereParseSingleValueObject(key, Op.in, value, options);
        }

        if (isPlainObject) {
            if (this.OperatorMap[valueKeys[0]]) {
                return this._whereParseSingleValueObject(key, valueKeys[0], value[valueKeys[0]], options);
            }
            return this._whereParseSingleValueObject(key, Op.eq, value, options);
        }

        // const opValue = this.escape(value);
        return this.joinKeyValue(key, value, Op.eq, options);
    }

    escape(value) {
        return value;
    }

    static and(...args) {
        return { [Op.and]: args };
    }

    static or(...args) {
        return { [Op.or]: args };
    }

    static where(attr, comparator, logic) {
        return new Utils.Where(attr, comparator, logic);
    }
}

Conditionalize.Op = Op;
Conditionalize.Utils = Utils;
Conditionalize.version = version;

Conditionalize.prototype.and = Conditionalize.and;
Conditionalize.prototype.or = Conditionalize.or;
Conditionalize.prototype.where = Conditionalize.where;
Conditionalize.prototype.Conditionalize = Conditionalize;
Conditionalize.prototype.Validator = Conditionalize.Validator = Validator;

Object.assign(Conditionalize.prototype, OperatorHelpers);

export default Conditionalize;

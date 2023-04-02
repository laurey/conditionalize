'use strict';

import _ from 'lodash';
import Op from './operators';
import * as Utils from './utils';

const OperatorHelpers = {
    OperatorMap: {
        [Op.eq]: '=',
        [Op.eqeq]: '==',
        [Op.ne]: '!=',
        [Op.neq]: '!=',
        [Op.neqeq]: '!==',
        [Op.gte]: '>=',
        [Op.gt]: '>',
        [Op.lte]: '<=',
        [Op.lt]: '<',
        [Op.not]: 'NOT',
        [Op.is]: 'IS',
        [Op.in]: 'IN',
        [Op.notIn]: 'NOT IN',
        [Op.like]: 'LIKE',
        [Op.notLike]: 'NOT LIKE',
        [Op.startsWith]: 'LIKE',
        [Op.endsWith]: 'LIKE',
        [Op.substring]: 'LIKE',
        [Op.or]: 'OR',
        [Op.all]: 'ALL',
        [Op.and]: 'AND',
        [Op.any]: 'ANY',
        [Op.col]: 'COL'
        // [Op.between]: 'BETWEEN',
        // [Op.notBetween]: 'NOT BETWEEN'
        // custom
        // [Op.isDate]: 'isDate'
        // [Op.isIPv4]: 'isIPv4'
    },

    OperatorsAliasMap: {},

    updateOperators(operators) {
        if (_.isPlainObject(operators)) {
            this.OperatorMap = Object.assign(this.OperatorMap, operators);
        }
    },

    setOperatorsAliases(aliases) {
        if (!aliases || _.isEmpty(aliases)) {
            this.OperatorsAliasMap = false;
        } else {
            this.OperatorsAliasMap = Object.assign({}, aliases);
        }
    },

    _replaceAliases(orig) {
        const obj = {};
        if (!this.OperatorsAliasMap) {
            return orig;
        }

        Utils.getOperators(orig).forEach(op => {
            const item = orig[op];
            if (_.isPlainObject(item)) {
                obj[op] = this._replaceAliases(item);
            } else {
                obj[op] = item;
            }
        });

        _.forOwn(orig, (item, prop) => {
            prop = this.OperatorsAliasMap[prop] || prop;
            if (_.isPlainObject(item)) {
                item = this._replaceAliases(item);
            }
            obj[prop] = item;
        });
        return obj;
    }
};

export default OperatorHelpers;

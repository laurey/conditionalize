import util from 'util';
import Conditionalize from '../src/conditionalize';

const { Op } = Conditionalize;

describe('Options.operatorsAliases as aliases for operators', () => {
    const applyTest = function (where, params, expectation, ignore = false) {
        const options = { ...params };
        if (ignore !== true) {
            Object.assign(options, { where });
        }

        it(
            util.inspect(typeof where === 'object' ? where : { where }, { depth: 5 }) +
                ((options && `, ${util.inspect(options, { depth: 5 })}`) || ''),
            () => {
                const ins = new Conditionalize(options);
                return expect(ins.check()).toBe(expectation);
            }
        );
    };

    const operatorsAliases = {
        $gt: Op.gt,
        $lt: Op.lt,
        $and: Op.and,
        $eq: Op.eq
    };
    const options = {
        operatorsAliases,
        dataSource: {
            id: 5,
            hours: 8,
            authorId: 33
        }
    };

    applyTest(
        {
            hours: { $gt: 5 },
            authorId: 33
        },
        options,
        true
    );
    applyTest(
        {
            hours: { $gt: 5 },
            id: { $lt: 11 }
        },
        options,
        true
    );
});

import util from 'util';

import Conditionalize from '../src/conditionalize';

describe('whereItemsQuery method', () => {
    const testQuery = function (where, options, expectation) {
        if (expectation === undefined) {
            expectation = options;
            options = undefined;
        }

        it(`${util.inspect(where, { depth: 10 })}: ${(options && `, ${util.inspect(options)}`) || ''}`, () => {
            const ins = new Conditionalize();
            return expect(ins.whereItemsQuery(where, options)).toBe(expectation);
        });
    };

    testQuery(0, {}, true);
    testQuery(false, {}, true);
    testQuery('', {}, true);
    testQuery(null, {}, true);
    testQuery(undefined, {}, true);
    testQuery({}, {}, true);
    testQuery([], {}, true);

    testQuery(
        {
            name: 'horse'
        },
        {
            dataSource: {
                name: 'horse',
                age: 33
            }
        },
        true
    );
});

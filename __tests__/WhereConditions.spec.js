import util from 'util';

import Conditionalize from '../src/conditionalize';

const { Op } = Conditionalize;

describe('whereQuery method', () => {
    const testQuery = function (where, options, expectation) {
        if (expectation === undefined) {
            expectation = options;
            options = undefined;
        }

        it(util.inspect(where, { depth: 10 }) + ((options && `, ${util.inspect(options)}`) || ''), () => {
            const ins = new Conditionalize(options);
            return expect(ins.whereQuery(where, options)).toBe(expectation);
        });
    };

    testQuery(null, {}, true);
    testQuery(undefined, {}, true);
    testQuery({}, {}, true);
    testQuery([], {}, true);

    testQuery(
        { id: undefined },
        {
            dataSource: {
                id: 1
            }
        },
        false
    );

    testQuery(
        { id: 11 },
        {
            dataSource: {
                id: 11
            }
        },
        true
    );

    testQuery(
        { id: 22, name: undefined },
        {
            dataSource: {
                id: 22,
                name: null
            }
        },
        false
    );

    testQuery(
        {
            name: 'the king of',
            [Op.or]: [{ id: [11, 12, 15] }, { id: { [Op.gte]: 20 } }]
        },
        {
            dataSource: {
                id: 26,
                name: 'the king of'
            }
        },
        true
    );

    testQuery(
        {
            name: 'an apple',
            id: { [Op.or]: [[1, 3, 5], { [Op.gte]: 13 }] }
        },
        {
            dataSource: {
                id: 13,
                name: 'an apple'
            }
        },
        true
    );

    testQuery(
        {
            name: 'an orange \0'
        },
        {
            dataSource: {
                addr: 'gogogo',
                name: 'an orange \0'
            }
        },
        true
    );
});

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

    testQuery(
        null,
        {
            dataSource: {
                name: 'html'
            }
        },
        true
    );

    testQuery(
        undefined,
        {
            dataSource: {
                name: 'css'
            }
        },
        true
    );
    testQuery(
        {},
        {
            dataSource: {
                name: 'less',
                age: 11
            }
        },
        true
    );
    testQuery(
        [],
        {
            dataSource: {
                name: 'pie',
                age: 22
            }
        },
        true
    );
    testQuery(
        'name',
        {
            dataSource: {
                name: 'beer',
                age: 23
            }
        },
        false
    );
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

describe('whereItemQuery method', () => {
    const testQuery = function (key, value, options, expectation) {
        if (expectation === undefined) {
            expectation = options;
            options = undefined;
        }

        it(`${String(key)}: ${util.inspect(value, { depth: 10 })}${
            (options && `, ${util.inspect(options)}`) || ''
        }`, () => {
            const ins = new Conditionalize();
            return expect(ins.whereItemQuery(key, value, options)).toBe(expectation);
        });
    };

    testQuery(
        'name',
        'juice',
        {
            dataSource: {
                name: 'juice'
            }
        },
        true
    );
});

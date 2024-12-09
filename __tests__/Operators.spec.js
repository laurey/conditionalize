import util from 'node:util';

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

describe('Operator symbols', () => {
    const testQuery = function (where, params, expectation, ignore = false) {
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

    describe('Op.and', () => {
        testQuery(
            { [Op.and]: [] },
            {
                dataSource: {
                    id: 1,
                    name: 'mike',
                    age: 22,
                    authorId: 11
                }
            },
            false
        );

        testQuery(
            { [Op.and]: {} },
            {
                dataSource: {
                    id: 1,
                    name: 'mike',
                    age: 22,
                    authorId: 11
                }
            },
            true
        );

        testQuery(
            { [Op.and]: 1 },
            {
                dataSource: {
                    id: 1,
                    name: 'mike',
                    age: 22,
                    authorId: 11
                }
            },
            true
        );

        testQuery(
            { [Op.and]: [{ name: 'mike' }] },
            {
                dataSource: {
                    id: 1,
                    name: 'mike',
                    age: 22,
                    authorId: 11
                }
            },
            true
        );

        testQuery(
            { [Op.and]: [{ name: 'mike' }, { age: 22 }] },
            {
                dataSource: {
                    id: 1,
                    name: 'mike',
                    age: 22,
                    authorId: 11
                }
            },
            true
        );
    });

    describe('Op.or', () => {
        testQuery(
            {
                authorId: { [Op.or]: [12, 13] }
            },
            {
                dataSource: {
                    id: 1,
                    name: 'mike',
                    age: 22,
                    authorId: 11
                }
            },
            false
        );

        testQuery(
            { [Op.or]: [{ name: 'mike' }, { name: 'jane' }] },
            {
                dataSource: {
                    id: 1,
                    name: 'mike',
                    age: 22,
                    authorId: 11
                }
            },
            true
        );

        testQuery(
            { [Op.or]: { name: 'leo', authorId: 11 } },
            {
                dataSource: {
                    id: 1,
                    name: 'mike',
                    age: 22,
                    authorId: 11
                }
            },
            true
        );

        testQuery(
            {
                [Op.or]: [
                    {
                        authorId: 10
                    },
                    {
                        authorId: 12,
                        name: 'leo'
                    }
                ]
            },
            {
                dataSource: {
                    id: 1,
                    name: 'mike',
                    age: 22,
                    authorId: 11
                }
            },
            false
        );

        testQuery(
            { [Op.or]: [] },
            {
                dataSource: {
                    id: 1,
                    name: 'mike',
                    age: 22,
                    authorId: 11
                }
            },
            false
        );

        testQuery(
            { [Op.or]: {} },
            {
                dataSource: {
                    id: 1,
                    name: 'mike',
                    age: 22,
                    authorId: 11
                }
            },
            true
        );

        testQuery(
            { [Op.or]: 1 },
            {
                dataSource: {
                    id: 1,
                    name: 'mike',
                    age: 22,
                    authorId: 11
                }
            },
            true
        );
    });

    describe('Op.not', () => {
        testQuery(
            { country: { [Op.not]: ['us', 'uk'] } }, // Op.notIn
            {
                dataSource: {
                    id: 1,
                    country: 'US',
                    name: 'mike',
                    age: 22,
                    authorId: 11
                }
            },
            true
        );

        testQuery(
            { deleted: { [Op.not]: false } }, // String.match
            {
                dataSource: {
                    id: 1,
                    country: 'US',
                    name: 'mike',
                    age: 22,
                    authorId: 11,
                    deleted: false
                }
            },
            false
        );

        testQuery(
            { addr: { [Op.not]: null } }, // String.match
            {
                dataSource: {
                    id: 1,
                    country: 'US',
                    name: 'mike',
                    age: 22,
                    authorId: 11,
                    deleted: false,
                    addr: 'nil'
                }
            },
            true
        );

        testQuery(
            { favors: { [Op.not]: 'app' } }, // Op.ne
            {
                dataSource: {
                    id: 1,
                    country: 'US',
                    name: 'mike',
                    age: 22,
                    authorId: 11,
                    deleted: false,
                    favors: 'apple'
                }
            },
            true
        );

        testQuery(
            { age: { [Op.not]: 55 } }, // Op.ne
            {
                dataSource: {
                    id: 1,
                    country: 'US',
                    name: 'mike',
                    age: 22,
                    authorId: 11,
                    deleted: false,
                    favors: 'apple'
                }
            },
            true
        );

        // testQuery({ [Op.not]: [] }, {}, false);
        // testQuery({ [Op.not]: {} }, {}, false);
        // testQuery({ [Op.not]: null }, {}, false);
        // testQuery({ [Op.not]: undefined }, {}, false);
        // testQuery({ [Op.not]: '' }, {}, false);
        // testQuery({ [Op.not]: 1 }, {}, false);
        // testQuery({ [Op.not]: 0 }, {}, false);
    });

    describe('Op.is', () => {
        testQuery(
            {
                name: { [Op.is]: ['MIKE', 'i'] }
            },
            {
                dataSource: {
                    id: 1,
                    country: 'US',
                    name: 'Mike',
                    age: 22,
                    authorId: 11,
                    deleted: false,
                    favors: 'apple'
                }
            },
            true
        );
        testQuery(
            {
                name: { [Op.is]: /mik/i }
            },
            {
                dataSource: {
                    id: 1,
                    country: 'US',
                    name: 'Mike',
                    age: 22,
                    authorId: 11,
                    deleted: false,
                    favors: 'apple'
                }
            },
            true
        );

        testQuery(
            { deleted: { [Op.is]: 'th' } }, // String.match
            {
                dataSource: {
                    id: 1,
                    country: 'US',
                    name: 'Mike',
                    age: 22,
                    authorId: 11,
                    deleted: 'truthy',
                    favors: 'apple'
                }
            },
            true
        );

        testQuery(
            { deleted: { [Op.is]: true } }, // String.match
            {
                dataSource: {
                    id: 1,
                    country: 'US',
                    name: 'Mike',
                    age: 22,
                    authorId: 11,
                    deleted: true,
                    favors: 'apple'
                }
            },
            true
        );

        // testQuery({ [Op.is]: [] }, {}, false);
        // testQuery({ [Op.is]: {} }, {}, false);
        // testQuery({ [Op.is]: 1 }, {}, false);
        // testQuery({ [Op.is]: null }, {}, true);
        // testQuery({ [Op.is]: undefined }, {}, true);
        // testQuery({ [Op.is]: '' }, {}, true);
        // testQuery({ [Op.is]: 0 }, {}, true);
    });

    describe('Op.like', () => {
        testQuery(
            {
                name: { [Op.like]: /mike/ }
            },
            {
                dataSource: {
                    id: 1,
                    country: 'US',
                    name: 'Mike',
                    age: 22,
                    authorId: 11,
                    deleted: true,
                    favors: 'apple'
                }
            },
            false
        );
        testQuery(
            {
                name: { [Op.like]: /mi/i }
            },
            {
                dataSource: {
                    id: 1,
                    country: 'US',
                    name: 'Mike',
                    age: 22,
                    authorId: 11,
                    deleted: true,
                    favors: 'apple'
                }
            },
            true
        );
        testQuery(
            {
                name: { [Op.like]: ['ke', 'i'] }
            },
            {
                dataSource: {
                    id: 1,
                    country: 'US',
                    name: 'Mike',
                    age: 22,
                    authorId: 11,
                    deleted: true,
                    favors: 'apple'
                }
            },
            true
        );

        testQuery(
            {
                favors: {
                    [Op.like]: 'se'
                }
            },
            {
                dataSource: {
                    id: 1,
                    country: 'US',
                    name: 'Mike',
                    age: 22,
                    authorId: 11,
                    deleted: true,
                    favors: ['rose', 'mario']
                }
            },
            true
        );

        testQuery(
            {
                name: {
                    [Op.like]: {
                        [Op.any]: ['mike', 'mairio']
                    }
                }
            },
            {
                dataSource: {
                    id: 1,
                    country: 'US',
                    name: 'Mike',
                    age: 22,
                    authorId: 11,
                    deleted: true,
                    favors: ['rose', 'mario']
                }
            },
            false
        );

        testQuery(
            {
                name: {
                    [Op.like]: {
                        [Op.any]: ['ke', 'niKE']
                    }
                }
            },
            {
                dataSource: {
                    id: 1,
                    country: 'US',
                    name: 'Mike',
                    age: 22,
                    authorId: 11,
                    deleted: true,
                    favors: ['rose', 'mario']
                }
            },
            true
        );
    });

    describe('Op.notLike', () => {
        testQuery(
            {
                name: { [Op.notLike]: /mary/ }
            },
            {
                dataSource: {
                    id: 1,
                    country: 'US',
                    name: 'Mike',
                    age: 22,
                    authorId: 11,
                    deleted: true,
                    favors: ['rose', 'mario']
                }
            },
            true
        );
        testQuery(
            {
                name: { [Op.notLike]: /marya/i }
            },
            {
                dataSource: {
                    id: 1,
                    country: 'US',
                    name: 'Mike',
                    age: 22,
                    authorId: 11,
                    deleted: true,
                    favors: ['rose', 'mario']
                }
            },
            true
        );
        testQuery(
            {
                name: { [Op.notLike]: ['mike', 'g'] }
            },
            {
                dataSource: {
                    id: 1,
                    country: 'US',
                    name: 'Mike',
                    age: 22,
                    authorId: 11,
                    deleted: true,
                    favors: ['rose', 'mario']
                }
            },
            true
        );

        testQuery(
            {
                favors: {
                    [Op.notLike]: 'see'
                }
            },
            {
                dataSource: {
                    id: 1,
                    country: 'US',
                    name: 'Mike',
                    age: 22,
                    authorId: 11,
                    deleted: true,
                    favors: ['rose', 'mario']
                }
            },
            true
        );

        testQuery(
            {
                name: { [Op.notLike]: ['mary$', 'i'] }
            },
            {
                dataSource: {
                    id: 1,
                    country: 'US',
                    name: 'Mike',
                    age: 22,
                    authorId: 11,
                    deleted: true,
                    favors: ['rose', 'mario']
                }
            },
            true
        );
    });

    describe('Op.col', () => {
        testQuery(
            { name: { [Op.col]: 'alias' } },
            {
                dataSource: {
                    id: 1,
                    country: 'US',
                    name: 'Mike',
                    age: 22,
                    authorId: 11,
                    deleted: true,
                    favors: ['rose', 'mario'],
                    alias: 'Mike'
                }
            },
            true
        );

        testQuery(
            { hobby: { [Op.col]: 'favors' } },
            {
                dataSource: {
                    id: 1,
                    country: 'US',
                    name: 'Mike',
                    age: 22,
                    authorId: 11,
                    deleted: true,
                    favors: ['rose', 'mario'],
                    hobby: ['rose', 'mario']
                }
            },
            true
        );
        testQuery(
            { favors: { [Op.eq]: { [Op.col]: 'hobby' } } },
            {
                dataSource: {
                    id: 1,
                    country: 'US',
                    name: 'Mike',
                    age: 22,
                    authorId: 11,
                    deleted: true,
                    favors: ['rose', 'mario'],
                    hobby: ['rose', 'mario']
                }
            },
            true
        );
        testQuery(
            { count: { [Op.like]: { [Op.col]: 'total' } } },
            {
                dataSource: {
                    id: 1,
                    country: 'US',
                    name: 'Mike',
                    age: 22,
                    authorId: 11,
                    deleted: true,
                    favors: ['rose', 'mario'],
                    hobby: ['rose', 'mario'],
                    count: '23aag',
                    total: '3a'
                }
            },
            true
        );

        testQuery(
            { age: { [Op.gt]: { [Op.col]: 'demo.ageAlias' } } },
            {
                dataSource: {
                    id: 1,
                    country: 'US',
                    name: 'Mike',
                    age: 22,
                    authorId: 11,
                    deleted: true,
                    favors: ['rose', 'mario'],
                    hobby: ['rose', 'mario'],
                    count: '23aag',
                    total: '3a',
                    demo: { ageAlias: 11 }
                }
            },
            true
        );
    });

    describe('Op.gt/Op.gte', () => {
        testQuery(
            {
                age: { [Op.gt]: 5 }
            },
            {
                dataSource: {
                    id: 1,
                    country: 'US',
                    name: 'Mike',
                    age: 22,
                    authorId: 11,
                    deleted: 'true',
                    favors: 'apple'
                }
            },
            true
        );

        testQuery(
            {
                age: { [Op.gte]: 6 }
            },
            {
                dataSource: {
                    id: 1,
                    country: 'US',
                    name: 'Mike',
                    age: 22,
                    authorId: 11,
                    deleted: 'true',
                    favors: 'apple'
                }
            },
            true
        );

        testQuery(
            'age',
            {
                where: {
                    age: {
                        [Op.gt]: 10
                    }
                },
                dataSource: {
                    id: 1,
                    country: 'US',
                    name: 'Mike',
                    age: 22,
                    authorId: 11,
                    deleted: 'true',
                    favors: 'apple'
                }
            },
            true,
            true
        );
    });

    describe('Op.lt/Op.lte', () => {
        testQuery(
            {
                likes: { [Op.lt]: 5 }
            },
            {
                dataSource: {
                    id: 1,
                    country: 'US',
                    name: 'Mike',
                    age: 22,
                    authorId: 11,
                    deleted: 'true',
                    favors: 'apple',
                    likes: 3
                }
            },
            true
        );

        testQuery(
            {
                likes: { [Op.lte]: 6 }
            },
            {
                dataSource: {
                    id: 1,
                    country: 'US',
                    name: 'Mike',
                    age: 22,
                    authorId: 11,
                    deleted: 'true',
                    favors: 'apple',
                    likes: 3
                }
            },
            true
        );

        testQuery(
            'age',
            {
                where: {
                    age: {
                        // [Op.lte]: { [Op.col]: 'count' }
                        [Op.lte]: 22
                    }
                },
                dataSource: {
                    id: 1,
                    country: 'US',
                    name: 'Mike',
                    age: 22,
                    authorId: 11,
                    deleted: 'true',
                    favors: 'apple',
                    likes: 3
                }
            },
            true,
            true
        );
    });

    describe('Op.in/Op.notIn', () => {
        testQuery(
            {
                likes: { [Op.in]: [1, 3] }
            },
            {
                dataSource: {
                    id: 1,
                    country: 'US',
                    name: 'Mike',
                    age: 22,
                    authorId: 11,
                    deleted: 'true',
                    favors: 'apple',
                    likes: 3
                }
            },
            true
        );

        testQuery(
            {
                likes: { [Op.in]: [1, '11'] }
            },
            {
                dataSource: {
                    id: 1,
                    country: 'US',
                    name: 'Mike',
                    age: 22,
                    authorId: 11,
                    deleted: 'true',
                    favors: 'apple',
                    likes: '11'
                }
            },
            true
        );

        testQuery(
            {
                likes: { [Op.in]: { up: 11, down: 1 } }
            },
            {
                dataSource: {
                    id: 1,
                    country: 'US',
                    name: 'Mike',
                    age: 22,
                    authorId: 11,
                    deleted: 'true',
                    favors: 'apple',
                    likes: 11
                }
            },
            true
        );

        testQuery(
            {
                likes: { [Op.in]: [1, '11', { up: 11 }] }
            },
            {
                dataSource: {
                    id: 1,
                    country: 'US',
                    name: 'Mike',
                    age: 22,
                    authorId: 11,
                    deleted: 'true',
                    favors: 'apple',
                    likes: {
                        up: 11
                    }
                }
            },
            true
        );

        testQuery(
            {
                grade: { [Op.in]: [] }
            },
            {
                dataSource: {
                    id: 1,
                    country: 'US',
                    name: 'Mike',
                    age: 22,
                    authorId: 11,
                    deleted: 'true',
                    favors: 'apple',
                    likes: 3,
                    grade: 6
                }
            },
            false
        );

        testQuery(
            {
                grade: { [Op.notIn]: [] }
            },
            {
                dataSource: {
                    id: 1,
                    country: 'US',
                    name: 'Mike',
                    age: 22,
                    authorId: 11,
                    deleted: 'true',
                    favors: 'apple',
                    likes: 3,
                    grade: 5
                }
            },
            true
        );

        testQuery(
            {
                likes: { [Op.notIn]: [32, 11] }
            },
            {
                dataSource: {
                    id: 1,
                    country: 'US',
                    name: 'Mike',
                    age: 22,
                    authorId: 11,
                    deleted: 'true',
                    favors: 'apple',
                    likes: 3
                }
            },
            true
        );

        testQuery(
            {
                likes: { [Op.notIn]: [1, '11', { up: 11 }] }
            },
            {
                dataSource: {
                    id: 1,
                    country: 'US',
                    name: 'Mike',
                    age: 22,
                    authorId: 11,
                    deleted: 'true',
                    favors: 'apple',
                    likes: {
                        up: 11,
                        down: 1
                    }
                }
            },
            true
        );

        testQuery(
            {
                likes: { [Op.notIn]: { up: 11, down: 1 } }
            },
            {
                dataSource: {
                    id: 1,
                    country: 'US',
                    name: 'Mike',
                    age: 22,
                    authorId: 11,
                    deleted: 'true',
                    favors: 'apple',
                    likes: 10
                }
            },
            true
        );
    });

    describe('Op.eq', () => {
        testQuery(
            {
                age: { [Op.eq]: 22 }
            },
            {
                dataSource: {
                    id: 1,
                    country: 'US',
                    name: 'Mike',
                    age: 22,
                    authorId: 11,
                    deleted: 'true',
                    favors: 'apple',
                    likes: 3
                }
            },
            true
        );

        testQuery(
            {
                age: { [Op.eq]: 22 }
            },
            {
                dataSource: {
                    id: 1,
                    country: 'US',
                    name: 'Mike',
                    age: new Number('22'),
                    authorId: 11,
                    deleted: 'true',
                    favors: 'apple',
                    likes: 3
                }
            },
            true
        );

        testQuery(
            {
                age: { [Op.eq]: '22' }
            },
            {
                dataSource: {
                    id: 1,
                    country: 'US',
                    name: 'Mike',
                    age: 22,
                    authorId: 11,
                    deleted: 'true',
                    favors: 'apple',
                    likes: 3
                }
            },
            true
        );

        testQuery(
            {
                deleted: { [Op.eq]: 1 }
            },
            {
                dataSource: {
                    id: 1,
                    country: 'US',
                    name: 'Mike',
                    age: 22,
                    authorId: 11,
                    deleted: true,
                    favors: 'apple',
                    likes: 3
                }
            },
            true
        );

        testQuery(
            {
                truthy: { [Op.eq]: new Boolean(10) }
            },
            {
                dataSource: {
                    id: 1,
                    country: 'US',
                    name: 'Mike',
                    age: 22,
                    authorId: 11,
                    deleted: true,
                    favors: 'apple',
                    likes: 3,
                    truthy: true
                }
            },
            true
        );

        testQuery(
            {
                name: { [Op.eq]: Symbol('Mike') }
            },
            {
                dataSource: {
                    id: 1,
                    country: 'US',
                    name: Symbol('Mike'),
                    age: 22,
                    authorId: 11,
                    deleted: true,
                    favors: 'apple',
                    likes: 3
                }
            },
            false
        );

        testQuery(
            {
                name: { [Op.eq]: Symbol.for('Mike') }
            },
            {
                dataSource: {
                    id: 1,
                    country: 'US',
                    name: Symbol.for('Mike'),
                    age: 22,
                    authorId: 11,
                    deleted: true,
                    favors: 'apple',
                    likes: 3
                }
            },
            true
        );

        testQuery(
            {
                falsy: { [Op.eq]: false }
            },
            {
                dataSource: {
                    id: 1,
                    country: 'US',
                    name: 'Mike',
                    age: 22,
                    authorId: 11,
                    deleted: true,
                    favors: 'apple',
                    likes: 3,
                    falsy: 'false'
                }
            },
            false
        );

        testQuery(
            {
                age: { [Op.eq]: 22 }
            },
            {
                dataSource: {
                    id: 1,
                    country: 'US',
                    name: 'Mike',
                    age: '22',
                    authorId: 11,
                    deleted: true,
                    favors: 'apple',
                    likes: 3
                }
            },
            true
        );

        testQuery(
            {
                name: { [Op.eq]: 'Mike' }
            },
            {
                dataSource: {
                    id: 1,
                    country: 'US',
                    name: 'Mike',
                    age: 22,
                    authorId: 11,
                    deleted: true,
                    favors: 'apple',
                    likes: 3
                }
            },
            true
        );

        testQuery(
            {
                orders: { [Op.eq]: [1, 2, 3] }
            },
            {
                dataSource: {
                    id: 1,
                    country: 'US',
                    name: 'Mike',
                    age: 22,
                    authorId: 11,
                    deleted: true,
                    favors: 'apple',
                    likes: 3,
                    orders: [1, 2, 3]
                }
            },
            true
        );

        testQuery(
            {
                other: {
                    [Op.eq]: {
                        a: 1,
                        b: [11, 22, 33]
                    }
                }
            },
            {
                dataSource: {
                    id: 1,
                    country: 'US',
                    name: 'Mike',
                    age: 22,
                    authorId: 11,
                    deleted: true,
                    favors: 'apple',
                    likes: 3,
                    other: {
                        a: 1,
                        b: [11, 22, 33]
                    }
                }
            },
            true
        );

        testQuery(
            {
                expires: { [Op.eq]: global.BigInt(9007199254740991n) }
            },
            {
                dataSource: {
                    id: 1,
                    country: 'US',
                    name: 'Mike',
                    age: 22,
                    authorId: 11,
                    deleted: true,
                    favors: 'apple',
                    likes: 3,
                    expires: global.BigInt('9007199254740991')
                }
            },
            true
        );
    });

    describe('Op.ne/Op.neq', () => {
        testQuery(
            {
                age: { [Op.neq]: 22 }
            },
            {
                dataSource: {
                    id: 1,
                    country: 'US',
                    name: 'Mike',
                    age: 22,
                    authorId: 11,
                    deleted: 'true',
                    favors: 'apple',
                    likes: 3
                }
            },
            false
        );

        testQuery(
            {
                age: { [Op.neq]: 22 }
            },
            {
                dataSource: {
                    id: 1,
                    country: 'US',
                    name: 'Mike',
                    age: new Number('22'),
                    authorId: 11,
                    deleted: 'true',
                    favors: 'apple',
                    likes: 3
                }
            },
            false
        );

        testQuery(
            {
                age: { [Op.neq]: '22' }
            },
            {
                dataSource: {
                    id: 1,
                    country: 'US',
                    name: 'Mike',
                    age: 22,
                    authorId: 11,
                    deleted: 'true',
                    favors: 'apple',
                    likes: 3
                }
            },
            false
        );

        testQuery(
            {
                deleted: { [Op.neq]: 1 }
            },
            {
                dataSource: {
                    id: 1,
                    country: 'US',
                    name: 'Mike',
                    age: 22,
                    authorId: 11,
                    deleted: true,
                    favors: 'apple',
                    likes: 3
                }
            },
            false
        );

        testQuery(
            {
                truthy: { [Op.neq]: new Boolean(10) }
            },
            {
                dataSource: {
                    id: 1,
                    country: 'US',
                    name: 'Mike',
                    age: 22,
                    authorId: 11,
                    deleted: true,
                    favors: 'apple',
                    likes: 3,
                    truthy: true
                }
            },
            false
        );

        testQuery(
            {
                name: { [Op.neq]: Symbol('Mike') }
            },
            {
                dataSource: {
                    id: 1,
                    country: 'US',
                    name: Symbol('Mike'),
                    age: 22,
                    authorId: 11,
                    deleted: true,
                    favors: 'apple',
                    likes: 3
                }
            },
            true
        );

        testQuery(
            {
                name: { [Op.neq]: Symbol.for('Mike') }
            },
            {
                dataSource: {
                    id: 1,
                    country: 'US',
                    name: Symbol.for('Mike'),
                    age: 22,
                    authorId: 11,
                    deleted: true,
                    favors: 'apple',
                    likes: 3
                }
            },
            false
        );

        testQuery(
            {
                falsy: { [Op.neq]: false }
            },
            {
                dataSource: {
                    id: 1,
                    country: 'US',
                    name: 'Mike',
                    age: 22,
                    authorId: 11,
                    deleted: true,
                    favors: 'apple',
                    likes: 3,
                    falsy: 'false'
                }
            },
            true
        );

        testQuery(
            {
                age: { [Op.neq]: 22 }
            },
            {
                dataSource: {
                    id: 1,
                    country: 'US',
                    name: 'Mike',
                    age: '22',
                    authorId: 11,
                    deleted: true,
                    favors: 'apple',
                    likes: 3
                }
            },
            false
        );

        testQuery(
            {
                name: { [Op.neq]: 'Mike' }
            },
            {
                dataSource: {
                    id: 1,
                    country: 'US',
                    name: 'Mike',
                    age: 22,
                    authorId: 11,
                    deleted: true,
                    favors: 'apple',
                    likes: 3
                }
            },
            false
        );

        testQuery(
            {
                orders: { [Op.neq]: [1, 2, 3] }
            },
            {
                dataSource: {
                    id: 1,
                    country: 'US',
                    name: 'Mike',
                    age: 22,
                    authorId: 11,
                    deleted: true,
                    favors: 'apple',
                    likes: 3,
                    orders: [1, 2, 3]
                }
            },
            false
        );

        testQuery(
            {
                other: {
                    [Op.neq]: {
                        a: 1,
                        b: [11, 22, 33]
                    }
                }
            },
            {
                dataSource: {
                    id: 1,
                    country: 'US',
                    name: 'Mike',
                    age: 22,
                    authorId: 11,
                    deleted: true,
                    favors: 'apple',
                    likes: 3,
                    other: {
                        a: 1,
                        b: [11, 22, 33]
                    }
                }
            },
            false
        );

        testQuery(
            {
                expires: { [Op.neq]: global.BigInt(9007199254740991n) }
            },
            {
                dataSource: {
                    id: 1,
                    country: 'US',
                    name: 'Mike',
                    email: 'jack@yahoo.com',
                    age: 22,
                    authorId: 11,
                    deleted: true,
                    favors: 'apple',
                    likes: 3,
                    expires: global.BigInt('9007199254740991')
                }
            },
            false
        );

        testQuery(
            {
                deletedAt: { [Op.ne]: null }
            },
            {
                dataSource: {
                    id: 1,
                    country: 'US',
                    name: 'Mike',
                    email: 'jack@yahoo.com',
                    age: 22,
                    authorId: 11,
                    favors: 'apple',
                    likes: 3,
                    expires: global.BigInt('9007199254740991'),
                    deletedAt: null
                }
            },
            false
        );

        testQuery(
            {
                age: { [Op.ne]: '22' }
            },
            {
                dataSource: {
                    id: 1,
                    country: 'US',
                    name: 'Mike',
                    email: 'jack@yahoo.com',
                    age: 22,
                    authorId: 11,
                    favors: 'apple',
                    likes: 3,
                    expires: global.BigInt('9007199254740991'),
                    deletedAt: null
                }
            },
            false
        );

        testQuery(
            {
                expires: { [Op.neq]: global.BigInt(9007199254740991n) }
            },
            {
                dataSource: {
                    id: 1,
                    country: 'US',
                    name: 'Mike',
                    email: 'jack@yahoo.com',
                    age: 22,
                    authorId: 11,
                    favors: 'apple',
                    likes: 3,
                    expires: global.BigInt('9007199254740991'),
                    deletedAt: null
                }
            },
            false
        );
    });

    describe('Op.eqeq', () => {
        testQuery(
            {
                truthy: { [Op.eqeq]: 1 }
            },
            {
                dataSource: {
                    truthy: true
                }
            },
            false
        );

        testQuery(
            {
                truthy: { [Op.neqeq]: 1 }
            },
            {
                dataSource: {
                    truthy: true
                }
            },
            true
        );

        testQuery(
            {
                age: { [Op.eqeq]: 21 }
            },
            {
                dataSource: {
                    age: '21'
                }
            },
            false
        );

        testQuery(
            {
                eqeq: { [Op.eqeq]: 11 }
            },
            {
                dataSource: {
                    eqeq: new Number('11')
                }
            },
            false
        );

        testQuery(
            {
                age: { [Op.eqeq]: '12' }
            },
            {
                dataSource: {
                    age: new Number('12')
                }
            },
            false
        );

        testQuery(
            {
                age: { [Op.neqeq]: Symbol.for('1') }
            },
            {
                dataSource: {
                    age: Symbol.for('1')
                }
            },
            false
        );

        testQuery(
            {
                eqeq: { [Op.eqeq]: Symbol.for('11') }
            },
            {
                dataSource: {
                    eqeq: Symbol.for('11')
                }
            },
            true
        );

        testQuery(
            {
                age: { [Op.eqeq]: 22 }
            },
            {
                dataSource: {
                    age: 22
                }
            },
            true
        );

        testQuery(
            {
                order: { [Op.eqeq]: [1, 2, 3] }
            },
            {
                dataSource: {
                    order: [1, 2, 3]
                }
            },
            false
        );

        testQuery(
            {
                order: {
                    [Op.eqeq]: {
                        aa: 11
                    }
                }
            },
            {
                dataSource: {
                    order: {
                        aa: 11
                    }
                }
            },
            false
        );

        testQuery(
            {
                age: { [Op.neqeq]: '23' }
            },
            {
                dataSource: {
                    age: 23
                }
            },
            true
        );

        testQuery(
            {
                age: { [Op.neqeq]: 22 }
            },
            {
                dataSource: {
                    age: 22
                }
            },
            false
        );

        testQuery(
            {
                email: { [Op.neqeq]: 'jack@gmail.com' }
            },
            {
                dataSource: {
                    email: 'jack@yahoo.com'
                }
            },
            true
        );

        testQuery(
            {
                deletedAt: { [Op.neqeq]: null }
            },
            {
                dataSource: {
                    deletedAt: null,
                    email: 'jack@yahoo.com'
                }
            },
            false
        );

        testQuery(
            {
                id: { [Op.gte]: 20 },
                time: {
                    [Op.eqeq]: 20221111
                }
            },
            {
                dataSource: {
                    id: 26,
                    name: 'thinking',
                    time: 20221111
                }
            },
            true
        );

        testQuery(
            {
                name: { [Op.eqeq]: Symbol('name') }
            },
            {
                dataSource: {
                    name: Symbol('name')
                }
            },
            false
        );

        testQuery(
            {
                expires: { [Op.eqeq]: global.BigInt(9007199254740991n) }
            },
            {
                dataSource: {
                    expires: global.BigInt('9007199254740991')
                }
            },
            true
        );

        testQuery(
            {
                times: { [Op.neqeq]: global.BigInt(9007199254740991n) }
            },
            {
                dataSource: {
                    times: global.BigInt('9007199254740991')
                }
            },
            false
        );

        testQuery(
            {
                name: { [Op.neqeq]: Symbol('name') }
            },
            {
                dataSource: {
                    name: Symbol('name')
                }
            },
            true
        );
    });

    describe('Op.neqeq', () => {
        testQuery(
            {
                truthy: { [Op.eqeq]: 1 }
            },
            {
                dataSource: {
                    truthy: true
                }
            },
            false
        );

        testQuery(
            {
                truthy: { [Op.neqeq]: 1 }
            },
            {
                dataSource: {
                    truthy: true
                }
            },
            true
        );

        testQuery(
            {
                age: { [Op.eqeq]: 21 }
            },
            {
                dataSource: {
                    age: '21'
                }
            },
            false
        );

        testQuery(
            {
                eqeq: { [Op.eqeq]: 11 }
            },
            {
                dataSource: {
                    eqeq: new Number('11')
                }
            },
            false
        );

        testQuery(
            {
                age: { [Op.eqeq]: '12' }
            },
            {
                dataSource: {
                    age: new Number('12')
                }
            },
            false
        );

        testQuery(
            {
                age: { [Op.neqeq]: Symbol.for('1') }
            },
            {
                dataSource: {
                    age: Symbol.for('1')
                }
            },
            false
        );

        testQuery(
            {
                eqeq: { [Op.eqeq]: Symbol.for('11') }
            },
            {
                dataSource: {
                    eqeq: Symbol.for('11')
                }
            },
            true
        );

        testQuery(
            {
                age: { [Op.eqeq]: 22 }
            },
            {
                dataSource: {
                    age: 22
                }
            },
            true
        );

        testQuery(
            {
                order: { [Op.eqeq]: [1, 2, 3] }
            },
            {
                dataSource: {
                    order: [1, 2, 3]
                }
            },
            false
        );

        testQuery(
            {
                order: {
                    [Op.eqeq]: {
                        aa: 11
                    }
                }
            },
            {
                dataSource: {
                    order: {
                        aa: 11
                    }
                }
            },
            false
        );

        testQuery(
            {
                age: { [Op.neqeq]: '23' }
            },
            {
                dataSource: {
                    age: 23
                }
            },
            true
        );

        testQuery(
            {
                age: { [Op.neqeq]: 22 }
            },
            {
                dataSource: {
                    age: 22
                }
            },
            false
        );

        testQuery(
            {
                email: { [Op.neqeq]: 'jack@gmail.com' }
            },
            {
                dataSource: {
                    email: 'jack@yahoo.com'
                }
            },
            true
        );

        testQuery(
            {
                deletedAt: { [Op.neqeq]: null }
            },
            {
                dataSource: {
                    deletedAt: null,
                    email: 'jack@yahoo.com'
                }
            },
            false
        );

        testQuery(
            {
                id: { [Op.gte]: 20 },
                time: {
                    [Op.eqeq]: 20221111
                }
            },
            {
                dataSource: {
                    id: 26,
                    name: 'thinking',
                    time: 20221111
                }
            },
            true
        );

        testQuery(
            {
                name: { [Op.eqeq]: Symbol('name') }
            },
            {
                dataSource: {
                    name: Symbol('name')
                }
            },
            false
        );

        testQuery(
            {
                expires: { [Op.eqeq]: global.BigInt(9007199254740991n) }
            },
            {
                dataSource: {
                    expires: global.BigInt('9007199254740991')
                }
            },
            true
        );

        testQuery(
            {
                times: { [Op.neqeq]: global.BigInt(9007199254740991n) }
            },
            {
                dataSource: {
                    times: global.BigInt('9007199254740991')
                }
            },
            false
        );

        testQuery(
            {
                name: { [Op.neqeq]: Symbol('name') }
            },
            {
                dataSource: {
                    name: Symbol('name')
                }
            },
            true
        );
    });

    describe('Op.startsWith/Op.endsWith', () => {
        testQuery(
            {
                name: { [Op.startsWith]: 'Mi' }
            },
            {
                dataSource: {
                    id: 1,
                    country: 'US',
                    name: 'Mike',
                    age: 22,
                    authorId: 11,
                    deleted: true,
                    favors: ['apple', 'orange'],
                    likes: {
                        up: 11,
                        down: 1
                    }
                }
            },
            true
        );

        testQuery(
            {
                name: { [Op.endsWith]: 'ke' }
            },
            {
                dataSource: {
                    id: 1,
                    country: 'US',
                    name: 'Mike',
                    age: 22,
                    authorId: 11,
                    deleted: true,
                    favors: ['apple', 'orange'],
                    likes: {
                        up: 11,
                        down: 1
                    }
                }
            },
            true
        );
    });

    describe('Op.substring', () => {
        testQuery(
            {
                name: { [Op.substring]: 'ik' }
            },
            {
                dataSource: {
                    id: 1,
                    country: 'US',
                    name: 'Mike',
                    age: 22,
                    authorId: 11,
                    deleted: true,
                    favors: ['apple', 'orange'],
                    likes: {
                        up: 11,
                        down: 1
                    }
                }
            },
            true
        );
    });

    describe('Op.any', () => {
        testQuery(
            {
                name: { [Op.any]: ['Mike', 'larry', 'may'] }
            },
            {
                dataSource: {
                    id: 1,
                    country: 'US',
                    name: 'Mike',
                    age: 22,
                    authorId: 11,
                    deleted: true,
                    favors: ['apple', 'orange'],
                    likes: {
                        up: 11,
                        down: 1
                    }
                }
            },
            true
        );

        testQuery(
            {
                favors: { [Op.any]: ['larry', 'may'] }
            },
            {
                dataSource: {
                    id: 1,
                    country: 'US',
                    name: 'Mike',
                    age: 22,
                    authorId: 11,
                    deleted: true,
                    favors: ['apple', 'orange'],
                    likes: {
                        up: 11,
                        down: 1
                    }
                }
            },
            false
        );

        testQuery(
            {
                favors: { [Op.any]: ['larry', 'may', ['apple', 'orange']] }
            },
            {
                dataSource: {
                    id: 1,
                    country: 'US',
                    name: 'Mike',
                    age: 22,
                    authorId: 11,
                    deleted: true,
                    favors: ['apple', 'orange'],
                    likes: {
                        up: 11,
                        down: 1
                    }
                }
            },
            true
        );

        testQuery(
            {
                likes: { [Op.any]: ['larry', 'may', { up: 11, down: 1 }] }
            },
            {
                dataSource: {
                    id: 1,
                    country: 'US',
                    name: 'Mike',
                    age: 22,
                    authorId: 11,
                    deleted: true,
                    favors: ['apple', 'orange'],
                    likes: {
                        up: 11,
                        down: 1
                    }
                }
            },
            true
        );

        testQuery(
            'level',
            {
                where: {
                    level: {
                        [Op.notIn]: {
                            [Op.any]: [10, 16, 12, 18]
                        }
                    }
                },
                dataSource: {
                    id: 1,
                    country: 'US',
                    name: 'Mike',
                    age: 22,
                    authorId: 11,
                    deleted: true,
                    favors: ['apple', 'orange'],
                    likes: {
                        up: 11,
                        down: 1
                    },
                    level: 2
                }
            },
            true,
            true
        );
    });

    describe('Op.all', () => {
        testQuery(
            {
                text: { [Op.all]: ['hello world!'] }
            },
            {
                dataSource: {
                    id: 1,
                    country: 'US',
                    name: 'Mike',
                    age: 22,
                    authorId: 11,
                    deleted: true,
                    favors: ['apple', 'orange'],
                    likes: {
                        up: 11,
                        down: 1
                    },
                    text: 'hello world!'
                }
            },
            false
        );

        testQuery(
            {
                text: { [Op.all]: ['hello world!', 'hihi'] }
            },
            {
                dataSource: {
                    id: 1,
                    country: 'US',
                    name: 'Mike',
                    age: 22,
                    authorId: 11,
                    deleted: true,
                    favors: ['apple', 'orange'],
                    likes: {
                        up: 11,
                        down: 1
                    },
                    text: ['hello world!', 'haha']
                }
            },
            false
        );

        testQuery(
            {
                favors: { [Op.all]: ['apple', 'orange'] }
            },
            {
                dataSource: {
                    id: 1,
                    country: 'US',
                    name: 'Mike',
                    age: 22,
                    authorId: 11,
                    deleted: true,
                    favors: ['apple', 'orange'],
                    likes: {
                        up: 11,
                        down: 1
                    }
                }
            },
            true
        );

        testQuery(
            {
                likes: {
                    [Op.all]: [
                        {
                            up: 11,
                            down: 1
                        }
                    ]
                }
            },
            {
                dataSource: {
                    id: 1,
                    country: 'US',
                    name: 'Mike',
                    age: 22,
                    authorId: 11,
                    deleted: true,
                    favors: ['apple', 'orange'],
                    likes: [
                        {
                            up: 11,
                            down: 1
                        }
                    ]
                }
            },
            true
        );

        testQuery(
            'grades',
            {
                where: {
                    age: {
                        [Op.gt]: {
                            [Op.all]: [11, 10, 17, 19]
                        }
                    }
                },
                dataSource: {
                    id: 1,
                    country: 'US',
                    name: 'Mike',
                    age: 22,
                    authorId: 11,
                    deleted: true,
                    favors: ['apple', 'orange']
                }
            },
            true,
            true
        );
    });

    describe('Op.between/Op.notBetween', () => {
        testQuery(
            {
                grade: { [Op.between]: [2, 6] }
            },
            {
                dataSource: {
                    id: 1,
                    country: 'US',
                    name: 'Mike',
                    age: 22,
                    authorId: 11,
                    deleted: true,
                    favors: ['apple', 'orange'],
                    grade: 5
                }
            },
            true
        );

        testQuery(
            {
                grade: { [Op.notBetween]: [12, 16] }
            },
            {
                dataSource: {
                    id: 1,
                    country: 'US',
                    name: 'Mike',
                    age: 22,
                    authorId: 11,
                    deleted: true,
                    favors: ['apple', 'orange'],
                    grade: 5
                }
            },
            true
        );

        testQuery(
            {
                date: { [Op.between]: [new Date('2010-08-11'), new Date('2010-12-09')] }
            },
            {
                dataSource: {
                    id: 1,
                    country: 'US',
                    name: 'Mike',
                    age: 22,
                    authorId: 11,
                    deleted: true,
                    favors: ['apple', 'orange'],
                    grade: 5,
                    date: new Date('2010-09-22')
                }
            },
            true
        );
    });

    describe('Op.contains/Op.contained', () => {
        testQuery(
            {
                lang: { [Op.contains]: 'java' }
            },
            {
                dataSource: {
                    id: 1,
                    country: 'US',
                    name: 'Mike',
                    age: 22,
                    authorId: 11,
                    deleted: true,
                    favors: ['apple', 'orange'],
                    grade: 5,
                    lang: 'javascript'
                }
            },
            true
        );

        testQuery(
            {
                lang: { [Op.contained]: 'javascript' }
            },
            {
                dataSource: {
                    id: 1,
                    country: 'US',
                    name: 'Mike',
                    age: 22,
                    authorId: 11,
                    deleted: true,
                    favors: ['apple', 'orange'],
                    grade: 5,
                    lang: 'java'
                }
            },
            true
        );

        testQuery(
            {
                seqs: { [Op.contains]: 11 }
            },
            {
                dataSource: {
                    id: 1,
                    country: 'US',
                    name: 'Mike',
                    age: 22,
                    authorId: 11,
                    deleted: true,
                    favors: ['apple', 'orange'],
                    grade: 5,
                    seqs: [11, 22, 33]
                }
            },
            true
        );

        testQuery(
            {
                seqs: { [Op.contained]: [11, 22, 33] }
            },
            {
                dataSource: {
                    id: 1,
                    country: 'US',
                    name: 'Mike',
                    age: 22,
                    authorId: 11,
                    deleted: true,
                    favors: ['apple', 'orange'],
                    grade: 5,
                    seqs: 11
                }
            },
            true
        );

        testQuery(
            {
                lang: { [Op.contains]: ['css', 'js'] }
            },
            {
                dataSource: {
                    id: 1,
                    country: 'US',
                    name: 'Mike',
                    age: 22,
                    authorId: 11,
                    deleted: true,
                    favors: ['apple', 'orange'],
                    grade: 5,
                    lang: ['js', 'html', 'css']
                }
            },
            true
        );

        testQuery(
            {
                lang: { [Op.contained]: ['js', 'html', 'css', 'py'] }
            },
            {
                dataSource: {
                    id: 1,
                    country: 'US',
                    name: 'Mike',
                    age: 22,
                    authorId: 11,
                    deleted: true,
                    favors: ['apple', 'orange'],
                    grade: 5,
                    lang: ['js', 'html', 'css']
                }
            },
            true
        );

        testQuery(
            {
                sources: { [Op.contains]: { c: 3, dd: 4 } }
            },
            {
                dataSource: {
                    id: 1,
                    country: 'US',
                    name: 'Mike',
                    age: 22,
                    authorId: 11,
                    deleted: true,
                    favors: ['apple', 'orange'],
                    grade: 5,
                    sources: {
                        a: 1,
                        b: 2,
                        c: 3,
                        dd: 4
                    }
                }
            },
            true
        );

        testQuery(
            {
                sources: { [Op.contained]: { a: 1, c: 3, dd: 4 } }
            },
            {
                dataSource: {
                    id: 1,
                    country: 'US',
                    name: 'Mike',
                    age: 22,
                    authorId: 11,
                    deleted: true,
                    favors: ['apple', 'orange'],
                    grade: 5,
                    sources: {
                        c: 3,
                        dd: 4
                    }
                }
            },
            true
        );

        testQuery(
            {
                favors: { [Op.contains]: 'apple' }
            },
            {
                dataSource: {
                    id: 1,
                    country: 'US',
                    name: 'Mike',
                    age: 22,
                    authorId: 11,
                    deleted: true,
                    favors: ['apple', 'orange'],
                    grade: 5,
                    sources: {
                        c: 3,
                        dd: 4
                    }
                }
            },
            true
        );

        testQuery(
            {
                sources: { [Op.contains]: { dd: 33 } }
            },
            {
                dataSource: {
                    id: 1,
                    country: 'US',
                    name: 'Mike',
                    age: 22,
                    authorId: 11,
                    deleted: true,
                    favors: ['apple', 'orange'],
                    grade: 5,
                    sources: {
                        c: 3,
                        dd: 33
                    }
                }
            },
            true
        );
    });

    describe('Op.overlap', () => {
        // testQuery(
        //     {
        //         seqs: { [Op.overlap]: [11, 22] }
        //     },
        //     {
        //         dataSource: {
        //             id: 1,
        //             country: 'US',
        //             name: 'Mike',
        //             age: 22,
        //             authorId: 11,
        //             deleted: true,
        //             favors: ['apple', 'orange'],
        //             grade: 5,
        //             seqs: [100, 333]
        //         }
        //     },
        //     true
        // );

        testQuery(
            {
                range: { [Op.overlap]: [] }
            },
            {
                dataSource: {
                    id: 1,
                    country: 'US',
                    name: 'Mike',
                    age: 22,
                    authorId: 11,
                    deleted: true,
                    favors: ['apple', 'orange'],
                    grade: 5,
                    range: []
                }
            },
            false
        );

        testQuery(
            {
                range: { [Op.overlap]: ['11:11:11'] }
            },
            {
                dataSource: {
                    id: 1,
                    country: 'US',
                    name: 'Mike',
                    age: 22,
                    authorId: 11,
                    deleted: true,
                    favors: ['apple', 'orange'],
                    grade: 5,
                    range: ['11:01:01']
                }
            },
            false
        );

        testQuery(
            {
                range: { [Op.overlap]: ['11:11:11', '22:22:22'] }
            },
            {
                dataSource: {
                    id: 1,
                    country: 'US',
                    name: 'Mike',
                    age: 22,
                    authorId: 11,
                    deleted: true,
                    favors: ['apple', 'orange'],
                    grade: 5,
                    range: ['11:01:01', '12:11:11']
                }
            },
            true
        );

        testQuery(
            {
                range: { [Op.overlap]: ['11:11:11 AM', '11:11:11 PM'] }
            },
            {
                dataSource: {
                    id: 1,
                    country: 'US',
                    name: 'Mike',
                    age: 22,
                    authorId: 11,
                    deleted: true,
                    favors: ['apple', 'orange'],
                    grade: 5,
                    range: ['11:11:11 AM', '12:11:11 AM']
                }
            },
            true
        );

        testQuery(
            {
                range: { [Op.overlap]: ['2001-10-29', '2001-10-30'] }
            },
            {
                dataSource: {
                    id: 1,
                    country: 'US',
                    name: 'Mike',
                    age: 22,
                    authorId: 11,
                    deleted: true,
                    favors: ['apple', 'orange'],
                    grade: 5,
                    range: ['2001-10-30', '2001-10-31']
                }
            },
            false
        );

        testQuery(
            {
                range: { [Op.overlap]: ['2001-Oct-30', '2001-Oct-30'] }
            },
            {
                dataSource: {
                    id: 1,
                    country: 'US',
                    name: 'Mike',
                    age: 22,
                    authorId: 11,
                    deleted: true,
                    favors: ['apple', 'orange'],
                    grade: 5,
                    range: ['2001-Oct-30', '2001-Oct-31']
                }
            },
            true
        );

        testQuery(
            {
                range: { [Op.overlap]: [new Date('2010-Aug-01'), new Date('2010-Nov-01')] }
            },
            {
                dataSource: {
                    id: 1,
                    country: 'US',
                    name: 'Mike',
                    age: 22,
                    authorId: 11,
                    deleted: true,
                    favors: ['apple', 'orange'],
                    grade: 5,
                    range: [new Date('2010-Feb-01'), new Date('2010-September-01')]
                }
            },
            true
        );

        testQuery(
            {
                range: { [Op.overlap]: ['2010-08-01', '2010-11-01'] }
            },
            {
                dataSource: {
                    id: 1,
                    country: 'US',
                    name: 'Mike',
                    age: 22,
                    authorId: 11,
                    deleted: true,
                    favors: ['apple', 'orange'],
                    grade: 5,
                    range: ['2010-02-01', '2010-09-01']
                }
            },
            true
        );
    });

    describe('Op.isDate', () => {
        testQuery(
            {
                bod: { [Op.isDate]: true }
            },
            {
                dataSource: {
                    id: 1,
                    country: 'US',
                    name: 'Mike',
                    age: 22,
                    authorId: 11,
                    deleted: true,
                    favors: ['apple', 'orange'],
                    grade: 5,
                    bod: '1999-11-11 11:22:33'
                }
            },
            true
        );

        testQuery(
            {
                bod: { [Op.isDate]: true }
            },
            {
                dataSource: {
                    id: 1,
                    country: 'US',
                    name: 'Mike',
                    age: 22,
                    authorId: 11,
                    deleted: true,
                    favors: ['apple', 'orange'],
                    grade: 5,
                    bod: new Date('1999-11-11 11:22:33')
                }
            },
            true
        );

        testQuery(
            {
                bod: { [Op.isDate]: true }
            },
            {
                dataSource: {
                    id: 1,
                    country: 'US',
                    name: 'Mike',
                    age: 22,
                    authorId: 11,
                    deleted: true,
                    favors: ['apple', 'orange'],
                    grade: 5,
                    bod: '1999-Oct-11 11:22:33'
                }
            },
            true
        );

        testQuery(
            {
                bod: { [Op.isDate]: true }
            },
            {
                dataSource: {
                    id: 1,
                    country: 'US',
                    name: 'Mike',
                    age: 22,
                    authorId: 11,
                    deleted: true,
                    favors: ['apple', 'orange'],
                    grade: 5,
                    bod: new Date('1999-Oct-11 11:22:33')
                }
            },
            true
        );

        testQuery(
            {
                since: { [Op.isDate]: false }
            },
            {
                dataSource: {
                    id: 1,
                    country: 'US',
                    name: 'Mike',
                    age: 22,
                    authorId: 11,
                    deleted: true,
                    favors: ['apple', 'orange'],
                    grade: 5,
                    since: 'not-a-valid-date'
                }
            },
            true
        );
    });
});

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

    testQuery(
        { [Op.and]: { name: 'joe', active: false, age: 33 } },
        {
            dataSource: {
                name: 'joe',
                active: false,
                age: 33
            }
        },
        true
    );
    describe('Op.and', () => {
        testQuery(
            { [Op.and]: [{ name: 'mike', age: 22 }] },
            {
                dataSource: {
                    id: 1,
                    name: 'mike',
                    age: 22
                }
            },
            true
        );

        // testQuery(
        //     { [Op.and]: null },
        //     {
        //         dataSource: {
        //             id: 2,
        //             name: 'mary',
        //             authorId: 12
        //         }
        //     },
        //     false
        // );

        // testQuery(
        //     { [Op.and]: undefined },
        //     {
        //         dataSource: {
        //             id: 3,
        //             name: 'mike',
        //             authorId: 12
        //         }
        //     },
        //     false
        // );

        testQuery(
            { [Op.and]: [] },
            {
                dataSource: {
                    id: 4,
                    name: 'jim',
                    authorId: 13
                }
            },
            false
        );

        testQuery(
            { [Op.and]: {} },
            {
                dataSource: {
                    id: 5,
                    name: 'lee',
                    authorId: 15
                }
            },
            true
        );

        // testQuery(
        //     { [Op.and]: 0 },
        //     {
        //         dataSource: {
        //             id: 6,
        //             name: 'leon',
        //             authorId: 22
        //         }
        //     },
        //     false
        // );

        testQuery(
            { [Op.and]: 1 },
            {
                dataSource: {
                    id: 7,
                    name: 'leon',
                    authorId: 31
                }
            },
            true
        );

        testQuery(
            { [Op.and]: 'test' },
            {
                dataSource: {
                    id: 8,
                    name: 'leon',
                    authorId: 16
                }
            },
            false
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
                    authorId: 22
                }
            },
            false
        );

        testQuery(
            { [Op.or]: [{ name: 'leo' }, { name: 'jane' }] },
            {
                dataSource: {
                    id: 3,
                    name: 'leo',
                    authorId: 11
                }
            },
            true
        );

        testQuery(
            { [Op.or]: { name: 'leo', authorId: 11 } },
            {
                dataSource: {
                    id: 4,
                    name: 'leo',
                    authorId: 22
                }
            },
            true
        );

        testQuery(
            {
                [Op.or]: [
                    {
                        authorId: 11
                    },
                    {
                        authorId: 12,
                        name: 'leo'
                    }
                ]
            },
            {
                dataSource: {
                    id: 6,
                    name: 'lee',
                    authorId: 12
                }
            },
            false
        );

        // testQuery(
        //     { [Op.or]: null },
        //     {
        //         dataSource: {
        //             id: 7,
        //             name: 'tom',
        //             authorId: 11
        //         }
        //     },
        //     false
        // );

        // testQuery(
        //     { [Op.or]: undefined },
        //     {
        //         dataSource: {
        //             id: 5,
        //             name: 'mayer',
        //             authorId: 12
        //         }
        //     },
        //     false
        // );

        testQuery(
            { [Op.or]: [] },
            {
                dataSource: {
                    id: 8,
                    name: 'cici',
                    authorId: 12
                }
            },
            false
        );

        testQuery(
            { [Op.or]: {} },
            {
                dataSource: {
                    id: 9,
                    name: 'lele',
                    authorId: 13
                }
            },
            true
        );

        // testQuery(
        //     { [Op.or]: 0 },
        //     {
        //         dataSource: {
        //             id: 10,
        //             name: 'leon',
        //             authorId: 21
        //         }
        //     },
        //     false
        // );

        testQuery(
            { [Op.or]: 1 },
            {
                dataSource: {
                    id: 11,
                    name: 'leonon',
                    authorId: 11
                }
            },
            true
        );

        testQuery(
            { [Op.or]: 'test' },
            {
                dataSource: {
                    name: 'leon',
                    authorId: 55
                }
            },
            false
        );
    });

    describe('Op.not', () => {
        testQuery(
            { name: { [Op.not]: ['js', 'i'] } }, // Op.notIn
            {
                dataSource: {
                    name: 'HTML',
                    status: 'active'
                }
            },
            true
        );

        testQuery(
            { deleted: { [Op.not]: true } },
            {
                dataSource: {
                    name: 'apple',
                    deleted: false
                }
            },
            true
        );

        testQuery(
            { deleted: { [Op.not]: null } },
            {
                dataSource: {
                    name: 'sass',
                    deleted: 'nil'
                }
            },
            true
        );

        testQuery(
            { langs: { [Op.not]: 'java' } }, // Op.ne
            {
                dataSource: {
                    langs: 'javascript'
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
                name: { [Op.is]: ['rose', 'i'] }
            },
            {
                dataSource: {
                    name: 'Rose'
                }
            },
            true
        );
        testQuery(
            {
                name: { [Op.is]: /ros/i }
            },
            {
                dataSource: {
                    name: 'Rosee'
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
                username: { [Op.like]: /mary/ }
            },
            {
                dataSource: {
                    username: 'Mary'
                }
            },
            false
        );
        testQuery(
            {
                username: { [Op.like]: /marya/i }
            },
            {
                dataSource: {
                    username: 'MaryAn'
                }
            },
            true
        );
        testQuery(
            {
                name: { [Op.like]: ['rya', 'i'] }
            },
            {
                dataSource: {
                    name: 'MaryAnn'
                }
            },
            true
        );

        testQuery(
            {
                name: {
                    [Op.like]: 'se'
                }
            },
            {
                dataSource: {
                    name: ['rose', 'mario']
                }
            },
            true
        );

        // //
        // // PASS FAILED
        // testQuery(
        //     {
        //         name: {
        //             [Op.like]: [
        //                 {
        //                     [Op.any]: ['larry', 'mario']
        //                 },
        //                 'i'
        //             ]
        //         }
        //     },
        //     {
        //         dataSource: {
        //             name: 'Mario'
        //         }
        //     },
        //     true
        // );
        // SHOULD PASS
        // testQuery(
        //     {
        //         name: {
        //             [Op.like]: [
        //                 {
        //                     [Op.any]: ['1122', '2233']
        //                 },
        //                 'i'
        //             ]
        //         }
        //     },
        //     {
        //         dataSource: {
        //             name: '22'
        //         }
        //     },
        //     true
        // );
    });

    describe('Op.notLike', () => {
        testQuery(
            {
                name: { [Op.notLike]: /mary/ }
            },
            {
                dataSource: {
                    name: 'Mario'
                }
            },
            true
        );
        testQuery(
            {
                username: { [Op.notLike]: /marya/i }
            },
            {
                dataSource: {
                    username: 'Mary'
                }
            },
            true
        );
        testQuery(
            {
                name: { [Op.notLike]: ['rya', 'g'] }
            },
            {
                dataSource: {
                    name: 'MaryAnn'
                }
            },
            true
        );

        testQuery(
            {
                name: {
                    [Op.notLike]: 'see'
                }
            },
            {
                dataSource: {
                    name: ['rose', 'mar']
                }
            },
            true
        );

        testQuery(
            {
                username: { [Op.notLike]: ['mary$', 'i'] }
            },
            {
                dataSource: {
                    username: 'maryen'
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
                    name: 'HTML',
                    alias: 'HTML'
                }
            },
            true
        );

        testQuery(
            { hobby: { [Op.col]: 'favor' } },
            {
                dataSource: {
                    id: 2,
                    hobby: ['aa', 'bb'],
                    favor: ['aa', 'bb']
                }
            },
            true
        );
        // testQuery(
        //     { name: { [Op.eq]: { [Op.col]: 'alias' } } },
        //     {
        //         dataSource: {
        //             name: ['JS', 'CSS'],
        //             alias: ['JS', 'CSS']
        //         }
        //     },
        //     true
        // );
        // testQuery(
        //     { count: { [Op.like]: { [Op.col]: 'total' } } },
        //     {
        //         dataSource: {
        //             count: 233,
        //             total: 33
        //         }
        //     },
        //     true
        // );
        // testQuery(
        //     { name: { [Op.like]: { [Op.col]: 'alias' } } },
        //     {
        //         dataSource: {
        //             name: 'sass',
        //             alias: 'ss'
        //         }
        //     },
        //     true
        // );
        // testQuery(
        //     { age: { [Op.gt]: { [Op.col]: 'demo.ageAlias' } } },
        //     {
        //         dataSource: {
        //             age: 23,
        //             name: 'javas',
        //             demo: { ageAlias: 11 },
        //             alias: 'js'
        //         }
        //     },
        //     true
        // );

        // SHOULD FAILED
        // testQuery(
        //     {
        //         alias: {
        //             // [Op.like]: '234'
        //             [Op.like]: 'NANA'
        //             // [Op.like]: ['ban', 'i']
        //             // [Op.like]: {
        //             //     [Op.any]: { [Op.col]: 'name' }
        //             // }
        //             // [Op.like]: [
        //             //     {
        //             //         [Op.col]: 'name'
        //             //     },
        //             //     'i'
        //             // ]
        //         }
        //     },
        //     {
        //         dataSource: {
        //             // name: ['tulip', 'orchid1'],
        //             // alias: ['tulip', 'orchid', 'sakura']
        //             name: '112233',
        //             alias: '112233',
        //             name: 'banana',
        //             alias: 'BANANA'
        //         }
        //     },
        //     true
        // );
    });

    describe('Op.gt/Op.gte', () => {
        testQuery(
            {
                age: { [Op.gt]: 5 }
            },
            {
                dataSource: {
                    name: 'mike',
                    age: 11
                }
            },
            true
        );

        testQuery(
            {
                age: { [Op.gte]: 26 }
            },
            {
                dataSource: {
                    name: 'lee',
                    age: 30
                }
            },
            true
        );

        // testQuery(
        //     'count',
        //     {
        //         [Op.gt]: {
        //             [Op.col]: 'total'
        //         }
        //     },
        //     {
        //         dataSource: {
        //             total: 11,
        //             count: 33
        //         }
        //     },
        //     true
        // );
    });

    describe('Op.lt/Op.lte', () => {
        testQuery(
            {
                count: { [Op.lt]: 5 }
            },
            {
                dataSource: {
                    id: 2,
                    count: 2
                }
            },
            true
        );

        testQuery(
            {
                count: { [Op.lte]: 6 }
            },
            {
                dataSource: {
                    id: 1,
                    count: 5
                }
            },
            true
        );

        // testQuery(
        //     'total',
        //     {
        //         [Op.lte]: { [Op.col]: 'count' }
        //     },
        //     {
        //         dataSource: {
        //             total: 2,
        //             count: 10
        //         }
        //     },
        //     true
        // );
    });

    describe('Op.in/Op.notIn', () => {
        testQuery(
            {
                total: { [Op.in]: [1, 3] }
            },
            {
                dataSource: {
                    total: 3,
                    id: 4
                }
            },
            true
        );

        testQuery(
            {
                grade: { [Op.notIn]: [] }
            },
            {
                dataSource: {
                    id: 3,
                    grade: 5
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
                    id: 2,
                    grade: 6
                }
            },
            false
        );

        testQuery(
            {
                count: { [Op.notIn]: [3, 11] }
            },
            {
                dataSource: {
                    id: 1,
                    count: 6
                }
            },
            true
        );
    });

    describe('Op.ne/Op.eq', () => {
        testQuery(
            {
                name: { [Op.eq]: 'jack' }
            },
            {
                dataSource: {
                    name: 'jack'
                }
            },
            true
        );

        testQuery(
            {
                order: { [Op.eq]: [1, 2, 3] }
            },
            {
                dataSource: {
                    order: [1, 2, 3]
                }
            },
            true
        );

        testQuery(
            {
                email: { [Op.ne]: 'jack@gmail.com' }
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
                deletedAt: { [Op.ne]: null }
            },
            {
                dataSource: {
                    deletedAt: null,
                    email: 'jack@yahoo.com'
                }
            },
            false
        );
    });

    describe('Op.startsWith/Op.endsWith', () => {
        testQuery(
            {
                name: { [Op.startsWith]: 'sup' }
            },
            {
                dataSource: {
                    name: 'super mario'
                }
            },
            true
        );

        testQuery(
            {
                txt: { [Op.endsWith]: 'ript' }
            },
            {
                dataSource: {
                    txt: 'javascript'
                }
            },
            true
        );
    });

    describe('Op.substring', () => {
        testQuery(
            {
                text: { [Op.substring]: 'we' }
            },
            {
                dataSource: {
                    text: 'javascript is awesome!'
                }
            },
            true
        );
    });

    describe('Op.any', () => {
        testQuery(
            {
                name: { [Op.any]: ['larry', 'may'] }
            },
            {
                dataSource: {
                    name: 'may'
                }
            },
            true
        );

        testQuery(
            {
                total: { [Op.any]: [1, 10, 15, 18] }
            },
            {
                dataSource: {
                    total: 10
                }
            },
            true
        );

        // testQuery(
        //     'userId',
        //     {
        //         [Op.any]: {
        //             [Op.values]: [11, 10, 15, 19]
        //         }
        //     },
        //     {
        //         dataSource: {
        //             userId: 11
        //         }
        //     },
        //     true
        // );

        // testQuery(
        //     'grades',
        //     {
        //         [Op.gt]: {
        //             [Op.any]: [6, 10, 16, 19]
        //         }
        //     },
        //     {
        //         dataSource: {
        //             grades: 10
        //         }
        //     },
        //     true
        // );

        // testQuery(
        //     'grades',
        //     {
        //         [Op.notIn]: {
        //             [Op.any]: [3, 13, 6, 15, 18]
        //         }
        //     },
        //     {
        //         dataSource: {
        //             grades: 6
        //         }
        //     },
        //     false
        // );
    });

    describe('Op.all', () => {
        testQuery(
            {
                name: { [Op.all]: ['jim', 'may'] }
            },
            {
                dataSource: {
                    name: ['jim', 'may']
                }
            },
            true
        );

        testQuery(
            {
                userId: { [Op.all]: [1, 10] }
            },
            {
                dataSource: {
                    userId: [1, 10]
                }
            },
            true
        );

        // testQuery(
        //     'sales_by_season',
        //     {
        //         [Op.all]: {
        //             [Op.values]: [11, 10]
        //         }
        //     },
        //     {
        //         dataSource: {
        //             sales_by_season: [11, 10]
        //         }
        //     },
        //     true
        // );

        // testQuery(
        //     'grades',
        //     {
        //         [Op.gt]: {
        //             [Op.all]: [11, 10, 17, 19]
        //         }
        //     },
        //     {
        //         dataSource: {
        //             grades: 25
        //         }
        //     },
        //     true
        // );

        // testQuery(
        //     'grades',
        //     {
        //         [Op.not]: {
        //             [Op.all]: [11, 15, 12, 19]
        //         }
        //     },
        //     {
        //         dataSource: {
        //             grades: 5
        //         }
        //     },
        //     true
        // );

        // testQuery(
        //     'level',
        //     {
        //         [Op.notIn]: {
        //             [Op.all]: [10, 16, 12, 18]
        //         }
        //     },
        //     {
        //         dataSource: {
        //             level: 2
        //         }
        //     },
        //     true
        // );
    });

    describe.skip('Op.between/Op.notBetween', () => {
        testQuery(
            {
                grade: { [Op.between]: [2, 6] }
            },
            {
                dataSource: {
                    id: 1,
                    grade: 5
                }
            },
            true
        );

        testQuery(
            {
                date: { [Op.between]: ['2010-08-01', '2010-12-02'] }
            },
            {
                dataSource: {
                    id: 2,
                    date: '2010-09-09'
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
                    id: 3,
                    date: new Date('2010-09-22')
                }
            },
            true
        );

        testQuery(
            {
                data: {
                    [Op.between]: ['2010-02-01', '2011-07-02'],
                    [Op.notBetween]: ['2011-08-09', '2011-12-11']
                }
            },
            {
                dataSource: {
                    id: 4,
                    date: '2010-07-09'
                }
            },
            true
        );

        testQuery(
            {
                date: { [Op.notBetween]: ['2010-08-01', '2010-12-02'] }
            },
            {
                dataSource: {
                    id: 5,
                    date: '2011-09-09'
                }
            },
            true
        );
    });

    describe.skip('Op.contains', () => {
        testQuery(
            {
                seqs: { [Op.contains]: 11 }
            },
            {
                dataSource: {
                    seqs: [11, 22, 33]
                }
            },
            true
        );
        testQuery(
            {
                lang: { [Op.contains]: 'css' }
            },
            {
                dataSource: {
                    lang: ['js', 'html', 'css']
                }
            },
            true
        );
        testQuery(
            {
                data: { [Op.contains]: { c: 3 } }
            },
            {
                dataSource: {
                    data: {
                        a: 1,
                        b: 2,
                        c: 3
                    }
                }
            },
            true
        );
    });
});

describe('Operators Combinations', () => {
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

    testQuery(
        { [Op.and]: { [Op.or]: { name: 'leo', authorId: 2 }, status: 'active' } },
        {
            dataSource: {
                id: 1,
                name: 'leo',
                status: 'active',
                authorId: 11
            }
        },
        true
    );
});

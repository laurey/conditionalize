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
    });

    describe('Op.not', () => {
        testQuery(
            { name: { [Op.not]: ['js', 'html'] } }, // Op.notIn
            {
                dataSource: {
                    name: 'HTML',
                    status: 'active'
                }
            },
            true
        );

        testQuery(
            { isMatch: { [Op.not]: false } }, // String.match
            {
                dataSource: {
                    name: 'apple',
                    isMatch: 'false'
                }
            },
            false
        );

        testQuery(
            { deleted: { [Op.not]: false } }, // String.match
            {
                dataSource: {
                    name: 'applePen',
                    deleted: false
                }
            },
            false
        );

        testQuery(
            { addr: { [Op.not]: null } }, // String.match
            {
                dataSource: {
                    name: 'sass',
                    addr: 'nil'
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

        testQuery(
            { age: { [Op.not]: 55 } }, // Op.ne
            {
                dataSource: {
                    name: 'not',
                    age: 22
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

        testQuery(
            { isMatch: { [Op.is]: true } }, // String.match
            {
                dataSource: {
                    name: 'Banana',
                    isMatch: 'true1'
                }
            },
            true
        );

        testQuery(
            { added: { [Op.is]: true } }, // String.match
            {
                dataSource: {
                    name: 'applePen',
                    added: true
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

        testQuery(
            {
                name: {
                    [Op.like]: {
                        [Op.any]: ['larry', 'mairio']
                    }
                }
            },
            {
                dataSource: {
                    name: 'Mario'
                }
            },
            false
        );

        testQuery(
            {
                name: {
                    [Op.like]: {
                        [Op.any]: ['a2', 'a2233']
                    }
                }
            },
            {
                dataSource: {
                    name: 'a22'
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
        testQuery(
            { name: { [Op.eq]: { [Op.col]: 'alias' } } },
            {
                dataSource: {
                    name: ['JS', 'CSS'],
                    alias: ['JS', 'CSS']
                }
            },
            true
        );
        testQuery(
            { count: { [Op.like]: { [Op.col]: 'total' } } },
            {
                dataSource: {
                    count: '23aag',
                    total: '3a'
                }
            },
            true
        );
        testQuery(
            { name: { [Op.like]: { [Op.col]: 'alias' } } },
            {
                dataSource: {
                    name: 'sass',
                    alias: 'ss'
                }
            },
            true
        );
        testQuery(
            { age: { [Op.gt]: { [Op.col]: 'demo.ageAlias' } } },
            {
                dataSource: {
                    age: 23,
                    name: 'javas',
                    demo: { ageAlias: 11 },
                    alias: 'js'
                }
            },
            true
        );

        testQuery(
            {
                alias: {
                    [Op.like]: 'NANA'
                }
            },
            {
                dataSource: {
                    name: 'banana',
                    alias: 'BANANA'
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

        testQuery(
            'count',
            {
                where: {
                    count: {
                        [Op.gt]: {
                            [Op.col]: 'total'
                        }
                    }
                },
                dataSource: {
                    total: 11,
                    count: 33
                }
            },
            true,
            true
        );
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

        testQuery(
            'total',
            {
                where: {
                    total: {
                        [Op.lte]: { [Op.col]: 'count' }
                    }
                },
                dataSource: {
                    total: 2,
                    count: 10
                }
            },
            true,
            true
        );
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

    describe('Op.ne/Op.neq/Op.eq', () => {
        testQuery(
            {
                age: { [Op.eq]: 35 }
            },
            {
                dataSource: {
                    age: '35'
                }
            },
            true
        );

        testQuery(
            {
                age: { [Op.eq]: 35 }
            },
            {
                dataSource: {
                    age: new Number('35')
                }
            },
            true
        );

        testQuery(
            {
                age: { [Op.eq]: '33' }
            },
            {
                dataSource: {
                    age: new Number('33')
                }
            },
            true
        );

        testQuery(
            {
                truthy: { [Op.eq]: 1 }
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
                truthy: { [Op.eq]: new Boolean(10) }
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
                name: { [Op.eq]: Symbol('name') }
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
                age: { [Op.neq]: Symbol.for('11') }
            },
            {
                dataSource: {
                    age: Symbol.for('11')
                }
            },
            false
        );

        testQuery(
            {
                age: { [Op.eq]: Symbol.for('33') }
            },
            {
                dataSource: {
                    age: Symbol.for('33')
                }
            },
            true
        );

        testQuery(
            {
                name: { [Op.neq]: Symbol('name') }
            },
            {
                dataSource: {
                    name: Symbol('name')
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
                    falsy: 'false'
                }
            },
            false
        );

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
                orders: { [Op.eq]: [1, 2, 3] }
            },
            {
                dataSource: {
                    orders: [1, 2, 3]
                }
            },
            true
        );

        testQuery(
            {
                eq: {
                    [Op.eq]: {
                        a: 1,
                        b: [11, 22, 33]
                    }
                }
            },
            {
                dataSource: {
                    eq: {
                        a: 1,
                        b: [11, 22, 33]
                    }
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

        testQuery(
            {
                age: { [Op.ne]: 35 }
            },
            {
                dataSource: {
                    age: '35'
                }
            },
            false
        );

        testQuery(
            {
                expires: { [Op.eq]: global.BigInt(9007199254740991n) }
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
                times: { [Op.neq]: global.BigInt(9007199254740991n) }
            },
            {
                dataSource: {
                    times: global.BigInt('9007199254740991')
                }
            },
            false
        );
    });

    describe('Op.neqeq/Op.eqeq', () => {
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
                name: { [Op.any]: ['larry', 'may'] }
            },
            {
                dataSource: {
                    name: ['larry', 'may']
                }
            },
            false
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
                    id: 2,
                    text: ['hello world!', 'haha']
                }
            },
            false
        );

        testQuery(
            {
                name: { [Op.all]: ['jim', 'may'] }
            },
            {
                dataSource: {
                    id: 4,
                    name: ['jim', 'may']
                }
            },
            true
        );

        testQuery(
            {
                name: { [Op.all]: ['han', 'jim', 'may'] }
            },
            {
                dataSource: {
                    id: 4,
                    name: ['jim', 'may', 'han']
                }
            },
            false
        );

        testQuery(
            'grades',
            {
                where: {
                    grades: {
                        [Op.gt]: {
                            [Op.all]: [11, 10, 17, 19]
                        }
                    }
                },
                dataSource: {
                    grades: 25
                }
            },
            true,
            true
        );
    });

    describe('Op.between/Op.notBetween', () => {
        testQuery(
            {
                gradeLevel: { [Op.between]: [2, 6] }
            },
            {
                dataSource: {
                    id: 1,
                    gradeLevel: 5
                }
            },
            true
        );

        testQuery(
            {
                grade: { [Op.notBetween]: [2, 16] }
            },
            {
                dataSource: {
                    id: 11,
                    grade: 115
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
    });

    describe('Op.contains/Op.contained', () => {
        testQuery(
            {
                lang: { [Op.contains]: 'java' }
            },
            {
                dataSource: {
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
                    lang: ['js', 'html', 'css']
                }
            },
            true
        );

        testQuery(
            {
                lang: { [Op.contained]: ['css', 'html', 'js'] }
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
                sources: { [Op.contains]: { c: 3, dd: 4 } }
            },
            {
                dataSource: {
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
                    sources: {
                        c: 3,
                        dd: 4
                    }
                }
            },
            true
        );
    });

    describe('Op.overlap', () => {
        testQuery(
            {
                seqs: { [Op.overlap]: [11, 12] }
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
                targets: { [Op.overlap]: ['aa', 'bb'] }
            },
            {
                dataSource: {
                    targets: [11, 22, 33]
                }
            },
            false
        );

        // testQuery(
        //     {
        //         range: { [Op.overlap]: [new Date('2010-08-01'), new Date('2010-11-01')] }
        //     },
        //     {
        //         dataSource: {
        //             id: 1,
        //             range: [new Date('2010-02-01'), new Date('2010-09-01')]
        //         }
        //     },
        //     true
        // );
    });

    describe('Op.isDate', () => {
        testQuery(
            {
                bod: { [Op.isDate]: true }
            },
            {
                dataSource: {
                    name: 'dood',
                    bod: '1999-11-11 11:22:33'
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
                    name: 'puppy',
                    since: 'not-a-valid-date'
                }
            },
            true
        );
    });
});

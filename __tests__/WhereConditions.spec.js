import util from 'util';
import Conditionalize from '../src/conditionalize';

const { Op } = Conditionalize;

describe('Conditionalize method test', () => {
    describe('check method', () => {
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

        describe('literal NUMBER type', () => {
            const options = {
                dataSource: {
                    id: 1,
                    rank: 22
                }
            };

            // dataSource.id == 1
            applyTest(1, options, true);
        });

        describe('literal STRING type', () => {
            const options = {
                dataSource: {
                    id: 2,
                    rank: 22
                }
            };

            // dataSource.id === '2'
            applyTest('2', options, false);
            // dataSource.id === 'false'
            applyTest('false', options, false);
        });

        describe('literal BOOLEAN type', () => {
            const options = {
                dataSource: {
                    id: 3,
                    value: true,
                    rank: 22
                }
            };

            // true === true
            applyTest(true, options, true);
            // true === false
            applyTest(false, options, false);
        });

        describe('literal null/undefined type', () => {
            const options = {
                dataSource: {
                    id: 4,
                    rank: 22
                }
            };

            applyTest(null, options, true);
            applyTest(undefined, options, true);
        });

        describe('no where property', () => {
            const options = {
                dataSource: {
                    id: 4,
                    rank: 22
                }
            };

            applyTest({}, options, true, true);
        });

        describe('no where arguments (plain object/empty array)', () => {
            const options = {
                dataSource: {
                    id: 15,
                    rank: 22
                }
            };

            applyTest({}, options, true);
            applyTest([], options, true);
        });

        describe('basic object where', () => {
            const options = {
                dataSource: {
                    id: 7,
                    rank: 22
                }
            };

            applyTest(
                {
                    rank: 100
                },
                options,
                false
            );
        });

        describe('multiple where arguments', () => {
            const options = {
                dataSource: {
                    id: 8,
                    authorId: 22
                }
            };

            applyTest(
                {
                    // if (authorId === 12 and status === 'active')  get true, else false
                    authorId: 12,
                    status: 'active'
                },
                options,
                false
            );
            applyTest(
                {
                    // if (authorId === 12 and status === 'active')  get true, else false
                    authorId: 12,
                    status: 'active'
                },
                Object.assign({}, options, {
                    dataSource: {
                        ...options.dataSource,
                        authorId: 12,
                        status: 'active'
                    }
                }),
                true
            );

            applyTest(
                {
                    // if (authorId !== 2)  get true, else false
                    authorId: { [Op.ne]: 2 }
                },
                options,
                true
            );
        });

        describe('use Op.or in where arguments', () => {
            const options = {
                dataSource: {
                    id: 15
                }
            };

            applyTest(
                {
                    [Op.or]: [{ id: [1, 2, 3] }, { id: { [Op.gt]: 10 } }]
                },
                options,
                true
            );
        });

        describe('use Op.any in where arguments', () => {
            let options = {
                dataSource: {
                    grade: 3
                }
            };
            applyTest(
                {
                    grade: {
                        [Op.any]: [3, 5, 10, 15, 20]
                    }
                },
                options,
                true
            );

            options = {
                dataSource: {
                    grade: 13
                }
            };
            applyTest(
                {
                    grade: {
                        [Op.gt]: {
                            [Op.any]: [5, 13, 15, 20]
                        }
                    }
                },
                options,
                true
            );

            options = {
                dataSource: {
                    name: 'james'
                }
            };
            applyTest(
                {
                    name: {
                        [Op.like]: {
                            [Op.any]: ['david', 'smith', 'jame']
                        }
                    }
                },
                options,
                true
            );

            options = {
                dataSource: {
                    name: 'anna'
                }
            };
            applyTest(
                {
                    name: {
                        [Op.notLike]: {
                            [Op.any]: ['anny', 'tom', 'jimmy']
                        }
                    }
                },
                options,
                true
            );
        });

        describe('use Op.all in where arguments', () => {
            let options = {
                dataSource: {
                    grade: 5
                }
            };
            applyTest(
                {
                    grade: {
                        [Op.all]: [5, 5, 5]
                    }
                },
                options,
                true
            );

            options = {
                dataSource: {
                    grade: 7
                }
            };

            applyTest(
                {
                    grade: {
                        [Op.lte]: {
                            [Op.all]: [9, 10, 15, 20]
                        }
                    }
                },
                options,
                true
            );

            options = {
                dataSource: {
                    name: 'anna'
                }
            };
            applyTest(
                {
                    name: {
                        [Op.notLike]: {
                            [Op.all]: ['anny', 'tommy', 'jane']
                        }
                    }
                },
                options,
                true
            );
        });

        describe('use options.operatorsAliases as aliases for operators', () => {
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
    });

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
                    age: 22
                }
            },
            true
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

        describe('Op.and/Op.or', () => {
            describe('Op.and', () => {
                testQuery(
                    Op.and,
                    { [Op.or]: { name: 'leo', authorId: 22 }, status: 'active' },
                    {
                        dataSource: {
                            name: 'leo',
                            status: 'active',
                            authorId: 11
                        }
                    },
                    true
                );

                testQuery(
                    Op.and,
                    [
                        {
                            name: 'leo'
                        },
                        {
                            authorId: {
                                [Op.eqeq]: '22'
                            }
                        }
                    ],
                    {
                        dataSource: {
                            name: 'leo',
                            authorId: 22
                        }
                    },
                    false
                );

                testQuery(
                    Op.and,
                    [
                        {
                            name: {
                                // [Op.like]: /^gE/i, // also works
                                [Op.like]: ['^(Ge)', 'i']
                            }
                        },
                        {
                            name: {
                                [Op.like]: /JS$/i
                            },
                            authorId: {
                                [Op.gte]: 12
                            }
                        }
                    ],
                    {
                        dataSource: {
                            name: 'GEEKKKK.js',
                            authorId: 20
                        }
                    },
                    true
                );

                // testQuery(
                //     'grade',
                //     {
                //         [Op.and]: {
                //             [Op.ne]: 5,
                //             [Op.between]: [1, 10]
                //         }
                //     },
                //     {
                //         dataSource: {
                //             name: 'leo',
                //             grade: 3
                //         }
                //     },
                //     true
                // );

                testQuery(
                    'name',
                    {
                        [Op.and]: [{ [Op.like]: /LE1/i }, { [Op.like]: ['Le22', 'i'] }]
                    },
                    {
                        dataSource: {
                            name: 'leole11le222'
                        }
                    },
                    true
                );
            });

            describe('Op.or', () => {
                testQuery(
                    'authorId',
                    {
                        [Op.or]: [12, 13]
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
                    'authorId',
                    {
                        [Op.or]: {
                            [Op.lt]: 100,
                            [Op.eq]: null
                        }
                    },
                    {
                        dataSource: {
                            id: 2,
                            authorId: null
                        }
                    },
                    true
                );

                testQuery(
                    Op.or,
                    [{ name: 'leo' }, { name: 'jane' }],
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
                    Op.or,
                    { name: 'leo', authorId: 11 },
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
                    Op.or,
                    {
                        receipt: [3, 5],
                        category: {
                            [Op.in]: [2, 4, 6]
                        }
                    },
                    {
                        dataSource: {
                            id: 5,
                            name: 'leo',
                            authorId: 22,
                            receipt: 13,
                            category: 6
                        }
                    },
                    true
                );

                testQuery(
                    Op.or,
                    [
                        {
                            authorId: 11
                        },
                        {
                            authorId: 12,
                            name: 'leo'
                        }
                    ],
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
                    Op.or,
                    [],
                    {
                        dataSource: {
                            name: 'mary',
                            authorId: 12
                        }
                    },
                    false
                );

                testQuery(
                    Op.or,
                    {},
                    {
                        dataSource: {
                            name: 'lee',
                            authorId: 13
                        }
                    },
                    true
                );
            });
        });

        describe('Op.is/Op.not', () => {
            describe('Op.not', () => {
                testQuery(
                    'name',
                    { [Op.not]: ['js', 'i'] }, // Op.notIn
                    {
                        dataSource: {
                            name: 'HTML',
                            status: 'active'
                        }
                    },
                    true
                );

                testQuery(
                    Op.not,
                    { [Op.or]: { name: 'leo1', authorId: 22 }, status: 'active' },
                    {
                        dataSource: {
                            name: 'leo1',
                            status: 'active',
                            authorId: 7
                        }
                    },
                    false
                );

                testQuery(
                    'deleted',
                    { [Op.not]: true },
                    {
                        dataSource: {
                            name: 'apple',
                            deleted: false
                        }
                    },
                    true
                );

                testQuery(
                    'deleted',
                    { [Op.not]: null },
                    {
                        dataSource: {
                            name: 'sass',
                            deleted: 'nil'
                        }
                    },
                    true
                );

                testQuery(
                    'langs',
                    { [Op.not]: 'java' }, // Op.ne
                    {
                        dataSource: {
                            langs: 'javascript'
                        }
                    },
                    true
                );
                testQuery(Op.not, [], {}, false);
                testQuery(Op.not, {}, {}, false);
            });
            describe('Op.is', () => {
                testQuery(
                    'name',
                    {
                        [Op.is]: ['rose', 'i']
                    },
                    {
                        dataSource: {
                            name: 'Rose'
                        }
                    },
                    true
                );
            });
        });

        describe('Op.col', () => {
            testQuery(
                'name',
                { [Op.col]: 'alias' },
                {
                    dataSource: {
                        name: 'HTML',
                        alias: 'HTML'
                    }
                },
                true
            );

            testQuery(
                'name',
                { [Op.eq]: { [Op.col]: 'alias' } },
                {
                    dataSource: {
                        name: ['JS', 'CSS'],
                        alias: ['JS', 'CSS']
                    }
                },
                true
            );

            testQuery(
                'name',
                { [Op.like]: { [Op.col]: 'alias' } },
                {
                    dataSource: {
                        name: 'sass',
                        alias: 'ss'
                    }
                },
                true
            );
            testQuery(
                'age',
                { [Op.gt]: { [Op.col]: 'demo.ageAlias' } },
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
        });

        describe.skip('Op.between/Op.notBetween', () => {
            testQuery(
                'grade',
                {
                    [Op.between]: [2, 6]
                },
                {
                    dataSource: {
                        grade: 5
                    }
                },
                true
            );

            testQuery(
                'date',
                {
                    [Op.between]: ['2010-08-01', '2010-12-02']
                },
                {
                    dataSource: {
                        date: '2010-09-09'
                    }
                },
                true
            );

            testQuery(
                'date',
                {
                    [Op.between]: [new Date('2010-08-11'), new Date('2010-12-09')]
                },
                {
                    dataSource: {
                        date: new Date('2010-09-22')
                    }
                },
                true
            );

            testQuery(
                'date',
                {
                    [Op.between]: ['2010-02-01', '2011-07-02'],
                    [Op.notBetween]: ['2011-08-09', '2011-12-11']
                },
                {
                    dataSource: {
                        date: '2010-07-09'
                    }
                },
                true
            );

            testQuery(
                'date',
                {
                    [Op.notBetween]: ['2010-08-01', '2010-12-02']
                },
                {
                    dataSource: {
                        date: '2011-09-09'
                    }
                },
                true
            );
        });

        describe('Op.gt/Op.gte', () => {
            testQuery(
                'count',
                {
                    [Op.gt]: 5
                },
                {
                    dataSource: {
                        count: 11
                    }
                },
                true
            );

            testQuery(
                'count',
                {
                    [Op.gte]: 6
                },
                {
                    dataSource: {
                        count: 10
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
                'count',
                {
                    [Op.lt]: 5
                },
                {
                    dataSource: {
                        count: 2
                    }
                },
                true
            );

            testQuery(
                'count',
                {
                    [Op.lte]: 6
                },
                {
                    dataSource: {
                        count: 5
                    }
                },
                true
            );

            testQuery(
                'total',
                {
                    [Op.lte]: { [Op.col]: 'count' }
                },
                {
                    dataSource: {
                        total: 2,
                        count: 10
                    }
                },
                true
            );
        });

        describe('Op.in/Op.notIn', () => {
            testQuery(
                'name',
                {
                    [Op.in]: [1, 3]
                },
                {
                    dataSource: {
                        name: 3
                    }
                },
                true
            );

            testQuery(
                'grade',
                {
                    [Op.notIn]: []
                },
                {
                    dataSource: {
                        grade: 5
                    }
                },
                true
            );

            testQuery(
                'grade',
                {
                    [Op.in]: []
                },
                {
                    dataSource: {
                        grade: 6
                    }
                },
                false
            );

            testQuery(
                'grade',
                {
                    [Op.notIn]: [3, 11]
                },
                {
                    dataSource: {
                        grade: 6
                    }
                },
                true
            );
        });

        describe('Op.ne/Op.eq', () => {
            testQuery(
                'name',
                {
                    [Op.eq]: 'jack'
                },
                {
                    dataSource: {
                        name: 'jack'
                    }
                },
                true
            );

            testQuery(
                'order',
                {
                    [Op.eq]: [1, 2, 3]
                },
                {
                    dataSource: {
                        order: [1, 2, 3]
                    }
                },
                true
            );

            testQuery(
                'email',
                {
                    [Op.ne]: 'jack@gmail.com'
                },
                {
                    dataSource: {
                        email: 'jack@yahoo.com'
                    }
                },
                true
            );

            testQuery(
                'deletedAt',
                {
                    [Op.ne]: null
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

        describe('Op.like/Op.notLike', () => {
            testQuery(
                'username',
                {
                    [Op.like]: /mary/
                },
                {
                    dataSource: {
                        username: 'Mary'
                    }
                },
                false
            );

            testQuery(
                'name',
                {
                    [Op.like]: {
                        [Op.any]: ['larry', 'mario']
                    }
                },
                {
                    dataSource: {
                        name: 'mario'
                    }
                },
                true
            );

            testQuery(
                'name',
                {
                    [Op.like]: {
                        [Op.all]: ['rose', 'mario']
                    }
                },
                {
                    dataSource: {
                        name: ['rose', 'mario']
                    }
                },
                true
            );

            // testQuery(
            //     'alias',
            //     {
            //         [Op.like]: {
            //             [Op.any]: { [Op.col]: 'name' }
            //         }
            //         // [Op.like]: [
            //         //     {
            //         //         [Op.col]: 'name'
            //         //     },
            //         //     'i'
            //         // ]
            //     },
            //     {
            //         dataSource: {
            //             name: ['tulip1', 'orchid1'],
            //             alias: ['tulip', 'orchid', 'sakura']
            //         }
            //     },
            //     false
            // );

            testQuery(
                'name',
                {
                    [Op.notLike]: {
                        [Op.any]: ['lucy', 'tulip']
                    }
                },
                {
                    dataSource: {
                        name: 'mach'
                    }
                },
                true
            );

            testQuery(
                'foods',
                {
                    [Op.notLike]: {
                        [Op.all]: ['corn', 'rice', 'BEEF']
                    }
                },
                {
                    dataSource: {
                        cats: ['apple', 'peach'],
                        foods: 'beef'
                    }
                },
                true
            );

            testQuery(
                'username',
                {
                    [Op.notLike]: ['mary$', 'i']
                },
                {
                    dataSource: {
                        username: 'maryen'
                    }
                },
                true
            );
        });

        describe('Op.startsWith/Op.endsWith', () => {
            testQuery(
                'username',
                {
                    [Op.startsWith]: 'ma'
                },
                {
                    dataSource: {
                        username: 'mario'
                    }
                },
                true
            );

            testQuery(
                'lang',
                {
                    [Op.endsWith]: 'script'
                },
                {
                    dataSource: {
                        lang: 'javascript'
                    }
                },
                true
            );
        });

        describe('Op.substring', () => {
            testQuery(
                'lang',
                {
                    [Op.substring]: 'avi'
                },
                {
                    dataSource: {
                        lang: 'javis'
                    }
                },
                true
            );

            testQuery(
                'langs',
                {
                    [Op.substring]: 'css'
                },
                {
                    dataSource: {
                        langs: ['js', 'html', 'css', 'node', 'python', 'go']
                    }
                },
                true
            );

            testQuery(
                'lan',
                {
                    [Op.substring]: 3
                },
                {
                    dataSource: {
                        lan: {
                            a: 1,
                            b: 2,
                            c: 3
                        }
                    }
                },
                true
            );
        });

        describe.skip('Op.contains', () => {});

        describe('Op.any', () => {
            testQuery(
                'name',
                {
                    [Op.any]: ['larry', 'may']
                },
                {
                    dataSource: {
                        name: 'may'
                    }
                },
                true
            );

            testQuery(
                'userId',
                {
                    [Op.any]: [1, 10, 15, 18]
                },
                {
                    dataSource: {
                        userId: 10
                    }
                },
                true
            );

            testQuery(
                'userId',
                {
                    [Op.any]: {
                        [Op.values]: [11, 10, 15, 19]
                    }
                },
                {
                    dataSource: {
                        userId: 11
                    }
                },
                true
            );

            testQuery(
                'grades',
                {
                    [Op.gt]: {
                        [Op.any]: [6, 10, 16, 19]
                    }
                },
                {
                    dataSource: {
                        grades: 10
                    }
                },
                true
            );

            testQuery(
                'grades',
                {
                    [Op.notIn]: {
                        [Op.any]: [3, 13, 6, 15, 18]
                    }
                },
                {
                    dataSource: {
                        grades: 6
                    }
                },
                false
            );
        });

        describe('Op.all', () => {
            testQuery(
                'name',
                {
                    [Op.all]: ['jim', 'may']
                },
                {
                    dataSource: {
                        name: ['jim', 'may']
                    }
                },
                true
            );

            testQuery(
                'userId',
                {
                    [Op.all]: [1, 10]
                },
                {
                    dataSource: {
                        userId: [1, 10]
                    }
                },
                true
            );

            testQuery(
                'sales_by_season',
                {
                    [Op.all]: {
                        [Op.values]: [11, 10]
                    }
                },
                {
                    dataSource: {
                        sales_by_season: [11, 10]
                    }
                },
                true
            );

            testQuery(
                'grades',
                {
                    [Op.gt]: {
                        [Op.all]: [11, 10, 17, 19]
                    }
                },
                {
                    dataSource: {
                        grades: 25
                    }
                },
                true
            );

            testQuery(
                'grades',
                {
                    [Op.not]: {
                        [Op.all]: [11, 15, 12, 19]
                    }
                },
                {
                    dataSource: {
                        grades: 5
                    }
                },
                true
            );

            testQuery(
                'level',
                {
                    [Op.notIn]: {
                        [Op.all]: [10, 16, 12, 18]
                    }
                },
                {
                    dataSource: {
                        level: 2
                    }
                },
                true
            );
        });
    });

    describe('getWhereConditions method', () => {
        const testQuery = function (smth, options, expectation) {
            if (expectation === undefined) {
                expectation = options;
                options = undefined;
            }

            const ins = new Conditionalize(options);
            it(`${util.inspect(smth, { depth: 10 })}${(options && `, ${util.inspect(options)}`) || ''}`, () => {
                return expect(ins.getWhereConditions(smth)).toBe(expectation);
            });
        };

        testQuery(
            null,
            {
                dataSource: {
                    hours: 1,
                    minutes: 11
                }
            },
            true
        );
        testQuery(
            undefined,
            {
                dataSource: {
                    hours: 2,
                    seconds: 22
                }
            },
            true
        );
        testQuery(
            {},
            {
                dataSource: {
                    hours: 3,
                    seconds: 55
                }
            },
            true
        );
        testQuery(
            {
                hours: { [Op.gt]: 2 }
            },
            {
                dataSource: {
                    hours: 5
                }
            },
            true
        );

        testQuery(
            {
                hours: { [Op.gt]: 2 },
                name: { [Op.like]: /script/ }
            },
            {
                dataSource: {
                    name: 'javascript',
                    hours: 6
                }
            },
            true
        );

        testQuery(
            {
                name: { [Op.not]: null }
            },
            {
                dataSource: {
                    name: 'express'
                }
            },
            true
        );

        testQuery(
            {
                name: { [Op.ne]: null }
            },
            {
                dataSource: {
                    name: 'html'
                }
            },
            true
        );
    });
});

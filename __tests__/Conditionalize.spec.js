import util from 'util';

import Conditionalize from '../src/conditionalize';

const { Op } = Conditionalize;

describe('Conditionalize constructor', () => {
    test('should not throw error without where argument', () => {
        const options = {
            dataSource: {
                rank: 2
            }
        };

        expect(() => {
            new Conditionalize(options);
        }).not.toThrow();
    });

    test('should not throw error with empty options', () => {
        expect(() => {
            new Conditionalize({});
        }).not.toThrow();
    });

    test('should not throw error without options', () => {
        expect(() => {
            new Conditionalize();
        }).not.toThrow();
    });

    test('should allow setting specific strings as aliases for operators', () => {
        const operatorsAliases = {
            $gt: Op.gt
        };

        const inst = new Conditionalize({ operatorsAliases });
        expect(inst).toHaveProperty('OperatorMap');
        expect(inst).toHaveProperty('OperatorsAliasMap');
        expect(inst).toHaveProperty('OperatorsAliasMap.$gt', Op.gt);
        expect(inst).not.toHaveProperty('OperatorsAliasMap.$lt');
    });
});

describe('Conditionalize instance', () => {
    const options = {
        dataSource: {
            rank: 2
        },
        where: {
            rank: 5
        }
    };

    const ins = new Conditionalize(options);

    test('should has options property', () => {
        expect(ins).toHaveProperty('options');
        expect(ins).toHaveProperty('options.dataSource.rank', 2);
        expect(ins).toHaveProperty('options.where.rank', 5);
    });

    test('should has update property method', () => {
        expect(ins).toHaveProperty('update');
        expect(typeof ins.update).toBe('function');
    });

    test('should has check property method', () => {
        expect(ins).toHaveProperty('check');
        expect(typeof ins.check).toBe('function');
    });

    test('should has setOperatorsAliases property method', () => {
        expect(ins).toHaveProperty('setOperatorsAliases');
    });
});

describe('Conditionalize.prototype/Conditionalize', () => {
    test('should has Op/Validator property', () => {
        expect(Conditionalize).toHaveProperty('Op');
        expect(Conditionalize).toHaveProperty('Op.gt');
        expect(Conditionalize).toHaveProperty('Op.lte');
        expect(Conditionalize).toHaveProperty('Validator');
    });

    test('should has where/and/or property', () => {
        expect(Conditionalize.prototype).toHaveProperty('where');
        expect(Conditionalize.prototype).toHaveProperty('and');
        expect(Conditionalize.prototype).toHaveProperty('or');
        expect(typeof Conditionalize.prototype.or).toBe('function');
        expect(typeof Conditionalize.prototype.and).toBe('function');
        expect(typeof Conditionalize.prototype.where).toBe('function');
    });

    // test('should has Validator.xxx property', () => {
    //     expect(Conditionalize.prototype).toHaveProperty('Validator.is');
    //     expect(Conditionalize.prototype).toHaveProperty('Validator.not');
    //     expect(typeof Conditionalize.prototype.Validator.is).toBe('function');
    // });
});

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
                rank: 33
            }
        };

        applyTest({}, options, true);
        applyTest([], options, true);
    });

    describe('basic object where', () => {
        const options = {
            dataSource: {
                id: 7,
                rank: 12
            }
        };

        applyTest(
            {
                rank: 12
            },
            options,
            true
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
});

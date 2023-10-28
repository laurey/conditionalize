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
});

describe('check method', () => {
    const applyTest = function (where, params, expectation, ignore = false) {
        const options = { ...params };
        if (ignore !== true) {
            Object.assign(options, { where });
        }

        it(
            util.inspect(typeof where === 'object' && where ? where : { where }, { depth: 5 }) +
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

        applyTest(0, options, false);
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
        applyTest('', options, true);
        // applyTest('2', options, false); // invalid: Not support
        // applyTest('ga2', options, false); // invalid: Not support
    });

    describe('literal BOOLEAN type', () => {
        const options = {
            dataSource: {
                id: 3,
                value: true,
                rank: 22
            }
        };

        // 1 === 1
        applyTest(true, options, true);
        // 1 === 1
        applyTest(false, options, true);
    });

    describe('literal null/undefined type', () => {
        const options = {
            dataSource: {
                id: 5,
                rank: 26
            }
        };

        applyTest(null, options, true);
        applyTest(undefined, options, true);
    });

    describe('no where property', () => {
        const options = {
            dataSource: {
                id: 9,
                rank: 21
            }
        };

        applyTest(0, options, true, true);
        applyTest({}, options, true, true);
        applyTest(null, options, true, true);
        applyTest(false, options, true, true);
        applyTest(
            {
                id: 10
            },
            options,
            true,
            true
        );
    });

    describe('no where arguments (plain Object/empty Array)', () => {
        const options = {
            dataSource: {
                id: 8,
                rank: 33
            }
        };

        applyTest({}, options, true);
        applyTest([], options, true);
    });

    describe('primitive types where arguments within array', () => {
        const options = {
            dataSource: {
                id: 8,
                rank: 33
            }
        };

        applyTest([''], options, true);
        applyTest(['1'], options, true);
        applyTest([1], options, true);
        applyTest([1, 0], options, true);
        applyTest([0], options, true);
        applyTest([null], options, true);
        applyTest([undefined], options, true);
    });

    describe('basic object/array where', () => {
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
        applyTest(
            [
                {
                    rank: 12
                }
            ],
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
                // (authorId === 12 and status === 'active')
                authorId: 12,
                status: 'active'
            },
            options,
            false
        );
        applyTest(
            {
                // (authorId === 12 and status === 'active')
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
                // (authorId !== 2)
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

    describe('use Op.and in where arguments', () => {
        applyTest(
            {
                grade: 3
            },
            {
                dataSource: {
                    id: 11,
                    grade: 3
                }
            },
            true
        );

        applyTest(
            {
                [Op.and]: [{ id: 12 }, { grade: 33 }]
            },
            {
                dataSource: {
                    id: 12,
                    grade: 11
                }
            },
            false
        );

        applyTest(
            {
                id: 15,
                name: 'james'
            },
            {
                dataSource: {
                    id: 15,
                    name: 'james'
                }
            },
            true
        );

        applyTest(
            {
                [Op.and]: {
                    id: 16,
                    name: 'anna'
                }
            },
            {
                dataSource: {
                    id: 16,
                    name: 'anna'
                }
            },
            true
        );
    });
});

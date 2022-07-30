import util from 'util';
import Conditionalize from '../es/conditionalize';

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

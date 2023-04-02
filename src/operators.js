/**
 * Operator symbols to be used when compare data
 *
 * @property eq
 * @property eqeq
 * @property ne
 * @property neq
 * @property neqeq
 * @property gte
 * @property gt
 * @property lte
 * @property lt
 * @property not
 * @property is
 * @property in
 * @property notIn
 * @property like
 * @property notLike
 * @property endsWith
 * @property startsWith
 * @property substring
 * @property or
 * @property and
 * @property any
 * @property all
 */
const Op = {
    eq: Symbol.for('eq'),
    eqeq: Symbol.for('eqeq'),
    ne: Symbol.for('ne'),
    neq: Symbol.for('neq'),
    neqeq: Symbol.for('neqeq'),
    gte: Symbol.for('gte'),
    gt: Symbol.for('gt'),
    lte: Symbol.for('lte'),
    lt: Symbol.for('lt'),
    not: Symbol.for('not'),
    is: Symbol.for('is'),
    in: Symbol.for('in'),
    notIn: Symbol.for('notIn'),
    like: Symbol.for('like'),
    notLike: Symbol.for('notLike'),
    endsWith: Symbol.for('endsWith'),
    startsWith: Symbol.for('startsWith'),
    substring: Symbol.for('substring'),
    or: Symbol.for('or'),
    and: Symbol.for('and'),
    any: Symbol.for('any'),
    all: Symbol.for('all'),
    col: Symbol.for('col')
    // between: Symbol.for('between'),
    // notBetween: Symbol.for('notBetween')
    // custom operators
    // isDate: Symbol.for('isDate')
    // isIPv4: Symbol.for('isIPv4')
};

export default Op;

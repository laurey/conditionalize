/*
 * For a detailed explanation regarding each configuration property, visit:
 * https://jestjs.io/docs/configuration
 */

export default {
    // Stop running tests after `n` failures
    bail: 1,

    // Automatically clear mock calls, instances, contexts and results before every test
    clearMocks: true,

    // The directory where Jest should output its coverage files
    coverageDirectory: 'coverage',

    // Indicates which provider should be used to instrument code for coverage
    coverageProvider: 'v8',

    // A list of paths to directories that Jest should use to search for files in
    roots: ['<rootDir>/src', '<rootDir>/__tests__']

    // A map from regular expressions to paths to transformers
    // transform: undefined,
};

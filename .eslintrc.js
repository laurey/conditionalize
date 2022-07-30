module.exports = {
    root: true,
    parser: '@babel/eslint-parser',
    parserOptions: {
        // sourceType: 'module',
        allowImportExportEverywhere: true
    },
    env: {
        browser: true,
        node: true,
        jest: true,
        es6: true
    },
    extends: ['eslint:recommended', 'plugin:prettier/recommended'],
    plugins: ['import', 'prettier'],
    rules: {
        'no-unused-vars': 1,
        'prettier/prettier': 'error',
        'import/prefer-default-export': 'off'
    },
    settings: {
        'import/resolver': {
            node: {
                extensions: ['.js', '.ts', '.json']
            }
        }
    }
};

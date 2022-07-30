const config = api => {
    const isTest = api.env('test');
    const isCJS = api.env('cjs');
    const isEnvES = api.env('es');
    const isBrowser = api.env('browser');
    const env = api.cache(() => process.env.NODE_ENV); // test/development/production

    return {
        plugins: [
            !isBrowser && ['@babel/plugin-transform-runtime'],
            ['@babel/plugin-proposal-decorators', { legacy: true }],
            ['@babel/plugin-proposal-class-properties', { loose: true }],
            ['@babel/plugin-proposal-private-methods', { loose: true }],
            ['@babel/plugin-proposal-private-property-in-object', { loose: true }],
            (isTest || isCJS) && ['@babel/plugin-transform-modules-commonjs'],
            (isTest || isCJS) && ['babel-plugin-add-module-exports'],
            '@babel/plugin-proposal-export-default-from',
            '@babel/plugin-proposal-export-namespace-from',
            '@babel/plugin-proposal-optional-chaining',
            '@babel/plugin-proposal-nullish-coalescing-operator'
        ].filter(Boolean),
        presets: [
            [
                '@babel/preset-env',
                {
                    targets: isBrowser
                        ? {
                              chrome: 50,
                              firefox: 45,
                              safari: 10,
                              edge: 12,
                              ios: 10,
                              ie: 10
                          }
                        : { node: '12' }
                }
            ]
        ]
    };
};

module.exports = config;

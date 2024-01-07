import path from 'path';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import { babel } from '@rollup/plugin-babel';
import json from '@rollup/plugin-json';
import autoExternal from 'rollup-plugin-auto-external';
import bundleSize from 'rollup-plugin-bundle-size';
import { terser } from 'rollup-plugin-terser';

import pkg from './package.json';

const outputFileName = 'conditionalize';
const name = 'Conditionalize';
const defaultInput = path.resolve(__dirname, 'src/conditionalize');

const buildConfig = ({ browser = false, minifiedVersion = false, output, ...config }) => {
    const getOutputFile = (item, minified) => {
        const { file } = item;
        const ext = path.extname(file);
        const basename = path.basename(file, ext);
        const extArr = ext.split('.');
        extArr.shift();
        return `${path.dirname(file)}/${basename}.${(minified ? ['min', ...extArr] : extArr).join('.')}`;
    };

    const build = ({ minified, output }) => ({
        input: defaultInput,
        ...config,
        output,
        plugins: [
            autoExternal({
                dependencies: false
            }),
            json({ preferConst: true, compact: true }),
            resolve({ browser }),
            commonjs(),
            minified && terser(),
            minified && bundleSize(),
            ...(config.plugins || [])
        ]
    });

    const options = { minified: false };
    let realOutput;
    if (Array.isArray(output)) {
        realOutput = output.map(item => ({
            ...item,
            file: getOutputFile(item, false)
        }));
    } else {
        realOutput = { ...output, file: getOutputFile(output, false) };
    }

    const configs = [build({ ...options, output: realOutput })];

    if (minifiedVersion) {
        Object.assign(options, { minified: true });
        if (Array.isArray(output)) {
            realOutput = output.map(item => ({
                ...item,
                file: getOutputFile(item, true)
            }));
        } else {
            realOutput = { ...output, file: getOutputFile(output, true) };
        }

        configs.push(build({ ...options, output: realOutput }));
    }

    return configs;
};

const buildESMConfig = ({ input, name, banner }) => {
    return buildConfig({
        input,
        minifiedVersion: true,
        output: {
            name,
            banner,
            file: pkg.module,
            preferConst: true,
            exports: 'auto',
            format: 'esm',
            globals: {
                lodash: '_',
                moment: 'moment'
            }
        },
        plugins: [
            babel({
                exclude: ['node_modules/**'],
                babelHelpers: 'runtime',
                configFile: path.resolve(__dirname, 'babel.config.cjs')
            })
        ]
    });
};

const buildCJSConfig = ({ input, name, banner }) => {
    return buildConfig({
        input,
        minifiedVersion: true,
        output: {
            name,
            banner,
            file: pkg.main,
            preferConst: true,
            exports: 'auto',
            format: 'cjs',
            globals: {
                lodash: '_',
                moment: 'moment'
            }
        }
    });
};

const buildUMDConfig = ({ name, banner, input }) => {
    return buildConfig({
        input,
        browser: true,
        minifiedVersion: true,
        output: [
            {
                name,
                banner,
                file: pkg.umd,
                format: 'umd',
                exports: 'auto',
                globals: {
                    lodash: '_',
                    moment: 'moment'
                }
            },
            {
                name,
                banner,
                file: `public/${outputFileName}.js`,
                format: 'umd',
                sourcemap: true,
                exports: 'auto',
                globals: {
                    lodash: '_',
                    moment: 'moment'
                }
            }
        ],
        plugins: [
            babel({
                exclude: ['node_modules/**'],
                babelHelpers: 'bundled',
                configFile: path.resolve(__dirname, 'babel.config.cjs')
            })
        ]
    });
};

// const buildAMDConfig = () => {};

export default async args => {
    const input = args?.entry ?? defaultInput;
    const env = process.env.BABEL_ENV ?? 'esm';
    const year = new Date().getFullYear();
    const banner = `// Conditionalize v${pkg.version} Copyright (c) ${year} ${pkg.author} and contributors`;

    switch (env) {
        case 'es':
        case 'esm':
            return buildESMConfig({ name, input, banner });

        case 'umd':
        case 'browser':
            return buildUMDConfig({ name, input, banner });

        case 'cjs':
        case 'commonjs':
            return buildCJSConfig({ name, input, banner });

        default:
            return buildESMConfig({ name, input, banner });
    }
};

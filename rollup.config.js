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
const defaultInput = path.resolve(__dirname, 'src/conditionalize.js');

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
            autoExternal(),
            json({ preferConst: true, compact: true }),
            resolve({ browser }),
            commonjs({
                // include: 'node_modules/**'
            }),
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
            file: `es/${outputFileName}.js`,
            preferConst: true,
            exports: 'named',
            format: 'esm'
        }
    });
};

const buildCJSConfig = ({ input, name, banner }) => {
    return buildConfig({
        input,
        minifiedVersion: true,
        output: {
            name,
            banner,
            file: `lib/${outputFileName}.js`,
            preferConst: true,
            exports: 'default',
            format: 'cjs'
        }
    });
};

const buildUMDConfig = ({ name, banner, input }) => {
    return buildConfig({
        input,
        browser: true,
        minifiedVersion: true,
        external: [/@babel\/runtime/],
        output: [
            {
                name,
                banner,
                file: `dist/${outputFileName}.js`,
                format: 'umd',
                exports: 'default',
                globals: {
                    lodash: '_'
                }
            },
            {
                name,
                banner,
                file: `public/${outputFileName}.js`,
                format: 'umd',
                exports: 'default',
                sourcemap: true,
                globals: {
                    lodash: '_'
                    // bluebird: 'P',
                    // moment: 'moment',
                    // validator: 'validator'
                }
            }
        ],
        plugins: [
            babel({
                exclude: 'node_modules/**',
                presets: ['@babel/preset-env'],
                babelHelpers: 'bundled',
                configFile: path.resolve(__dirname, 'babel.config.cjs')
            })
        ]
    });
};

const buildAMDConfig = () => {};

export default async args => {
    const input = args?.entry ?? defaultInput;
    const env = args?.env ?? 'es';
    const year = new Date().getFullYear();
    const banner = `// Conditionalize v${pkg.version} Copyright (c) ${year} ${pkg.author} and contributors`;

    switch (env) {
        case 'es':
        case 'esm':
            return buildESMConfig({ name, input, banner });
            break;

        case 'umd':
        case 'browser':
            return buildUMDConfig({ name, input, banner });
            break;

        case 'cjs':
        case 'commonjs':
            return buildCJSConfig({ name, input, banner });
            break;

        default:
            return buildESMConfig({ name, input, banner });
            break;
    }
};

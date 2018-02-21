import babel from 'rollup-plugin-babel';
import nodeResolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import peerDeps from 'rollup-plugin-peer-deps-external';

const pkg = require('./package.json');

export default [

  {
    input: 'src/XMLToReact.js',
    output: [
      {
        name: 'XMLToReact',
        file: pkg.browser,
        format: 'umd',
        globals: {
          react: 'React',
        },
      },
    ],
    plugins: [
      nodeResolve({ preferBuiltins: true }),
      commonjs(),
      peerDeps(),
      babel({
        presets: ['es2015-rollup'],
        babelrc: false,
      }),
    ],
  },
  {
    input: 'src/XMLToReact.js',
    output: [
      {
        file: pkg.main,
        format: 'cjs',
      },
      {
        file: pkg.module,
        format: 'es',
      },
    ],
    external: ['xmldom'],
    plugins: [
      commonjs(),
      peerDeps(),
      babel({
        presets: ['es2015-rollup'],
        babelrc: false,
      }),
    ],
  },
];

import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import {terser} from 'rollup-plugin-terser';

export default {
  input: 'add-ons/add-on.js',
  output: [
    {
      file: '_site/heti-addon.js',
      name: 'Heti',
      format: 'umd'
    },
    {
      file: 'dist/heti-addon.min.js',
      format: 'umd',
      name: 'Heti',
      plugins: [
        terser({
          output: {
            comments: false
          }
        })
      ]
    },
  ],
  plugins: [
    resolve(),
    commonjs(),
  ]
};

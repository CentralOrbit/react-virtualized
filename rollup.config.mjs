import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import babel from '@rollup/plugin-babel';
import replace from '@rollup/plugin-replace';
import terser from '@rollup/plugin-terser';

export default {
  input: './source/index.js',
  output: {
    file: 'dist/umd/react-virtualized.js',
    format: 'umd',
    name: 'ReactVirtualized',
    globals: {
      react: 'React',
      'react-dom': 'ReactDOM',
    },
  },
  external: ['react', 'react-dom'],
  plugins: [
    resolve({
      moduleDirectories: ['node_modules']
    }),
    commonjs({
      include: 'node_modules/**',
    }),
    babel({
      babelHelpers: 'external',
      exclude: 'node_modules/**',
    }),
    replace({
      preventAssignment: true,
      'process.env.NODE_ENV': JSON.stringify('development'),
    }),
    terser({
      mangle: false,
      output: {
        comments: "all",
        beautify: true,
      },
    }),
  ],
};

const path = require('path');

/**
 * Refer to the documentation below in order to do your webpack overrides.
 * Override rules:
 * -> Objects are (deeply) merged.
 * -> Strings are overridden.
 * -> Arrays are concatenated.
 * https://webpack.js.org/configuration/
 */
module.exports = {
  resolve: {
    alias: {
      '@components': path.resolve(__dirname + '/src/components/'),
      '@pages': path.resolve(__dirname + '/src/pages/'),
      '@hooks': path.resolve(__dirname + '/src/hooks/'),
      '@contexts': path.resolve(__dirname + '/src/contexts/'),
      '@types': path.resolve(__dirname + '/src/types/'),
      '@services': path.resolve(__dirname + '/src/services/'),
      '@utils': path.resolve(__dirname + '/src/utils/'),
      '@models': path.resolve(__dirname + '/src/models/'),
      '@workers': path.resolve(__dirname + '/src/workers/'),
      '@enums': path.resolve(__dirname + '/src/enums/')
    }
  },
  // entry: {},
  // mode: {},
  // output: {},
  // module: {},
  // optimization: {},
  // plugins: {},
  // devServer: {},
  // cache: {},
  // devtool: {},
  // target: 'browserslist'
  // watch: {},
  // externals: {},
  // performance: {},
  // node: {},
  // stats: {},
  // experiments: {}
};

import '../docs/docs';

//More info:
// https://webpack.js.org/configuration/optimization/

/**
 * Defines a Webpack Optimization config object.
 * @param {"dev"|"prod"|"test"|undefined} env The environment indentifier.
 * @returns {WebpackOptimization} webpack.optimization
 */
export function defineOptimizations() {
  return {
    splitChunks: {
      chunks: 'all'
    }
  };
}

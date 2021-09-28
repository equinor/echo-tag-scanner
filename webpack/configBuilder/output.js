import '../docs/docs';

import path from 'path';

// More info:
// https://webpack.js.org/configuration/output/

/**
 * Defines how webpack outputs bundled files.
 * @param {"dev"|"prod"|"test"|"standaloneProd"|undefined} env - the stringified environment name.
 * @param {string} rootPath - the root path of the webserver.
 * @returns {WebpackOutput} webpack.output
 */
export function defineOutput(env, rootPath) {
  // no need for content hash as caching is irrelevant due to npm versions.
  if (env === 'prod' || env === 'standaloneProd') {
    return {
      path: path.join(rootPath, '/build/'),
      clean: true,
      publicPath: '/build/',
      filename: '[name].js',
      library: {
        type: 'umd'
      }
    };
  }

  return {
    path: path.join(rootPath, '/build/'),
    publicPath: '/',
    // chunks are regarding dependencies
    chunkFilename: '[name].[contenthash].js',
    // filename is naming the entry points
    filename: '[name].[contenthash].js',
    clean: true
  };
}

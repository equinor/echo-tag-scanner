import { join } from 'path';
import '../docs/docs';

// More info:
// https://webpack.js.org/configuration/resolve/

/**
 * Defines default resolved extensions and aliases, both used in ESM imports.
 * @param {"dev"|"prod"|"test"|undefined} env The build enviroment.
 * @param {string} rootPath - The root of the webserver.
 * @returns {WebpackResolve} webpack.resolve
 */
export function defineResolves(env, rootPath) {
  if (!rootPath) {
    return {};
  }
  return {
    extensions: ['.tsx', '.ts', '.js', '.jsx', '.css'],

    alias: {
      '@components': join(rootPath, '/src/components/'),
      '@pages': join(rootPath, '/src/pages/'),
      '@hooks': join(rootPath, '/src/hooks/'),
      '@contexts': join(rootPath, '/src/contexts/'),
      '@types': join(rootPath, '/src/types/'),
      '@services': join(rootPath, '/src/services/'),
      '@utils': join(rootPath, '/src/utils/'),
      '@models': join(rootPath, '/src/models/'),
      '@workers': join(rootPath, '/src/workers/'),
      '@enums': join(rootPath, '/src/enums/')
      // '@icons': join(rootPath, '/src/'),
      // '@images': join(rootPath, '/src/'),
      // '@fonts': join(rootPath, '/src/'),
    },
    fallback: {
      crypto: require.resolve('crypto-browserify'),
      buffer: require.resolve('buffer/'),
      stream: require.resolve('stream-browserify')
    }
  };
}

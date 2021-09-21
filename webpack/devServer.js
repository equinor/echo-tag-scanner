import { readFileSync } from 'fs';
import { rootPath } from './configBuilder/root';
import { join } from 'path';

/**
 *  Defines options for the webpack dev server middleware.
 * @param - Additional options (https://webpack.js.org/configuration/dev-server/)
 * @returns {WebpackDevServerOptions} A settings object.
 */
export function defineDevServer(additionalOptions) {
  return {
    port: 3000,
    https: {
      key: readFileSync(join(rootPath, '.ssl/prkey')),
      cert: readFileSync(join(rootPath, '.ssl/cert'))
    },
    hot: true,
    historyApiFallback: {
      disableDotRule: true
    },
    stats: 'errors-only',
    ...additionalOptions
  };
}

/**
 * @typedef WebpackDevServerOptions
 * @type {object}
 * @property {number} port
 * @property {WebpackDevServerHTTPS} https
 * @property {boolean} hot
 * @property {object} historyApiFallback
 * @property {string} stats
 * @property {boolean} noInfo
 */

/**
 * @typedef WebpackDevServerHTTPS
 * @type {object}
 * @property {callback} key
 * @property {callback} cert
 * @property {callback} ca
 */

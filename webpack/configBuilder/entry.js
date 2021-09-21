import '../docs/docs';
import { rootPath } from './root';
import { join } from 'path';

// More info:
// https://webpack.js.org/configuration/entry-context/

/**
 * Defines a WebpackEntry config object.
 * @param {"dev"|"prod"|"test"|undefined} env The environment indentifier.
 * @returns {WebpackEntry} webpack.entry
 */
export function defineEntry(env) {
  switch (env) {
    case 'prod':
      return { index: join(rootPath, '/src/setup.tsx') };
    default:
      return {
        index: join(rootPath, '/src/index.tsx')
      };
  }
}

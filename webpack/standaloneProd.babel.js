import './docs/docs.js';

import { rootPath } from './configBuilder/root';
import { defineOutput } from './configBuilder/output';
import { defineModules } from './configBuilder/modules';
import { definePlugins } from './configBuilder/plugins';
import { defineOptimizations } from './configBuilder/optimization';
import { defineResolves } from './configBuilder/resolve';
import { defineEntry } from './configBuilder/entry';
import { defineTarget } from './configBuilder/target';

/**@type WebpackConfig */
const config = {
  entry: defineEntry('standaloneProd'),
  module: defineModules('standaloneProd'),
  resolve: defineResolves('standaloneProd', rootPath),
  plugins: definePlugins('standaloneProd', rootPath),
  output: defineOutput('standaloneProd', rootPath),
  devtool: 'eval-source-map',
  // optimization: defineOptimizations('prod'),

  // FIXME: do we need source-maps in prod?
  // devtool: 'source-map',
  // FIXME: Something with optimization breaks exports and echopedia won't find XLD app.
  // optimization: defineOptimizations('prod'),
  // FIXME: Do we need target? it is set in babelrc
  // target: defineTarget('prod'),

  externals: [
    '@equinor/echo-utils',
    '@equinor/echo-components',
    '@equinor/echo-core',
    '@equinor/echo-framework',
    '@equinor/eds-core-react',
    '@equinor/eds-icons',
    'react',
    'react-dom',
    'react-router-dom',
    'styled-components'
  ]
};
export default config;

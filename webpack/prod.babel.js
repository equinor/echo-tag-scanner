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
  mode: 'production',
  entry: defineEntry('prod'),
  module: defineModules('prod'),
  resolve: defineResolves('prod', rootPath),
  plugins: definePlugins('prod', rootPath),
  output: defineOutput('prod', rootPath),

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
    'styled-components',
    'buffer',
    'crypto-browserify',
    'stream-browserify'
  ]
};
export default config;

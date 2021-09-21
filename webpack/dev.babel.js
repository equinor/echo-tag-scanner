import { rootPath } from './configBuilder/root';
import './docs/docs.js';

import { defineOutput } from './configBuilder/output';
import { defineModules } from './configBuilder/modules';
import { definePlugins } from './configBuilder/plugins';
import { defineOptimizations } from './configBuilder/optimization';
import { defineResolves } from './configBuilder/resolve';
import { defineEntry } from './configBuilder/entry';
import { defineDevServer } from './devServer';
import { defineTarget } from './configBuilder/target';

/**@type WebpackConfig */
const config = {
  entry: defineEntry('dev'),
  devtool: 'eval-source-map',
  devServer: defineDevServer(),
  module: defineModules('dev'),
  resolve: defineResolves('dev', rootPath),
  plugins: definePlugins('dev', rootPath),
  output: defineOutput('dev', rootPath),
  optimization: defineOptimizations('dev'),
  target: defineTarget('dev')
};
export default config;

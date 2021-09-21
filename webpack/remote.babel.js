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

const remoteOptions = {
  host: '0.0.0.0',
  disableHostCheck: true,
  public: 'mapwalker.erlendhall.no'
};

/**@type WebpackConfig */
const config = {
  entry: defineEntry('dev'),
  devtool: 'eval-source-map',
  devServer: defineDevServer(remoteOptions),
  module: defineModules('dev'),
  resolve: defineResolves(rootPath),
  plugins: definePlugins('dev'),
  optimization: defineOptimizations(),
  output: defineOutput(rootPath)
  // target: defineTarget('dev')
};
export default config;

import { rootPath } from './configBuilder/root';
import { join } from 'path';
import './docs/docs.js';

import { defineOutput } from './configBuilder/output';
import { defineModules } from './configBuilder/modules';
import { definePlugins } from './configBuilder/plugins';
import { defineOptimizations } from './configBuilder/optimization';
import { defineResolves } from './configBuilder/resolve';
import { defineEntry } from './configBuilder/entry';
import { defineTarget } from './configBuilder/target';

import nodeExternals from 'webpack-node-externals';

/**@type WebpackConfig */
const config = {
  entry: defineEntry('analyze'),
  devtool: false,
  module: defineModules('analyze'),
  resolve: defineResolves(rootPath),
  plugins: definePlugins('analyze'),
  optimization: defineOptimizations(),
  output: defineOutput(rootPath),
  target: defineTarget('analyze'),

  // in order to ignore built-in modules like path, fs, etc.
  externalsPresets: { node: true },
  // in order to ignore all modules in node_modules folder
  // add config modulesFromFile to read from package.json
  externals: [
    nodeExternals({
      modulesFromFile: {
        fileName: join(rootPath, 'package.json'),
        includeInBundle: ['dependencies'],
        excludeInBundle: ['devDependencies', 'peerDependencies', 'optionalDependencies']
      }
    })
  ]
};
export default config;

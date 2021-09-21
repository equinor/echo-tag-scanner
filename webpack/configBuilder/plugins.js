import '../docs/docs';
import { rootPath } from './root';
import { join } from 'path';

// Webpack third party plugins
import HtmlWebPackPlugin from 'html-webpack-plugin';
import WebpackBar from 'webpackbar';
import ReactRefreshWebpackPlugin from '@pmmmwh/react-refresh-webpack-plugin';
import Dotenv from 'dotenv-webpack';
import webpack from 'webpack';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';
import CopyPlugin from 'copy-webpack-plugin';

// More info:
// https://webpack.js.org/configuration/plugins/

/** Handles the templating of index.html */
let htmlWebPackPlugin = new HtmlWebPackPlugin({
  template: join(rootPath, '/webpack/templates/index.html'),
  filename: './index.html',
  // favicon: './public/favicon.ico',
  inject: true
});

// Custom bundling stats.
let progressReport = new WebpackBar({
  name: 'Echo Camera',
  color: '#FF69B4',
  profile: true
});

let analyzer = new BundleAnalyzerPlugin({
  analyzerMode: 'server',
  analyzerPort: 3001,
  openAnalyzer: true
});

let hotModuleReplacement = new webpack.HotModuleReplacementPlugin();
let fastRefresh = new ReactRefreshWebpackPlugin();
let envFile = join(rootPath, './.env');

/**
 * Export all plugins which are used in all environments.
 * @returns {WebpackPlugin[]}
 */
export function defineBasePlugins() {
  return [htmlWebPackPlugin, progressReport];
}

/**
 * Creates an array of webpack plugins that will be used in the build process.
 * @param {"prod"|"dev"|"remote"|"analyze"} env
 * @param {string} rootPath - The root of the webserver.
 * @returns {WebpackPlugin[]}
 */
export function definePlugins(env, rootPath) {
  switch (env) {
    case 'dev':
      return [
        ...defineBasePlugins(),
        hotModuleReplacement,
        fastRefresh,
        new Dotenv({
          path: envFile
        })
      ];
    case 'remote':
      return [
        ...defineBasePlugins(),
        hotModuleReplacement,
        fastRefresh,
        new Dotenv({
          path: envFile
        })
      ];
    case 'analyze':
      return [
        ...defineBasePlugins(),
        analyzer,
        new Dotenv({
          path: envFile
        })
      ];
    case 'prod':
      return [
        progressReport,
        new CopyPlugin({
          patterns: [
            {
              from: join(rootPath, '/src/typings/EchoCameraWeb.d.ts'),
              to: join(rootPath, '/build/index.d.ts')
            }
          ]
        }),
        new Dotenv({ path: envFile })
      ];
    default:
      throw Error('No environment was specified or it is not currently supported.');
  }
}

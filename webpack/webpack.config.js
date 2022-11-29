const path = require('path');

const {defineResolves} = require("./configBuilder/resolve");

const rootpath = path.resolve(__dirname, "../");
/**
 * Refer to the documentation below in order to do your webpack overrides.
 * Override rules:
 * -> Objects are (deeply) merged.
 * -> Strings are overridden.
 * -> Arrays are concatenated.
 * https://webpack.js.org/configuration/
 */
module.exports = {
  resolve: defineResolves(rootpath),
  experiments: { topLevelAwait: true }
};

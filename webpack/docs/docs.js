/**
 * @typedef WebpackConfig
 * @type {object}
 * @property {WebpackEntry} entry
 * @property {WebpackDevtool} devtool
 * @property {WebpackModule} module
 * @property {WebpackPlugin[]} plugins
 * @property {WebpackResolve} resolve
 * @property {WebpackOptimization} optimization
 * @property {WebpackOutput} output
 */

/**
 * @typedef WebpackResolve
 * @type {object}
 * @property {Array<string>} extensions
 * @property {object} alias
 */

/**
 * @typedef WebpackModule
 * @type {object}
 */

/**
 * @typedef WebpackResolve
 * @type {object}
 */

/**
 * @typedef WebpackOutput
 * @type {object}
 */

/**
 * @typedef WebpackEntry
 * @type {object}
 */

/**
 * @typedef WebpackPlugin
 * @type {object}
 */

/**
 * @typedef WebpackOptimization
 * @type {object}
 */

/**
 * @typedef WebpackDevtool
 * @type {object|string}
 */

/**
 * @typedef RuleSetRule
 * @type {object}
 * @property {RegExp} test
 * @property {Array<string|RegExp>} include
 * @property {Array<object>} use
 */

/**
 * @typedef WebpackTarget
 * @type {string|string[]|false}
 */

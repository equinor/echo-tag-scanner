// More info:
//https://webpack.js.org/configuration/target/

/**
 * Defines a WebpackTarget config object.
 * @param {"dev"|"remote"} env
 * @returns {WebpackTarget}
 */
 export function defineTarget(env) {
   // A workaround for getting HMR working with webpack-dev-server@3 working.
   // web needs to be set for dev environments.
   // Should be removed once webpack-dev-server@4 is prod-ready.
   switch (env) {
     case 'dev':
     case 'remote':
     case 'analyze':
       return 'web';
     default:
       return 'browserslist';
   }
 }

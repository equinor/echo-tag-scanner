const fs = require('fs');
const path = require('path');
const webpack = require('webpack');

// Note: does not include a trailing slash.
const rootPath = path.resolve(__dirname);

// Locally trusted mkcert certificate, so EchopediaWeb (https://localhost:3000)
// can load this module's manifest from https://localhost:3001. See README.
const certPath = path.join(rootPath, '.cert', 'localhost.pem');
const keyPath = path.join(rootPath, '.cert', 'localhost-key.pem');

function getHttpsServer() {
  if (!fs.existsSync(certPath) || !fs.existsSync(keyPath)) {
    console.warn(
      `[echo-tag-scanner] No mkcert certificate found at ${certPath}. ` +
        'Falling back to an untrusted self-signed certificate; EchopediaWeb will not detect this module. ' +
        'See README "Local HTTPS certificate".'
    );
    return { type: 'https' };
  }

  return {
    type: 'https',
    options: {
      cert: fs.readFileSync(certPath),
      key: fs.readFileSync(keyPath)
    }
  };
}

/**
 * Refer to the documentation below in order to do your webpack overrides.
 * Override rules:
 * -> Objects are (deeply) merged.
 * -> Strings are overridden.
 * -> Arrays are concatenated.
 * https://webpack.js.org/configuration/
 */
module.exports = {
  resolve: {
    alias: {
      '@hooks': path.join(rootPath, '/src/hooks/'),
      '@types': path.join(rootPath, '/src/types/'),
      '@services': path.join(rootPath, '/src/services/'),
      '@utils': path.join(rootPath, '/src/utils/'),
      '@cameraLogic': path.join(rootPath, '/src/cameraLogic/'),
      '@ui': path.join(rootPath, '/src/UI/'),
      '@const': path.join(rootPath, '/src/const/')
    }
  },
  devServer: {
    host: '0.0.0.0',
    server: getHttpsServer()
  },
  experiments: {
    topLevelAwait: true
  }
};

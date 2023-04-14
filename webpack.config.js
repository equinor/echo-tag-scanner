const path = require("path");
const webpack = require("webpack");

// Note: does not include a trailing slash.
const rootPath = path.resolve(__dirname);

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
      "@hooks": path.join(rootPath, "/src/hooks/"),
      "@types": path.join(rootPath, "/src/types/"),
      "@services": path.join(rootPath, "/src/services/"),
      "@utils": path.join(rootPath, "/src/utils/"),
      "@cameraLogic": path.join(rootPath, "/src/cameraLogic/"),
      "@ui": path.join(rootPath, "/src/UI/"),
      "@const": path.join(rootPath, "/src/const/"),
    },
  },
  devServer: {
    headers: {
      "permissions-policy": "camera=self",
    },
  },
  experiments: {
    topLevelAwait: true,
  },
};

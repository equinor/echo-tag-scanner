const {join} = require("path");


function defineResolves(rootPath) {
    if (!rootPath) {
        return {};
    }

    return {
      extensions: ['.tsx', '.ts', '.js', '.jsx', '.css'],
      alias: {
        '@ui': join(rootPath, '/src/UI/'),
        '@cameraLogic': join(rootPath, '/src/cameraLogic'),
        '@hooks': join(rootPath, '/src/hooks/'),
        '@types': join(rootPath, '/src/types/'),
        '@services': join(rootPath, '/src/services/'),
        '@utils': join(rootPath, '/src/utils/'),
        '@const': join(rootPath, '/src/const/')
      }
    };
}

module.exports = {defineResolves}
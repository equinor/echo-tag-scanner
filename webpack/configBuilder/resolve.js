const {join} = require("path");


function defineResolves(rootPath) {
    if (!rootPath) {
        return {};
    }

    return {
        extensions: ['.tsx', '.ts', '.js', '.jsx', '.css'],
        alias: {
          '@components': join(rootPath, '/src/components/'),
          '@pages': join(rootPath, '/src/pages/'),
          '@hooks': join(rootPath, '/src/hooks/'),
          '@contexts': join(rootPath, '/src/contexts/'),
          '@types': join(rootPath, '/src/types/'),
          '@services': join(rootPath, '/src/services/'),
          '@utils': join(rootPath, '/src/utils/'),
          '@models': join(rootPath, '/src/models/'),
          '@workers': join(rootPath, '/src/workers/'),
          '@enums': join(rootPath, '/src/enums/')
        }
      }
}

module.exports = {defineResolves}
const path = require('path');
module.exports = {
  resolve: {
    alias: {
      '@components': path.resolve(__dirname + '/src/components/'),
      '@pages': path.resolve(__dirname + '/src/pages/'),
      '@hooks': path.resolve(__dirname + '/src/hooks/'),
      '@contexts': path.resolve(__dirname + '/src/contexts/'),
      '@types': path.resolve(__dirname + '/src/types/'),
      '@services': path.resolve(__dirname + '/src/services/'),
      '@utils': path.resolve(__dirname + '/src/utils/'),
      '@models': path.resolve(__dirname + '/src/models/'),
      '@workers': path.resolve(__dirname + '/src/workers/'),
      '@enums': path.resolve(__dirname + '/src/enums/')
    }
  }
};

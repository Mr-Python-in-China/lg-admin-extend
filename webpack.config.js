//@ts-check

const path = require('path');

module.exports =
  /**
   * @param {{ mode: 'production' | 'development' | 'none' | undefined; }} argv
   * @returns { Promise<import('webpack').Configuration> }
   */
  async function (env, argv) {
    const mode = argv.mode || 'none';
    return {
      mode,
      devServer: {
        static: { directory: path.resolve('docs') },
        port: 54220,
        compress: true
        // server:"https"
      }
    };
  };

const path = require('path');

module.exports = (env, argv) => {
  let config = {
    mode: 'production',
    entry: './index.js',
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: 'parser.js',
      library: "parser",
      libraryTarget: 'umd',
      globalObject: 'this'
    },
  };
  if (argv.mode === 'development') {
    config.devtool = 'source-map';
  }
  return config;
};
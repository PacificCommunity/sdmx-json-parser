const path = require('path');

module.exports = {
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
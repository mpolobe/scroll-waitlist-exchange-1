const path = require('path');

module.exports = {
  mode: 'production',
  entry: path.resolve(__dirname, 'app.js'), // adjust path
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist')
  }
};
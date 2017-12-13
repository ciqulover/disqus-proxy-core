const UglifyJSPlugin = require('uglifyjs-webpack-plugin')
const merge = require('webpack-merge')
const baseConf = require('./webpack.base.conf')
const CleanWebpackPlugin = require('clean-webpack-plugin')
const path = require('path')
const resolve = p => path.resolve(__dirname, p)

module.exports = merge(baseConf, {
  entry: resolve('../src/index'),
  output: {
    path: resolve('../lib'),
    filename: 'disqus-proxy-core.js',
  },
  resolve: {
    extensions: ['.js', '.jsx', '.json']
  },
  externals: {
    react: 'React',
    'react-dom': 'ReactDOM'
  },
  plugins: [
    new CleanWebpackPlugin(['lib'], {
      root: resolve('../'),
      verbose: true,
    }),
    new UglifyJSPlugin()
  ]
})




const baseConf = require('./webpack.base.conf')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const merge = require('webpack-merge')
const path = require('path')
const resolve = p => path.resolve(__dirname, p)

module.exports = merge(baseConf, {
  entry: resolve('../src/index.js'),
  output: {
    filename: '[name].js',
    path: resolve('../dist'),
  },
  devtool: "source-map",
  devServer: {
    port: 7070,
    open: true,
    hot: false,
    host: '0.0.0.0',
    proxy: {
      "/api": {
        target: "http://localhost:5209/",
        changeOrigin: true,
      }
    },
  },
  plugins: [
    new HtmlWebpackPlugin({template: resolve('./index.html')})
  ]
})

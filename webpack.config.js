const path = require('path');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

const production = process.argv[process.argv.indexOf('--mode') + 1] === 'production';

module.exports = {
  entry: ['babel-polyfill', './src/client/index.jsx'],
  output: {
    path: path.join(__dirname, 'dist'),
    publicPath: '/',
    filename: 'bundle.js',
  },
  module: {
    rules: [{
      test: /\.(js|jsx)$/,
      exclude: /node_modules/,
      use: {
        loader: 'babel-loader',
      },
    },
    {
      test: /\.(css|less)$/,
      use: [
        MiniCssExtractPlugin.loader,
        'css-loader',
        'less-loader',
      ],
    },
    {
      test: /\.(png|woff|woff2|eot|ttf|svg)$/,
      use: [
        {
          loader: 'url-loader',
          options: {
            limit: 100000,
          },
        },
      ],
    },
    ],
  },
  resolve: {
    extensions: ['*', '.js', '.jsx'],
    alias: {
      inferno: production ? 'inferno' : 'inferno/dist/index.dev.esm.js',
      // 'uikit-util': 'uikit/src/js/util/index',
      // uikit: 'uikit/src/js/uikit',
    },
  },
  devServer: {
    host: '0.0.0.0',
    port: 3000,
    open: true,
    historyApiFallback: true,
    proxy: {
      '/api': 'http://localhost:8888',
    },
  },
  plugins: [
    new OptimizeCssAssetsPlugin(),
    new MiniCssExtractPlugin(),
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      template: './static/index.html',
    }),
  ],
  optimization: {
    mangleWasmImports: true,
    splitChunks: {
      chunks: 'async',
    },
  },
};

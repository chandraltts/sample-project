const path = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  devtool: 'cheap-module-eval-source-map',
  entry: "./src/index.js",
  externals: {
    fs: 'empty',
  },
  mode: "development",
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /(node_modules|bower_components)/,
        loader: "babel-loader",
        options: { presets: ["@babel/env"] },
      },
      {
        test: /\.(wasm)$/,
        loader: 'file-loader',
        type: 'javascript/auto',
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"]
      },
    ]
  },
  resolve: { extensions: ["*", ".js", ".jsx"] },
  output: {
    path: path.resolve(__dirname, "dist/"),
    publicPath: "/dist/",
    filename: "bundle.js"
  },
  devServer: {
    contentBase: path.join(__dirname, "public/"),
    port: 3000,
    publicPath: "http://localhost:3000/dist/",
    hotOnly: true
  },
  plugins: [new HtmlWebpackPlugin({ template: path.resolve(__dirname, 'public/index.html') })]
};
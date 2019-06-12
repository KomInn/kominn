let path = require("path");
let MiniCssExtractPlugin = require('mini-css-extract-plugin')
let isDevelopment = true;

module.exports = {
  entry: "./src/index.tsx",
  output: {
    path: path.resolve(__dirname, 'templates/root/SiteAssets/js'),
    filename: "bundle.js",
  },
  mode: isDevelopment ? "development" : "production",
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".json", ".scss"]
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: [
          {
            loader: 'ts-loader'
          }
        ]
      },
      {
        test: /\.(woff|woff2)(\?v=\d+\.\d+\.\d+)?$/,
        use: [{ loader: "url-loader" }]
      },
      {
        test: /\.module\.s(a|c)ss$/,
        loader: [
          isDevelopment ? 'style-loader' : MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader'
          },
          {
            loader: 'sass-loader',
            options: { sourceMap: isDevelopment }
          }
        ]
      },
      {
        test: /\.s(a|c)ss$/,
        exclude: /\.module.(s(a|c)ss)$/,
        loader: [
          isDevelopment ? 'style-loader' : MiniCssExtractPlugin.loader,
          'css-loader',
          {
            loader: 'sass-loader',
            options: { sourceMap: isDevelopment }
          }
        ]
      }
    ]
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: isDevelopment ? '[name].css' : '[name].[hash].css',
      chunkFilename: isDevelopment ? '[id].css' : '[id].[hash].css'
    })
  ]
};
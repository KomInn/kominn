let path = require("path");

module.exports = env => ({
  entry: "./src/index.tsx",
  output: {
    path: path.resolve(__dirname, 'templates/root/SiteAssets/js'),
    filename: "bundle.js",
  },
  mode: env.production ? "production" : "development",
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
          'style-loader',
          {
            loader: 'css-loader'
          },
          {
            loader: 'sass-loader',
            options: { sourceMap: !env.production }
          }
        ]
      },
      {
        test: /\.s(a|c)ss$/,
        exclude: /\.module.(s(a|c)ss)$/,
        loader: [
          'style-loader',
          'css-loader',
          {
            loader: 'sass-loader',
            options: { sourceMap: !env.production }
          }
        ]
      }
    ]
  }
});
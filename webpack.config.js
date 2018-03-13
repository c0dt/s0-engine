let path = require('path');
let webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const BrowserSyncPlugin = require('browser-sync-webpack-plugin');

let definePlugin = new webpack.DefinePlugin({
  '__DEBUG__': true
});

module.exports = {
  entry: {
    app: [
      path.resolve(__dirname, 'src/main')
    ],
    vendor: ['gl-matrix']
  },
  devtool: 'source-map',
  output: {
    pathinfo: true,
    path: path.resolve(__dirname, 'build/debug'),
    filename: 'js/[name].js'
  },
  plugins: [
    definePlugin,
    new webpack.optimize.CommonsChunkPlugin({
      name: "vendor",
      minChunks: Infinity
    }),
    new webpack.HotModuleReplacementPlugin(),
    new CopyWebpackPlugin([
      { context: 'resources/', from: '**/*', to: './' },
    ]),
    new HtmlWebpackPlugin({
      template: './index.html',
      inject: true,
      filename: 'index.html'
    }),
    new BrowserSyncPlugin({
      host: 'localhost',
      port: 3000,
      server: { baseDir: [path.resolve(__dirname, 'build/debug')] }
    })
  ],
  module: {
    loaders: [
      { 
        test: /\.js$/, 
        use: {
          loader: 'babel-loader',
          options: {
            "presets": [["es2015", { modules: false }]],
          }
        },
        exclude: /node_modules\/lodash/
      },
      { test: /\.(glsl|frag|vert)$/, loader: 'raw-loader', include: [ path.join(__dirname, 'src') ], exclude: /node_modules/ },
      { test: /\.(glsl|frag|vert)$/, loader: 'glslify-loader', include: [ path.join(__dirname, 'src') ], exclude: /node_modules/ },
      { test: /\.worker\.js$/, loader: "worker!babel?presets[]=es2015", include: [ path.join(__dirname, 'src') ], exclude: /node_modules/ }
    ]
  },
  node: {
    fs: 'empty',
    net: 'empty',
    tls: 'empty'
  },
  resolve: {
    // alias: {
    //   'pixi': pixi
    // }
  },
  watch: true
};
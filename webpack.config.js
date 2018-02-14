let path = require('path');
let webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const BrowserSyncPlugin = require('browser-sync-webpack-plugin');

let definePlugin = new webpack.DefinePlugin({
  __DEV__: JSON.stringify(JSON.parse(process.env.BUILD_DEV || 'true'))
});

module.exports = {
  entry: {
    app: [
      path.resolve(__dirname, 'src/main')
    ]
    // vendor: ['gl-matrix']
  },
  devtool: 'source-map',
  output: {
    pathinfo: true,
    path: path.resolve(__dirname, 'build'),
    filename: 'debug/js/app.js'
  },
  plugins: [
    definePlugin,
    // new webpack.optimize.CommonsChunkPlugin(/* chunkName= */'vendor', /* filename= */'vendor.bundle.js'),
    new webpack.HotModuleReplacementPlugin(),
    new CopyWebpackPlugin([
      { context: 'resources/', from: '**/*', to: 'debug' },
    ]),
    new BrowserSyncPlugin({
      host: 'localhost',
      port: 3000,
      server: { baseDir: [path.resolve(__dirname, 'build/debug')] }
    })
  ],
  module: {
    loaders: [
      { test: /\.js$/, loader: 'babel-loader', include: [ path.join(__dirname, 'src') ], exclude: /node_modules/ },
      { test: /\.(glsl|frag|vert)$/, loader: 'raw-loader', exclude: /node_modules/ },
      { test: /\.(glsl|frag|vert)$/, loader: 'glslify-loader', exclude: /node_modules/ },
      { test: /\.worker\.js$/, loader: "worker!babel?presets[]=es2015" }
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
let path = require('path');
let webpack = require('webpack');
// let BrowserSyncPlugin = require('browser-sync-webpack-plugin');

let definePlugin = new webpack.DefinePlugin({
  __DEV__: JSON.stringify(JSON.parse(process.env.BUILD_DEV || 'true'))
});

module.exports = {
  entry: {
    app: [
      path.resolve(__dirname, 'src/Main')
    ],
    // vendor: ['pixi', 'webfontloader']
  },
  devtool: 'cheap-source-map',
  output: {
    // pathinfo: true,
    // path: path.resolve(__dirname, 'dist'),
    // publicPath: './dist/',
    filename: 'app.js'
  },
  plugins: [
    definePlugin,
    // new webpack.optimize.CommonsChunkPlugin(/* chunkName= */'vendor', /* filename= */'vendor.bundle.js'),
    new webpack.HotModuleReplacementPlugin()
  ],
  module: {
    loaders: [
      { test: /\.js$/, loader: 'babel', include: path.join(__dirname, 'src') },
      { test: /\.(glsl|frag|vert)$/, loader: 'raw', exclude: /node_modules/ },
      { test: /\.(glsl|frag|vert)$/, loader: 'glslify', exclude: /node_modules/ }
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
  }
};
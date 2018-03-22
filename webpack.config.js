let path = require('path');
let webpack = require('webpack');

let definePlugin = new webpack.DefinePlugin({
  '__DEBUG__': true
});

module.exports = {
  entry: {
    "s0-engine": [
      path.resolve(__dirname, 'src/index')
    ]
  },
  devtool: 'source-map',
  output: {
    pathinfo: true,
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js'
  },
  plugins: [
    definePlugin,
    new webpack.HotModuleReplacementPlugin()
  ],
  module: {
    rules: [
      { 
        test: /\.js$/, 
        use: {
          loader: 'babel-loader'
        },
        exclude: /node_modules\//
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
  watch: true
};
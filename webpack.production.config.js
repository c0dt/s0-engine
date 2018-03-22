let path = require('path');
let webpack = require('webpack');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
let definePlugin = new webpack.DefinePlugin({
  '__DEBUG__': false
});

module.exports = {
  entry: {
    "s0-engine": [
      path.resolve(__dirname, 'src/S0')
    ]
  },
  output: {
    pathinfo: true,
    path: path.resolve(__dirname, 'dist'),
    filename: '[name]-min.js'
  },
  optimization: {
    minimizer: [
      new UglifyJsPlugin({
        uglifyOptions: {
          compress: {
            drop_console: true,
          },
          dead_code: true,
          output: {
            comments(node, comment) {
              let text = comment.value;
              let type = comment.type;
              if (type === "comment2") {
                // multiline comment
                return /@copyright/i.test(text);
              }
            }
          }
        }
      })
    ]
  },
  plugins: [
    definePlugin
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
  }
};
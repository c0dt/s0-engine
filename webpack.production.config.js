let path = require('path');
let webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
let definePlugin = new webpack.DefinePlugin({
  __DEV__: JSON.stringify(JSON.parse(process.env.BUILD_DEV || 'true'))
});

module.exports = {
  entry: {
    app: [
      path.resolve(__dirname, 'src/main')
    ],
    vendor: ['gl-matrix']
  },
  output: {
    pathinfo: true,
    path: path.resolve(__dirname, 'build/release/'),
    filename: 'js/[name].js'
  },
  plugins: [
    definePlugin,
    new CopyWebpackPlugin([
      { context: 'resources/', from: '**/*', to: './' },
    ]),
    new HtmlWebpackPlugin({
      template: './index.html',
      inject: true,
      filename: 'index.html'
    }),
    new webpack.optimize.CommonsChunkPlugin({
      name: "vendor",
      minChunks: Infinity
    }),
    new webpack.optimize.UglifyJsPlugin({
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
    }),
    new webpack.optimize.AggressiveMergingPlugin()
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
  }
};
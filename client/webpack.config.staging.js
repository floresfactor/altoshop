// For info about this file refer to webpack and webpack-hot-middleware documentation
// For info on how we're generating bundles with hashed filenames for cache busting: https://medium.com/@okonetchnikov/long-term-caching-of-static-assets-with-webpack-1ecb139adb95#.w99i89nsz
import webpack from 'webpack';
import ExtractTextPlugin from 'extract-text-webpack-plugin';
import WebpackMd5Hash from 'webpack-md5-hash';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import CopyWebpackPlugin from 'copy-webpack-plugin';
import UglifyJSPlugin from 'uglifyjs-webpack-plugin';
import autoprefixer from 'autoprefixer';
import path from 'path';
import fs from 'fs';

let kopayServerEnv = {};
fs.readFileSync('../server/env/staging', 'utf8').replace(/(\w+)=(.+)/g, function($0, $1, $2) { kopayServerEnv[$1] = $2; });

const kopayServerAddress = (kopayServerEnv && kopayServerEnv.HOST_IP && kopayServerEnv.PORT)
  ? (kopayServerEnv.HTTPS == 'true' ? 'https://' : 'http://') + kopayServerEnv.HOST_IP + ':' + kopayServerEnv.PORT + '/'
  : 'http://localhost:' + (kopayServerEnv.PORT ? kopayServerEnv.PORT : '3005');

//TODO
//set this settings from  enviroment variables
const ghostServerAdress = 'http://' + (kopayServerEnv.HOST_IP ? kopayServerEnv.HOST_IP : 'localhost') + ':2468'

let kopayClientEnv = {};
fs.readFileSync('../client/env/staging', 'utf8').replace(/(\w+)=(.+)/g, function($0, $1, $2) { kopayClientEnv[$1] = $2; });

const GLOBALS = {
  'process.env.NODE_ENV': JSON.stringify('staging'),
  'process.env.KOPAY_SERVER_ADDRESS': JSON.stringify(kopayServerAddress),
  'process.env.GHOST_SERVER_ADDRESS': JSON.stringify(ghostServerAdress),
  'process.env.CLIENT_ID': JSON.stringify(kopayClientEnv.CLIENT_ID),
  'process.env.CLIENT_SECRET': JSON.stringify(kopayClientEnv.CLIENT_SECRET),
  __DEV__: false
};

export default {
  resolve: {
    extensions: ['*', '.js', '.jsx', '.json'],
    alias: {
      jsondiffpatch: 'jsondiffpatch/public/build/jsondiffpatch.js'
    }
  },
  devtool: 'source-map', // more info:https://webpack.github.io/docs/build-performance.html#sourcemaps and https://webpack.github.io/docs/configuration.html#devtool
  entry: path.resolve(__dirname, 'src/index'),
  target: 'web', // necessary per https://webpack.github.io/docs/testing.html#compile-and-test
  output: {
    path: path.resolve(__dirname, 'staging'),
    publicPath: '/',
    filename: '[name].[chunkhash].js'
  },
  plugins: [
    // Hash the files using MD5 so that their names change when the content changes.
    new WebpackMd5Hash(),

    // Tells React to build in prod mode. https://facebook.github.io/react/downloads.html
    new webpack.DefinePlugin(GLOBALS),

    // Generate an external css file with a hash in the filename
    new ExtractTextPlugin('[name].[contenthash].css'),

    // Generate HTML file that contains references to generated bundles. See here for how this works: https://github.com/ampedandwired/html-webpack-plugin#basic-usage
    new HtmlWebpackPlugin({
      favicon: 'src/favicon.ico',
      template: 'src/index.ejs',
      minify: {
        removeComments: true,
        collapseWhitespace: true,
        removeRedundantAttributes: true,
        useShortDoctype: true,
        removeEmptyAttributes: true,
        removeStyleLinkTypeAttributes: true,
        keepClosingSlash: true,
        minifyJS: true,
        minifyCSS: true,
        minifyURLs: true
      },
      inject: true,
      // Note that you can add custom options here if you need to handle other custom logic in index.html
      // To track JavaScript errors via TrackJS, sign up for a free trial at TrackJS.com and enter your token below.
      trackJSToken: ''
    }),

    // Minify JS
    new UglifyJSPlugin({ sourceMap: true }),

    new webpack.LoaderOptionsPlugin({
      minimize: false,
      debug: true,
      noInfo: false, // set to false to see a list of every file being bundled.
      options: {
        sassLoader: {
          includePaths: [path.resolve(__dirname, 'src', 'scss')]
        },
        lessLoader: {
          includePaths: [path.resolve(__dirname, 'src', 'less')]
        },
        context: '/',
        postcss: () => [autoprefixer],
      }
    }),

    new CopyWebpackPlugin([{
      context: './',
      from: 'src/public',
      to: 'public'
    },
    { from: 'src/public/img/branch/',
      to: 'img/', 
      toType: 'dir',
      ignore: ['*.DS_Store']
    }])
  ],
  module: {
    rules: [
      {test: /\.jsx?$/, exclude: /node_modules/, loader: 'babel-loader'},
      {test: /\.eot(\?v=\d+.\d+.\d+)?$/, loader: 'url-loader?name=[name].[ext]'},
      {test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/, loader: 'url-loader?limit=10000&mimetype=application/font-woff&name=[path][name].[ext]'},
      {test: /\.[ot]tf(\?v=\d+.\d+.\d+)?$/, loader: 'url-loader?limit=10000&mimetype=application/octet-stream&name=[path][name].[ext]'},
      {test: /\.svg(\?v=\d+.\d+.\d+)?$/, loader: 'url-loader?limit=10000&mimetype=image/svg+xml&name=[path][name].[ext]'},
      {test: /\.(jpe?g|png|gif)$/i, loader: 'file-loader?name=[path][name].[ext]!extract-loader!html-loader'},
      {test: /\.ico$/, loader: 'file-loader?name=[name].[ext]'},
      {test: /(\.css|\.scss|\.sass|\.less)$/, loaders: ['style-loader', 'css-loader?sourceMap', 'postcss-loader', 'sass-loader?sourceMap', 'less-loader?sourceMap'] }
    ]
  }
};
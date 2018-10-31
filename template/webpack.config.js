var path = require('path');
var webpack = require('webpack');
var CopyWebpackPlugin = require('copy-webpack-plugin');
var HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'report.[chunkhash].js'
  },
  module: {
    rules: [
      /**
       * Bundle JavaScript (ES6)
       */
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      },

      /**
       * Bundle CSS, images and fonts
       */
      { test: /\.css$/, use: ['style-loader', 'css-loader'] },
      { test: /\.(otf|ttf|woff|woff2)$/, use: ['url-loader?limit=10000'] },
      { test: /\.(jpg|png|gif)$/, use: ['url-loader?limit=10000'] },
      { test: /\.(eot|svg)$/, use: ['file-loader'] }
    ]
  },
  plugins: [
    /**
     * Make jquery and lodash globally available
     * (dependencies of @leanix/reporting library)
     */
    new webpack.ProvidePlugin({
      $: 'jquery',
      jQuery: 'jquery',
      '_': 'lodash'
    }),

    /**
     * Copy assets into dist folder.
     */
    new CopyWebpackPlugin([
      { from: 'src/assets', to: 'assets' }
    ]),

    /**
     * Insert created bundles as script tags at the end
     * of the body tag in index.html
     */
    new HtmlWebpackPlugin({
      inject: true,
      template: 'src/index.html'
    })
  ],

	devServer: {
		headers: {
			'Access-Control-Allow-Origin': '*'
		}
	}
}

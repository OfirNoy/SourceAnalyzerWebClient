const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const { VueLoaderPlugin } = require('vue-loader')
const v8 = require('v8');

v8.setFlagsFromString('--max_old_space_size=8192');

module.exports = {
  mode: 'development',
  devtool: 'inline-source-map',
  entry: './src/client/client.content.js',
  node: {
    fs: "empty",
    net: "empty"
  },
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'build/client')
  },
  module: {
    rules: [{
      test: /\.css$/,
      loaders: [
        'style-loader',
        'css-loader'
      ]      
    },
    {
      test: /\.vue$/,
      loader: 'vue-loader',
      options: {
        loaders: {
            'scss': 'vue-style-loader!css-loader!sass-loader',
            'sass': 'vue-style-loader!css-loader!sass-loader?indentedSyntax'
        }      
      }
    },
    {
      test: /\.scss$/,
      use: [
        {
          loader: 'css-loader'
        },
        {
          loader: 'sass-loader'
        }
      ]
    }
  ]},
  resolve: {
    alias: {
      vue: 'vue/dist/vue.js'
    }
  },
  plugins: [
    new HtmlWebpackPlugin({
        filename: 'index.html',
        template: 'src/client/index.html'
      }),
      new CopyWebpackPlugin([
        {from:'src/client/img', to:"img"} 
    ]),    
    new VueLoaderPlugin() 
  ]
};
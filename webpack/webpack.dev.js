const HTMLWebpackPlugin = require('html-webpack-plugin')
const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');
const build = require('../build.json')

module.exports = merge(common, {
    mode: 'development',
    devtool: 'eval-source-map',
    devServer: {
        static: {
            directory: build.assetsFolder,
        },
        host: '0.0.0.0',
        port: 8080,
        open: true,
        hot: true,
        compress: true,
        historyApiFallback: true,
        client: {
            overlay: {
                errors: true,
                warnings: false,
            },
        },
    },
    plugins: [
        new HTMLWebpackPlugin({
            template: build.indexHTML,
            templateParameters: build,
            inject: 'body'
        })
    ]
});

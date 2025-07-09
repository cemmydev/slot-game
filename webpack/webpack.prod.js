const CopyWebpackPlugin = require('copy-webpack-plugin')
const HTMLWebpackPlugin = require('html-webpack-plugin')
const { merge } = require('webpack-merge');
const common = require('./webpack.common.js')
const build = require('../build.json')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const JavaScriptObfuscator = require('webpack-obfuscator')
const TerserPlugin = require('terser-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')

module.exports = merge(common, {
    mode: 'production',
    output: {
        path: require('path').resolve(__dirname, '../dist'),
        filename: 'js/[name].[contenthash].bundle.js',
        chunkFilename: 'js/[name].[contenthash].chunk.js',
        clean: true
    },
    optimization: {
        minimize: true,
        minimizer: [
            new TerserPlugin({
                terserOptions: {
                    compress: {
                        drop_console: true,
                    },
                },
            }),
        ],
        splitChunks: {
            chunks: 'all',
            cacheGroups: {
                vendor: {
                    test: /[\\/]node_modules[\\/]/,
                    name: 'vendors',
                    filename: 'js/[name].[contenthash].bundle.js',
                    chunks: 'all',
                },
                commons: {
                    filename: 'js/[name].[contenthash].bundle.js'
                }
            }
        }
    },
    module: {
        rules: [
            {
                test: /\.css$/,
                use: [MiniCssExtractPlugin.loader, 'css-loader']
            }
        ]
    },
    plugins: [
        new CleanWebpackPlugin(),
        new MiniCssExtractPlugin({
            filename: 'css/[name].[contenthash].css',
        }),
        new JavaScriptObfuscator(
            {
                rotateStringArray: true,
                stringArray: true,
                stringArrayThreshold: 0.75
            },
            ['vendors.*.js']
        ),
        new CopyWebpackPlugin({
            patterns: [
                {
                    from: build.assetsFolder,
                    to: '.',
                    globOptions: {
                        ignore: ['**/index.html'],
                    },
                }
            ]
        }),
        new HTMLWebpackPlugin({
            template: build.indexHTML,
            templateParameters: build,
            inject: 'body',
            minify: {
                collapseWhitespace: true,
                removeComments: true,
                removeRedundantAttributes: true,
                useShortDoctype: true
            }
        })
    ]
})
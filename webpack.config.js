'use strict';
const parseArgs = require('yargs');
const webpack = require('webpack');
const {merge} = require('webpack-merge');
const path = require('path');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CopyWebpackPlugin = require('copy-webpack-plugin');
const TerserPlugin = require("terser-webpack-plugin");
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");

const {
    repositoryRootPath,
    nodeModulesPath,
    intermediateAppPath
} = require('./script/config');

const pkgJson = require('./package.json');

function recursiveIssuer(m) {
    if (m.issuer) {
        return recursiveIssuer(m.issuer);
    } else if (m.name) {
        return m.name;
    } else {
        return false;
    }
}

const combineCss = (entry) => ({
    name: entry,
    test: (m, c) => m.constructor.name === 'CssModule' && recursiveIssuer(m) === entry,
    chunks: 'all',
    enforce: true
});

module.exports = (env = {}, argv = {}) => {    
    const depsOverride = {
        'highlight.js': path.resolve(repositoryRootPath, 'vendor/highlight.js/highlight.pack.js'),
        'emoji-js': path.resolve(repositoryRootPath, 'vendor/js-emoji/emoji.min.js'),
        'lodash': path.resolve(nodeModulesPath, 'lodash'),
        'lodash.isequal': path.resolve(nodeModulesPath, 'lodash/isEqual'),
        'lodash.merge': path.resolve(nodeModulesPath, 'lodash/merge'),
        'lodash.throttle': path.resolve(nodeModulesPath, 'lodash/throttle')
    };
    const deps = Object.assign({}, depsOverride, Object.keys(pkgJson.dependencies).reduce(
        (pkgDeps, dep) => (dep in depsOverride) ? pkgDeps : (pkgDeps[dep] = path.resolve(nodeModulesPath, dep), pkgDeps), {}));

    const cssOptions = {        
        context: path.resolve(repositoryRootPath, 'src'),
        modules: true,
        sourceMap: false,
        localIdentName: argv.mode !== 'development' ? `[hash:base64]` : `[path][name]__[local]--[hash:base64:6]`
    };

    const postcssOptions = {
        ident: 'postcss',
        plugins: () => ([
            require('postcss-import'),
            require('postcss-scoped-custom-properties')(),
            require('postcss-cssnext')({
                browsers: ['> 1%', 'last 5 versions']
            }),
            require('./script/lib/postcss-important')()
        ])
    };

    const baseConfig = {
        mode: argv.mode,
        context: repositoryRootPath,
        resolve: {
            extensions: ['.js', '.ts', '.tsx'],
            modules: ['node_modules' /*, path.resolve(__dirname, 'src/modules')*/ ],
            alias: deps
        },
        module: {
            rules: [{
                enforce: 'pre',
                test: /\.(js|tsx?)$/,
                use: ['source-map-loader']
            }, {
                test: /\.(js|tsx?)$/,
                use: [{
                    loader: 'babel-loader'
                }],
                include: path.resolve(repositoryRootPath, 'src')
            }, {
                test: /\.css$/,
                use: env.devServer ? ['style-loader', {
                     loader: "css-loader", options: cssOptions ,
                }, {
                     loader: "postcss-loader", options: { postcssOptions } ,
                }] : [MiniCssExtractPlugin.loader, {
                    loader: "css-loader", options: cssOptions ,
                }, {
                    loader: "postcss-loader", options: { postcssOptions } 
                }],
                include: path.resolve(repositoryRootPath, 'src')
            }, {
                test: /\.css$/,
                use: env.devServer ? ['style-loader', {
                    loader: 'css-loader'
                }] : [MiniCssExtractPlugin.loader, {
                    loader: 'css-loader'
                }],
                include: path.resolve(nodeModulesPath)
            }, {
                test: /\.(svg|png|gif|jpg|ico|icns)$/,
                use: ['file-loader?name=images/[name].[ext]'],
                include: [
                    path.resolve(repositoryRootPath, 'assets'),
                    path.resolve(repositoryRootPath, 'resources')
                ]
            }, {
                test: /jquery\/src/,
                use: [{
                    loader: path.resolve(nodeModulesPath, 'amd-define-factory-patcher-loader')
                }],
                include: path.resolve(nodeModulesPath, 'jquery/src')
            }],
            noParse: [
                /highlight\.pack\.js/,
                /emoji\.min\.js/,
                /jquery\.min\.js/
            ]
        },
        externals: [{
            'ws': 'var WebSocket',
            ...Object.keys(pkgJson.dependencies)
            .reduce((externals, key) => (externals[key] = `commonjs ${key}`, externals), {})
        }],
        output: {
            pathinfo: true,
            path: path.resolve(intermediateAppPath),
            filename: 'javascripts/[name].js',
            publicPath: '/'
        },
        devtool: 'source-map',
        plugins: ([
            new webpack.IgnorePlugin( { resourceRegExp: /vertx/}),
            new webpack.IgnorePlugin({ resourceRegExp: /jsdom/}),
            new CopyWebpackPlugin([{
                from: 'assets',
                ignore: ['*.ejs']
            }], {})
        ]).concat(
            env.devServer ? [
                new webpack.HotModuleReplacementPlugin()
            ] : [
                new MiniCssExtractPlugin({
                    filename: `css/[name].css`
                })
            ]
        ),
        optimization: {
            splitChunks: {
                cacheGroups: {
                    /*styles: {
                        name: 'styles',
                        test: /\.css$/,
                        chunks: 'all',
                        enforce: true
                    }*/
                    rendererStyles: combineCss('renderer'),
                    loginStyles: combineCss('login')
                }
            },
            minimizer: [
                new TerserPlugin({
                    terserOptions: {
                      parse: {
                        ecma: 8, // Adjust for compatibility
                      },
                      compress: {
                        ecma: 6, // Keep as specified
                      },
                      mangle: {
                        safari10: true, // Address potential Safari 10 issues
                      },
                    },
                    // Other TerserPlugin options:
                    // cache: true,
                    // parallel: true,
                    // sourceMap: true,
                  }),
                
                // new OptimizeCSSAssetsPlugin({})
            ]
        }
    };

    const browser = [
        './src/modules/browser/main'
    ];

    const renderer = env.devServer ? [
        'react-hot-loader/patch',
        'webpack-hot-middleware/client',
        './src/modules/renderer/main'
    ] : [
        './src/modules/renderer/main'
    ];

    const interop = [
        './src/modules/interop/main'
    ];

    
    if (env.browserOnly) {
        return [merge(baseConfig, {
            entry: {
                browser
            },
            target: 'electron-main'
        }), merge(baseConfig, {
            entry: {
                interop
            },
            target: 'electron-renderer'
        })];
    } else if (env.rendererOnly) {
        return merge(baseConfig, {
            entry: {
                renderer,
                interop
            },
            target: 'electron-renderer'
        });
    } else {
        return [merge(baseConfig, {
            entry: {
                browser
            },
            target: 'electron-main'
        }), merge(baseConfig, {
            entry: {
                renderer,
                interop
            },
            target: 'electron-renderer'
        })];
    }
}
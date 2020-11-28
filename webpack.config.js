const path = require('path');

var WebpackObfuscator = require('webpack-obfuscator');

module.exports = {
    entry: './client/index.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'logeo.js'
    },
    resolve: {
        modules: [
            path.join(__dirname, 'client'),
            path.join(__dirname, 'node_modules')
        ]
    },
    optimization: {
        minimize: true,
    },

    externalsType: 'script',
    externals: {
        threejs: ['https://unpkg.com/three@0.119.0/build/three.module.js'],
    },


/**
    plugins: [
        new WebpackObfuscator ({
            rotateStringArray: true
        }, ['excluded_bundle_name.js'])
    ]
**/

};


const path = require('path');

module.exports = {
    entry: {
        app: './client/puzzle.jsx',
        login: './client/login.jsx',
    },
    mode: 'production',
    watchOptions: {
        aggregateTimeout: 200,
    },
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                },
            },
        ],
    },
    output: {
        path: path.resolve(__dirname, 'hosted'),
        filename: '[name]Bundle.js',
    },
};

var webpack = require("webpack");
var path = require("path");
module.exports = {
    entry: ["./home.js","./share.js" ],
    output: {
        path: "./js",
        filename: "[name].bundle.js",
    },
    module: {
        loaders: [
            { test: /\.js$/,
        include: [
            path.resolve(__dirname, "./js")
        ],
             loader: "core!connect" }
        ]
    }
};
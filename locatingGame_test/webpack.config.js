var path = require("path");

module.exports = {
    entry: {
        //為index.js注入包含regeneratorRuntime的polyfill
        index: ["@babel/polyfill", path.resolve(__dirname, "src/index.js")]
    },
    output: {
        path: path.join(__dirname, "dist"),
        filename: "[name].js",
    },
    module: {
        rules: [
            {
                //透過babel轉譯js檔
                test: /\.js$/,
                loaders: ["babel-loader"],
                include: path.join(__dirname, "src"),
            },
        ],
    }
};
const path = require("path");

module.exports = {
    mode: "development",
    entry: "./src/logon.js",
    output: {
        path: path.resolve(__dirname, "src"),
        filename: "logon_bundle.js"
    },
    watch: true
}
const path = require("path");
//ROOT index.js
/*
module.exports = {
    mode: "development",
    entry: "./src/index.js",
    output: {
        path: path.resolve(__dirname, "dist"),
        filename: "bundle.js"
    },
    watch: true
}
*/
//STAFFER logon.js
/*
module.exports = {
    mode: "development",
    entry: "./dist/staffer/src/logon.js",
    output: {
        path: path.resolve(__dirname, "./dist/staffer/src"),
        filename: "logon_bundle.js"
    },
    watch: true
}
*/
//STUDENT index.js

module.exports = {
    mode: "development",
    entry: "./dist/student/src/index.js",
    output: {
        path: path.resolve(__dirname, "./dist/student/src"),
        filename: "bundle.js"
    },
    watch: true
}

//STUDENT logon.js
/*
module.exports = {
    mode: "development",
    entry: "./dist/student/src/logon.js",
    output: {
        path: path.resolve(__dirname, "./dist/student/src"),
        filename: "logon_bundle.js"
    },
    watch: true
}
*/

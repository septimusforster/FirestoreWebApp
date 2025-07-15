/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./dist/student/worker.js":
/*!********************************!*\
  !*** ./dist/student/worker.js ***!
  \********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var firebase_app__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! firebase/app */ \"./node_modules/firebase/app/dist/esm/index.esm.js\");\n/* harmony import */ var firebase_firestore__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! firebase/firestore */ \"./node_modules/firebase/firestore/dist/esm/index.esm.js\");\n/* harmony import */ var _src_JSON_configurations_json__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../src/JSON/configurations.json */ \"./src/JSON/configurations.json\");\n\r\n\r\n\r\n\r\nvar app, db;\r\nfunction useApp(n){\r\n    if (app) (0,firebase_app__WEBPACK_IMPORTED_MODULE_0__.deleteApp)(app);\r\n    app = (0,firebase_app__WEBPACK_IMPORTED_MODULE_0__.initializeApp)(_src_JSON_configurations_json__WEBPACK_IMPORTED_MODULE_2__[n]);\r\n    db = (0,firebase_firestore__WEBPACK_IMPORTED_MODULE_1__.getFirestore)(app);\r\n}\r\nself.addEventListener('message', async ({ data }) => {\r\n    useApp(data.mois.cls);\r\n    const scoreRef = (0,firebase_firestore__WEBPACK_IMPORTED_MODULE_1__.doc)(db,'session', data.ssn, 'students', data.mois.id, 'scores', 'records');\r\n    try{\r\n        const my_ca = await (0,firebase_firestore__WEBPACK_IMPORTED_MODULE_1__.getDoc)(scoreRef);\r\n        if(my_ca.exists) {\r\n            self.postMessage(my_ca.data());\r\n        }\r\n    }catch(err){\r\n        self.postMessage(\"Worker-based Error.\");\r\n    }\r\n});\n\n//# sourceURL=webpack://firestorewebapp/./dist/student/worker.js?");

/***/ }),

/***/ "./src/JSON/configurations.json":
/*!**************************************!*\
  !*** ./src/JSON/configurations.json ***!
  \**************************************/
/***/ ((module) => {

eval("module.exports = JSON.parse('[{\"apiKey\":\"AIzaSyBJA5v78O_yZsw9Vkx7qZcdqo_Ek2Cg0nc\",\"authDomain\":\"jss-1-d8b98.firebaseapp.com\",\"projectId\":\"jss-1-d8b98\",\"storageBucket\":\"jss-1-d8b98.appspot.com\",\"messagingSenderId\":\"985767701555\",\"appId\":\"1:985767701555:web:4cbe7a5739b4f4288f0746\",\"measurementId\":\"G-KWGP4XGZS7\"},{\"apiKey\":\"AIzaSyAcW8SrGRjpae3yX41mengldQSkJZNSyyI\",\"authDomain\":\"jss-2-45bfb.firebaseapp.com\",\"projectId\":\"jss-2-45bfb\",\"storageBucket\":\"jss-2-45bfb.appspot.com\",\"messagingSenderId\":\"297181603876\",\"appId\":\"1:297181603876:web:deda0db38dfd99e56ad0b1\",\"measurementId\":\"G-HGF1RZF6G7\"},{\"apiKey\":\"AIzaSyBRrmYnGDXYcuhR9hxjUNHjTTAoaFU-iTU\",\"authDomain\":\"jss-3-9f56a.firebaseapp.com\",\"projectId\":\"jss-3-9f56a\",\"storageBucket\":\"jss-3-9f56a.appspot.com\",\"messagingSenderId\":\"485860840332\",\"appId\":\"1:485860840332:web:03eff5287d1c11e965bca9\"},{\"apiKey\":\"AIzaSyDAFU7YC7-F6Z5f7U_c4CaZfvMX2kWOvGY\",\"authDomain\":\"sss-1-c4e20.firebaseapp.com\",\"projectId\":\"sss-1-c4e20\",\"storageBucket\":\"sss-1-c4e20.appspot.com\",\"messagingSenderId\":\"583010609084\",\"appId\":\"1:583010609084:web:2301c411508b8bc1286db9\"},{\"apiKey\":\"AIzaSyBi2pDZDR1UYgE_0BokzSxfEUu6pdFJavE\",\"authDomain\":\"sss-2-6559e.firebaseapp.com\",\"projectId\":\"sss-2-6559e\",\"storageBucket\":\"sss-2-6559e.appspot.com\",\"messagingSenderId\":\"1080184329339\",\"appId\":\"1:1080184329339:web:afd1b3b963ff9e8b89fede\"},{\"apiKey\":\"AIzaSyCg54BF3m0TDPV3slZ0ctWf3s9x1dpaDDs\",\"authDomain\":\"sss-3-57cf1.firebaseapp.com\",\"projectId\":\"sss-3-57cf1\",\"storageBucket\":\"sss-3-57cf1.appspot.com\",\"messagingSenderId\":\"213082789734\",\"appId\":\"1:213082789734:web:0fdba98e8ffc2ac65b1aa7\"},{\"apiKey\":\"AIzaSyB1FJnKHGt3Ch1KGFuZz_UtZm1EH811NEU\",\"authDomain\":\"fir-pro-152a1.firebaseapp.com\",\"projectId\":\"fir-pro-152a1\",\"storageBucket\":\"fir-pro-152a1.appspot.com\",\"messagingSenderId\":\"158660765747\",\"appId\":\"1:158660765747:web:bd2b4358cc5fc9067ddb46\"},[\"JSS 1\",\"JSS 2\",\"JSS 3\",\"SSS 1\",\"SSS 2\",\"SSS 3\",6,7,\"Demo\"],{\"apiKey\":\"AIzaSyCT92x3HE8nUsYsKgQ2eJZU7DHQ83mTgwE\",\"authDomain\":\"dca-mobile-26810.firebaseapp.com\",\"projectId\":\"dca-mobile-26810\",\"storageBucket\":\"dca-mobile-26810.appspot.com\",\"messagingSenderId\":\"843119620986\",\"appId\":\"1:843119620986:web:e1a4f469626cbd4f241cc3\"},{\"appsettings\":{\"apiKey\":\"AIzaSyCnGk02gQeUZ9nJeOBxHMk3jlC2_pG_jZo\",\"authDomain\":\"flutterspace-d2385.firebaseapp.com\",\"projectId\":\"flutterspace-d2385\",\"storageBucket\":\"flutterspace-d2385.appspot.com\",\"messagingSenderId\":\"979544012314\",\"appId\":\"1:979544012314:web:c2eef86fccbae61f17c3a3\",\"measurementId\":\"G-5E3NVV96HY\"},\"categories\":[\"Cough Syrup\",\"Analgesic Tablet\",\"Eye/Ear Drops/Antiallergy\",\"Anti-malaria Tablet/Injection\",\"Ulcer Medication\",\"Antifungal/Anti-diarrhea\",\"Antibiotics Tablet/Injection\",\"Analgesic Injection/Ointment\",\"Multi Vitamins\",\"Non-consummables 1\",\"Non-consummables 2\",\"Lozenge\"]}]');\n\n//# sourceURL=webpack://firestorewebapp/./src/JSON/configurations.json?");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = __webpack_modules__;
/******/ 	
/******/ 	// the startup function
/******/ 	__webpack_require__.x = () => {
/******/ 		// Load entry module and return exports
/******/ 		// This entry module depends on other loaded chunks and execution need to be delayed
/******/ 		var __webpack_exports__ = __webpack_require__.O(undefined, ["vendors-node_modules_firebase_app_dist_esm_index_esm_js-node_modules_firebase_firestore_dist_-2b1f60"], () => (__webpack_require__("./dist/student/worker.js")))
/******/ 		__webpack_exports__ = __webpack_require__.O(__webpack_exports__);
/******/ 		return __webpack_exports__;
/******/ 	};
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/chunk loaded */
/******/ 	(() => {
/******/ 		var deferred = [];
/******/ 		__webpack_require__.O = (result, chunkIds, fn, priority) => {
/******/ 			if(chunkIds) {
/******/ 				priority = priority || 0;
/******/ 				for(var i = deferred.length; i > 0 && deferred[i - 1][2] > priority; i--) deferred[i] = deferred[i - 1];
/******/ 				deferred[i] = [chunkIds, fn, priority];
/******/ 				return;
/******/ 			}
/******/ 			var notFulfilled = Infinity;
/******/ 			for (var i = 0; i < deferred.length; i++) {
/******/ 				var [chunkIds, fn, priority] = deferred[i];
/******/ 				var fulfilled = true;
/******/ 				for (var j = 0; j < chunkIds.length; j++) {
/******/ 					if ((priority & 1 === 0 || notFulfilled >= priority) && Object.keys(__webpack_require__.O).every((key) => (__webpack_require__.O[key](chunkIds[j])))) {
/******/ 						chunkIds.splice(j--, 1);
/******/ 					} else {
/******/ 						fulfilled = false;
/******/ 						if(priority < notFulfilled) notFulfilled = priority;
/******/ 					}
/******/ 				}
/******/ 				if(fulfilled) {
/******/ 					deferred.splice(i--, 1)
/******/ 					var r = fn();
/******/ 					if (r !== undefined) result = r;
/******/ 				}
/******/ 			}
/******/ 			return result;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/ensure chunk */
/******/ 	(() => {
/******/ 		__webpack_require__.f = {};
/******/ 		// This file contains only the entry chunk.
/******/ 		// The chunk loading function for additional chunks
/******/ 		__webpack_require__.e = (chunkId) => {
/******/ 			return Promise.all(Object.keys(__webpack_require__.f).reduce((promises, key) => {
/******/ 				__webpack_require__.f[key](chunkId, promises);
/******/ 				return promises;
/******/ 			}, []));
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/get javascript chunk filename */
/******/ 	(() => {
/******/ 		// This function allow to reference async chunks and sibling chunks for the entrypoint
/******/ 		__webpack_require__.u = (chunkId) => {
/******/ 			// return url for filenames based on template
/******/ 			return "" + chunkId + ".idx_bun.js";
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/global */
/******/ 	(() => {
/******/ 		__webpack_require__.g = (function() {
/******/ 			if (typeof globalThis === 'object') return globalThis;
/******/ 			try {
/******/ 				return this || new Function('return this')();
/******/ 			} catch (e) {
/******/ 				if (typeof window === 'object') return window;
/******/ 			}
/******/ 		})();
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/publicPath */
/******/ 	(() => {
/******/ 		var scriptUrl;
/******/ 		if (__webpack_require__.g.importScripts) scriptUrl = __webpack_require__.g.location + "";
/******/ 		var document = __webpack_require__.g.document;
/******/ 		if (!scriptUrl && document) {
/******/ 			if (document.currentScript)
/******/ 				scriptUrl = document.currentScript.src;
/******/ 			if (!scriptUrl) {
/******/ 				var scripts = document.getElementsByTagName("script");
/******/ 				if(scripts.length) {
/******/ 					var i = scripts.length - 1;
/******/ 					while (i > -1 && !scriptUrl) scriptUrl = scripts[i--].src;
/******/ 				}
/******/ 			}
/******/ 		}
/******/ 		// When supporting browsers where an automatic publicPath is not supported you must specify an output.publicPath manually via configuration
/******/ 		// or pass an empty string ("") and set the __webpack_public_path__ variable from your code to use your own logic.
/******/ 		if (!scriptUrl) throw new Error("Automatic publicPath is not supported in this browser");
/******/ 		scriptUrl = scriptUrl.replace(/#.*$/, "").replace(/\?.*$/, "").replace(/\/[^\/]+$/, "/");
/******/ 		__webpack_require__.p = scriptUrl;
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/importScripts chunk loading */
/******/ 	(() => {
/******/ 		// no baseURI
/******/ 		
/******/ 		// object to store loaded chunks
/******/ 		// "1" means "already loaded"
/******/ 		var installedChunks = {
/******/ 			"dist_student_worker_js": 1
/******/ 		};
/******/ 		
/******/ 		// importScripts chunk loading
/******/ 		var installChunk = (data) => {
/******/ 			var [chunkIds, moreModules, runtime] = data;
/******/ 			for(var moduleId in moreModules) {
/******/ 				if(__webpack_require__.o(moreModules, moduleId)) {
/******/ 					__webpack_require__.m[moduleId] = moreModules[moduleId];
/******/ 				}
/******/ 			}
/******/ 			if(runtime) runtime(__webpack_require__);
/******/ 			while(chunkIds.length)
/******/ 				installedChunks[chunkIds.pop()] = 1;
/******/ 			parentChunkLoadingFunction(data);
/******/ 		};
/******/ 		__webpack_require__.f.i = (chunkId, promises) => {
/******/ 			// "1" is the signal for "already loaded"
/******/ 			if(!installedChunks[chunkId]) {
/******/ 				if(true) { // all chunks have JS
/******/ 					importScripts(__webpack_require__.p + __webpack_require__.u(chunkId));
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 		
/******/ 		var chunkLoadingGlobal = self["webpackChunkfirestorewebapp"] = self["webpackChunkfirestorewebapp"] || [];
/******/ 		var parentChunkLoadingFunction = chunkLoadingGlobal.push.bind(chunkLoadingGlobal);
/******/ 		chunkLoadingGlobal.push = installChunk;
/******/ 		
/******/ 		// no HMR
/******/ 		
/******/ 		// no HMR manifest
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/startup chunk dependencies */
/******/ 	(() => {
/******/ 		var next = __webpack_require__.x;
/******/ 		__webpack_require__.x = () => {
/******/ 			return __webpack_require__.e("vendors-node_modules_firebase_app_dist_esm_index_esm_js-node_modules_firebase_firestore_dist_-2b1f60").then(next);
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// run startup
/******/ 	var __webpack_exports__ = __webpack_require__.x();
/******/ 	
/******/ })()
;
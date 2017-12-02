module.exports = {
  "maximumFileSizeToCacheInBytes": 5000000,
  "globDirectory": "www\\",
  "globPatterns": [ 
    "index.html",
    "manifest.json",
    "assets/js/promise.js",
    "assets/js/fetch.js",   
    "assets/js/localforage.min.js",
    "assets/js/localforageUtil.js",
    "assets/js/sync.js",  
    "assets/js/notification.js",
    "build/main.js",
    "build/vendor.js",
    "build/main.css",
    "build/polyfills.js",    
    "assets/imgs/*-on.png" 
  ],
  "swSrc": "./src/service-worker-base.js",
  "swDest": "./src/service-worker.js",
  "globIgnores": [  
    "assets/js/workbox-sw.prod.v2.1.2.js",
    "assets/imgs/icons/**"
  ],
  "templatedUrls": {
    "/": ["index.html"]
  }
};

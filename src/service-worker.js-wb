importScripts('/assets/js/workbox-sw.prod.v2.1.2.js');
importScripts('/assets/js/localforage.min.js');
importScripts('/assets/js/localforageUtil.js');
importScripts('/assets/js/sync.js');
importScripts('/assets/js/notification.js');

const workboxSW = new self.WorkboxSW({ clientClaims: true });

workboxSW.router.registerRoute('/(.*?)/', workboxSW.strategies.cacheFirst({
  cacheName: 'assets',
  cacheableResponse: { statuses: [0, 200] }
}));

workboxSW.router.registerRoute(/.*(?:googleapis|gstatic)\.com.*$/, workboxSW.strategies.cacheFirst({
    cacheName: 'google-map',
    cacheExpiration: {        
       maxAgeSeconds: 60 * 60 * 24 * 15
    },
    cacheableResponse: { statuses: [0, 200] }
}));

workboxSW.router.registerRoute(/.*(?:firebasestorage\.googleapis)\.com.*$/, 
  workboxSW.strategies.cacheFirst({
    cacheName: 'user-images',
    cacheExpiration: {        
        maxEntries: 100
      },
    cacheableResponse: { statuses: [0, 200] }
}));

workboxSW.router.registerRoute('https://employeenotification-440d8.firebaseio.com/users/(.*)', args => {
      const { pathname } = args.url;
      const key = pathname.substr(pathname.lastIndexOf('/') + 1).replace('.json', '');  
  
      return fetch(args.event.request)
        .then(networkResponse => {                             
            appendData('data', key, networkResponse.clone().json());                                
            return networkResponse;
        })
      .catch(() =>             
        readData('data').then(data =>                      
          new Response(JSON.stringify(data[key]), {                           
            headers: { 'Content-Type': 'application/json' }          
        })
      )
    );  
});

workboxSW.router.registerRoute('https://employeenotification-440d8.firebaseio.com/users.json', args => 
    fetch(args.event.request)
    .then(networkResponse => {           
        writeData('data', networkResponse.clone().json());                     
        return networkResponse;
    })
    .catch(() =>             
        readData('data').then(data => 
          new Response(JSON.stringify(data), {                           
            headers: { 'Content-Type': 'application/json' }
          })
        )
    )    
);

workboxSW.router.registerRoute(/(\/build\/\d+)/, workboxSW.strategies.networkFirst({
  cacheName: 'builds',
  networkTimeoutSeconds: 3
}));

workboxSW.precache([
  {
    "url": "index.html",
    "revision": "eb250e65a5d4cb032ae270edbe25fdea"
  },
  {
    "url": "manifest.json",
    "revision": "b1bee699d69ec6bd550a5036e80ab270"
  },
  {
    "url": "assets/js/promise.js",
    "revision": "10c2238dcd105eb23f703ee53067417f"
  },
  {
    "url": "assets/js/fetch.js",
    "revision": "6b82fbb55ae19be4935964ae8c338e92"
  },
  {
    "url": "assets/js/localforage.min.js",
    "revision": "5e0d1878d4f4a8d21228835a869c91b8"
  },
  {
    "url": "assets/js/localforageUtil.js",
    "revision": "a79596d1ebea625ce52924c4228c7717"
  },
  {
    "url": "assets/js/sync.js",
    "revision": "44148a0eae5e8c6d38a9790e044fc612"
  },
  {
    "url": "assets/js/notification.js",
    "revision": "517e6ca9e118e4187ecce1c009469902"
  },
  {
    "url": "build/main.js",
    "revision": "ebbfe94695135dcec6c10472ef4535e7"
  },
  {
    "url": "build/vendor.js",
    "revision": "086bcc6812428c0831d8f4d1a90cb2ea"
  },
  {
    "url": "build/main.css",
    "revision": "4b19576a6a3580990c3ef5bc389e968f"
  },
  {
    "url": "build/polyfills.js",
    "revision": "a0f85bbdf3767a0ba06226c4ba43053f"
  },
  {
    "url": "assets/imgs/accounting-on.png",
    "revision": "1c002c000abaf71a98de5ccb1d04b8c5"
  },
  {
    "url": "assets/imgs/engineering-on.png",
    "revision": "6da28be39f4a06342da500919ec8cb69"
  },
  {
    "url": "assets/imgs/finance-on.png",
    "revision": "ec7db1c462815112391e61b08b197ad2"
  },
  {
    "url": "assets/imgs/health-care-on.png",
    "revision": "6ab241e0358c7ca4142c29d96ac5c16e"
  },
  {
    "url": "assets/imgs/it-on.png",
    "revision": "6d7a4c359aefbe0d5122fe27369aabf6"
  },
  {
    "url": "assets/imgs/sales-on.png",
    "revision": "cabe154888c96c8eccb4389fa3f0657d"
  },
  {
    "url": "assets/imgs/transportation-on.png",
    "revision": "8fe86cf6b589ae5da8efb3d38b27e7fa"
  },
  {
    "url": "/",
    "revision": "de9ac207b34e9f5a7fec5474bb490b0e"
  }
]);

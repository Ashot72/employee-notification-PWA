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

workboxSW.router.registerRoute(/(\/build\/\d+)/, workboxSW.strategies.staleWhileRevaliate({
  cacheName: 'builds',
  networkTimeoutSeconds: 3
}));

workboxSW.precache([]);

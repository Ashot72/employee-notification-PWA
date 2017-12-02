importScripts('/assets/js/localforage.min.js');
importScripts('/assets/js/localforageUtil.js');
importScripts('/assets/js/sync.js');
importScripts('/assets/js/notification.js');

const CACHE_STATIC_NAME = 'static-v56';
const CACHE_DYNAMIC_NAME = 'dynamic-v71';

const STATIC_FILES = [
    '/',
    'index.html',
    'manifest.json',
    '/build/main.js',
    '/build/vendor.js',
    '/build/main.css',
    '/build/polyfills.js',
    '/assets/js/promise.js',
    '/assets/js/fetch.js',   
    '/assets/js/localforage.min.js',
    '/assets/js/localforageUtil.js',
    '/assets/js/sync.js',  
    '/assets/js/notification.js',
    '/assets/imgs/accounting-on.png',
    '/assets/imgs/engineering-on.png',
    '/assets/imgs/finance-on.png',
    '/assets/imgs/health-care-on.png',
    '/assets/imgs/it-on.png',
    '/assets/imgs/sales-on.png', 
    '/assets/imgs/transportation-on.png'   
];

const IsPrecached = requestURL => STATIC_FILES.includes(requestURL.pathname) ? true : false;

self.addEventListener('install', function(event) {
  console.log("'Service Worker' Installing Service Worker ...", event);
  event.waitUntil(
    caches.open(CACHE_STATIC_NAME)
      .then(cache => {
        console.log("'Service Worker' Precaching App Shell");
        cache.addAll(STATIC_FILES)     
      })
  );
});

self.addEventListener('activate', function(event) {
  console.log("'Service Worker' Activating Service Worker ...", event);
  event.waitUntil(
    caches.keys()
     .then(keyList => Promise.all(keyList.map(key => {
         if( key !== CACHE_STATIC_NAME && key !== CACHE_DYNAMIC_NAME) {
           console.log("'Service Worker' Removing old cache.", key);
           return caches.delete(key);
         }
       }))
     )
  );
  return self.clients.claim();
});

self.addEventListener('fetch', event => { 
  const requestURL = new URL(event.request.url);

  if(requestURL.href === 'https://employeenotification-440d8.firebaseio.com/users.json')
  {
     // netwark falling back to cache with frequent updates    
     event.respondWith(    
        fetch(event.request)
          .then(networkResponse => {           
              writeData("data", networkResponse.clone().json());                     
              return networkResponse;
        })
        .catch(_ =>                 
          readData("data").then(data => 
            new Response(JSON.stringify(data), {                           
              headers: { 'Content-Type' : 'application/json' }
            })
          )
        )      
     );
  }
  else if(requestURL.href.startsWith('https://employeenotification-440d8.firebaseio.com/users/'))
  { 
     // netwark falling back to cache with frequent updates  
     let key = requestURL.href.substr(requestURL.href.lastIndexOf('/') + 1).replace('.json', '');   
     
     event.respondWith(      
          fetch(event.request)
           .then(networkResponse => {                             
               appendData("data", key, networkResponse.clone().json());                                
               return networkResponse;
           })
          .catch(_ =>             
            readData("data").then(data =>                       
              new Response(JSON.stringify(data[key]), {                           
                headers: { 'Content-Type' : 'application/json' }
              })            
          )
        )     
     );
  }
  else if(/^\/build\/\d+/.test(requestURL.pathname))
  {
    // cache falling back to network with frequent updates
    event.respondWith( 
      caches.open(CACHE_DYNAMIC_NAME).then(cache => 
        cache.match(event.request)
          .then(cachedResponse => {         
            let fetchedPromise = fetch(event.request)
             .then(networkResponse => {
                cache.put(event.request, networkResponse.clone());
                return networkResponse;
             })
             .catch(err => { });
             return cachedResponse || fetchedPromise;
        })
      )
    );
  }
  else if(IsPrecached(requestURL)){
    // cache only
    event.respondWith(
      caches.match(event.request)
    );
  }
  else
  {
    event.respondWith(   
        // cache falling back to network
        caches.match(event.request)
          .then(cacheResponse =>      
              cacheResponse || fetch(event.request)
              .then(networkResponse => 
                  caches.open(CACHE_DYNAMIC_NAME)
                  .then(cache => {
                    cache.put(event.request.url, networkResponse.clone());
                    return networkResponse;
                  })
              )
              .catch(err => { })                                      
          )
      );
    }
  });

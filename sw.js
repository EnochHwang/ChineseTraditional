var CACHE_NAME = 'Chinese-Traditional-cache-v0';

// include all the files for offline access
const CACHE_FILES = [
  'index.html', 'manifest.json', 'styles.css', 'app.js', 'file_lists.js',
  'https://cdn.jsdelivr.net/npm/swiper@10/swiper-bundle.min.css',
  'https://cdn.jsdelivr.net/npm/swiper@10/swiper-bundle.min.js',
  
  'icons/icon-16.png',
  'icons/icon-32.png',
  'icons/icon-192.png',
  "icons/icon-512.png",
  'icons/ic_bookmark.png',
  'icons/ic_drag.png',
  'icons/ic_number.png',
  'icons/ic_pause.png',
  'icons/ic_play.png',
  'icons/ic_search.png',
  'icons/ic_settings.png',
  'icons/ic_stop.png',
  'icons/ic_title.png',
  'icons/ic_trash.png',
  
  'songsheets/about.png',
  
];
  

// Install the Service Worker
/*
// original
self.addEventListener("install", (event) => {
  // Tell the browser not to finish the install until this promise resolves
  event.waitUntil((async () => {
    try {
      const cache = await caches.open(CACHE_NAME);
      // this might still load files from the browser's cache instead of from server
      await cache.addAll(CACHE_FILES);
      
      // if don't want to use the new SW immediately then don't do the skipWaiting here but in the addEventListener('message'
      // self.skipWaiting(); // forces the waiting service worker (i.e. with the new updates) to become the active one immediately
    } catch (error) {
      console.error("Service Worker installation failed:", error);
    }
  })());
});
*/

self.addEventListener("install", (event) => {
  console.log("SW: Install started");
  event.waitUntil((async () => {
    try {
      const cache = await caches.open(CACHE_NAME);
      
      // Manual fetch with 'cache: reload' to bypass HTTP cache
      const cachePromises = CACHE_FILES.map(async (url) => {
        try {
          // fetch(url, { cache: 'reload' }) forces the browser to go to the server
          const response = await fetch(new Request(url, { cache: 'reload' }));
          if (!response.ok) throw new Error(`Network response was not ok for ${url}`);
          return await cache.put(url, response);
        } catch (err) {
          console.error(`Failed to fetch and cache ${url}:`, err);
        }
      });

      await Promise.all(cachePromises);
      console.log("SW: All files cached fresh from server");

    } catch (error) {
      console.error("Service Worker installation failed:", error);
    }
  })());
});

// this is executed when the 'update' message is sent by user clicking on an update button
self.addEventListener('message', function (event) {
  console.log("SW 5:User acknowledged new updates");
  if (event.data.action === 'update') {
    self.skipWaiting(); // forces the waiting service worker (i.e. with the new updates) to become the active one immediately
  }
});

// delete old cache after updating files
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            console.log("SW 7:Deleting old cache", cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => {
      // Claim clients AFTER the old cache is purged
      console.log("SW 8:Claiming clients after old cache is purged");
      return self.clients.claim();
    })
  );
});

// Fetch resources from cache first then from server if not in cache
self.addEventListener("fetch", (event) => {
  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE_NAME);

      try {
        // 1. Try to load from cache first
        const cachedResponse = await cache.match(event.request);
        if (cachedResponse) return cachedResponse;

        // 2. Not in cache so do a Network Fetch
        const fetchResponse = await fetch(event.request);

        // 3. Handle Partial Content (The 206 "Audio Stream" trigger)
        if (fetchResponse.status === 206) {
          // We create a clean URL object to ensure the background fetch 
          // hits the exact same location as the original request.
          const fullUrl = event.request.url;

          // Perform the background download for the WHOLE file
          // We don't 'await' this so the audio plays immediately
          fetch(fullUrl)
            .then((fullResponse) => {
              if (fullResponse.status === 200) {
                // IMPORTANT: Use the URL string as the key to avoid 
                // any header-matching issues with Range requests
                cache.put(fullUrl, fullResponse);
                console.log("Audio cached successfully:", fullUrl);
              }
            })
            .catch((err) => console.error("Background fetch failed:", err));

          return fetchResponse;
        }

        // 4. Regular files (Status 200)
        if (fetchResponse.status === 200) {
          await cache.put(event.request, fetchResponse.clone());
        }

        return fetchResponse;

      } catch (error) {
        // If the network is down and not in cache, fallback
        const fallback = await cache.match("index.html");
        return fallback || new Response("Offline", { status: 503 });
      }
    })()
  );
});
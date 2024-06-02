// @ts-check
/// <reference types="serviceworker" />

const CacheName = 'v0';

self.addEventListener(
  'install',
  /**@param {ExtendableEvent} e*/
  e => {
    e.waitUntil(caches.open(CacheName));
  }
);

const putInCache = async (
  /** @type {Request} */ request,
  /** @type {Response} */ response
) => {
  if ((x => x !== 'http:' && x !== 'https:')(new URL(request.url).protocol))
    return;
  const cache = await caches.open(CacheName);
  await cache.put(request, response);
};

self.addEventListener(
  'fetch',
  /**@param {FetchEvent} e  */
  e =>
    e.respondWith(
      new Promise(async resolve => {
        let flag = false;
        const responseFromCache = await caches.match(e.request);
        if (responseFromCache) resolve(responseFromCache), (flag = true);
        try {
          const responseFromNetwork = await fetch(e.request);
          putInCache(e.request, responseFromNetwork.clone());
          if (!flag) resolve(responseFromNetwork), (flag = true);
        } catch (err) {
          console.error('Error on service-worker', err);
          if (!flag)
            resolve(
              new Response('Network error happened', {
                status: 408,
                headers: { 'Content-Type': 'text/plain' }
              })
            ),
              (flag = true);
        }
      })
    )
);

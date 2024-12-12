async function getCacheData() {
  const cacheVersion = 1;
  const cacheName = `yt-dlp-subs-${cacheVersion}`;
  const url = `http://localhost:8080/sub?url=${window.location.href}`;
  const cachedResponse = await caches.match(url);
  if (cachedResponse) {
    return await cachedResponse.text();
  }
  await (await caches.open(cacheName)).add(url);
  return await (await caches.match(url)).text();
}

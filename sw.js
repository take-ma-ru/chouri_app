// Kitchen Note - Service Worker
// ※ 1775729175966 は deploy 時に patch-pwa.js がタイムスタンプに置き換える
const CACHE_VERSION = 'CACHE_VERSION_PLACEHOLDER';
const CACHE_NAME = `kitchen-note-${CACHE_VERSION}`;

self.addEventListener('install', function(event) {
  // 新しいSWをすぐにアクティブにする
  self.skipWaiting();
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames
          // kitchen-note- で始まる古いキャッシュをすべて削除
          .filter(name => name.startsWith('kitchen-note-') && name !== CACHE_NAME)
          .map(name => {
            console.log('[SW] 古いキャッシュを削除:', name);
            return caches.delete(name);
          })
      );
    }).then(() => clients.claim()) // 開いているページをすぐ新しいSWで制御
  );
});

// ネットワーク優先（Gemini APIはキャッシュしない）
self.addEventListener('fetch', function(event) {
  if (event.request.url.includes('generativelanguage.googleapis.com')) {
    return;
  }
  event.respondWith(
    fetch(event.request).catch(function() {
      return caches.match(event.request);
    })
  );
});

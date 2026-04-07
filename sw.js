// Kitchen Note - Service Worker
// PWAとしてインストール可能にするための最小限のサービスワーカー

const CACHE_NAME = 'kitchen-note-v1';

self.addEventListener('install', function(event) {
  self.skipWaiting();
});

self.addEventListener('activate', function(event) {
  event.waitUntil(clients.claim());
});

// ネットワーク優先（APIキーを使うのでオフライン対応は最小限）
self.addEventListener('fetch', function(event) {
  // Gemini API呼び出しはキャッシュしない
  if (event.request.url.includes('generativelanguage.googleapis.com')) {
    return;
  }
  event.respondWith(
    fetch(event.request).catch(function() {
      return caches.match(event.request);
    })
  );
});

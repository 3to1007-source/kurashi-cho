// 最小構成のservice worker。ネットワーク優先(オンライン時は常に最新を取得し、
// 取れたレスポンスをキャッシュに保存)、オフライン時のみキャッシュから返す。
// 事前キャッシュリストは持たず、実際に開いたページ・取得したファイルだけを
// 都度キャッシュするので、ビルドごとのファイル名(ハッシュ)変更にも追従できる。

const CACHE_NAME = 'shiori-v1'

self.addEventListener('install', () => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return
  const url = new URL(event.request.url)
  if (url.origin !== location.origin) return

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const copy = response.clone()
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy))
        return response
      })
      .catch(() => caches.match(event.request).then((cached) => cached || caches.match('.')))
  )
})

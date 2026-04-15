const APP_SHELL_CACHE = 'konnectionz-app-shell-v1'
const RUNTIME_CACHE = 'konnectionz-runtime-v1'
const APP_SHELL_URLS = ['/', '/manifest.webmanifest', '/favicon.png', '/favicon.svg', '/background.png']

self.addEventListener('install', (event) => {
  event.waitUntil(installAppShell())
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(cleanupOldCaches())
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  if (request.method !== 'GET' || url.origin !== self.location.origin) {
    return
  }

  if (request.mode === 'navigate') {
    event.respondWith(handleNavigationRequest(request))
    return
  }

  if (shouldCacheStaticAsset(url.pathname, request.destination)) {
    event.respondWith(handleStaticAssetRequest(request))
  }
})

async function installAppShell() {
  const cache = await caches.open(APP_SHELL_CACHE)
  const assetUrls = await getAssetUrlsFromIndex()
  await cache.addAll([...new Set([...APP_SHELL_URLS, ...assetUrls])])
}

async function cleanupOldCaches() {
  const cacheNames = await caches.keys()
  const currentCaches = new Set([APP_SHELL_CACHE, RUNTIME_CACHE])

  await Promise.all(
    cacheNames
      .filter((cacheName) => !currentCaches.has(cacheName))
      .map((cacheName) => caches.delete(cacheName)),
  )
}

async function getAssetUrlsFromIndex() {
  const response = await fetch('/', { cache: 'no-store' })

  if (!response.ok) {
    throw new Error(`Failed to fetch app shell: ${response.status}`)
  }

  const html = await response.text()
  const assetMatches = html.matchAll(/<(?:link|script)[^>]+(?:href|src)="([^"]+)"/g)

  return [...new Set(
    [...assetMatches]
      .map((match) => match[1])
      .map((assetUrl) => new URL(assetUrl, self.location.origin).pathname)
      .filter((pathname) => pathname.startsWith('/assets/')),
  )]
}

async function handleNavigationRequest(request) {
  const cache = await caches.open(APP_SHELL_CACHE)

  try {
    const response = await fetch(request)
    cache.put(request, response.clone())
    return response
  } catch {
    return (await cache.match(request)) ?? (await cache.match('/'))
  }
}

async function handleStaticAssetRequest(request) {
  const cachedResponse = await caches.match(request)

  if (cachedResponse) {
    void refreshStaticAsset(request)
    return cachedResponse
  }

  return refreshStaticAsset(request)
}

async function refreshStaticAsset(request) {
  const response = await fetch(request)

  if (response.ok) {
    const cache = await caches.open(RUNTIME_CACHE)
    cache.put(request, response.clone())
  }

  return response
}

function shouldCacheStaticAsset(pathname, destination) {
  if (pathname.startsWith('/assets/')) {
    return true
  }

  return ['font', 'image', 'script', 'style'].includes(destination)
}

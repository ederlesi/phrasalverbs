// Learn Phrasal Verbs: keeps a copy of the app on the phone so it opens with no signal.
// Network first, so learners always get the newest version when they are online.
var CACHE = "learn-phrasal-verbs-v4";
var FILES = ["./", "./index.html", "./manifest.webmanifest", "./icon-192.png", "./icon-512.png"];
self.addEventListener("install", function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(FILES); }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener("activate", function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});
self.addEventListener("fetch", function (e) {
  if (e.request.method !== "GET") return;
  var sameSite = new URL(e.request.url).origin === self.location.origin;
  e.respondWith(fetch(e.request).then(function (r) {
    if (r.ok && sameSite) { var copy = r.clone(); caches.open(CACHE).then(function (c) { c.put(e.request, copy); }); }
    return r;
  }).catch(function () {
    return caches.match(e.request).then(function (m) { return m || (e.request.mode === "navigate" ? caches.match("./index.html") : undefined); });
  }));
});

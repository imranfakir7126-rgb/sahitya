/* যাত্রাপথ — অফলাইনে অ্যাপ খোলার জন্য সার্ভিস ওয়ার্কার (পেজ ও ছবি ফোনে জমিয়ে রাখে) */
/* পুশ নোটিফিকেশন (FCM) — অ্যাপ বন্ধ থাকলেও নোটিফিকেশন দেখাবে */
try {
  importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js', 'https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');
  firebase.initializeApp({ apiKey: 'AIzaSyChJazuEIsUbRjfULzalX9-DK5nL58afYA', authDomain: 'novelread-4ab43.firebaseapp.com', projectId: 'novelread-4ab43', storageBucket: 'novelread-4ab43.firebasestorage.app', messagingSenderId: '373192250091', appId: '1:373192250091:web:2aa4faecbeaed491f3e4ae' });
  firebase.messaging();
} catch (e) { /* অফলাইনে SDK না পেলে বাদ */ }
var CACHE = 'jp-shell-v1', SDK = 'jp-sdk-v1';
self.addEventListener('install', function (e) { self.skipWaiting(); });
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (ks) { return Promise.all(ks.filter(function (k) { return k !== CACHE && k !== SDK; }).map(function (k) { return caches.delete(k); })); }).then(function () { return self.clients.claim(); }));
});
function fromNet(req, ms) {
  return new Promise(function (ok, no) {
    var t = setTimeout(function () { no(new Error('timeout')); }, ms);
    fetch(req).then(function (r) { clearTimeout(t); ok(r); }, function (e) { clearTimeout(t); no(e); });
  });
}
self.addEventListener('fetch', function (e) {
  var req = e.request; if (req.method !== 'GET') return;
  var u = new URL(req.url);
  /* ফায়ারবেস SDK (নির্দিষ্ট ভার্সন, বদলায় না) — একবার নামলে ফোনে জমা থাকে, রাইটার প্যানেল দ্রুত খোলে */
  if (/(www\.gstatic\.com\/firebasejs\/|cdn\.jsdelivr\.net\/npm\/firebase@)/.test(req.url)) {
    e.respondWith(caches.open(SDK).then(function (ch) { return ch.match(req).then(function (m) { return m || fetch(req).then(function (r) { if (r && (r.ok || r.type === 'opaque')) ch.put(req, r.clone()); return r; }); }); }));
    return;
  }
  var same = u.origin === self.location.origin, font = /fonts\.(googleapis|gstatic)\.com$/.test(u.hostname);
  if (!same && !font) return; /* Firebase ও বিজ্ঞাপনের অনুরোধে হাত দেওয়া হয় না */
  e.respondWith(
    fromNet(req, req.mode === 'navigate' ? 4000 : 8000).then(function (r) {
      if (r && (r.ok || r.type === 'opaque')) { var c = r.clone(); caches.open(CACHE).then(function (ch) { ch.put(req, c); }); }
      return r;
    }).catch(function () {
      return caches.match(req, { ignoreSearch: true }).then(function (m) {
        if (m) return m;
        if (req.mode === 'navigate') return caches.match(self.registration.scope).then(function (x) { return x || caches.match('./'); });
        return Response.error();
      });
    })
  );
});

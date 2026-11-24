/* Cung Đình Ký — service worker (W121): cài như app, mở nhanh, chơi được khi mất mạng.
   Chiến lược: trả bản đã lưu ngay, đồng thời tải bản mới ở nền (lần mở sau dùng bản mới). Tên bộ nhớ đệm đổi theo phiên bản để dọn bản cũ. */
const VER = '30de7f3', CACHE = 'cdk-' + VER, CORE = ['3d.html', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png'];
self.addEventListener('install', (e) => { e.waitUntil(caches.open(CACHE).then((c) => c.addAll(CORE)).then(() => self.skipWaiting())); });
self.addEventListener('activate', (e) => { e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k.startsWith('cdk-') && k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', (e) => {
  const u = new URL(e.request.url); if (e.request.method !== 'GET' || u.origin !== location.origin) return;
  /* W157: trang game (.html) lấy bản MỚI từ mạng trước, chỉ dùng bản đã lưu khi mất mạng. Trước đây trả bản cũ trước nên người chơi
     không thấy cập nhật (Hoàng hậu, Ngọ Môn chữ U) cho tới lần mở thứ hai. Biểu tượng, manifest vẫn lấy bản lưu cho nhanh. */
  const page = e.request.mode === 'navigate' || u.pathname.endsWith('.html') || u.pathname.endsWith('/');
  e.respondWith(caches.open(CACHE).then(async (c) => {
    if (page) { try { const r = await fetch(e.request, { cache: 'no-cache' }); if (r && r.ok) c.put(e.request, r.clone()); return r; } catch (err) { return (await c.match(e.request, { ignoreSearch: true })) || Response.error(); } }
    const hit = await c.match(e.request, { ignoreSearch: true });
    const net = fetch(e.request).then((r) => { if (r && r.ok) c.put(e.request, r.clone()); return r; }).catch(() => hit);
    return hit || net; }));
});

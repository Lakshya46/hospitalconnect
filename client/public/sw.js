self.addEventListener('push', (event) => {
  // 1. Fallback for empty or non-JSON payloads
  let data = { title: 'Emergency Alert', body: 'New resource update available.' };
  try {
    data = event.data.json();
  } catch (e) {
    console.warn("Push event received non-JSON data");
  }

  const options = {
    body: data.body,
    icon: '/logo192.png', 
    badge: '/badge.png',  
    data: { url: data.url || '/hospital-admin/resource-request' },
    vibrate: [200, 100, 200],
    
    // 2. TAGGING: Prevents spam. If multiple notifications arrive, 
    // they replace each other instead of filling the user's screen.
    tag: 'resource-request-alert',
    renotify: true,

    // 3. ACTIONS: Users can interact without opening the site
    actions: [
      { action: 'view', title: '📂 View Bundle' },
      { action: 'close', title: '✖ Dismiss' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  // Handle Action Buttons
  if (event.action === 'close') return;

  // 4. SMART FOCUS: If the app is already open in a tab, focus it 
  // instead of opening a brand new tab every time.
  const targetUrl = new URL(event.notification.data.url, self.location.origin).href;

  const clickActionPromise = clients.matchAll({
    type: 'window',
    includeUncontrolled: true
  }).then((windowClients) => {
    for (let client of windowClients) {
      if (client.url === targetUrl && 'focus' in client) {
        return client.focus();
      }
    }
    if (clients.openWindow) {
      return clients.openWindow(targetUrl);
    }
  });

  event.waitUntil(clickActionPromise);
});
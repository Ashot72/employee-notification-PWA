self.addEventListener('notificationclick', (event) => {
  const notification = event.notification;
    console.log(notification);

    if (notification.tag === 'employee-notification'){
        notification.close();
        return;
    }

    event.waitUntil(
      clients.matchAll()
        .then(clis => {
          const client = clis.find(c => c.visibilityState === 'visible');

          if (client !== undefined) {
            client.navigate(notification.data.url);
            client.focus();
          } else {
            clients.openWindow(notification.data.url);
          }
          notification.close();
        })
    );  
});

self.addEventListener('push', event => {
  console.log('Push Notification received', event);

  if (event.data) {
    const data = JSON.parse(event.data.text());

    const options = {
        body: data.content,
        icon: '/assets/imgs/icons/app-icon-96x96.png',
        image: '/assets/imgs/icons/interview.png',
        badge: '/assets/imgs/icons/app-icon-96x96.png',
        vibrate: [100, 50, 200],
        data: {
          url: data.openUrl
        }
    };

    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
  }
});

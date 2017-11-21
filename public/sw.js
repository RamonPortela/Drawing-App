self.addEventListener('install', function(event){

});

self.addEventListener('activate', function(event){
    return self.clients.claim();
})

self.addEventListener('notificationclick', function(event){
    var notification = event.notification;
    var action = event.action;
  
    console.log(notification);
  
    if(action === 'confirm'){
      console.log('Confrim was chosen');
    }
    else{
      event.waitUntil(
        clients.matchAll().then(function(clis){
          var client = clis.find(function(c){
            return c.visibilityState === 'visible';
          });
  
          if(client !== undefined){
            client.navigate(notification.data.url);
            client.focus();
          }
          else{
            clients.openWindow(notification.data.url);
          }
        })
      )
      console.log(action);
    }
    notification.close();
});

var jaNotificado = false;

self.addEventListener('push', function(event){
    console.log('Push notification received', event);
    var data = {title: 'New!', content: 'Something new happened!', openUrl: '/'}
    if(event.data){
      data = JSON.parse(event.data.text());
    }  
    var options = {
      body: data.content,
      icon: '/src/img/icones/icone_drawing_momo_192x192.png',
      badge: '/src/img/icones/icone_drawing_momo_192x192.png',
      data: {
        url: data.openUrl
      }
    }


    event.waitUntil(
      clients.matchAll().then(function(clientList){
        for (var i = 0; i < clientList.length; i++) {
          var client = clientList[i];
            if ('focus' in client) {
              if(!client.focused && !jaNotificado){
                jaNotificado = true;
                setTimeout(function() {
                  jaNotificado = false;
                }, 1000 * 60 * 5);
                event.waitUntil(
                  self.registration.showNotification(data.title, options)
                )
              }
            }
        }
      })
    )
  

})
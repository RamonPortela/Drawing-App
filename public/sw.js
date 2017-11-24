var CACHE_STATIC_NAME = 'static-v1.1';
var STATIC_FILES = [
  '/',
  '/index.html',
  '/src/js/drawing.js',
  '/src/js/idb.js',
  '/src/js/IndexDBAccess.js',
  '/src/js/mobile.js',
  '/src/js/socket.js',
  '/src/css/fonts/icomoon.eot',
  '/src/css/fonts/icomoon.svg',
  '/src/css/fonts/icomoon.ttf',
  '/src/css/fonts/icomoon.woff',
  '/src/css/fonts.css',
  '/src/css/styles.css',
  'https://cdnjs.cloudflare.com/ajax/libs/socket.io/2.0.3/socket.io.js'
]


self.addEventListener('install', function(event){
	event.waitUntil(
		caches.open(CACHE_STATIC_NAME)
		.then(function (cache) {
			cache.addAll(STATIC_FILES);
		})
	)
});

self.addEventListener('activate', function(event){
	event.waitUntil(
		caches.keys()
		.then(function (keyList) {
			return Promise.all(keyList.map(function (key) {
				if (key !== CACHE_STATIC_NAME) {
					return caches.delete(key);
				}
			}));
		})
	);


    return self.clients.claim();
});

function checkIfStatic(string, array) {
	var cachePath;
	if (string.indexOf(self.origin) === 0) // request targets domain where we serve the page from (i.e. NOT a CDN)
		cachePath = string.substring(self.origin.length); // take the part of the URL AFTER the domain (e.g. after localhost:8080)
	 else 
		cachePath = string; // store the full request (for CDNs)	

	return array.indexOf(cachePath) > -1;
}
  

self.addEventListener('fetch', function(event){
	if(checkIfStatic(event.request.url, STATIC_FILES)){
		event.respondWith(
			caches.match(event.request)
		);
	}
	else{
		event.respondWith(
			caches.match(event.request)
			.then(function(response){
				if(response)
					return response;
				else{
					return fetch(event.request)
				}
			})
		);
	}
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
var tempoTimeOut = 1000 * 60 * 3;

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
        url: data.data.openUrl
      }
    }

    event.waitUntil(
      clients.matchAll().then(function(clientList){
        console.log(clientList);
        for (var i = 0; i < clientList.length; i++) {
          var client = clientList[i];
            if ('focus' in client) {
              if(!client.focused && !jaNotificado){
                jaNotificado = true;
                setTimeout(function() {
                  jaNotificado = false;
                }, tempoTimeOut);
                event.waitUntil(
                  self.registration.showNotification(data.title, options)
                )
              }
            }
        }
        if(clientList.length === 0 && !jaNotificado){
          jaNotificado = true;
          setTimeout(function() {
            jaNotificado = false;
          }, tempoTimeOut);
          event.waitUntil(
            self.registration.showNotification(data.title, options)
          )
        }
      })
    )
})

self.addEventListener('pushsubscriptionchange', function(registration, newSubscription, oldSubscription){
  console.log(event);
  fetch("http://localhost:8080/api/subscribe", {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(newSubscription)
  }).catch(function(error){
    console.log(error);
  })
})
var dbPromise = idb.open('notificationKey', 1, function(db){
    if(!db.objectStoreNames.contains('notification')){
      db.createObjectStore('notification', {
        keyPath: 'id'
      })
    }
});

function writeData(storeName, data){
  return dbPromise.then(function(db){
      var transaction = db.transaction(storeName, 'readwrite');
      var store = transaction.objectStore(storeName);
      store.put(data);
      return transaction.complete;
    });
}

function readAllData(storeName){
  return dbPromise.then(function(db){
      var transaction = db.transaction(storeName, 'readonly');
      var store = transaction.objectStore(storeName);
      return store.getAll();
  });
}
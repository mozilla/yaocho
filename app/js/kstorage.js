'use strict';

var yaocho = angular.module('yaocho');

yaocho.service('KStorage', ['$rootScope',
function($rootScope) {

  function reqToPromise(req) {
    return new Promise(function(resolve, reject) {
      req.onsuccess = function(ev) {
        resolve(req.result);
      };
      req.onerror = function(ev) {
        reject(req.result);
      };
    });
  }

  var dbPromise = new Promise(function(resolve, reject) {
    var openReq = indexedDB.open('kitsune', 1);
    openReq.onsuccess = function(ev) {
      resolve(openReq.result);
    };
    openReq.onerror = function() {
      console.error('Error opening DB.', openReq);
      reject(openReq);
    };
    openReq.onupgradeneeded = function(ev) {
      openReq.result.createObjectStore('objects', {keyPath: 'key'});
      openReq.result.createObjectStore('sets', {keyPath: 'key'});
    };
  });

  this.getObject = function(key) {
    return dbPromise
    .then(function(db) {
      var transaction = db.transaction('objects');
      return reqToPromise(transaction.objectStore('objects').get(key))
    })
    .then(function(obj) {
      if (obj) {
        return obj.value;
      } else {
        throw new Error('Cache miss for getObject(' + key + ')');
      }
    });
  }

  this.putObject = function(key, value) {
    var obj = {
      key: key,
      value: value,
    };
    return dbPromise
    .then(function(db) {
      var transaction = db.transaction('objects', 'readwrite');
      return reqToPromise(transaction.objectStore('objects').put(obj));
    })
  };

  this.putSet = function(key, setKeys) {
    return dbPromise
    .then(function(db) {
      var transaction = db.transaction('sets', 'readwrite');
      return reqToPromise(transaction.objectStore('sets').put({
        key: key,
        value: setKeys,
      }));
    })
  };

  this.getSet = function(key) {
    // this can't use reqToPromise for the first call because the
    // transaction goes stale by the time the promise .then would call.
    return dbPromise
    .then(function(db) {
      return new Promise(function(resolve, reject) {
        var transaction = db.transaction(['objects', 'sets']);
        var req = transaction.objectStore('sets').get(key);
        req.onsuccess = function() {
          if (req.result === undefined) {
            reject(new Error('Cache miss for getSet(' + key + ')'));
          } else {
            var listOfKeys = req.result.value.filter(function(key) { return !!key; });
            resolve(Promise.all(listOfKeys.map(function(key) {
              if (key !== undefined) {
                return reqToPromise(transaction.objectStore('objects').get(key))
                .then(function(obj) {
                  if (obj) {
                    return obj.value;
                  } else {
                    return {title: key};
                  }
                });
              }
            })));
          }
        }
        req.onerror = function() {
          reject(req.result);
        }
      });
    })
  }

  this.clear = function() {
    return dbPromise
    .then(function(db) {
      var transaction = db.transaction(['objects', 'sets'], 'readwrite');
      var setReq = transaction.objectStore('sets').clear();
      var objReq = transaction.objectStore('objects').clear();
      return Promise.all([setReq, objReq].map(reqToPromise));
    });
  }
}]);

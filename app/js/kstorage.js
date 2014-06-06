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

  this.getObject = function(name) {
    return dbPromise
    .then(function(db) {
      var transaction = db.transaction('objects');
      return reqToPromise(transaction.objectStore('objects').get(name))
    })
    .then(function(obj) {
      return obj.value;
    });
  }

  this.putObject = function(value) {
    return dbPromise
    .then(function(db) {
      var transaction = db.transaction('objects', 'readwrite');
      return reqToPromise(transaction.objectStore('objects').put(value))
    })
  };

  this.putSet = function(name, values) {
    return dbPromise
    .then(function(db) {
      var setValue = values.map(function(v) { return v.key; });
      var transaction = db.transaction('sets');
      return reqToPromise(transaction.objectStore('sets').put({
        name: name,
        value: setValue,
      }))
    })
  };

  this.getSet = function(name) {
    // this can't use reqToPromise for the first call because the
    // transaction goes stale by the time the names get resolved.
    return dbPromise
    .then(function(db) {
      return new Promise(function(resolve, reject) {
        var transaction = db.transaction(['objects', 'sets']);
        var req = transaction.objectStore('objects').get(name);
        req.onsuccess = function() {
          var listOfNames = req.result.value;
          resolve(Promise.all(listOfNames.map(function(name) {
            return reqToPromise(transaction.objectStore('objects').get(name))
            .then(function(obj) {
              return obj.value;
            });
          })));
        }
      });
    })
  }

  window.getObject = this.getObject;
  window.putObject = this.putObject;
  window.getSet = this.getSet;
  window.putSet = this.putSet;
}]);

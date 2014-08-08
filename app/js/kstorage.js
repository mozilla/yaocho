'use strict';

var yaocho = angular.module('yaocho');

yaocho.service('KStorage', ['$rootScope', '$injector', 'updateObject',
function($rootScope, $injector, updateObject) {

  var fetchMethodsForType = {
    document: ['fromCache', 'documentFromNetwork', 'lol'],
    image: ['fromCache', 'imageFromNetwork', 'lol'],
    topic: ['fromCache', 'topicFromNetwork', 'lol'],
  };

  this.getObject = function(key) {
    var type = key.split(':')[0];
    var fetchMethods = fetchMethodsForType[type];
    if (fetchMethods === undefined) {
      throw new Error('Unknown KStorage type: ' + type);
    }
    fetchMethods = fetchMethods.map(function(m) { return this.methods[m]; }.bind(this));

    var p = new Promise(function(resolve, reject) {
      function next() {
        var method = fetchMethods.shift();
        if (method === undefined) {
          reject();
        }
        method(key)
        .then(function(obj) {
          updateObject(p.$$object, obj);
          resolve(obj);
        })
        .catch(next);
      }
      next();
    });

    p.$$object = {};

    return p;
  };

  this.methods = {
    fromCache: function(key) {
      console.log('methods.fromCache', key);
      var idb = $injector.get('IndexedDbWrapper');
      return idb.getObject(key);
    },

    documentFromNetwork: function(key) {
      console.log('methods.documentFromNetwork', key);
      var KitsuneRestangular = $injector.get('KitsuneRestangular');
      var idb = $injector.get('IndexedDbWrapper');

      var slug = key.split(':')[1];
      var documentKeys = ['title', 'slug', 'html', 'products', 'topics', 'locale'];

      return KitsuneRestangular.one('kb', slug).get()
      .then(function(doc) {
        doc = _.pick(doc, documentKeys);
        idb.putObject(key, doc)
        .then(function() {
          console.log('put document in cache', key);
        })
        .catch(function(err) {
          console.error('erroring putting', key, 'in cache');
          console.error(err.trace || err);
        });
        return doc;
      });
    },

    imageFromNetwork: function(key) {
      console.log('methods.imageFromNetwork', key);
      var idb = $injector.get('IndexedDbWrapper');
      var downloadImageAsBlob = $injector.get('downloadImageAsBlob');
      var kitsuneBase = $injector.get('kitsuneBase');

      var path = key.split(':')[1];

      var p = downloadImageAsBlob(kitsuneBase + path);
      p.then(idb.putObject.bind(idb, key));
      return p;
    },

    topicFromNetwork: function(key) {
      console.log('methods.topicFromNetwork', key);
      var KitsuneRestangular = $injector.get('KitsuneRestangular');
      var idb = $injector.get('IndexedDbWrapper');

      var slug = key.split(':')[1];
      var product = slug.split('/')[0];
      var topic = slug.split('/')[1];
      var topicKeys = ['id', 'slug', 'title', 'parent', 'product', 'subtopics', 'documents'];

      return KitsuneRestangular.one('products', product).one('topic', topic).get()
      .then(function(doc) {
        doc = _.pick(doc, topicKeys);
        idb.putObject(key, doc);
        return doc;
      });
    },

    lol: function(key) {
      console.log('methods.lol', key);
      return Promise.resolve({
        title: 'LOL',
        html: 'hahahahahahaha',
      });
    }
  };

}]);


yaocho.service('IndexedDbWrapper', [
function() {

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
    };
  });

  this.getObject = function(key) {
    return dbPromise
    .then(function(db) {
      var transaction = db.transaction('objects');
      return reqToPromise(transaction.objectStore('objects').get(key));
    })
    .then(function(obj) {
      if (obj) {
        return obj.value;
      } else {
        console.log('cache miss', key);
        throw new Error('Cache miss for ' + key);
      }
    });
  };

  this.putObject = function(key, value) {
    var obj = {
      key: key,
      value: value,
    };
    return dbPromise
    .then(function(db) {
      var transaction = db.transaction('objects', 'readwrite');
      return reqToPromise(transaction.objectStore('objects').put(obj));
    });
  };

  this.numObjectsExist = function(objectType, num) {
    return dbPromise
    .then(function(db) {
      var transaction = db.transaction('objects');
      var advanced = false;
      return new Promise(function(resolve, reject) {
        transaction.objectStore('objects')
        .openCursor(IDBKeyRange.bound(objectType, objectType + '\uffff'))
        .onsuccess = function (ev) {
          var cursor = ev.target.result;
          // Check to make sure the cursor isn't null.
          if (cursor) {
            if (advanced) {
              // num of objectType do exist.
              resolve(true);
            } else {
              cursor.advance(num);
              advanced = true;
            }
          } else {
            // num of objectType do not exist.
            resolve(false);
          }
        };
      });
    });
  }

  this.fuzzySearchObjects = function(partialKey) {
    return dbPromise
    .then(function(db) {
      var transaction = db.transaction('objects');
      var results = []
      return new Promise(function(resolve, reject) {
        var req = transaction.objectStore('objects')
          .openCursor(IDBKeyRange.bound(partialKey, partialKey + '\uffff'));
        req.onsuccess = function (ev) {
          var cursor = ev.target.result;
          // Check to make sure the cursor isn't null.
          if (cursor) {
            results.push(cursor.value.value);
            cursor.continue()
          } else {
            // num of objectType do not exist.
            resolve(results);
          }
        };
      });
    });
  };

  this.clear = function() {
    return dbPromise
    .then(function(db) {
      var transaction = db.transaction(['objects'], 'readwrite');
      return reqToPromise(transaction.objectStore('objects').clear());
    });
  };
}]);

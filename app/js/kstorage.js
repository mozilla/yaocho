'use strict';

var yaocho = angular.module('yaocho');

yaocho.service('KStorage', ['$rootScope', '$injector', 'updateObject',
function($rootScope, $injector, updateObject) {

  var fetchMethodsForType = {
    document: ['fromCache', 'documentFromNetwork'],
    image: ['fromCache', 'imagesFromIncludes', 'imageFromNetwork'],
    topic: ['fromCache', 'topicFromNetwork'],
  };

  this.getObject = function(key, fetchMethods) {
    var type = key.split(':')[0];
    fetchMethods = fetchMethods || fetchMethodsForType[type];
    if (fetchMethods === undefined) {
      throw new Error('Unknown KStorage type: ' + type);
    }
    fetchMethods = fetchMethods.map(function(m) { return this.methods[m]; }.bind(this));

    var p = new Promise(function(resolve, reject) {
      function next() {
        var method = fetchMethods.shift();
        if (method === undefined) {
          return reject();
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
      var idb = $injector.get('IndexedDbWrapper');
      return idb.getObject(key);
    },

    imageFromIncludes: function(key) {
      var downloadImageAsBlob = $injector.get('downloadImageAsBlob');
      var path = key.split(':')[1];
      return downloadImageAsBlob('/includes/image' + path);
    },

    documentFromNetwork: function(key) {
      var KitsuneRestangular = $injector.get('KitsuneRestangular');
      var idb = $injector.get('IndexedDbWrapper');

      var slug = key.split(':')[1];
      var documentKeys = ['title', 'slug', 'html', 'products', 'topics', 'locale'];

      return KitsuneRestangular.one('kb', slug).get()
      .then(function(doc) {
        doc = _.pick(doc, documentKeys);
        idb.putObject(key, doc)
        return doc;
      });
    },

    imageFromNetwork: function(key) {
      var idb = $injector.get('IndexedDbWrapper');
      var downloadImageAsBlob = $injector.get('downloadImageAsBlob');
      var kitsuneBase = $injector.get('kitsuneBase');

      var path = key.split(':')[1];

      var p = downloadImageAsBlob(kitsuneBase + path);
      p.then(idb.putObject.bind(idb, key));
      return p;
    },

    topicFromNetwork: function(key) {
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
  };

}]);


yaocho.factory('cacheAll', ['$rootScope', 'KStorage',
function($rootScope, KStorage) {

  return function() {
    console.log('Caching all topics and documents.')
    var queue = [{type: 'topic', slug: ''}];
    $rootScope.$emit('loading.incr', 'Downloading articles');
    var product = $rootScope.settings.product.slug;

    function downloadNext() {
      var next = queue.shift();
      return new Promise(function(resolve, reject) {
        if (next.type === 'topic') {
          KStorage.getObject('topic:' + product + '/' + next.slug, ['topicFromNetwork'])
          .then(function(topic) {
            topic.subtopics.forEach(function(st) {
              queue.push({type: 'topic', slug: st.slug});
              $rootScope.$emit('loading.incr');
            });
            topic.documents.forEach(function(st) {
              queue.push({type: 'document', slug: st.slug});
              $rootScope.$emit('loading.incr');
            });
            resolve();
          })

        } else if (next.type === 'document') {
          KStorage.getObject('document:' + next.slug, ['documentFromNetwork'])
          .then(function() {
            resolve();
          });

        } else {
          reject(new Error('Unknown object type "' + next.type + '" when downloading objects.'));
        }
      })
      .then(function() {
        $rootScope.$emit('loading.decr');
        if (queue.length) {
          return downloadNext();
        }
      });
    }

    return downloadNext()
    .then(function() {
      $rootScope.$apply(function() {
        var finishMsg = gettext("Documents finished downloading.");
        $rootScope.$emit('flash', finishMsg);
        $rootScope.$emit('loading.flush');
      });
    })
    .catch(function(err) {
      $rootScope.$apply(function() {
        $rootScope.$emit('loading.flush');
      });
      console.error(err);
    });
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
    var openReq = window.indexedDB.open('kitsune', 1);
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
        .openCursor(window.IDBKeyRange.bound(objectType, objectType + '\uffff'))
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
  };

  this.fuzzySearchObjects = function(partialKey) {
    return dbPromise
    .then(function(db) {
      var transaction = db.transaction('objects');
      var results = [];
      return new Promise(function(resolve, reject) {
        var req = transaction.objectStore('objects')
          .openCursor(window.IDBKeyRange.bound(partialKey, partialKey + '\uffff'));
        req.onsuccess = function (ev) {
          var cursor = ev.target.result;
          // Check to make sure the cursor isn't null.
          if (cursor) {
            results.push(cursor.value);
            cursor.continue();
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

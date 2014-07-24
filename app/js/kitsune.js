'use strict';

var yaocho = angular.module('yaocho');

// yaocho.value('kitsuneBase', 'http://kitsune');
yaocho.value('kitsuneBase', 'https://support.mozilla.org/');
// yaocho.value('kitsuneBase', 'http://mythmon-kitsune.ngrok.com');
// yaocho.value('kitsuneBase', 'https://support.allizom.org');


yaocho.directive('wikiImage', ['$rootScope', 'kitsuneBase', 'KStorage', 'safeApply', 'downloadImageAsBlob',
function($rootScope, kitsuneBase, KStorage, safeApply, downloadImageAsBlob) {
  return {
    restrict: 'C',
    link: function(scope, element, attrs) {
      var originalSrc = attrs.originalSrc;
      var path = originalSrc;
      // Check if the url has a host, and if so, strip it off.
      // In particular, check if there are double slashes near the beginning,
      // and another slash later.
      var match = path.match(/[^\/\/]*\/\/[^\/]+\/(.*)/);
      if (match) {
        path = match[1];
      }

      var key = 'image:' + path;
      KStorage.getObject(key)
      .catch(function() {
        var p = downloadImageAsBlob(kitsuneBase + path)
        p.then(KStorage.putObject.bind(KStorage, key));
        return p;
      })
      .then(function(imageData) {
        element.attr('src', URL.createObjectURL(imageData));
      })
      .catch(function(err) {
        console.error('wikiImage error', 'key=' + key, err);
      });
    },
  };
}]);


// For now, this hard codes a set of showFor settings.
yaocho.value('showForSettings', {
  fx: {
    enabled: true,
    platform: 'win8',
    version: {
      min: 29,
      max: 30,
      slug: 'fx29',
    },
  },
  fxos: {
    enabled: true,
    platform: 'web',
    version: {
      min: 1.3,
      max: 1.4,
      slug: 'fxos1.3',
    },
  },
});


yaocho.directive('for', ['showForSettings',
function(showForSettings) {
  var allPlatforms = ['win', 'winxp', 'win7', 'win8', 'mac', 'linux', 'web'];
  var allBrowsers = ['fx', 'fxos', 'm'];

  var enabledPlatforms = {};
  var key;

  for (key in showForSettings) {
    enabledPlatforms[showForSettings[key].platform] = true;
  }

  // Check a showfor spec. If any browsers are mentioned, at least
  function shouldShow(spec) {
    var not = false;
    if (spec.slice(0, 4) === 'not ') {
      not = true;
      spec = spec.slice(4);
    }
    var browserFound = false, browserMatch = false;
    var platformFound = false, platformMatch = false;
    var parts = spec.split(',');

    parts.forEach(function(part) {
      if (allPlatforms.indexOf(part) >= 0) {
        platformFound = true;
        if (part == 'win') {
          platformMatch = platformMatch || !!enabledPlatforms['win'] ||
                          !!enabledPlatforms['winxp'] ||
                          !!enabledPlatforms['win7'] ||
                          !!enabledPlatforms['win8'];
        } else {
          platformMatch = platformMatch || !!enabledPlatforms[part];
        }

      } else {
        var regexMatch = /^(=|>=)([^\d]+)([\d\.]*)$/.exec(part);
        if (regexMatch && showForSettings[regexMatch[2]]) {
          browserFound = true;
          var op = regexMatch[1]
          var browserCode = regexMatch[2];
          var version = parseFloat(regexMatch[3]);

          var settings = showForSettings[browserCode];
          if (settings.enabled) {

            if ((op === '>=' || op == '') && settings.version.min <= version) {
              browserMatch = true;
            } else if (op === '=' && settings.version.min <= version && settings.version.max > version) {
              browserMatch = true;
            }
            if (op !== '>=' && op !== '=') {
              console.warn('Unknown showfor op:', op);
            }
          }
        }
      }
    });

    /* This implements the right logic of:
     * If any browsers are found, they must all match.
     * If any platform is found, they must all match.
     * If nothing is found, it will be shown.
     */
    var match = (browserMatch && !platformFound) ||
                (platformMatch && !browserFound) ||
                (platformMatch && browserMatch) ||
                (!platformFound && !browserFound);
    // This inverts the match iff `not` is true.
    return match !== not;
  }

  return {
    restrict: 'C',
    link: function(scope, element, attrs) {
      if (!shouldShow(element.attr('data-for'))) {
        element.css('display', 'none');
      }
    },
  };
}]);


yaocho.factory('KitsuneRestangular', ['Restangular', 'kitsuneBase',
function(Restangular, kitsuneBase) {
  return Restangular.withConfig(function(rc) {
    rc.setBaseUrl(kitsuneBase + '/api/1');

    // Deal with Django Rest Framework list responses.
    rc.addResponseInterceptor(function(data, operation, what, url, response, deferred) {
      var extractedData;
      if (operation === "getList" && data.results) {
        extractedData = data.results;
        extractedData.meta = {
          count: data.count,
          next: data.next,
          previous: data.previous,
        };
      } else {
        extractedData = data;
      }
      return extractedData;
    });
  });
}]);


yaocho.service('Kitsune', ['KitsuneRestangular',
function(KitsuneRestangular) {
  this.documents = {
    all: function(opts) {
      opts = opts || {};
      return KitsuneRestangular.all('kb/').getList(opts);
    },
    get: function(slug) {
      return KitsuneRestangular.one('kb', slug).get();
    }
  };

  this.topics = {
    all: function(product) {
      return KitsuneRestangular.all('products').one(product, 'topics').getList();
    },
    one: function(product, topic) {
      return KitsuneRestangular.one('products', product).one('topic', topic).get();
    },
  };
}]);


yaocho.service('KitsuneCorpus', ['$rootScope', 'Kitsune', 'KStorage', 'safeApply',
function($rootScope, Kitsune, KStorage, safeApply) {
  var topicKeys = ['id', 'slug', 'title', 'parent', 'product'];
  var documentKeys = ['id', 'slug', 'title', 'locale', 'products', 'topics'];

  function update(obj1, obj2) {
    safeApply(function() {
      for (var key in obj2) {
        if (key.indexOf('$') === 0) continue;
        if (!obj2.hasOwnProperty(key)) continue;
        obj1[key] = obj2[key];
      }
    })
  }

  this.getTopic = function(topicSlug) {
    var product = $rootScope.settings.product.slug;
    var topic = {
      title: null,
      slug: topicSlug,
      product: product,
      parent: null,
      description: null,
    };
    var topicKeys = _.keys(topic);
    var found = false;

    if (['/', undefined, ''].indexOf(topicSlug) !== -1) {
      topic.slug = '/';
      topic.title = gettext('All Topics');
    } else {
      var key = 'topic:' + product + '/' + topicSlug;
      KStorage.getObject(key, ['title'])
      .catch(function() {
        var p = Kitsune.topics.one(product, topicSlug)
        p.then(function(val) {
          KStorage.putObject(key, _.pick(topic, topicKeys));
        });
        return p;
      })
      .then(function(val) {
        update(topic, val);
      })
      .catch(function(err) {
        console.error('getTopic error', 'key=' + key, err);
      });
    }

    return topic;
  };

  function updateCacheAllTopics(allTopics) {
    var parentSubtopicMap = {};
    var promises = [];
    var keys = [];

    allTopics.forEach(function(topic) {
      parentSubtopicMap[topic.parent] = [];
      parentSubtopicMap[topic.slug] = [];
    });

    allTopics.forEach(function(topic) {
      parentSubtopicMap[topic.parent].push(topic);
      var key = 'topic:' + topic.product + '/' + topic.slug;
      keys.push(key);
      promises.push(KStorage.putObject(key, _.pick(topic, topicKeys)));
    });

    for (var key in parentSubtopicMap) {
      var subtopics = parentSubtopicMap[key];
      if (key === null) {
        key = '/';
      }
      var key = 'subtopics:' + key;
      var keys = subtopics.map(function(st) {
        return 'topic:' + st.product + '/' + st.slug;
      });
      promises.push(KStorage.putSet(key, keys));
    }

    return Promise.all(promises);
  }

  function updateCacheDocs(key, docs) {
    var promises = [];
    var keys = [];

    docs.forEach(function(doc) {
      var key = 'document:' + doc.slug;
      keys.push(key);
      promises.push(KStorage.putObject(key, _.pick(doc, documentKeys)));
    });

    promises.push(KStorage.putSet(key, keys));

    return Promise.all(promises);
  }

  this.getSubTopics = function(parent) {
    parent = parent || null;
    var product = $rootScope.settings.product.slug;
    var subtopics = [];
    var found = false;

    function addSubtopics(newSubtopics) {
      safeApply(function() {
        newSubtopics.forEach(function(subtopic) {
          subtopics.push(subtopic);
        })
      })
    }

    var key = 'subtopics:' + parent;
    KStorage.getSet(key)
    .catch(function() {
      var p = Kitsune.topics.all(product);
      p.then(updateCacheAllTopics);
      return p;
    })
    .then(function(val) {
      addSubtopics(val.filter(function(topic) { return topic.parent === parent; }));
    })
    .catch(function(err) {
      console.error('getSubTopics error', 'key=' + key, err);
    })

    return subtopics;
  };

  this.getTopicDocs = function(slug) {
    if (!slug) {
      return [];
    }
    var docs = [];
    var found = false;

    function addDocs(newDocs) {
      safeApply(function() {
        newDocs.forEach(function(doc) {
          docs.push(doc);
        });
      });
    }

    var key = 'documents:' + slug;
    KStorage.getSet(key)
    .catch(function() {
      var p = Kitsune.documents.all({
        product: $rootScope.settings.product.slug,
        topic: slug,
      });
      p.then(updateCacheDocs.bind(null, key));
      return p
    })
    .then(function(val) {
      addDocs(val);
    })
    .catch(function(err) {
      console.error('getTopicDocs error', 'key=' + key, err);
    });

    return docs;
  };

  this.getDoc = function(slug) {
    var doc = {
      title: null,
      slug: slug,
      html: null,
      products: [],
      topics: [],
      locale: $rootScope.settings.locale,
    };
    var docKeys = _.keys(doc);

    var key = 'documents:' + slug;
    KStorage.getObject(key, ['title', 'html'])
    .catch(function(err) {
      var p = Kitsune.documents.get(slug);
      p.then(function(val) {
        KStorage.putObject(key, _.pick(val, docKeys));
      });
      return p;
    })
    .then(function(val) {
      update(doc, val);
    });

    return doc;
  };
}]);

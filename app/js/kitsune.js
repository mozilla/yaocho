'use strict';

var yaocho = angular.module('yaocho');

yaocho.value('kitsuneApiBase', 'http://kitsune/api');
// yaocho.value('kitsuneApiBase', 'http://mythmon-kitsune.ngrok.com/api');


yaocho.directive('wikiImage', ['$rootScope', 'kitsuneBase',
function($rootScope, kitsuneBase) {
  return {
    restrict: 'C',
    link: function(scope, element, attrs) {
      var originalSrc = attrs.originalSrc;
      var path = originalSrc.replace('//support.cdn.mozilla.net', kitsuneBase);
      var path = originalSrc.replace('//support.cdn.mozilla.net', 'https://support.mozilla.org');
      element.attr('src', path);
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
    rc.setBaseUrl(kitsuneBase + '/api');

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
      return KitsuneRestangular.one('products', 'topics', product, topic).get();
    },
  };
}]);


yaocho.service('CachedKitsune', ['Kitsune', '$localForage',
function(Kitsune, $localForage) {
  this.documents = {
    all: function(opts) {
      var key = 'documents.all(' + JSON.stringify(opts) + ')';
      return cachedCall(key, Kitsune, Kitsune.documents.all, [opts]);
    },
    get: function(slug) {
      var key = 'documents.one(' + slug + ')';
      return cachedCall(key, Kitsune, Kitsune.documents.get, [slug]);
    }
  };

  this.topics = {
    all: function(product) {
      var key = 'topics.all(' + product + ')';
      return cachedCall(key, Kitsune, Kitsune.topics.all, [product]);
    },
    one: function(product, topic) {
      var key = 'topics.one(' + product + ',' + topic + ')';
      return cachedCall(key, Kitsune, Kitsune.topics.one, [product, topic]);
    },
  };
}]);

yaocho.service('KitsuneCorpus', ['$rootScope', 'Kitsune', 'KStorage', 'safeApply',
function($rootScope, Kitsune, KStorage, safeApply) {

  function update(obj1, obj2) {
    safeApply(function() {
      for (var key in obj2) {
        if (key.indexOf('$') === 0) continue;
        if (!obj2.hasOwnProperty(key)) continue;
        obj1[key] = obj2[key];
      }
    })
  }

  this.getTopic = function(product, topic) {
    if (topic === undefined) {
      var key = 'topics:' + product;
      return KStorage.getObject(key)
      .catch(function cacheMiss() {
        return Kitsune.topics.all(product)
        .then(function(value) {
          KStorage.putObject({key: key, value: value});
          return obj;
        });
      });
    } else {
      var key = 'topics:' + product + '/' + topic
      return KStorage.getObject(key)
      .catch(function cacheMiss() {
        return Kitsune.topics.one(product, topic)
        .then(function(value) {
          KStorage.putObject({key: key, value: value});
          return value;
        })
      })
    }
  };

  this.getDoc = function(slug) {
    var doc = {
      title: null,
      slug: slug,
      body: null,
    };

    var key = 'documents:' + slug;
    KStorage.getObject(key)
    .then(
      function cacheHit(val) {
        update(doc, val);
      },
      function cacheMiss() {
        // supress reject;
      })
    .then(function() {
      if (doc.title === null || doc.html === null) {
        console.log('checking the network');
        return Kitsune.documents.get(slug)
      }
    })
    .then(function(val) {
      if (val) {
        update(doc, val);
        return KStorage.putObject({key: key, value: {
          title: doc.title,
          slug: doc.slug,
          html: doc.html,
          products: doc.products,
          topics: doc.topics,
          locale: doc.locale,
        }});
      }
    })
    .catch(function(err) {
      console.log('AHHHHH', err);
    });

    return doc;
  }
}]);

'use strict';

var yaocho = angular.module('yaocho');

yaocho.value('kitsuneApiBase', 'http://kitsune/api');


yaocho.directive('wikiImage', ['$rootScope',
function($rootScope) {
  return {
    restrict: 'C',
    link: function(scope, element, attrs) {
      var originalSrc = attrs.originalSrc;
      var path = originalSrc.replace('//support.cdn.mozilla.net', '');
      var workingPath = 'https://support.mozilla.org' + path;
      element.attr('src', workingPath);
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
      console.log('checking', part);
      if (allPlatforms.indexOf(part) >= 0) {
        console.log('platform');
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
        var match = /^(\w+)\d.*$/.exec(part);
        if (match && showForSettings[match[1]]) {
          browserFound = true;
          var code = match[1];
          var version = parseFloat(match[2]);

          var settings = showForSettings[code];
          if (settings.enabled &&
              settings.version.min <= version &&
              settings.version.max > version) {
            browserMatch = true;
          }
        }
      }
    });

    var match = (browserMatch && !platformFound) ||
                (platformMatch && !browserFound) ||
                (platformMatch && browserMatch);
    console.log(spec, "bm:", browserMatch, "bf:", browserFound,
                "pm:", platformMatch, "pf:", platformFound,
                "not:", not, "result:", match !== not);
    return match !== not;
  }

  return {
    restrict: 'C',
    link: function(scope, element, attrs) {
      if (!shouldShow(element.attr('data-for'))) {
        element.css('display', 'none');
        console.log('hiding', element);
      } else {
        console.log('showing', element);
      }
    },
  };
}]);


yaocho.factory('KitsuneRestangular', ['Restangular', 'kitsuneApiBase',
function(Restangular, kitsuneApiBase) {
  return Restangular.withConfig(function(rc) {
    rc.setBaseUrl(kitsuneApiBase);

    // Deal with Django Rest Framework list responses.
    rc.addResponseInterceptor(function(data, operation, what, url, response, deferred) {
      var extractedData;
      if (operation === "getList") {
        extractedData = data.resules;
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
    all: function() {
      return KitsuneRestangular.all('kb/documents').getList();
    },
    get: function(slug) {
      return KitsuneRestangular.one('kb/documents', slug).get();
    }
  };
}]);

yaocho.service('CachedKitsune', ['Kitsune', '$localForage',
function(Kitsune, $localForage) {
  function cachedCall(key, _this, func, args) {
    return $localForage.getItem(key)
    .then(function(data) {
      if (data === null) {
        var p = func.apply(_this, args);
        p.then(function(data) {
          $localForage.setItem(key, data);
        });
        return p;
      } else {
        return Promise.resolve(data);      }
    });
  }

  this.documents = {
    all: function() {
      var key = 'documents.all';
      return cachedCall(key, Kitsune, Kitsune.documents.all, []);
    },
    get: function(slug) {
      var key = 'documents.one(' + slug + ')';
      return cachedCall(key, Kitsune, Kitsune.documents.get, [slug]);
    }
  };
}]);

'use strict';

var yaocho = angular.module('yaocho');

yaocho.value('kitsuneApiBase', 'http://kitsune/api');

yaocho.factory('Kitsune', ['Restangular', 'kitsuneApiBase',
function(Restangular, kitsuneApiBase) {
  return Restangular.withConfig(function(rc) {
    rc.setBaseUrl(kitsuneApiBase);

    // Deal with Django Rest Framework list responses.
    rc.addResponseInterceptor(function(data, operation, what, url, response, deferred) {
      var extractedData;
      if (operation === "getList") {
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

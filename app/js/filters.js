'use strict';

var yaocho = angular.module('myApp.filters', []);

yaocho.filter('interpolate', ['version', function(version) {
  return function(text) {
    return String(text).replace(/\%VERSION\%/mg, version);
  };
}]);

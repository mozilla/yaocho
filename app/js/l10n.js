'use strict';

var yaocho = angular.module('yaocho');

yaocho.directive('l10n', ['$compile', 'L10nService',
function($compile, L10nService) {
  return {
    restrict: 'EA',
    link: function(scope, element, attrs) {
      var original = element.html();
      var translated = _(original);
      element.html(translated);
      $compile(element.contents())(scope);
    },
  };
}]);

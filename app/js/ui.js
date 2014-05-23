'use strict';

var yaocho = angular.module('yaocho');

yaocho.controller('MenuCtrl', ['$scope', '$rootScope',
function($scope, $rootScope) {
  $scope.title = "Yaocho";

  $scope.back = function() {
    window.history.back();
  };

  $scope.scrollTop = function() {
  };

  $scope.menu = function() {
  };

  $rootScope.$on('title.change', function(ev, newTitle) {
    $scope.title = newTitle;
  });
}]);

'use strict';

var yaocho = angular.module('yaocho');

yaocho.controller('MenuCtrl', ['$scope', '$rootScope', '$location',
function($scope, $rootScope, $location) {
  var locationTrail = [];

  $scope.title = "Yaocho";

  $scope.back = function() {
    window.history.back();
  };

  $scope.backHidden = function() {
    return locationTrail.length < 2;
  }

  $rootScope.$on('title.change', function(ev, newTitle) {
    $scope.title = newTitle;
  });


  $rootScope.$on('$locationChangeSuccess', function(ev, newAddress, oldAddress) {
    // Strip off trailing /s
    console.log(newAddress, oldAddress);
    newAddress = newAddress.replace(/\/+$/, '');
    oldAddress = oldAddress.replace(/\/+$/, '');

    // This happens sometimes on initial page load.
    if (newAddress === oldAddress && newAddress === locationTrail.slice(-1)[0]) {
      return;
    }
    if (locationTrail.length < 2) {
      locationTrail.push(newAddress);
    } else {
      if (locationTrail.slice(-2)[0] === newAddress) {
        // Back was pressed.
        locationTrail.pop();
      } else {
        locationTrail.push(newAddress);
      }
    }
  });
}]);

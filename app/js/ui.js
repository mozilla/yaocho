'use strict';

var yaocho = angular.module('yaocho');

yaocho.controller('NavCtrl', ['$scope', '$rootScope', '$location',
function($scope, $rootScope, $location) {
  var locationTrail = [];

  $rootScope.ui = {
    backHidden: true,
    current: {
      title: "Mozilla Support",
    }
  };

  $scope.ui = $rootScope.ui;

  $scope.back = function() {
    window.history.back();
  };

  $scope.showMenu = function() {
    $rootScope.$emit('mainMenu.show');
  };

  $rootScope.$on('$locationChangeSuccess', function(ev) {
    $scope.ui.backHidden = false;
  });
}]);

yaocho.directive('alink', ['urlManager', '$location', 'safeApply',
function(urlManager, $location, safeApply) {
  return {
    restrict: 'A',
    link: function(scope, element, attrs){
      var params = {};
      angular.forEach(attrs, function(value, key){
        if(key !== 'view' && key !== 'text' && key !== 'class' && key.charAt(0) !== '$'){
          params[key] = value;
        }
      });
      element.on('click', function(ev) {
        ev.preventDefault();
        safeApply(function() {
          var url = urlManager.reverse(attrs.view, params);
          $location.url(url);
        });
      });
    }
  }
}]);

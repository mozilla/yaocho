'use strict';

var yaocho = angular.module('yaocho');

yaocho.controller('NavCtrl', ['$scope', '$rootScope',
function($scope, $rootScope) {
  var locationTrail = [];

  $rootScope.ui = {
    backHidden: true,
    current: {
      title: gettext('Mozilla Support'),
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

yaocho.controller('FlashCtrl', ['$scope', '$rootScope', '$timeout',
function($scope, $rootScope, $timeout) {
  $scope.messages = [];

  $rootScope.$on('flash', function(ev, message) {
    $scope.messages.push(message);
    $timeout(function() {
      var index = $scope.messages.indexOf(message);
      if (index >= 0) {
        $scope.messages.splice(index, 1);
      }
    }, 5000)
  })
}]);

yaocho.controller('LoadingCtrl', ['$scope', '$rootScope',
function($scope, $rootScope) {
  $scope.total = 0;
  $scope.loaded = 0;
  $scope.message = null;

  $rootScope.$on('loading.incr', function(ev, message) {
    if (message) {
      $scope.message = message;
    }
    $scope.total++;
  });

  $rootScope.$on('loading.decr', function(ev, count) {
    $scope.loaded++;
    if ($scope.loaded > $scope.total) {
      console.error('More things finished loading than started loading.');
    }
  });

  $rootScope.$on('loading.flush', function(ev) {
    if ($scope.loaded !== $scope.total) {
      console.error('Loading flush when not everything was loaded.');
    }
    $scope.total = 0;
    $scope.loaded = 0;
    $scope.message = null;
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

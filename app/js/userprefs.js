'use strict';

var yaocho = angular.module('yaocho');

yaocho.controller('SettingsCtrl', ['$scope', '$rootScope',
function($scope, $rootScope) {
  $rootScope.$emit('ui.title.change', 'Settings');

  // These also serve as the defaults.
  $scope.settings = {
    product: {
      slug: 'firefox-os',
      title: 'Firefox OS',
    },
    locale: 'en-US',
    browseMode: 'online',
  };

  function keyName(key) {
    return 'settings.' + key;
  }

  // XXX update this.
  // angular.forEach($scope.settings, function(value, key) {
  //   $localForage.getItem(keyName(key))
  //   .then(function(storedValue) {
  //     if (storedValue === null) {
  //       $localForage.setItem(keyName(key), value);
  //     } else {
  //       $scope.settings[key] = storedValue;
  //     }
  //   })
  // });

  $scope.$watch('settings', function(newValue) {
  });

  $rootScope.settings = $scope.settings;
}]);

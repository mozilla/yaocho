'use strict';

var yaocho = angular.module('yaocho');

yaocho.controller('DocumentListCtrl', ['$rootScope', '$scope', 'bindPromise', 'CachedKitsune',
function($rootScope, $scope, bindPromise, Kitsune) {
  bindPromise($scope, 'documents', Kitsune.documents.all());
  $rootScope.$emit('title.change', "All Document");
}]);

yaocho.controller('DocumentCtrl', ['$rootScope', '$scope', '$routeParams', 'bindPromise', 'CachedKitsune', 'safeApply',
function($rootScope, $scope, $routeParams, bindPromise, Kitsune, safeApply) {
  bindPromise($scope, 'document', Kitsune.documents.get($routeParams.slug))
  .then(function(doc) {
    safeApply(function() {
      $rootScope.$emit('title.change', doc.title);
    });
  });
}]);

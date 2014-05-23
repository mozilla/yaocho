'use strict';

var yaocho = angular.module('yaocho');

yaocho.controller('TopicListCtrl', ['$rootScope', '$scope', 'bindPromise', 'Kitsune', 'userprefs',
function($rootScope, $scope, bindPromise, Kitsune, userprefs) {
  $rootScope.$emit('title.change', userprefs.product.title + ' Support');
  bindPromise($scope, 'topics', Kitsune.topics.all(userprefs.product.slug));
}]);

yaocho.controller('DocumentListCtrl', ['$rootScope', '$scope', '$routeParams', 'bindPromise', 'Kitsune', 'userprefs',
function($rootScope, $scope, $routeParams, bindPromise, Kitsune, userprefs) {
  bindPromise($scope, 'documents', Kitsune.documents.all({
    product: userprefs.product.slug,
    topic: $routeParams.topic,
  }));
  $rootScope.$emit('title.change', "All Document");
}]);

yaocho.controller('DocumentCtrl', ['$rootScope', '$scope', '$routeParams', 'bindPromise', 'Kitsune', 'safeApply',
function($rootScope, $scope, $routeParams, bindPromise, Kitsune, safeApply) {
  bindPromise($scope, 'document', Kitsune.documents.get($routeParams.slug))
  .then(function(doc) {
    safeApply(function() {
      $rootScope.$emit('title.change', doc.title);
    });
  });
}]);

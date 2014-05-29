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

yaocho.controller('TopicBrowserCtrl', ['$rootScope', '$scope', '$routeParams', 'bindPromise', 'Kitsune', 'userprefs',
function($rootScope, $scope, $routeParams, bindPromise, Kitsune, userprefs) {
  var topicPath = $routeParams.topic || '';
  $scope.topics = [];
  $scope.documents = [];
  $scope.topicPath = topicPath;

  var topicSlug;
  if (topicPath === '') {
    topicSlug = null;
  } else {
    topicSlug = topicPath.split('/').slice(-1)[0];
  }

  if (topicSlug !== null) {
    bindPromise($scope, 'documents',  Kitsune.documents.all({
      product: userprefs.product.slug,
      topic: topicSlug,
    }));
  }

  Kitsune.topics.all(userprefs.product.slug)
  .then(function(topics) {
    var topTopic;
    if (topicPath === '') {
      $rootScope.$emit('title.change', 'All Topics');
      $scope.topics = topics.filter(function(topic) {
        return topic.parent === null;
      });
      topTopic = {slug: ''};
    } else {
      var path = userprefs.product.slug + '/' + topicPath;
      topTopic = topics.filter(function(topic) { return topic.path = path; })[0];
      $rootScope.$emit('title.change', topTopic.title);
      $scope.topics = topics.filter(function(topic) { return topic.parent === topTopic.slug; });
    }
    return topTopic;
  });

}]);

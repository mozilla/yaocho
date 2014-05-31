describe('controllers', function(){
  beforeEach(module('yaocho'));
  beforeEach(module('yaocho.mocks'));

  var scope;

  beforeEach(inject(function($rootScope, $controller) {
    scope = $rootScope.$new();
    $controller('SettingsCtrl', {
      $scope: $rootScope.$new(),
    });
  }));

  describe('TopicBrowser', function() {
    function makeController($routeParams) {
      inject(function($controller, MockKitsune) {
        $controller('TopicBrowserCtrl', {
          $scope: scope,
          Kitsune: MockKitsune,
          $routeParams: $routeParams,
        });
      });
    }

    it('should show top level topics when no topic given.', function() {
      // setup
      makeController({topic: ''});
      // test
      expect(scope.topics)
        .to.exist
        .to.have.length(1);
      expect(scope.topics[0].slug).to.equal('topic1');
    });

    it('should show subtopics when a topic is given.', function() {
      // setup
      makeController({topic: 'topic1'});
      // test
      expect(scope.topics)
        .to.exist
        .to.have.length(2);
      expect(scope.topics[0].slug).to.equal('topic1-1');
      expect(scope.topics[1].slug).to.equal('topic1-2');
    });

    it('should show documents in the current topic', function() {
      // setup
      makeController({topic: 'topic1'});
      // test
      expect(scope.documents)
        .to.exist
        .to.have.length(2);
      expect(scope.documents.map(function(d) { return d.slug; }))
        .to.have.length(2)
        .to.have.members(['topic1-doc1', 'topic1-doc2']);
    });

    it('should set a useful topicPath', function() {
      // setup
      makeController({topic: 'topic1/topic1-1'});
      // test
      expect(scope.topicPath)
        .to.exist
        .to.equal("topic1/topic1-1");
    });
  });
});

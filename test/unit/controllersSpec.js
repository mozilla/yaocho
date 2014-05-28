'use strict';

/* jasmine specs for controllers go here */

describe('controllers', function(){
  beforeEach(module('yaocho'));
  beforeEach(module('yaocho.mocks'));

  describe('TopicBrowser', function() {
    it('should show top level topics when no topic given.', inject(function($controller, MockKitsune) {
      var ctrl = $controller('TopicBrowserCtrl', {
        $scope: {},
        Kitsune: MockKitsune,
      });
    }));
  });
});

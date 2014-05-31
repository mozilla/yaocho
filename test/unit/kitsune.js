describe('kitsune', function() {
  beforeEach(module('yaocho'));
  beforeEach(module('yaocho.mocks'));

  describe('for', function() {
    var scope;
    var $compile;

    beforeEach(inject(function($rootScope, _$compile_) {
      scope = $rootScope.$new();
      $compile = _$compile_;
    }));

    function makeElement(showFor) {
      var contents = '<span class="for" data-for="' + showFor + '"></span>';
      var element = $compile(contents)(scope);
      scope.$digest();
      return element;
    }

    function expectHidden(showFor) {
      return function() {
        expect(makeElement(showFor).css('display'))
          .to.equal('none', 'Expected {for ' + showFor + '} to be hidden');
      };
    }

    function expectShown(showFor) {
      return function() {
        expect(makeElement(showFor).css('display'))
          .to.equal('', 'Expected {for ' + showFor + '} to be shown');
      };
    }

    it('should hide =fxos1.1', expectHidden('=fxos1.1'));
    it('fxos1.1 should mean >=', expectShown('fxos1.1'));
    it('should show FxOS 1.3', expectShown('fxos1.3'));
    it('should show windows', expectShown('win'));

    it('should do the opposite when "not" is used', function() {
      expectShown('not =fxos1.1')();
      expectHidden('not fxos1.1')();
      expectHidden('not fxos1.3')();
      expectHidden('not win')();
    });
  });
});

define(['Controls/_list/ScrollController'], function(ScrollControllerLib) {
   const ScrollController = ScrollControllerLib.default;
   describe('Controls.List.Container', function() {
      let scrollController;
      beforeEach(() => {
         scrollController = new ScrollController({});
      });

      describe('.update()', () => {
         it('should update active element', () => {
            let activeElement = {};
            scrollController.update({
               activeElement: activeElement
            });
            assert.equal(activeElement, scrollController._options.activeElement);
         });
      });

      describe('._registerObserver()', () => {
         it('should do nothing if trigers was undefined', () => {
            scrollController._triggers = undefined;
            scrollController._observerRegistered = true;

            assert.doesNotThrow(() => scrollController._registerObserver());
         });
      });
   });
});

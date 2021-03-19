define(
   [
      'Env/Env',
      'Controls/_scroll/Container'
   ],
   function(Env, ScrollContainer) {
      'use strict';

      describe('Controls.Container.Scroll', function() {
         var scroll;
         beforeEach(function() {
            scroll = new ScrollContainer.default(ScrollContainer.default.getDefaultOptions());
            scroll._options = ScrollContainer.default.getDefaultOptions();
         });

         describe('_shadowVisible', function() {
            let sandbox = sinon.createSandbox();
            beforeEach(function() {
               scroll._scrollModel = {
                  clone: () => {
                     return 0;
                  },
                  updateState: () => {
                     return true;
                  }
               };
               scroll._scrollbars = {
                  updateScrollState: sinon.stub().returns(true)
               };
               scroll._stickyHeaderController = {
                  setCanScroll: sinon.stub().returns({ then: () => undefined }),
                  setShadowVisibility: sinon.stub().returns({ then: () => undefined }),

                  resizeHandler: () => undefined
               };
               sinon.stub(scroll, '_updateScrollContainerPaigingSccClass');
            });
            afterEach(function () {
               sandbox.restore();
            })
            it('should call updateScrollState on shadows if _isOptimizeShadowEnabled = false', function() {
               scroll._isOptimizeShadowEnabled = false;
               let updateScrollStateCalled = false;
               scroll._shadows = {
                  updateScrollState() {
                     updateScrollStateCalled = true;
                  },
                  top: {
                     isStickyHeadersShadowsEnabled: sinon.stub().returns({ then: () => undefined })
                  },
                  bottom: {
                     isStickyHeadersShadowsEnabled: sinon.stub().returns({ then: () => undefined })
                  }
               };
               scroll._updateState({scrollTop: 555});
               assert.isTrue(updateScrollStateCalled);
            });
         });
      });
   }
);

define(
   [
      'Controls/_scroll/Scroll/Scrollbar',
      'Core/core-merge'
   ],
   function (Scrollbar, coreMerge) {

      'use strict';

      let createComponent = function (Component, cfg) {
         let cmp;
         if (Component.getDefaultOptions) {
            cfg = coreMerge(cfg, Component.getDefaultOptions(), {preferSource: true});
         }
         cmp = new Component(cfg);
         cmp.saveOptions(cfg);
         cmp._beforeMount(cfg);
         return cmp;
      };

      describe('Controls._scroll:Scrollbar', function () {
         var result;

         it('_getThumbCoordByScroll', function () {
            var component = createComponent(Scrollbar.default, {contentSize: 1000});
            result = component._getThumbCoordByScroll(100, 10, 400);
            assert.equal(40, result);

            result = component._getThumbCoordByScroll(100, 10, 0);
            assert.equal(0, result);
         });

         it('_getCurrentCoords', function () {
            var component = createComponent(Scrollbar.default, {contentSize: 1000});
            component._children = {
               scrollbar: {
                  getBoundingClientRect: function () {
                     return {
                        top: 10,
                        left: 20,
                        width: 200,
                        height: 100
                     };
                  }
               }
            };
            result = component._getCurrentCoords('horizontal');
            assert.equal(result.offset, 20);
            assert.equal(result.size, 200);

            result = component._getCurrentCoords('vertical');
            assert.equal(result.offset, 10);
            assert.equal(result.size, 100);
         });

         it('_getScrollCoordByThumb', function () {
            var component = createComponent(Scrollbar.default, {contentSize: 1000});
            result = component._getScrollCoordByThumb(100, 10, 40);
            assert.equal(400, result);

            result = component._getScrollCoordByThumb(100, 10, 0);
            assert.equal(0, result);
         });

         it('_setPosition', function () {
            var component = createComponent(Scrollbar.default, {contentSize: 1000});
            result = component._setPosition(100);
            assert.isTrue(result);

            result = component._setPosition(100);
            assert.isFalse(result);
         });

         it('_scrollbarMouseDownHandler', function () {
            var component = createComponent(Scrollbar.default, {contentSize: 1000});
            result = component._setPosition(100);
            assert.isTrue(result);

            result = component._setPosition(100);
            assert.isFalse(result);
         });

         it('calcViewportRatio', function () {
            result = Scrollbar.default._calcViewportRatio(100, 200);
            assert.equal(result, 0.5);
         });

         it('calcWheelDelta', function () {
            result = Scrollbar.default._calcWheelDelta(false, 80);
            assert.equal(result, 80);

            result = Scrollbar.default._calcWheelDelta(true, 80);
            assert.equal(result, 100);
         });

         it('getDefaultOptions', function () {
            result = Scrollbar.default.getDefaultOptions();
            assert.deepEqual(result, {
               position: 0,
               direction: 'vertical'
            });
         });

         describe('_afterUpdate', function () {
            it('Should update scroll position', function () {
               let
                  sandbox = sinon.sandbox.create(),
                  component = createComponent(Scrollbar.default, {contentSize: 100, position: 0});
               component._children.scrollbar = {
                  offsetHeight: 50,
                  clientHeight: 50
               };
               sandbox.stub(component, '_setSizes');
               sandbox.stub(component, '_setPosition');
               component._afterUpdate({contentSize: 200, position: 10});
               sinon.assert.called(component._setPosition);
               sandbox.restore();
            });

         });
      });
   }
);

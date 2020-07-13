define([
   'Env/Env',
   'Controls/_scroll/StickyHeader/_StickyHeader',
   'Controls/_scroll/StickyHeader/Utils',
   'Controls/_scroll/StickyHeader/FastUpdate',
   'Controls/scroll',
   'Core/core-merge'
], function(
   EnvLib,
   StickyHeaderLib,
   StickyHeaderUtils,
   FastUpdateLib,
   scroll,
   coreMerge
) {

   'use strict';

   const StickyHeader = StickyHeaderLib.default;
   const FastUpdate = FastUpdateLib.default;

   const
      createComponent = function(Component, cfg) {
         let mv;
         if (Component.getDefaultOptions) {
            cfg = coreMerge(cfg, Component.getDefaultOptions(), {preferSource: true});
         }
         mv = new Component(cfg);
         mv.saveOptions(cfg);
         mv._beforeMount(cfg);
         return mv;
      },
      options = {
      };

   describe('Controls/_scroll/StickyHeader/_StickyHeader', function() {
      describe('Initialisation', function() {
         it('should set correct header id', function() {
            const component = createComponent(StickyHeader, options);
            const component2 = createComponent(StickyHeader, options);
            assert.strictEqual(component._index, component2._index - 1);
         });

         // it('should not create a observer if the control was created invisible, and must create after it has become visible', function () {
         //    const component = createComponent(StickyHeader, options);
         //    component._container = {
         //       closest: () => true
         //    };
         //    sinon.stub(component, '_createObserver');
         //    component._canScroll = true;
         //    component._afterMount(coreMerge(options, StickyHeader.getDefaultOptions(), {preferSource: true}));
         //    component._onScrollStateChanged('canScroll');
         //    assert.isUndefined(component._observer);
         //    component._container.closest = () => false;
         //    component._resizeHandler();
         //    sinon.assert.called(component._createObserver);
         //    sinon.restore();
         // });
         //
         // it('should create observer if scroll is appears', function () {
         //    const component = createComponent(StickyHeader, options);
         //    component._container = {
         //       closest: () => false
         //    };
         //    sinon.stub(component, '_createObserver');
         //    component._afterMount(coreMerge(options, StickyHeader.getDefaultOptions(), {preferSource: true}));
         //    assert.isUndefined(component._observer);
         //    component._onScrollStateChanged('canScroll');
         //    sinon.assert.called(component._createObserver);
         //    sinon.restore();
         // });

         // it('should not create a observer if there is no scroll, and must create scroll is appears', function () {
         //    const component = createComponent(StickyHeader, options);
         //    component._container = {
         //       closest: () => false
         //    };
         //    sinon.stub(component, '_createObserver');
         //    component._afterMount(coreMerge(options, StickyHeader.getDefaultOptions(), {preferSource: true}));
         //    assert.isUndefined(component._observer);
         //    component._onScrollStateChanged('cantScroll');
         //    sinon.assert.notCalled(component._createObserver);
         //    component._onScrollStateChanged('canScroll');
         //    sinon.assert.called(component._createObserver);
         //    sinon.restore();
         // });
      });

      describe('_beforeUnmount', function() {
         it('should destroy all inner objects', function() {
            const
               sandbox = sinon.createSandbox(),
               component = createComponent(StickyHeader, options);

            component._container = {
               closest: () => false
            };
            component._model = {
               destroy: sinon.fake()
            };
            component._observer = {
               disconnect: sinon.fake()
            };

            component._beforeUnmount();
            assert.isUndefined(component._observeHandler);
            assert.isUndefined(component._observer);
            sandbox.restore();
         });
      });

      describe('_onScrollStateChangedOld', function() {
         it('canScroll', function () {
            const component = createComponent(StickyHeader, {});
            sinon.stub(component, '_forceUpdate');
            component._model = {
               fixedPosition: 'top'
            };
            component._onScrollStateChangedOld('canScroll');
            assert.isTrue(component._canScroll);
            sinon.assert.called(component._forceUpdate);
         });

         it('cantScroll', function () {
            const component = createComponent(StickyHeader, {});
            component._onScrollStateChangedOld('cantScroll');
            assert.isFalse(component._canScroll);
         });
      });

      describe('_observeHandler', function() {
         it('should not update state if control is hidden', function() {
            const component = createComponent(StickyHeader, {});
            var sandbox = sinon.createSandbox();
            component._container = {
               closest: sandbox.stub().returns(true)
            };
            sandbox.stub(component, '_createObserver');
            sandbox.stub(StickyHeaderUtils, 'isHidden').returns(true);
            component._afterMount(coreMerge(options, StickyHeader.getDefaultOptions(), {preferSource: true}));
            sandbox.stub(component._model, 'update');

            component._observeHandler();

            sandbox.assert.notCalled(component._model.update);
            sandbox.restore();
         });
      });

      describe('_getStyle', function() {
         var sandbox;
         beforeEach(function() {
            sandbox = sinon.createSandbox();
         });

         afterEach(function() {
            sandbox.restore();
            sandbox = null;
         });

         it('should set correct z-index', function() {
            const component = createComponent(StickyHeader, {fixedZIndex: 2});
            component._context = {
               stickyHeader: { top: 0, bottom: 0 }
            };

            component._model = { fixedPosition: 'top' };
            assert.include(component._getStyle(), 'z-index: 2;');

            component._model = { fixedPosition: 'bottom' };
            assert.include(component._getStyle(), 'z-index: 2;');
         });

         it('should return correct top.', function() {
            const component = createComponent(StickyHeader, {fixedZIndex: 2, position: 'topbottom'});
            component._stickyHeadersHeight = {
               top: 10,
               bottom: 20
            };

            component._model = { fixedPosition: 'top' };
            assert.include(component._getStyle(), 'top: 10px;');

            component._model = { fixedPosition: 'bottom' };
            assert.include(component._getStyle(), 'bottom: 20px;');
         });

         it('should return correct min-height.', function() {
            const
               component = createComponent(StickyHeader, { fixedZIndex: 2, position: 'topbottom' });
            sandbox.replace(component, '_getComputedStyle', function() {
               return { boxSizing: 'border-box', minHeight: '30px' };
            });
            component._context = {
               stickyHeader: { top: 2}
            };
            component._stickyHeadersHeight = {
               top: 10
            };
            sandbox.stub(StickyHeaderUtils, 'getGapFixSize').returns(1);

            component._model = { fixedPosition: 'top' };
            component._container = { style: { paddingTop: '' } };

            assert.include(component._getStyle(), 'min-height:31px;');
            component._minHeight = 40;
            component._container.style.minHeight = 40;
            assert.include(component._getStyle(), 'min-height:40px;');
         });

         it('should return correct styles for Android.', function() {
            const
               component = createComponent(StickyHeader, { fixedZIndex: 2, position: 'top' });
            let style;
            sandbox.replace(component, '_getComputedStyle', function() {
               return { boxSizing: 'border-box', minHeight: '30px', paddingTop: '1px' };
            });
            component._stickyHeadersHeight = {
               top: 10
            };
            sandbox.stub(StickyHeaderUtils, 'getGapFixSize').returns(3);

            component._model = { fixedPosition: 'top' };
            component._container = { style: { paddingTop: '' } };
            style = component._getStyle();
            assert.include(style, 'min-height:33px;');
            assert.include(style, 'top: 7px;');
            assert.include(style, 'margin-top: -3px;');
            assert.include(style, 'padding-top:4px;');
         });

         it('should return correct shadow styles for iOS.', function() {
            const component = createComponent(StickyHeader, {});
            component._isSafari13 = true;
            sandbox.stub(component, '_getNormalizedContainer').returns({
               offsetWidth: 10,
               offsetHeight: 10
            });
            component.updateBottomShadowStyle();
            assert.equal(component._bottomShadowStyle, 'bottom: unset; right: unset; top:10px; width:10px;');
            assert.equal(component._topShadowStyle, 'right: unset; width:10px;');
         });

         it('should return correct styles for container with border on mobile platforms.', function() {
            const
               component = createComponent(StickyHeader, { fixedZIndex: 2, position: 'top' });
            let style;
            sandbox.replace(component, '_getComputedStyle', function() {
               return { boxSizing: 'border-box', minHeight: '30px', paddingTop: '1px', 'border-top-width': '1px' };
            });
            component._stickyHeadersHeight = {
               top: 10
            };
            sandbox.stub(StickyHeaderUtils, 'getGapFixSize').returns(1);

            component._model = { fixedPosition: 'top' };
            component._container = { style: { paddingTop: '' } };

            style = component._getStyle();
            assert.include(style, 'min-height:31px;');
            assert.include(style, 'top: 9px;');
            assert.include(style, 'margin-top: -1px;');
            assert.include(style, 'border-top-width:2px;');

            sandbox.restore();
         });
      });

      describe('set top', function() {
         it('should update top', function () {
            const component = createComponent(StickyHeader, {});
            component._canScroll = true;
            component._model = {fixedPosition: ''};
            component._container = {
               style: { top: null },
               container: {
                  getBoundingClientRect() {
                     return {height: 500};
                  }
               }
            };
            sinon.stub(component, '_forceUpdate');

            assert.strictEqual(component._stickyHeadersHeight.top, null);
            component.top = 20;
            assert.strictEqual(component._stickyHeadersHeight.top, 20);
            sinon.assert.called(component._forceUpdate);
            sinon.restore();
            return FastUpdate._promise.then(() => {
               assert.strictEqual(component._container.style.top, '20px');
            });
         });

         it('should not force update if top did not changed', function () {
            const component = createComponent(StickyHeader, {});
            component._model = {fixedPosition: ''};
            sinon.stub(component, '_forceUpdate');

            component._stickyHeadersHeight.top = 20;
            component.top = 20;
            sinon.assert.notCalled(component._forceUpdate);
            sinon.restore();
         });
      });

      describe('set bottom', function() {
         it('should update bottom', function () {
            const component = createComponent(StickyHeader, {});
            component._model = {fixedPosition: ''};
            component._canScroll = true;
            component._container = {
               style: { top: null }
            };
            sinon.stub(component, '_forceUpdate');

            assert.strictEqual(component._stickyHeadersHeight.bottom, null);
            component.bottom = 20;
            assert.strictEqual(component._stickyHeadersHeight.bottom, 20);
            assert.strictEqual(component._container.style.bottom, '20px');
            sinon.assert.called(component._forceUpdate);
            sinon.restore();
         });

         it('should not force update if bottom did not changed', function () {
            const component = createComponent(StickyHeader, {});
            component._model = {fixedPosition: ''};
            sinon.stub(component, '_forceUpdate');

            component._stickyHeadersHeight.bottom = 20;
            component.bottom = 20;
            sinon.assert.notCalled(component._forceUpdate);
            sinon.restore();
         });
      });

      describe('_getObserverStyle', function() {
         it('should return correct style', function() {
            const component = createComponent(StickyHeader, {});
            component._model = { fixedPosition: '' };

            assert.strictEqual(component._getObserverStyle('top'), 'top: -3px;');
            assert.strictEqual(component._getObserverStyle('bottom'), 'bottom: -3px;');
            component._stickyHeadersHeight = {
               top: 2,
               bottom: 3
            };
            assert.strictEqual(component._getObserverStyle('top'), 'top: -5px;');
            assert.strictEqual(component._getObserverStyle('bottom'), 'bottom: -6px;');
            sinon.restore();
         });
         it('should consider borders', function() {
            const component = createComponent(StickyHeader, {});
            const oldIsServerSide = EnvLib.constants.isServerSide;
            EnvLib.constants.isServerSide = false;
            component._container = {};
            sinon.stub(component, '_getComputedStyle').returns({ 'border-top-width': '1px', 'border-bottom-width': '1px' });
            component._model = { fixedPosition: '' };

            assert.strictEqual(component._getObserverStyle('top'), 'top: -4px;');
            assert.strictEqual(component._getObserverStyle('bottom'), 'bottom: -4px;');
            component._stickyHeadersHeight = {
               top: 2,
               bottom: 3
            };
            assert.strictEqual(component._getObserverStyle('top'), 'top: -6px;');
            assert.strictEqual(component._getObserverStyle('bottom'), 'bottom: -7px;');
            EnvLib.constants.isServerSide = oldIsServerSide;
            sinon.restore();
         });
      });

      describe('updateFixed', function() {
         it('should turn on a shadow and generate force update if the corresponding identifier is passed.', function() {
            const component = createComponent(StickyHeader, {});
            component._isFixed = false;
            component._canScroll = true;
            component._model = { fixedPosition: false };
            sinon.stub(component, '_forceUpdate');
            component.updateFixed([component._index]);
            assert.isTrue(component._isFixed);
            sinon.assert.called(component._forceUpdate);
            sinon.restore();
         });
         it('should turn off a shadow and generate force update if the corresponding identifier is not passed.', function() {
            const component = createComponent(StickyHeader, {});
            component._isFixed = true;
            component._canScroll = true;
            component._model = { fixedPosition: false };
            sinon.stub(component, '_forceUpdate');
            component.updateFixed(['someId']);
            assert.isFalse(component._isFixed);
            sinon.assert.called(component._forceUpdate);
            sinon.restore();
         });
         it('should not apply force update if the shadow has not changed.', function() {
            const component = createComponent(StickyHeader, {});
            component._isFixed = true;
            sinon.stub(component, '_forceUpdate');
            component.updateFixed([component._index]);
            assert.isTrue(component._isFixed);
            sinon.assert.notCalled(component._forceUpdate);
            sinon.restore();
         });
      });

      describe('_fixationStateChangeHandler', function() {
         it('should notify fixed event', function() {
            const component = createComponent(StickyHeader, {});
            component._container = {
               closest: () => false,
               offsetHeight: 10
            }
            sinon.stub(component, '_notify');
            component._fixationStateChangeHandler('', 'top')
            sinon.assert.calledWith(
               component._notify,
               'fixed',
               [{
                  fixedPosition: '',
                  id: component._index,
                  mode: "replaceable",
                  offsetHeight: 10,
                  prevPosition: "top",
                  shadowVisible: true,
                  isFakeFixed: false
               }], {
                  bubbling: true
               }
            );
            sinon.restore();
         });
         it('should use previous offsetHeight if container is hidden', function() {
            const component = createComponent(StickyHeader, {});
            component._height = 10;
            component._container = {
               closest: () => true,
               offsetHeight: 0
            }
            sinon.stub(component, '_notify');
            component._fixationStateChangeHandler('', 'top');
            sinon.assert.calledWith(
               component._notify,
               'fixed',
               [{
                  fixedPosition: '',
                  id: component._index,
                  mode: "replaceable",
                  offsetHeight: 10,
                  prevPosition: "top",
                  shadowVisible: true,
                  isFakeFixed: false
               }], {
                  bubbling: true
               }
            );

            sinon.restore();
         });
      });

      describe('_isShadowVisible', function() {
         it('should not show shadow displayed outside scroll container', function() {
            const component = createComponent(StickyHeader, {});
            component._context = {};
            assert.isFalse(component._isShadowVisible('top'));
         });
      });
   });

});

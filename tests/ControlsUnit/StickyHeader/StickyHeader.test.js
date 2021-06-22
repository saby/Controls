define([
   'Env/Env',
   'Controls/_scroll/StickyBlock',
   'Controls/_scroll/StickyBlock/Utils',
   'Controls/_scroll/StickyBlock/FastUpdate',
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

   describe('Controls/_scroll/StickyBlock', function() {
      describe('Initialisation', function() {
         it('should set correct header id', function() {
            const component = createComponent(StickyHeader, options);
            const component2 = createComponent(StickyHeader, options);
            assert.strictEqual(component._index, component2._index - 1);
         });

         describe('should set correct _canShadowVisible', () => {
            [{
               position: 'top',
               top: false,
               bottom: true
            }, {
               position: 'bottom',
               top: true,
               bottom: false
            }, {
               position: 'topbottom',
               top: true,
               bottom: true
            }].forEach((test) => {
               it(test.position, function() {
                  const component = createComponent(StickyHeader, { position: test.position });
                  assert.strictEqual(component._canShadowVisible.top, test.top);
                  assert.strictEqual(component._canShadowVisible.bottom, test.bottom);
               });
            });

         });


         it('should not initialise observer if fixation disabled', function () {
            const component = createComponent(StickyHeader, { mode: 'notsticky' });
            component._container = {
               closest: () => true,
               className: ''
            };
            sinon.stub(component, '_createObserver');
            sinon.stub(component, '_updateComputedStyle');
            component._canScroll = true;
            component._afterMount(coreMerge(options, StickyHeader.getDefaultOptions(), {preferSource: true}));
            component._onScrollStateChanged({ canVerticalScroll: true }, {});
            assert.isUndefined(component._observer);
            sinon.restore();
         });

         it('should not create a observer if the control was created invisible, and must create after it has become visible', function () {
            const component = createComponent(StickyHeader, options);
            component._container = {
               closest: () => true,
               className: ''
            };
            sinon.stub(component, '_createObserver');
            sinon.stub(component, '_updateComputedStyle');
            component._canScroll = true;
            component._afterMount(coreMerge(options, StickyHeader.getDefaultOptions(), {preferSource: true}));
            component._onScrollStateChanged({ canVerticalScroll: true }, {});
            assert.isUndefined(component._observer);
            component._container.closest = () => false;
            component._resizeHandler();
            sinon.assert.called(component._createObserver);
            sinon.restore();
         });

         it('should create observer if scroll is appears', function () {
            const component = createComponent(StickyHeader, options);
            component._container = {
               closest: (selector) => {
                  return selector !== '.ws-hidden';
               },
               className: ''
            };
            sinon.stub(component, '_createObserver');
            sinon.stub(component, '_updateComputedStyle');
            component._afterMount(coreMerge(options, StickyHeader.getDefaultOptions(), {preferSource: true}));
            assert.isUndefined(component._observer);
            component._onScrollStateChanged({ canVerticalScroll: true }, {});
            sinon.assert.called(component._createObserver);
            sinon.restore();
         });

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

      describe('_componentDidMount', function() {
         it('should restore scrollTop', function() {
            const sandbox = sinon.createSandbox();
            const component = createComponent(StickyHeader, options);
            sandbox.stub(component, '_isStickyEnabled').returns(false);
            component._container = {
               style: {
                  top: 1,
                  bottom: 1
               },
               dataset: {
                  stickyBlockNode: 'true'
               }
            };
            component._componentDidMount();
            assert.equal(component._container.style.top, 0);
            sandbox.restore();
         });

         it('should\'t restore scrollTop', function () {
            const sandbox = sinon.createSandbox();
            const component = createComponent(StickyHeader, options);
            sandbox.stub(component, '_isStickyEnabled').returns(false);
            component._container = {
               style: {
                  top: 1,
                  bottom: 1
               },
               dataset: {
                  stickyBlockNode: ''
               }
            };
            component._componentDidMount();
            assert.equal(component._container.style.top, 1);
            sandbox.restore();
         });
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
            assert.isUndefined(component._observer);
            sandbox.restore();
         });
      });

      describe('_beforeUpdate', function() {
         it('should initialise observer after fixation enabled', function () {
            const component = createComponent(StickyHeader, { mode: 'notsticky' });
            component._container = {
               closest: (selector) => {
                  return selector !== '.ws-hidden';
               },
               className: ''
            };
            sinon.stub(component, '_createObserver');
            sinon.stub(component, '_updateComputedStyle');
            component._canScroll = true;
            component._afterMount(coreMerge(options, StickyHeader.getDefaultOptions(), { preferSource: true }));

            assert.isUndefined(component._observer);
            component._options.mode = 'notSticky';
            component._beforeUpdate(coreMerge({ mode: 'notsticky' }, StickyHeader.getDefaultOptions(), { preferSource: true }));
            assert.isUndefined(component._observer);
            sinon.restore();
         });

         it('should call _stickyModeChanged if mode changed', () => {
            const component = createComponent(StickyHeader, { mode: 'stackable' });
            const newMode = 'replaceable';
            const stubStickyModeChanged = sinon.stub(component, '_stickyModeChanged');
            component._beforeUpdate({ mode: newMode, ...StickyHeader.getDefaultOptions() });

            sinon.assert.calledWith(stubStickyModeChanged, newMode);
            sinon.restore();
         });

         it('should generate "stickyHeaderOffsetTopChanged" event if offsetTop option has been changed', function () {
            const component = createComponent(StickyHeader, {});
            sinon.stub(component, '_notify');

            component._beforeUpdate(coreMerge({ offsetTop: 100 }, StickyHeader.getDefaultOptions(), { preferSource: true }));

            sinon.assert.calledWith(component._notify, 'stickyHeaderOffsetTopChanged', [], { bubbling: true });

            sinon.restore();
         });
      });

      describe('_afterUpdate', function() {
         it('should initialise observer after fixation enabled', function () {
            const component = createComponent(StickyHeader, { mode: 'notsticky' });
            component._container = {
               closest: (selector) => {
                  return selector !== '.ws-hidden';
               },
               className: ''
            };
            sinon.stub(component, '_createObserver');
            sinon.stub(component, '_updateComputedStyle');
            component._canScroll = true;
            component._afterMount(coreMerge(options, StickyHeader.getDefaultOptions(), { preferSource: true }));

            assert.isUndefined(component._observer);
            component._options.mode = 'notsticky';
            component._afterUpdate(coreMerge({ mode: 'notsticky' }, StickyHeader.getDefaultOptions(), { preferSource: true }));
            sinon.assert.called(component._createObserver);
            sinon.restore();
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
            sandbox.stub(component, '_updateComputedStyle');
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
            const fixedZIndex = 2;
            const position = 'top';
            const component = createComponent(StickyHeader, { fixedZIndex });
            component._context = {
               stickyHeader: { top: 0, bottom: 0 }
            };

            component._container = {};

            component._model = { fixedPosition: 'top' };
            assert.include(component._getStyle(position, fixedZIndex), 'z-index: 2;');

            component._model = { fixedPosition: 'bottom' };
            assert.include(component._getStyle(position, fixedZIndex), 'z-index: 2;');
         });

         it('should return correct top and bottom.', function() {
            const fixedZIndex = 2;
            const position = {
               vertical: 'topBottom'
            };
            const component = createComponent(StickyHeader, {fixedZIndex, position });
            component._stickyHeadersHeight = {
               top: 10,
               bottom: 20
            };

            component._model = { fixedPosition: 'top' };
            assert.include(component._getStyle(position, fixedZIndex), 'top: 10px;');

            component._model = { fixedPosition: 'bottom' };
            assert.include(component._getStyle(position, fixedZIndex), 'bottom: 20px;');
         });

         it('should return correct left and right.', () => {
            const fixedZIndex = 2;
            const position = {
               horizontal: 'leftRight'
            };
            const component = createComponent(StickyHeader, {fixedZIndex, position });
            component._stickyHeadersHeight = {
               left: 10,
               right: 20
            };

            component._model = { fixedPosition: 'left' };
            assert.include(component._getStyle(position, fixedZIndex), 'left: 10px;');

            component._model = { fixedPosition: 'right' };
            assert.include(component._getStyle(position, fixedZIndex), 'right: 20px;');
         });

         it('should return correct min-height.', function() {
            const fixedZIndex = 2;
            const position = 'topbottom';
            const
               component = createComponent(StickyHeader, { fixedZIndex, position });
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

            assert.include(component._getStyle(position, fixedZIndex), 'min-height:31px;');
            component._minHeight = 40;
            component._container.style.minHeight = 40;
            assert.include(component._getStyle(position, fixedZIndex), 'min-height:40px;');
         });

         it('should return correct styles for Android.', function() {
            const fixedZIndex = 2;
            const position = 'top';
            const
               component = createComponent(StickyHeader, { fixedZIndex, position });
            let style;
            sandbox.replace(component, '_getComputedStyle', function() {
               return { boxSizing: 'border-box', minHeight: '30px', 'padding-top': '1px' };
            });
            component._stickyHeadersHeight = {
               top: 10
            };
            sandbox.stub(StickyHeaderUtils, 'getGapFixSize').returns(3);

            component._model = { fixedPosition: 'top' };
            component._container = { style: { paddingTop: '' } };
            style = component._getStyle(position, fixedZIndex);
            assert.include(style, 'min-height:33px;');
            assert.include(style, 'top: 7px;');
            assert.include(style, 'margin-top: -3px;');
            assert.include(style, 'padding-top:4px;');
         });

         it('should return correct styles for container with border on mobile platforms.', function() {
            const fixedZIndex = 2;
            const position = 'top';
            const
               component = createComponent(StickyHeader, { fixedZIndex, position });
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

            style = component._getStyle(position, fixedZIndex);
            assert.include(style, 'min-height:31px;');
            assert.include(style, 'top: 9px;');
            assert.include(style, 'margin-top: -1px;');
            assert.include(style, 'border-top-width:2px;');

            sandbox.restore();
         });
         describe('offsetTop', function() {
            it('should return correct top.', function () {
               const component = createComponent(StickyHeader, {});
               component._stickyHeadersHeight = {
                  top: 15,
                  bottom: 0
               };

               component._model = {fixedPosition: 'top'};
               assert.include(component._getStyle('topbottom', 2, undefined, -10), 'top: 5px;');
            });
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

            assert.strictEqual(component._stickyHeadersHeight.top, null);
            component.top = 20;
            assert.strictEqual(component._stickyHeadersHeight.top, 20);
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

            assert.strictEqual(component._stickyHeadersHeight.bottom, null);
            component.bottom = 20;
            assert.strictEqual(component._stickyHeadersHeight.bottom, 20);
            assert.strictEqual(component._container.style.bottom, '20px');
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

      describe('height', function() {
         it('should should take into account offsetTop option', function() {
            const component = createComponent(StickyHeader, {offsetTop: 10});
            component._container = {
               closest: () => false,
               offsetHeight: 10,
               className: ''
            };
            assert.strictEqual(component.height, 10);
         });
      });

      describe('_getObserverStyle', function() {
         it('should return correct style', function() {
            const component = createComponent(StickyHeader, {});
            component._model = { fixedPosition: '' };

            assert.strictEqual(component._getObserverStyle('top', 0, StickyHeaderUtils.SHADOW_VISIBILITY.visible),
               'top: -2px;');
            assert.strictEqual(component._getObserverStyle('bottom', 0, StickyHeaderUtils.SHADOW_VISIBILITY.visible),
               'bottom: -2px;');

            component._stickyHeadersHeight = {
               top: 2,
               bottom: 3
            };

            assert.strictEqual(component._getObserverStyle('top', 0, StickyHeaderUtils.SHADOW_VISIBILITY.visible),
               'top: -4px;');
            assert.strictEqual(component._getObserverStyle('bottom', 0, StickyHeaderUtils.SHADOW_VISIBILITY.visible),
               'bottom: -5px;');

            sinon.restore();
         });
         it('should consider borders', function() {
            const component = createComponent(StickyHeader, {});
            const oldIsServerSide = EnvLib.constants.isServerSide;
            EnvLib.constants.isServerSide = false;
            component._container = {};
            sinon.stub(component, '_getComputedStyle').returns({ 'border-top-width': '1px', 'border-bottom-width': '1px' });
            component._model = { fixedPosition: '' };

            assert.strictEqual(component._getObserverStyle('top', 0, StickyHeaderUtils.SHADOW_VISIBILITY.visible),
               'top: -3px;');
            assert.strictEqual(component._getObserverStyle('bottom', 0, StickyHeaderUtils.SHADOW_VISIBILITY.visible),
               'bottom: -3px;');

            component._stickyHeadersHeight = {
               top: 2,
               bottom: 3
            };
            assert.strictEqual(component._getObserverStyle('top', 0, StickyHeaderUtils.SHADOW_VISIBILITY.visible),
               'top: -5px;');
            assert.strictEqual(component._getObserverStyle('bottom', 0, StickyHeaderUtils.SHADOW_VISIBILITY.visible),
               'bottom: -6px;');
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
            component.updateFixed([component._index]);
            assert.isTrue(component._isFixed);
         });
         it('should turn off a shadow and generate force update if the corresponding identifier is not passed.', function() {
            const component = createComponent(StickyHeader, {});
            component._isFixed = true;
            component._canScroll = true;
            component._model = { fixedPosition: false };
            component.updateFixed(['someId']);
            assert.isFalse(component._isFixed);
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

         it('should update shadows by scroll state if model does not initialized.', function() {
            const component = createComponent(StickyHeader, {});
            sinon.stub(component, '_init');
            component._scrollState = {
               verticalPosition: 'middle'
            };
            component._children = {
               shadowBottom: {
                  classList: {
                     remove: sinon.stub()
                  }
               }
            }
            component.updateFixed([component._index]);
            return Promise.resolve().then(() => {
               assert.isTrue(component._isBottomShadowVisible);
               sinon.assert.calledOnce(component._children.shadowBottom.classList.remove);
               sinon.restore();
            });
         });
      });

      describe('_fixationStateChangeHandler', function() {
         it('should notify fixed event', function() {
            const component = createComponent(StickyHeader, {});
            component._container = {
               closest: () => false,
               offsetHeight: 10
            };
            sinon.stub(component, '_notify');
            component._fixationStateChangeHandler('', 'top');
            sinon.assert.calledWith(
               component._notify,
               'fixed',
               [{
                  fixedPosition: '',
                  id: component._index,
                  mode: "replaceable",
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
         it('should show shadow', function() {
            const mode = 'replaceable';
            const shadowVisibility = 'visible';
            const component = createComponent(StickyHeader, {});
            component._context = {};
            component._model = { fixedPosition: 'top' };
            component._isFixed = true;
            component._scrollState = {
               verticalPosition: 'middle',
               hasUnrenderedContent: {
                  top: false,
                  bottom: false
              }
            };
            assert.isTrue(component._isShadowVisible('bottom', mode, shadowVisibility));
         });

         it('should show shadow', function() {
            const component = createComponent(StickyHeader, {});
            component._initialShowShadow = true;
            const position = {
               vertical: 'bottom'
            };
            assert.isTrue(component._isShadowVisible('top', '', '', position));
         });

         it('should not show shadow if it disabled by controller', function() {
            const component = createComponent(StickyHeader, {});
            component._context = {};
            component._model = { fixedPosition: 'top' };
            component._isFixed = true;
            component._scrollState = {
               verticalPosition: 'middle',
               hasUnrenderedContent: {
                  top: false,
                  bottom: false
              }
            };
            component.updateShadowVisibility(false);
            assert.isFalse(component._isShadowVisible('bottom'));
         });

         it('should not show shadow displayed outside scroll container', function() {
            const component = createComponent(StickyHeader, {});
            component._context = {};
            assert.isFalse(component._isShadowVisible('top'));
         });


      });

      describe('getOffset', function() {
         it('should should`t take into account gap fix if fixed but changes but the changes are not applied to DOM', function () {
            const getOffsetValue = 0;
            const component = createComponent(StickyHeader, {});
            const isMobilePlatform = EnvLib.detection.isMobilePlatform;
            EnvLib.detection.isMobilePlatform = true;
            component._model = { isFixed: () => true };
            component._container = {
               style: { top: '' }
            };

            sinon.stub(StickyHeaderUtils, 'getOffset').returns(getOffsetValue);

            assert.strictEqual(component.getOffset({}, {}), getOffsetValue);

            EnvLib.detection.isMobilePlatform = isMobilePlatform;
            sinon.restore();
         });
      });
      describe('_onScrollStateChanged', () => {
         [{
            position: {
               vertical: 'top'
            }
         }, {
            position: {
               vertical: 'bottom'
            }
         }, {
            position: {
               vertical: 'topBottom'
            }
         }, {
            position: {
               horizontal: 'left'
            }
         }, {
            position: {
               horizontal: 'right'
            }
         }, {
            position: {
               horizontal: 'leftRight'
            }
         }].forEach((test, index) => {
            it('should call updateStylesStub' + index, () => {
               const component = createComponent(StickyHeader, {position: test.position});
               const updateStylesStub = sinon.stub(component, '_updateStyles');
               component._initialized = true;
               component._scrollState = {
                  hasUnrenderedContent: {
                     top: false,
                     bottom: false
                  },
                  canVerticalScroll: false,
                  canHorizontalScroll: false
               };
               const scrollState = {
                  hasUnrenderedContent: {
                     top: false,
                     bottom: false
                  },
                  canVerticalScroll: true,
                  canHorizontalScroll: true
               };
               const oldScrollState = {
                  canVerticalScroll: false
               };
               component._onScrollStateChanged(scrollState, oldScrollState);
               sinon.assert.called(updateStylesStub);
            });
         });
      });

      describe('getStickyPosition ', () => {
         [{
            position: 'top',
            result: {
               vertical: 'top'
            }
         }, {
            position: 'bottom',
            result: {
               vertical: 'bottom'
            }
         }, {
            position: 'topbottom',
            result: {
               vertical: 'topBottom'
            }
         }, {
            position: 'left',
            result: {
               horizontal: 'left'
            }
         }, {
            position: 'right',
            result: {
               horizontal: 'right'
            }
         }, {
            position: 'leftright',
            result: {
               horizontal: 'leftRight'
            }
         }].forEach((test) => {
            it('should return correct position', () => {
               const result = StickyHeader.getStickyPosition(test);
               assert.equal(JSON.stringify(result), JSON.stringify(test.result));
            });
         });
      });
   });

});

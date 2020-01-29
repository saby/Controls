define(
   [
      'Env/Env',
      'Controls/scroll',
      'ControlsUnit/Calendar/Utils',
      'wml!ControlsUnit/Container/resources/Content'
   ],
   function(Env, scrollMod, utils, Content) {

      'use strict';

      describe('Controls.Container.Scroll', function() {
         var scroll, result;

         beforeEach(function() {
            scroll = new scrollMod.Container({});

            var templateFn = scroll._template;

            scroll._template = function(inst) {
               inst._options = {
                  content: Content
               };
               var markup = templateFn.call(this, inst);

               markup = markup.replace(/ ?(ws-delegates-tabfocus|ws-creates-context|__config|tabindex|name)=".+?"/g, '');
               markup = markup.replace(/\s+/g, ' ');

               return markup;
            };
            scroll._registeredHeadersIds = [];
            scroll._stickyHeadersIds = {
               top: [],
               bottom: []
            };
            scroll._headersHeight = {
               top: 0,
               bottom: 0
            };
            scroll._children.stickyHeaderShadow = {
               start: sinon.fake()
            };
            scroll._children.content = {
               scrollHeight: 50,
               scrollTop: 10
            };
            scroll._displayState = {
               contentHeight: 0,
               shadowVisible: {
                  top: false,
                  bottom: false
               }
            };
            scroll._shadowVisibilityByInnerComponents = {
               top: 'auto',
               bottom: 'auto'
            };
         });

         describe('_shadowVisible', function() {
            [{
               title: "shouldn't display shadow if there are fixed headers",
               shadowPosition: 'top',
               hasFixed: true,
               result: false
            }].forEach(function(test) {
               it(test.title, function () {
                  scroll._displayState.shadowPosition = test.shadowPosition || '';
                  scroll._shadowVisibilityByInnerComponents.top = test.shadowVisibilityByInnerComponents;
                  scroll._children.stickyController = {
                     hasFixed: function () {
                        return Boolean(test.hasFixed);
                     }
                  };

                  if (test.result) {
                     assert.isTrue(scroll._shadowVisible('top'));
                  } else {
                     assert.isFalse(scroll._shadowVisible('top'));
                  }
               });
            });

            describe('ipad', function() {
               beforeEach(function () {
                  Env.detection.isMobileIOS = true;
               });
               afterEach(function () {
                  if (typeof window === 'undefined') {
                     Env.detection.isMobileIOS = undefined;
                  } else {
                     Env.detection.isMobileIOS = false;
                  }
               });

               it('should display top shadow if scrollTop > 0.', function () {
                  scroll._displayState.shadowVisible.top = true;
                  scroll._children.stickyController = {
                     hasFixed: function () {
                        return false;
                     }
                  };

                  assert.isTrue(scroll._shadowVisible('top'));
               });

               it('should not display top shadow if scrollTop < 0.', function () {
                  scroll._displayState.shadowVisible.top = true;
                  scroll._children.content.scrollTop = -10;
                  scroll._children.stickyController = {
                     hasFixed: function () {
                        return false;
                     }
                  };

                  assert.isFalse(scroll._shadowVisible('top'));
               });

               it('should not display top shadow on initial build.', function () {
                  scroll._children = {};

                  assert.isFalse(scroll._shadowVisible('top'));
               });
            });
         });

         describe('_updateStickyHeaderContext', function() {
            [{
               title: 'should display shadow on headers if shadow is visible',
               shadowVisible: { top: true, bottom: true },
               resultShadowPosition: 'topbottom'
            }, {
               title: 'shouldn\'t display shadow on headers if shadow is hidden',
               shadowVisible: { top: false, bottom: false },
               resultShadowPosition: ''
            }].forEach(function (test) {
               it(test.title, function () {
                  scroll._displayState.shadowPosition = test.shadowPosition || '';
                  scroll._displayState.canScroll = true;
                  scroll._displayState.shadowVisible = test.shadowVisible;
                  scroll._stickyHeaderContext = {
                     updateConsumers: function() { }
                  };

                  scroll._updateStickyHeaderContext();
                  assert.strictEqual(scroll._stickyHeaderContext.shadowPosition, test.resultShadowPosition);
               });
            });
         });

         describe('_resizeHandler. Paging buttons.', function() {
            it('Content at the top', function() {
               scroll._pagingState = {};
               scroll._children.content = {
                  scrollTop: 0,
                  scrollHeight: 200,
                  clientHeight: 100
               };

               scroll._resizeHandler();
               assert.deepEqual(scroll._pagingState, {
                  stateUp: 'disabled',
                  stateDown: 'normal'
               });
            });
            it('Content at the middle', function() {
               scroll._pagingState = {};
               scroll._children.content = {
                  scrollTop: 50,
                  scrollHeight: 200,
                  clientHeight: 100
               };

               scroll._resizeHandler();
               assert.deepEqual(scroll._pagingState, {
                  stateUp: 'normal',
                  stateDown: 'normal'
               });
            });
            it('Content at the bottom', function() {
               scroll._pagingState = {};
               scroll._children.content = {
                  scrollTop: 100,
                  scrollHeight: 200,
                  clientHeight: 100
               };

               scroll._resizeHandler();
               assert.deepEqual(scroll._pagingState, {
                  stateUp: 'normal',
                  stateDown: 'disabled'
               });
            });
         });

         describe('_resizeHandler', function() {
            it('should update _displayState if it changed.', function() {
               let oldDisplayState = scroll._displayState;
               scroll._pagingState = {};
               scroll._children.content = {
                  scrollTop: 100,
                  scrollHeight: 200,
                  clientHeight: 100
               };

               scroll._resizeHandler();
               assert.notStrictEqual(scroll._displayState, oldDisplayState);
               oldDisplayState = scroll._displayState;
               scroll._resizeHandler();
               assert.strictEqual(scroll._displayState, oldDisplayState);
            });
         });

         describe('_scrollbarTaken', function() {
            it('Should generate scrollbarTaken event if scrollbar displayed', function() {
               const sandbox = sinon.sandbox.create();
               scroll._displayState = { canScroll: true };
               sandbox.stub(scroll, '_notify');
               scroll._scrollbarTaken();
               sinon.assert.calledWith(scroll._notify, 'scrollbarTaken');
               sandbox.restore();
            });
            it('Should not generate scrollbarTaken event if scrollbar not displayed', function() {
               const sandbox = sinon.sandbox.create();
               scroll._displayState = { canScroll: false };
               sandbox.stub(scroll, '_notify');
               scroll._scrollbarTaken();
               sinon.assert.notCalled(scroll._notify);
               sandbox.restore();
            });
         });

         describe('_mouseenterHandler', function() {
            it('Should show scrollbar and generate scrollbarTaken event on mouseenter', function() {
               const sandbox = sinon.sandbox.create();
               scroll._displayState = { canScroll: true };
               scroll._options.scrollbarVisible = true;
               sandbox.stub(scroll, '_notify');
               scroll._mouseenterHandler();
               sinon.assert.calledWith(scroll._notify, 'scrollbarTaken');
               assert.isTrue(scroll._scrollbarVisibility());
               sandbox.restore();
            });
            it('Should hide scrollbar and generate scrollbarReleased event on mouseleave', function() {
               const sandbox = sinon.sandbox.create();
               scroll._displayState = { canScroll: false };
               sandbox.stub(scroll, '_notify');
               scroll._mouseenterHandler();
               scroll._mouseleaveHandler();
               sinon.assert.calledWith(scroll._notify, 'scrollbarReleased');
               assert.isFalse(scroll._scrollbarVisibility());
               sandbox.restore();
            });
         });

         describe('_adjustContentMarginsForBlockRender', function() {
            if (!Env.constants.isBrowserPlatform) {
               return;
            }

            it('should not update the context if the height has not changed', function() {
               sinon.stub(window, 'getComputedStyle').returns({ marginTop: 0, marginRight: 0 });
               scroll._styleHideScrollbar = '';
               scroll._stickyHeaderContext = {
                  top: 0,
                  updateConsumers: sinon.fake()
               };
               scroll._adjustContentMarginsForBlockRender();
               sinon.assert.notCalled(scroll._stickyHeaderContext.updateConsumers);
               sinon.restore();
            });
         });

         describe('Template', function() {
            it('Hiding the native scroll', function() {
               result = scroll._template(scroll);

               assert.equal(result, '<div class="controls-Scroll ws-flexbox ws-flex-column">' +
                                       '<span class="controls-Scroll__content controls-BlockLayout__blockGroup controls-Scroll__content_hideNativeScrollbar controls-Scroll__content_hidden">' +
                                          '<div class="controls-Scroll__userContent">test</div>' +
                                       '</span>' +
                                       '<div></div>' +
                                    '</div>');

               scroll._contentStyles = 'margin-right: -15px;';
               result = scroll._template(scroll);

               assert.equal(result, '<div class="controls-Scroll ws-flexbox ws-flex-column">' +
                                       '<span class="controls-Scroll__content controls-BlockLayout__blockGroup controls-Scroll__content_hideNativeScrollbar controls-Scroll__content_scroll" style="margin-right: -15px;">' +
                                          '<div class="controls-Scroll__userContent">test</div>' +
                                       '</span>' +
                                       '<div></div>' +
                                    '</div>');
            });
         });

         describe('_scrollMoveHandler', function() {
            beforeEach(function() {
               scroll._pagingState = {
                  visible: true
               };
            });
            it('up', function() {
               scroll._scrollMoveHandler({}, {
                  position: 'up'
               });
               assert.equal('disabled', scroll._pagingState.stateUp, 'Wrong paging state');
               assert.equal('normal', scroll._pagingState.stateDown, 'Wrong paging state');
            });
            it('down', function() {
               scroll._scrollMoveHandler({}, {
                  position: 'down'
               });
               assert.equal('normal', scroll._pagingState.stateUp, 'Wrong paging state');
               assert.equal('disabled', scroll._pagingState.stateDown, 'Wrong paging state');
            });
            it('middle', function() {
               scroll._scrollMoveHandler({}, {
                  position: 'middle'
               });
               assert.equal('normal', scroll._pagingState.stateUp, 'Wrong paging state');
               assert.equal('normal', scroll._pagingState.stateDown, 'Wrong paging state');
            });

         });

         describe('_fixedHandler', function() {
            it('Should update scroll style when header fixed', function() {
               scroll._fixedHandler(null, 10, 10);
               assert.strictEqual(scroll._scrollbarStyles, 'top:10px; bottom:10px;');
               assert.strictEqual(scroll._displayState.contentHeight, 30);
            });
            it('Should update scroll style when header unfixed', function() {
               scroll._headersHeight = { top: 10, bottom: 20 };
               scroll._fixedHandler(null, 0, 0);
               assert.strictEqual(scroll._scrollbarStyles, 'top:0px; bottom:0px;');
               assert.strictEqual(scroll._displayState.contentHeight, 50);
            });
         });

         describe('Save/restore scroll position.', function() {
            it('Should restore previous scroll position', function() {
               const
                  addedHeight = 100,
                  oldScrollTop = scroll._children.content.scrollTop;
               scroll._children.scrollWatcher = {
                  setScrollTop(value) {
                     scroll._children.content.scrollTop = value;
                  }
               };
               scroll._saveScrollPosition({stopPropagation: function(){}});
               scroll._children.content.scrollHeight += addedHeight;
               scroll._restoreScrollPosition({stopPropagation: function(){}}, 0);
               assert.equal(scroll._children.content.scrollTop, 0);
            });
         });


         describe('selectedKeysChanged', function() {
            var instance;
            beforeEach(function() {
               instance = new scrollMod.Container();
            })
            it('should forward event', function() {
               var
                  notifyCalled = false,
                  event = {
                     propagating: function() {
                        return false;
                     }
                  };
               instance._notify = function(eventName, eventArgs) {
                  assert.equal(eventName, 'selectedKeysChanged');
                  assert.deepEqual(eventArgs, ['1', '2', '3']);
                  notifyCalled = true;
               };
               instance.selectedKeysChanged(event, '1', '2', '3');
               assert.isTrue(notifyCalled);
            });

            it('should not forward event', function() {
               var
                  notifyCalled = false,
                  event = {
                     propagating: function() {
                        return true;
                     }
                  };
               instance._notify = function() {
                  notifyCalled = true;
               };
               instance.selectedKeysChanged(event, '1', '2', '3');
               assert.isFalse(notifyCalled);
            });
         });

         describe('excludedKeysChanged', function() {
            var instance;
            beforeEach(function() {
               instance = new scrollMod.Container();
            })
            it('should forward event', function() {
               var
                  notifyCalled = false,
                  event = {
                     propagating: function() {
                        return false;
                     }
                  };
               instance._notify = function(eventName, eventArgs) {
                  assert.equal(eventName, 'excludedKeysChanged');
                  assert.deepEqual(eventArgs, ['1', '2', '3']);
                  notifyCalled = true;
               };
               instance.excludedKeysChanged(event, '1', '2', '3');
               assert.isTrue(notifyCalled);
            });

            it('should not forward event', function() {
               var
                  notifyCalled = false,
                  event = {
                     propagating: function() {
                        return true;
                     }
                  };
               instance._notify = function() {
                  notifyCalled = true;
               };
               instance.excludedKeysChanged(event, '1', '2', '3');
               assert.isFalse(notifyCalled);
            });
         });

         describe('_scrollHandler', function() {
            let
               scrollContainer = new scrollMod.Container({}),
               sandbox = sinon.createSandbox();

            scrollContainer._children = {
               content: {
                  scrollHeight: 200,
                  offsetHeight: 100,
                  scrollTop: 0
               },
               scrollDetect: {
                  start: () => null
               }
            };
            scrollContainer._scrollTop = 0;

            it('scrollTop has not changed. scroll should not fire', function() {
               sandbox.stub(scrollContainer._children.scrollDetect, 'start');
               sandbox.stub(scrollContainer, '_notify');
               scrollContainer._scrollHandler({});
               sinon.assert.notCalled(scrollContainer._notify);
               sinon.assert.notCalled(scrollContainer._children.scrollDetect.start);
               sandbox.restore();
            });
            it('scrollTop has changed. scroll should fire', function() {
               sandbox.stub(scrollContainer._children.scrollDetect, 'start');
               sandbox.stub(scrollContainer, '_notify');
               scrollContainer._children.content.scrollTop = 10;
               scrollContainer._scrollHandler({});
               sinon.assert.calledWith(scrollContainer._notify, 'scroll', [10]);
               sinon.assert.calledWith(scrollContainer._children.scrollDetect.start, sinon.match.any, 10);
               sandbox.restore();
            });
         });

         it('restores scroll after scrollbar drag end', () => {
            let
               sandbox = sinon.createSandbox(),
               scrollContainer = new scrollMod.Container({});

            scrollContainer._children = {
               content: {
                  scrollHeight: 200,
                  offsetHeight: 100,
                  scrollTop: 100
               },
               scrollDetect: {
                  start: () => null
               }
            };

            // Dragging scrollbar to 0
            scrollContainer._dragging = true;
            scrollContainer._children.content.scrollTop = 0;
            scrollContainer._scrollTop = 0;
            scrollContainer._scrollHandler({});

            sandbox.stub(scrollContainer._children.scrollDetect, 'start');
            sandbox.stub(scrollContainer, '_notify');

            // Scroll position is restored from outside
            scrollContainer._children.content.scrollTop = 50;
            scrollContainer._scrollHandler({});

            assert.strictEqual(scrollContainer._scrollTop, 0,
               'scroll top should not change because scroll bar is being dragged');

            // Dragging stops
            scrollContainer._draggingChangedHandler({}, false);

            assert.strictEqual(scrollContainer._scrollTop, 50,
               'restored scroll top value should be applied after drag end');

            sinon.assert.calledWith(scrollContainer._notify, 'scroll', [50]);
            sinon.assert.calledWith(scrollContainer._children.scrollDetect.start, sinon.match.any, 50);
         });

         it('does not restore scroll after drag end if it was cancelled by dragging', () => {
            let scrollContainer = new scrollMod.Container({});
            scrollContainer._children = {
               content: {
                  scrollHeight: 200,
                  offsetHeight: 100,
                  scrollTop: 100
               },
               scrollDetect: {
                  start: () => null
               }
            };

            // Dragging scrollbar to 0
            scrollContainer._dragging = true;
            scrollContainer._children.content.scrollTop = 0;
            scrollContainer._scrollTop = 0;
            scrollContainer._scrollHandler({});

            // Scroll position is restored from outside
            scrollContainer._children.content.scrollTop = 50;
            scrollContainer._scrollHandler({});

            assert.strictEqual(scrollContainer._scrollTop, 0,
               'scroll top should not change because scroll bar is being dragged');

            // Dragging scrollbar to 100
            scrollContainer._children.content.scrollTop = 100;
            scrollContainer._scrollHandler({});
            scrollContainer._scrollTop = 100;

            // Dragging stops
            scrollContainer._draggingChangedHandler({}, false);

            assert.strictEqual(scrollContainer._scrollTop, 100,
               'restored scroll top value should not be applied after drag end, because it was changed by dragging');
         });

         describe('Controls.Container.Shadow', function() {
            var result;
            describe('calcShadowPosition', function() {
               it('Тень сверху', function() {
                  result = scrollMod.Container._private.calcShadowPosition(100, 100, 200);
                  assert.equal(result, 'top');
               });
               it('Тень снизу', function() {
                  result = scrollMod.Container._private.calcShadowPosition(0, 100, 200);
                  assert.equal(result, 'bottom');
               });
               it('Should hide bottom shadow if there is less than 1 pixel to the bottom.', function() {
                  // Prevent rounding errors in the scale do not equal 100%
                  result = scrollMod.Container._private.calcShadowPosition(99.234, 100, 200);
                  assert.notInclude(result, 'bottom');
               });
               it('Тень сверху и снизу', function() {
                  result = scrollMod.Container._private.calcShadowPosition(50, 100, 200);
                  assert.equal(result, 'topbottom');
               });
            });
            describe('getSizes', function() {
               var container = {
                  scrollHeight: 200,
                  offsetHeight: 100,
                  scrollTop: 0
               };

               it('getScrollHeight', function() {
                  result = scrollMod.Container._private.getScrollHeight(container);
                  assert.equal(result, 200);
               });
               it('getContainerHeight', function() {
                  result = scrollMod.Container._private.getContainerHeight(container);
                  assert.equal(result, 100);
               });
               it('getScrollTop', function() {
                  result = scrollMod.Container._private.getScrollTop({ _topPlaceholderSize: 0 }, container);
                  assert.equal(result, 0);
               });
            });
            describe('isShadowEnable', function() {
               [{
                  options: { shadowVisible: false },
                  position: 'top',
                  result: false
               }, {
                  options: { shadowVisible: false },
                  position: 'bottom',
                  result: false
               }, {
                  options: { topShadowVisibility: 'visible', bottomShadowVisibility: 'hidden' },
                  position: 'top',
                  result: true
               }, {
                  options: { topShadowVisibility: 'visible', bottomShadowVisibility: 'hidden' },
                  position: 'bottom',
                  result: false
               }, {
                  options: { topShadowVisibility: 'auto', bottomShadowVisibility: 'hidden' },
                  position: 'top',
                  result: true
               }, {
                  options: { topShadowVisibility: 'hidden', bottomShadowVisibility: 'auto' },
                  position: 'top',
                  result: false
               }].forEach(function(test) {
                  it(`should return ${test.result} if options is equal ${JSON.stringify(test.options)} and position is equal "${test.position}"`, function() {
                     result = scrollMod.Container._private.isShadowEnable(test.options, test.position);
                     assert.equal(result, test.result);
                  });
               });
            });

            describe('isShadowVisible', function() {
               [{
                  options: { shadowVisible: false },
                  shadowVisibilityByInnerComponents: { top: 'auto', bottom: 'auto' },
                  position: 'top',
                  shadowPosition: 'topbottom',
                  result: false
               }, {
                  options: { shadowVisible: false },
                  shadowVisibilityByInnerComponents: { top: 'auto', bottom: 'auto' },
                  position: 'bottom',
                  shadowPosition: 'topbottom',
                  result: false
               }, {
                  options: { topShadowVisibility: 'visible', bottomShadowVisibility: 'hidden' },
                  shadowVisibilityByInnerComponents: { top: 'auto', bottom: 'auto' },
                  position: 'top',
                  shadowPosition: 'topbottom',
                  result: true
               }, {
                  options: { topShadowVisibility: 'visible', bottomShadowVisibility: 'hidden' },
                  shadowVisibilityByInnerComponents: { top: 'auto', bottom: 'auto' },
                  position: 'bottom',
                  shadowPosition: 'topbottom',
                  result: false
               }].forEach(function(test) {
                  it(`should return ${test.result} if options is equal ${JSON.stringify(test.options)} and position is equal "${test.position}"`, function() {
                     const component = {
                        _options: test.options,
                        _shadowVisibilityByInnerComponents: test.shadowVisibilityByInnerComponents
                     };
                     result = scrollMod.Container._private.isShadowVisible(component, test.position, test.shadowPosition);
                     assert.equal(result, test.result);
                  });
               });
            });
         });
      });
   }
);

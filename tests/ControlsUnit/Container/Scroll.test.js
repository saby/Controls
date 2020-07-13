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
         let event;
         beforeEach(function() {
            event = {
               stopImmediatePropagation: sinon.fake()
            }
            scroll = new scrollMod.Container(scrollMod.Container.getDefaultOptions());
            scroll._options = scrollMod.Container.getDefaultOptions();

            var templateFn = scroll._template;

            scroll._template = function(inst) {
               inst._options = {
                  content: Content,
                  theme: 'default'
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
            scroll._headersWidth = {
               left: 0,
               right: 0
            };
            scroll._children.stickyHeaderShadow = {
               start: sinon.fake()
            };
            scroll._children.content = {
               offsetHeight: 40,
               scrollHeight: 50,
               scrollTop: 10
            };
            scroll._displayState = {
               contentHeight: 0,
               shadowVisible: {
                  top: false,
                  bottom: false,
                  left: false,
                  right: false
               }
            };
            scroll._shadowVisibilityByInnerComponents = {
               top: 'auto',
               bottom: 'auto'
            };
            scroll._stickyHeaderContext = {
               updateConsumers: function() { }
            };

            scroll._isMounted = true;
         });

         describe('_afterMount', function() {
            it('should be enable shadows if the contents fit in the container', function () {
               scroll._beforeMount(scrollMod.Container.getDefaultOptions(), {});
               sinon.stub(scroll, '_adjustContentMarginsForBlockRender');
               scroll._stickyHeaderController = {
                  setCanScroll: sinon.fake(),
                  init: sinon.fake()
               };
               scroll._afterMount();
               assert.isTrue(scroll._displayState.shadowEnable.top);
               assert.isTrue(scroll._displayState.shadowEnable.bottom);
            });
            it('should be disable shadows if the content does not fit in the container', function () {
               scroll._beforeMount(scrollMod.Container.getDefaultOptions(), {});
               scroll._children.content.offsetHeight = 100;
               sinon.stub(scroll, '_adjustContentMarginsForBlockRender');
               scroll._afterMount();
               assert.isFalse(scroll._displayState.shadowEnable.top);
               assert.isFalse(scroll._displayState.shadowEnable.bottom);
            });
         });

         describe('_afterUpdate', function() {
            it('should not update state if control is invisible', function () {
               sinon.stub(scroll, '_isHidden').returns(true);
               sinon.stub(scrollMod.Container._private, 'calcDisplayState');
               scroll._afterUpdate();
               sinon.assert.notCalled(scrollMod.Container._private.calcDisplayState);
               sinon.restore();
            });
         });

         describe('_shadowVisible', function() {
            [{
               title: "shouldn't display shadow if there are fixed headers",
               shadowPosition: 'top',
               hasFixed: true,
               hasShadowVisible: true,
               result: false
            }, {
               title: "should display shadow if there are fixed headers",
               shadowPosition: 'top',
               hasFixed: true,
               hasShadowVisible: false,
               result: true
            }].forEach(function(test) {
               it(test.title, function () {
                  scroll._displayState.shadowPosition = test.shadowPosition || '';
                  scroll._displayState.shadowVisible = {
                     top: true,
                     bottom: true
                  };
                  scroll._shadowVisibilityByInnerComponents.top = test.shadowVisibilityByInnerComponents;
                  scroll._stickyHeaderController = {
                     hasFixed: function () {
                        return Boolean(test.hasFixed);
                     },
                     hasShadowVisible: function() {
                        return Boolean(test.hasShadowVisible);
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
                  scroll._stickyHeaderController = {
                     hasFixed: function () {
                        return false;
                     },
                     hasShadowVisible: function() {
                        return false;
                     }
                  };

                  assert.isTrue(scroll._shadowVisible('top'));
               });

               it('should display left shadow if scrollLeft > 0.', function () {
                  scroll._displayState.shadowVisible.left = true;
                  scroll._stickyHeaderController = {
                     hasFixed: function () {
                        return false;
                     },
                     hasShadowVisible: function() {
                        return false;
                     }
                  };

                  assert.isTrue(scroll._shadowVisible('left'));
               });

               it('should not display top shadow if scrollLeft < 0.', function () {
                  scroll._displayState.shadowVisible.left = true;
                  scroll._children.content.scrollLeft = -10;
                  scroll._stickyHeaderController = {
                     hasFixed: function () {
                        return false;
                     },
                     hasShadowVisible: function() {
                        return false;
                     }
                  };

                  assert.isFalse(scroll._verticalShadowVisible('left'));
               });

               it('should not display top shadow on initial build.', function () {
                  scroll._children = {};

                  assert.isFalse(scroll._shadowVisible('top'));
               });

               it('should not display left shadow on initial build.', function () {
                  scroll._children = {};

                  assert.isFalse(scroll._verticalShadowVisible('left'));
               });
            });
         });

         describe('canScrollTo', function() {
            [{
               offset: 0,
               scrollHeight: 100,
               clientHeight: 100,
               result: true
            }, {
               offset: 50,
               scrollHeight: 200,
               clientHeight: 100,
               result: true
            }, {
               offset: 50,
               scrollHeight: 100,
               clientHeight: 100,
               result: false
            }].forEach(function (test) {
               it(`should return ${test.result} if offset = ${test.offset},  scrollHeight = ${test.scrollHeight},  clientHeight = ${test.clientHeight}`, function () {
                  scroll._children.content.scrollHeight = test.scrollHeight;
                  scroll._children.content.clientHeight = test.clientHeight;

                  if (test.result) {
                     assert.isTrue(scroll.canScrollTo(test.offset));
                  } else {
                     assert.isFalse(scroll.canScrollTo(test.offset));
                  }
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
            beforeEach(function() {
               scroll._container = {
                  closest: () => {}
               };
               scroll._stickyHeaderController = {
                  setCanScroll: () => undefined,
                  resizeHandler: () => undefined
               };
            });
            it('Content at the top', function() {
               scroll._pagingState = {};
               scroll._children.content = {
                  scrollTop: 0,
                  scrollHeight: 200,
                  clientHeight: 100,
                  scrollLeft: 0,
                  scrollWidth: 200,
                  clientWidth: 100
               };

               scroll._resizeHandler();
               assert.deepEqual(scroll._pagingState, {
                  stateUp: false,
                  stateDown: true
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
                  stateUp: true,
                  stateDown: true
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
                  stateUp: true,
                  stateDown: false
               });
            });
         });

         describe('_resizeHandler', function() {
            beforeEach(function() {
               scroll._container = {
                  closest: () => {}
               };
               scroll._stickyHeaderController = {
                  setCanScroll: sinon.stub(),
                  resizeHandler: () => undefined
               };
            });
            it('should update _displayState if it changed(vertical scroll).', function() {
               let oldDisplayState = scroll._displayState;
               scroll._pagingState = {};
               scroll._children.content = {
                  scrollTop: 100,
                  scrollHeight: 200,
                  clientHeight: 100
               };

               scroll._resizeHandler();
               assert.notStrictEqual(scroll._displayState, oldDisplayState);
               sinon.assert.calledWith(scroll._stickyHeaderController.setCanScroll, false);

               oldDisplayState = scroll._displayState;
               scroll._resizeHandler();
               assert.strictEqual(scroll._displayState, oldDisplayState);
            });

            it('should update _displayState if it changed(horizontal scroll).', function() {
               let oldDisplayState = scroll._displayState;
               scroll._pagingState = {};
               scroll._children.content = {
                  scrollLeft: 100,
                  scrollWidth: 200,
                  clientWidth: 100
               };

               scroll._resizeHandler();
               assert.notStrictEqual(scroll._displayState, oldDisplayState);
               oldDisplayState = scroll._displayState;
               scroll._resizeHandler();
               assert.strictEqual(scroll._displayState, oldDisplayState);
            });

            it('should not update _displayState if the function was called before the control was fully initialized(horizontal scroll).', function() {
               let oldDisplayState = scroll._displayState;
               scroll._pagingState = {};
               scroll._children.content = {
                  scrollLeft: 100,
                  scrollWidth: 200,
                  clientWidth: 100
               };

               scroll._isMounted = false;
               scroll._resizeHandler();
               assert.strictEqual(scroll._displayState, oldDisplayState);
            });

            it('should not update _displayState if the function was called before the control was fully initialized(vertical scroll).', function() {
               let oldDisplayState = scroll._displayState;
               scroll._pagingState = {};
               scroll._children.content = {
                  scrollTop: 100,
                  scrollHeight: 200,
                  clientHeight: 100
               };

               scroll._isMounted = false;
               scroll._resizeHandler();
               assert.strictEqual(scroll._displayState, oldDisplayState);
            });
         });

         describe('_scrollbarTaken', function() {
            [{
               scrollType: 'horizontal',
               canScrollFieldName: 'canHorizontalScroll'
            },{
               scrollType: 'vertical',
               canScrollFieldName: 'canScroll'
            }].forEach(function(test) {
               it(`Should generate scrollbarTaken event if scrollbar displayed (${test.scrollType} scroll)`, function() {
                  const sandbox = sinon.sandbox.create();
                  scroll._displayState = { [test.canScrollFieldName]: true };
                  sandbox.stub(scroll, '_notify');
                  scroll._scrollbarTaken();
                  sinon.assert.calledWith(scroll._notify, 'scrollbarTaken');
                  sandbox.restore();
               });
            });

            [{
               scrollType: 'horizontal',
               canScrollFieldName: 'canHorizontalScroll'
            },{
               scrollType: 'vertical',
               canScrollFieldName: 'canScroll'
            }].forEach(function(test) {
               it(`Should not generate scrollbarTaken event if scrollbar not displayed (${test.scrollType} scroll)`, function() {
                  const sandbox = sinon.sandbox.create();
                  scroll._displayState = { [test.canScrollFieldName]: false };
                  sandbox.stub(scroll, '_notify');
                  scroll._scrollbarTaken();
                  sinon.assert.notCalled(scroll._notify);
                  sandbox.restore();
               });
            });
         });

         describe('_mouseenterHandler', function() {
            it(`Should show vertical scrollbar and generate scrollbarTaken event on mouseenter`, function() {
               const sandbox = sinon.sandbox.create();
               scroll._displayState = { canScroll: true };
               scroll._options.scrollbarVisible = true;
               sandbox.stub(scroll, '_notify');
               scroll._mouseenterHandler();
               sinon.assert.calledWith(scroll._notify, 'scrollbarTaken');
               assert.isTrue(scroll._scrollbarVisibility());
               sandbox.restore();
            });
            it(`Should show horizontal scrollbar and generate scrollbarTaken event on mouseenter`, function() {
               const sandbox = sinon.sandbox.create();
               scroll._displayState = { canHorizontalScroll: true };
               scroll._options.scrollbarVisible = true;
               scroll._options.scrollMode = 'verticalHorizontal';
               sandbox.stub(scroll, '_notify');
               scroll._mouseenterHandler();
               sinon.assert.calledWith(scroll._notify, 'scrollbarTaken');
               assert.isTrue(scroll._horizontalScrollbarVisibility());
               sandbox.restore();
            });
            it(`Should not show horizontal scrollbar and generate scrollbarTaken event on mouseenter if scrollMode = 'vertical'`, function() {
               const sandbox = sinon.sandbox.create();
               scroll._displayState = { canHorizontalScroll: true };
               scroll._options.scrollbarVisible = true;
               scroll._options.scrollMode = 'vertical';
               sandbox.stub(scroll, '_notify');
               scroll._mouseenterHandler();
               sinon.assert.calledWith(scroll._notify, 'scrollbarTaken');
               assert.isFalse(scroll._horizontalScrollbarVisibility());
               sandbox.restore();
            });
            it('Should hide vertical scrollbar and generate scrollbarReleased event on mouseleave', function() {
               const sandbox = sinon.sandbox.create();
               scroll._displayState = { canScroll: false };
               sandbox.stub(scroll, '_notify');
               scroll._mouseenterHandler();
               scroll._mouseleaveHandler();
               sinon.assert.calledWith(scroll._notify, 'scrollbarReleased');
               assert.isFalse(scroll._scrollbarVisibility());
               sandbox.restore();
            });
            it('Should hide horizontal scrollbar and generate scrollbarReleased event on mouseleave', function() {
               const sandbox = sinon.sandbox.create();
               scroll._displayState = { canHorizontalScroll: false };
               sandbox.stub(scroll, '_notify');
               scroll._mouseenterHandler();
               scroll._mouseleaveHandler();
               sinon.assert.calledWith(scroll._notify, 'scrollbarReleased');
               assert.isFalse(scroll._horizontalScrollbarVisibility());
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
                  '<span class="controls-Scroll__content controls-BlockLayout__blockGroup controls-BlockLayout__blockGroup_theme-default controls-Scroll__content_hideNativeScrollbar controls-Scroll__content_hidden">' +
                  '<div class="controls-Scroll__userContent">test</div>' +
                  '</span>' +
                  '<div></div>' +
                  '</div>');

               scroll._contentStyles = 'margin-right: -15px;';
               result = scroll._template(scroll);

               assert.equal(result, '<div class="controls-Scroll ws-flexbox ws-flex-column">' +
                  '<span class="controls-Scroll__content controls-BlockLayout__blockGroup controls-BlockLayout__blockGroup_theme-default controls-Scroll__content_hideNativeScrollbar" style="margin-right: -15px;">' +
                  '<div class="controls-Scroll__userContent">test</div>' +
                  '</span>' +
                  '<div></div>' +
                  '</div>');
            });

            [{
               class: 'controls-Scroll__scroll_vertical',
               scrollMode: 'vertical'
            },{
               class: 'controls-Scroll__scroll_verticalHorizontal',
               scrollMode: 'verticalHorizontal'
            }].forEach(function(test) {
               it(`Should set ${test.class} class if options scrollMode = ${test.scrollMode}`, function() {
                  const sandbox = sinon.sandbox.create();
                  scroll.calcStyleOverflow(test.scrollMode);
                  assert.equal(test.class, scroll._classTypeScroll);
                  sandbox.restore();
               });
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
               assert.equal(false, scroll._pagingState.stateUp, 'Wrong paging state');
               assert.equal(true, scroll._pagingState.stateDown, 'Wrong paging state');
            });
            it('down', function() {
               scroll._scrollMoveHandler({}, {
                  position: 'down'
               });
               assert.equal(true, scroll._pagingState.stateUp, 'Wrong paging state');
               assert.equal(false, scroll._pagingState.stateDown, 'Wrong paging state');
            });
            it('middle', function() {
               scroll._scrollMoveHandler({}, {
                  position: 'middle'
               });
               assert.equal(true, scroll._pagingState.stateUp, 'Wrong paging state');
               assert.equal(true, scroll._pagingState.stateDown, 'Wrong paging state');
            });

         });

         describe('_fixedHandler', function() {
            it('Should update scroll style when header fixed', function() {
               scroll._displayState.canScroll = true;
               scroll._fixedHandler(null, 10, 10);
               assert.strictEqual(scroll._scrollbarStyles, 'top:10px; bottom:10px;');
               assert.strictEqual(scroll._displayState.contentHeight, 30);
            });
            it('Should update scroll style when header unfixed', function() {
               scroll._headersHeight = { top: 10, bottom: 20 };
               scroll._displayState.canScroll = true;
               scroll._fixedHandler(null, 0, 0);
               assert.strictEqual(scroll._scrollbarStyles, 'top:0px; bottom:0px;');
               assert.strictEqual(scroll._displayState.contentHeight, 50);
            });
            it('Should\'t update scroll style if there is no scroll', function() {
               scroll._displayState.contentHeight = 40;
               scroll._displayState.canScroll = false;
               scroll._fixedHandler(null, 10, 10);
               assert.strictEqual(scroll._scrollbarStyles, '');
               assert.strictEqual(scroll._displayState.contentHeight, 40);
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
               assert.equal(scroll._children.content.scrollTop, 10);
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
                  scrollTop: 0,
                  scrollLeft: 0,
                  scrollWidth: 200,
                  offsetWidth: 100
               },
               scrollDetect: {
                  start: () => null
               }
            };
            scrollContainer._scrollTop = 0;
            scrollContainer._scrollLeft = 0;

            it('scrollTop and scrollLeft has not changed. scroll should not fire', function() {
               sandbox.stub(scrollContainer._children.scrollDetect, 'start');
               sandbox.stub(scrollContainer, '_notify');
               scrollContainer._scrollHandler({});
               sinon.assert.notCalled(scrollContainer._notify);
               sinon.assert.notCalled(scrollContainer._children.scrollDetect.start);
               sandbox.restore();
            });
            [{
               scrollType: 'scrollTop'
            },{
               scrollType: 'scrollLeft'
            }].forEach(function(test) {
               it(`${test.scrollType} has changed. scroll should fire`, function() {
                  sandbox.stub(scrollContainer._children.scrollDetect, 'start');
                  sandbox.stub(scrollContainer, '_notify');
                  scrollContainer._children.content[test.scrollType] = 10;
                  scrollContainer._scrollHandler({});
                  sinon.assert.calledWith(scrollContainer._notify, 'scroll', [10]);
                  sinon.assert.calledWith(scrollContainer._children.scrollDetect.start, sinon.match.any, 10);
                  sandbox.restore();
               });
            });
         });

         it('scrollToBottom', () => {
            let
               sandbox = sinon.createSandbox(),
               scrollContainer = new scrollMod.Container({});

            scrollContainer._children = {
               content: {
                  scrollHeight: 200,
                  clientHeight: 50,
               }
            };
            sandbox.stub(scrollMod.Container._private, 'setScrollTop');
            scrollContainer.scrollToBottom();

            sinon.assert.calledWith(scrollMod.Container._private.setScrollTop, sinon.match.any, 150);
            sandbox.restore();
         });

         it('should function scrollToRight work correctly', () => {
            let
               sandbox = sinon.createSandbox(),
               scrollContainer = new scrollMod.Container({});

            scrollContainer._children = {
               content: {
                  scrollWidth: 200,
                  clientWidth: 50,
               }
            };
            sandbox.stub(scrollMod.Container._private, 'setScrollLeft');
            scrollContainer.scrollToRight();

            sinon.assert.calledWith(scrollMod.Container._private.setScrollLeft, sinon.match.any, 150);
            sandbox.restore();
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

         const  SCROLL_TYPE = {
            VERTICAL: 'vertical',
            HORIZONTAL: 'horizontal'
         };
         describe('Controls.Container.Shadow', function() {
            var result;
            describe('calcShadowPosition', function() {
               it('Тень сверху', function() {
                  result = scrollMod.Container._private.calcShadowPosition(SCROLL_TYPE.VERTICAL, 100, 100, 200);
                  assert.equal(result, 'top');
               });
               it('Тень снизу', function() {
                  result = scrollMod.Container._private.calcShadowPosition(SCROLL_TYPE.VERTICAL, 0, 100, 200);
                  assert.equal(result, 'bottom');
               });
               it('Shadow on the left', function() {
                  result = scrollMod.Container._private.calcShadowPosition(SCROLL_TYPE.HORIZONTAL, 100, 100, 200);
                  assert.equal(result, 'left');
               });
               it('Shadow on the right', function() {
                  result = scrollMod.Container._private.calcShadowPosition(SCROLL_TYPE.HORIZONTAL, 0, 100, 200);
                  assert.equal(result, 'right');
               });
               it('Should hide bottom shadow if there is less than 1 pixel to the bottom.', function() {
                  // Prevent rounding errors in the scale do not equal 100%
                  result = scrollMod.Container._private.calcShadowPosition(SCROLL_TYPE.VERTICAL, 99.234, 100, 200);
                  assert.notInclude(result, 'bottom');
               });
               it('Should hide bottom shadow if there is less than 1 pixel to the right.', function() {
                  // Prevent rounding errors in the scale do not equal 100%
                  result = scrollMod.Container._private.calcShadowPosition(SCROLL_TYPE.HORIZONTAL, 99.234, 100, 200);
                  assert.notInclude(result, 'right');
               });
               it('Тень сверху и снизу', function() {
                  result = scrollMod.Container._private.calcShadowPosition(SCROLL_TYPE.VERTICAL, 50, 100, 200);
                  assert.equal(result, 'topbottom');
               });
               it('Shadow on the left and on the right', function() {
                  result = scrollMod.Container._private.calcShadowPosition(SCROLL_TYPE.HORIZONTAL, 50, 100, 200);
                  assert.equal(result, 'leftright');
               });
            });

            describe('_updateShadowMode', function() {
               const mode = {
                  top: 'visible',
                  bottom: 'visible',
               };
               it('Should update shadow mode if the container is visible.', function() {
                  sinon.stub(scroll, '_isHidden').returns(false);
                  sinon.stub(scroll, '_forceUpdate');
                  scroll._updateShadowMode(event, mode);
                  assert.include(scroll._shadowVisibilityByInnerComponents, mode);
                  sinon.assert.called(event.stopImmediatePropagation);
                  sinon.assert.called(scroll._forceUpdate);
                  sinon.restore();
               });
               it('Should\'t update shadow mode if the container is hidden.', function() {
                  sinon.stub(scroll, '_isHidden').returns(true);
                  sinon.stub(scroll, '_forceUpdate');
                  scroll._updateShadowMode(event, mode);
                  assert.notInclude(scroll._shadowVisibilityByInnerComponents, mode);
                  sinon.assert.called(event.stopImmediatePropagation);
                  sinon.assert.notCalled(scroll._forceUpdate);
                  sinon.restore();
               });
               it('Should\'t force update if value does not changed.', function() {
                  scroll._shadowVisibilityByInnerComponents = mode
                  sinon.stub(scroll, '_isHidden').returns(true);
                  sinon.stub(scroll, '_forceUpdate');
                  scroll._updateShadowMode(event, mode);
                  sinon.assert.called(event.stopImmediatePropagation);
                  sinon.assert.notCalled(scroll._forceUpdate);
                  sinon.restore();
               });
            });

            describe('getSizes', function() {
               var container = {
                  scrollHeight: 200,
                  offsetHeight: 100,
                  scrollTop: 0,
                  scrollWidth: 200,
                  offsetWidth: 100,
                  scrollLeft: 0
               };

               it('getScrollHeight', function() {
                  result = scrollMod.Container._private.getScrollSize(SCROLL_TYPE.VERTICAL, container);
                  assert.equal(result, 200);
               });
               it('getContainerHeight', function() {
                  result = scrollMod.Container._private.getContainerSize(SCROLL_TYPE.VERTICAL, container);
                  assert.equal(result, 100);
               });
               it('getScrollTop', function() {
                  result = scrollMod.Container._private.getScrollTop({ _topPlaceholderSize: 0 }, container);
                  assert.equal(result, 0);
               });
               it('getScrollWidth', function() {
                  result = scrollMod.Container._private.getScrollSize(SCROLL_TYPE.HORIZONTAL, container);
                  assert.equal(result, 200);
               });
               it('getContainerWidth', function() {
                  result = scrollMod.Container._private.getContainerSize(SCROLL_TYPE.HORIZONTAL, container);
                  assert.equal(result, 100);
               });
               it('getScrollLeft', function() {
                  result = scrollMod.Container._private.getScrollLeft({ _leftPlaceholderSize: 0 }, container);
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
                  options: { shadowVisible: false },
                  position: 'left',
                  result: false
               }, {
                  options: { shadowVisible: false },
                  position: 'right',
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
                  options: { leftShadowVisibility: 'visible', rightShadowVisibility: 'hidden' },
                  position: 'left',
                  result: true
               }, {
                  options: { leftShadowVisibility: 'visible', rightShadowVisibility: 'hidden' },
                  position: 'right',
                  result: false
               }, {
                  options: { topShadowVisibility: 'auto', bottomShadowVisibility: 'hidden' },
                  position: 'top',
                  result: true
               }, {
                  options: { topShadowVisibility: 'hidden', bottomShadowVisibility: 'auto' },
                  position: 'top',
                  result: false
               }, {
                  options: { leftShadowVisibility: 'auto', rightShadowVisibility: 'hidden' },
                  position: 'left',
                  result: true
               }, {
                  options: { leftShadowVisibility: 'hidden', rightShadowVisibility: 'auto' },
                  position: 'left',
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
               }, {
                  options: { scrollMode: 'vertical' },
                  shadowVisibilityByInnerComponents: { left: 'auto', right: 'auto' },
                  position: 'right',
                  shadowPosition: 'left',
                  result: false
               }, {
                  options: { scrollMode: 'verticalHorizontal' },
                  shadowVisibilityByInnerComponents: { left: 'auto', right: 'auto' },
                  position: 'left',
                  shadowPosition: 'left',
                  result: true
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

define(
   [
      'Env/Env',
      'Controls/scroll',
      'ControlsUnit/Calendar/Utils',
      'wml!ControlsUnit/Container/resources/Content',
      'Controls/_scroll/Container/PagingModel'
   ],
   function(Env, scrollMod, utils, Content, PagingModel) {
      'use strict';

      describe('Controls.Container.Scroll', function() {
         var scroll;
         let event;

         beforeEach(function() {
            event = {
               stopImmediatePropagation: sinon.fake()
            };
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

            scroll._children.scrollBar = {
               _position: 0,
               setViewportSize: sinon.fake()
            };
         });

         describe('_shadowVisible', function() {
            [{
               title: 'should called setStickyFixed with correct args',
               shadowPosition: 'top',
               hasFixed: true,
               hasShadowVisible: true,
               result: false,
            }, {
               title: 'should called setStickyFixed with correct args',
               shadowPosition: 'top',
               hasFixed: true,
               hasShadowVisible: false,
               result: true
            }].forEach(function(test) {
               it(test.title, function() {
                  scroll._stickyHeaderController = {
                     hasFixed: function() {
                        return Boolean(test.hasFixed);
                     },
                     hasShadowVisible: function() {
                        return Boolean(test.hasShadowVisible);
                     },
                     fixedHandler() {},
                     getHeadersHeight() {},
                     setShadowVisibility () {}
                  };

                  let result;

                  scroll._scrollbars = {
                     setOffsets() {}
                  };
                  scroll._shadows = {
                     setStickyFixed(res) {
                        result = res;
                     },
                     top: {
                        isStickyHeadersShadowsEnabled: sinon.stub().returns({ then: () => undefined })
                     },
                     bottom: {
                        isStickyHeadersShadowsEnabled: sinon.stub().returns({ then: () => undefined })
                     }
                  };
                  scroll._stickyFixedHandler({}, {});

                  if (test.result) {
                     assert.isFalse(result);
                  } else {
                     assert.isTrue(result);
                  }
                  sinon.assert.called(scroll._children.scrollBar.setViewportSize);
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
            }].forEach(function(test) {
               it(`should return ${test.result} if offset = ${test.offset},  scrollHeight = ${test.scrollHeight},  clientHeight = ${test.clientHeight}`, function() {
                  scroll._scrollModel = {
                     scrollHeight: test.scrollHeight,
                     clientHeight: test.clientHeight
                  };

                  if (test.result) {
                     assert.isTrue(scroll.canScrollTo(test.offset));
                  } else {
                     assert.isFalse(scroll.canScrollTo(test.offset));
                  }
               });
            });
         });

         describe('Paging buttons. PagingModel', function() {
            beforeEach(function() {
               scroll._container = {
                  closest: () => {}
               };
               scroll._stickyHeaderController = {
                  setCanScroll: () => ({ then: () => undefined }),
                  resizeHandler: () => undefined
               };
            });
            it('Content at the top', function() {
               scroll._paging = new PagingModel.default();
               scroll._paging.update({
                  verticalPosition: 'start'
               });

               assert.equal(scroll._paging._arrowState.begin, 'readonly');
               assert.equal(scroll._paging._arrowState.next, 'visible');
            });
            it('Content at the middle', function() {
               scroll._paging = new PagingModel.default();
               scroll._paging.update({
                  verticalPosition: 'middle'
               });

               assert.equal(scroll._paging._arrowState.begin, 'visible');
               assert.equal(scroll._paging._arrowState.next, 'visible');
            });
            it('Content at the bottom', function() {
               scroll._paging = new PagingModel.default();
               scroll._paging.update({
                  verticalPosition: 'end'
               });

               assert.equal(scroll._paging._arrowState.begin, 'visible');
               assert.equal(scroll._paging._arrowState.next, 'readonly');
            });
         });

         describe('_resizeHandler', function() {
            beforeEach(function() {
               scroll._container = {
                  closest: () => {}
               };
               scroll._shadows = {
                  top: {
                     isStickyHeadersShadowsEnabled: sinon.stub().returns({ then: () => undefined })
                  },
                  bottom: {
                     isStickyHeadersShadowsEnabled: sinon.stub().returns({ then: () => undefined })
                  }
               };
               scroll._stickyHeaderController = {
                  setCanScroll: sinon.stub().returns({ then: () => undefined }),
                  setShadowVisibility: sinon.stub().returns({ then: () => undefined }),

                  resizeHandler: () => undefined
               };
            });
            it('should update _displayState if it changed(vertical scroll).', function() {
               const oldState = {
                  scrollTop: 0,
                  scrollHeight: 200,
                  clientHeight: 100
               };
               let result;
               scroll._scrollModel = Object.assign({
                  clone: () => {
                     return oldState;
                  },
                  updateState: () => {
                     return false;
                  }
               }, oldState);

               const sandbox = sinon.createSandbox();
               scroll._options.optimizeShadow = true;
               scroll._scrollbars = {
                  updateScrollState: sinon.stub().returns(true)
               };

               scroll._shadows.updateScrollState = state => result = state;

               sinon.stub(scroll, '_updateScrollContainerPaigingSccClass');

               scroll._updateState({
                  scrollTop: 100,
                  scrollHeight: 200,
                  clientHeight: 100
               });

               assert.notStrictEqual(result, oldState);

               let isUpdated = scroll._updateState({
                  scrollTop: 100,
                  scrollHeight: 200,
                  clientHeight: 100
               });

               assert.isFalse(isUpdated);
               sandbox.restore();
            });
         });
      });
   }
);

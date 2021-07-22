import { assert } from 'chai';
import {fake, assert as sinonAssert} from 'sinon';

import {_ContainerBase as ContainerBase} from 'Controls/scroll';
import {IContainerBaseOptions} from 'Controls/_scroll/ContainerBase';
import {SCROLL_MODE} from 'Controls/_scroll/Container/Type';
import {SCROLL_DIRECTION, SCROLL_POSITION} from 'Controls/_scroll/Utils/Scroll';

var global = (function() { return this || (0,eval)('this') })();

function getBoundingClientRectMock() {
   return { height: 30, width: 50};
}

describe('Controls/scroll:ContainerBase', () => {
   const options: IContainerBaseOptions = {
      scrollOrientation: SCROLL_MODE.VERTICAL
   };

   const contains: Function = () => false;
   const classList = { contains: () => false };

   describe('_beforeMount', () => {
      it('should create models', () => {
         const control: ContainerBase = new ContainerBase(options);
         control._beforeMount(options);
         assert.isDefined(control._resizeObserver);
         assert.strictEqual(control._scrollCssClass, 'controls-Scroll-ContainerBase__scroll_vertical');
         assert.strictEqual(control._initialScrollPositionCssClass, 'controls-Scroll-ContainerBase__scrollPosition-regular');
      });

      it('initialScrollPosition, vertical: end', () => {
         const testOptions = {
            ...options,
            initialScrollPosition: {
               vertical: SCROLL_POSITION.END
            }
         };
         const control: ContainerBase = new ContainerBase(testOptions);
         control._beforeMount(testOptions);
         assert.strictEqual(control._initialScrollPositionCssClass, 'controls-Scroll-ContainerBase__scrollPosition-vertical-end');
      });

      it('initialScrollPosition, horizontal: end', () => {
         const testOptions = {
            ...options,
            initialScrollPosition: {
               horizontal: SCROLL_POSITION.END
            }
         };
         const control: ContainerBase = new ContainerBase(testOptions);
         control._beforeMount(testOptions);
         assert.strictEqual(control._initialScrollPositionCssClass, 'controls-Scroll-ContainerBase__scrollPosition-horizontal-end');
      });
   });

   describe('_componentDidMount', () => {
      it('should restore scrollTop to 0', () => {
         const control: ContainerBase = new ContainerBase(options);
         control._children = { content: { scrollTop: 10 } };
         control._container = {
            dataset: {
               scrollContainerNode: 'true'
            }
         };
         control._componentDidMount();
         assert.strictEqual(control._children.content.scrollTop, 0);
      });

      it('should not restore scrollTop to 0', () => {
         const control: ContainerBase = new ContainerBase(options);
         control._children = { content: { scrollTop: 10 } };
         control._container = {
            dataset: { /* scrollContainerNode is missing */}
         };
         control._componentDidMount();
         assert.strictEqual(control._children.content.scrollTop, 10);
      });


      it('should restore flex-direction and set scrollTop to end. vertical: end.', () => {
         const testOptions = {
            ...options,
            initialScrollPosition: {
               vertical: SCROLL_POSITION.END
            }
         };
         const control: ContainerBase = new ContainerBase(testOptions);
         control._options = testOptions;
         control._children = {
            content: {
               scrollTop: 10,
               scrollHeight: 100,
               classList: {
                  remove: fake(),
                  add: fake()
               }
            }
         };
         control._componentDidMount();
         assert.strictEqual(control._children.content.scrollTop, 100);
         sinonAssert.calledWith(control._children.content.classList.remove,
             'controls-Scroll-ContainerBase__scrollPosition-vertical-end');
         sinonAssert.calledWith(control._children.content.classList.add,
             'controls-Scroll-ContainerBase__scrollPosition-regular');
      });

      it('should restore flex-direction and set scrollTop to end. horizontal: end.', () => {
         const testOptions = {
            ...options,
            initialScrollPosition: {
               horizontal: SCROLL_POSITION.END
            }
         };
         const control: ContainerBase = new ContainerBase(testOptions);
         control._options = testOptions;
         control._children = {
            content: {
               scrollLeft: 10,
               scrollWidth: 100,
               classList: {
                  remove: fake(),
                  add: fake()
               }
            }
         };
         control._container = {
            dataset: {}
         }
         control._componentDidMount();
         assert.strictEqual(control._children.content.scrollLeft, 100);
         sinonAssert.calledWith(control._children.content.classList.remove,
             'controls-Scroll-ContainerBase__scrollPosition-horizontal-end');
         sinonAssert.calledWith(control._children.content.classList.add,
             'controls-Scroll-ContainerBase__scrollPosition-regular');
      });
   });

   describe('_afterMount', () => {
      it('should initialize models', () => {
         const control: ContainerBase = new ContainerBase(options);
         const children = [ { classList: { contains } }, { classList: { contains } } ];
         control._beforeMount(options);

         sinon.stub(control._resizeObserver, 'observe');
         control._controlResizeHandler = () => {};
         control._children = {
            content: {
               getBoundingClientRect: getBoundingClientRectMock
            },
            userContent: {
               children: children
            }
         };
         control._afterMount();
         sinon.assert.called(control._resizeObserver.observe);
         assert.isEmpty(control._observedElements);
         sinon.restore();
      });
   });

   describe('_beforeUpdate', () => {
      it('should update state and generate events if ResizeObserver is not supported ', () => {
         const control: ContainerBase = new ContainerBase(options);
         control._beforeMount(options);
         control._beforeUpdate({scrollOrientation: SCROLL_MODE.VERTICAL_HORIZONTAL});
         assert.strictEqual(control._scrollCssClass, 'controls-Scroll-ContainerBase__scroll_verticalHorizontal');
      });
   });

   describe('_afterUpdate', () => {
      let control;
      const content = {
         scrollTop: 10,
         scrollLeft: 20,
         clientHeight: 30,
         scrollHeight: 40,
         clientWidth: 50,
         scrollWidth: 60,
         getBoundingClientRect: getBoundingClientRectMock
      };

      beforeEach(() => {
         control = new ContainerBase();
         control._state = {
         };
         control._children = {
            content: content,
            userContent: {
               children: [{
                  classList: {
                     contains: () => true
                  }
               }]
            }
         };

         sinon.stub(control, '_generateEvent');
         sinon.stub(control, '_sendByListScrollRegistrar');
         sinon.stub(control, '_sendScrollMoveAsync');
      });

      afterEach(() => {
         sinon.restore();
         control = null;
      });

      it('should update state from dom if resize observer unavailable', () => {
         control._resizeObserverSupported = false;
         sinon.stub(control, '_observeContentSize');
         sinon.stub(control, '_unobserveDeleted');
         control._resizeObserver = {
            isResizeObserverSupported: () => {
               return true;
            },
            observe: () => {
               return 0;
            }
         };
         sinon.stub(control, '_resizeObserver');
         sinon.stub(control, '_isHorizontalScroll');
         control._afterMount();
         control._afterUpdate();

         assert.strictEqual(control._scrollModel.scrollTop, content.scrollTop);
         assert.strictEqual(control._scrollModel.scrollLeft, content.scrollLeft);
         assert.strictEqual(control._scrollModel.clientHeight, content.clientHeight);
         assert.strictEqual(control._scrollModel.scrollHeight, content.scrollHeight);
         assert.strictEqual(control._scrollModel.clientWidth, content.clientWidth);
         assert.strictEqual(control._scrollModel.scrollWidth, content.scrollWidth);
      });

      it("should't update state from dom if resize observer available", () => {
         control._resizeObserverSupported = true;
         sinon.stub(control, '_observeContentSize');
         sinon.stub(control, '_unobserveDeleted');

         control._afterUpdate();

         assert.isUndefined(control._state.scrollTop);
         assert.isUndefined(control._state.scrollLeft);
         assert.isUndefined(control._state.clientHeight);
         assert.isUndefined(control._state.scrollHeight);
         assert.isUndefined(control._state.clientWidth);
         assert.isUndefined(control._state.scrollWidth);
      });

      it('should update observed containers', () => {
         const children = [ { classList: {contains: () => true} }, { classList: {contains} } ];
         control._beforeMount(options);
         control._resizeObserverSupported = true;

         sinon.stub(control._resizeObserver, 'observe');
         sinon.stub(control._resizeObserver, 'unobserve');
         control._children.userContent.children = children;
         control._observedElements = [children[0], 'children3'];
         control._contentType = 'restricted';
         control._afterUpdate();

         assert.sameMembers(control._observedElements, children);
      });
   });

   describe('_beforeUnmount', () => {
      it('should destroy models and controllers', () => {
         const control: ContainerBase = new ContainerBase(options);
         control._container = {
            dataset: {
               scrollContainerNode: 0
            }
         };
         control._beforeMount(options);

         sinon.stub(control._resizeObserver, 'terminate');

         control._beforeUnmount();

         sinon.assert.called(control._resizeObserver.terminate);
         assert.isNull(control._scrollModel);
         assert.isNull(control._oldScrollState);
      });
   });

   describe('_resizeHandler', () => {
      it('should destroy models and controllers', () => {
         const control: ContainerBase = new ContainerBase(options);
         control._beforeMount(options);

         const content = {
            scrollTop: 10,
            scrollLeft: 20,
            clientHeight: 30,
            scrollHeight: 40,
            clientWidth: 50,
            scrollWidth: 60,
            getBoundingClientRect: getBoundingClientRectMock
         };

         control._children = {
            content: content,
            userContent: {
               children: [{
                  classList: {
                     contains: () => true
                  }
               }]
            }
         };

         control._resizeObserver = {
            isResizeObserverSupported: () => {
               return true;
            },
            observe: () => {
               return 0;
            }
         };
         sinon.stub(control, '_resizeObserver');
         sinon.stub(control, '_observeContentSize');
         sinon.stub(control, '_isHorizontalScroll');
         control._afterMount();

         control._resizeHandler();

         assert.strictEqual(control._scrollModel.scrollTop, content.scrollTop);
         assert.strictEqual(control._scrollModel.scrollLeft, content.scrollLeft);
         assert.strictEqual(control._scrollModel.clientHeight, content.clientHeight);
         assert.strictEqual(control._scrollModel.scrollHeight, content.scrollHeight);
         assert.strictEqual(control._scrollModel.clientWidth, content.clientWidth);
         assert.strictEqual(control._scrollModel.scrollWidth, content.scrollWidth);
         sinon.restore();
      });
   });

   describe('_resizeObserverCallback', () => {
      it('should\'t update state if container is invisible', () => {
         const control: ContainerBase = new ContainerBase(options);
         control._beforeMount(options);

         control._container = {
            closest: sinon.stub().returns(true),
            className: ''
         }

         const getComputedStyle = global.getComputedStyle;
         global.getComputedStyle = () => { return {} };

         sinon.stub(control, '_updateStateAndGenerateEvents');

         control._resizeObserverCallback();

         sinon.assert.notCalled(control._updateStateAndGenerateEvents);

         global.getComputedStyle = getComputedStyle;

         sinon.restore();
      });
   });

   describe('_scrollHandler', () => {
      it('should scroll to locked position if its specified', () => {
         const position: number = 10;
         const control: ContainerBase = new ContainerBase(options);
         control._beforeMount(options);

         control._scrollLockedPosition = position;
         control._children = {
            content: {
               scrollTop: 0
            },
            userContent: {
               children: [{
                  classList: {
                     contains: () => true
                  }
               }]
            }
         };

         control._scrollHandler({currentTarget: { scrollTop: position }});

         assert.strictEqual(control._children.content.scrollTop, position);
      });

      it('should\'t scroll if locked position is not specified', () => {
         const position: number = 10;
         const control: ContainerBase = new ContainerBase(options);
         control._beforeMount(options);

         control._scrollLockedPosition = null;
         control._children = {
            content: {
               scrollTop: position,
               getBoundingClientRect: getBoundingClientRectMock
            },
            userContent: {
               children: [{
                  classList: {
                     contains: () => true
                  }
               }]
            }
         };
         control._resizeObserver = {
            isResizeObserverSupported: () => {
               return true;
            },
            observe: () => {
               return 0;
            }
         };
         sinon.stub(control, '_resizeObserver');
         sinon.stub(control, '_observeContentSize');
         sinon.stub(control, '_isHorizontalScroll');
         control._afterMount();

         control._scrollHandler({currentTarget: { scrollTop: position }});

         assert.strictEqual(control._children.content.scrollTop, position);
         sinon.restore();
      });
   });

   describe('_registerIt', () => {
      it('should register on all registrars', () => {
         const control: ContainerBase = new ContainerBase(options);
         control._beforeMount(options);

         sinon.stub(control._registrars.scrollStateChanged, 'register');
         sinon.stub(control._registrars.listScroll, 'register');
         sinon.stub(control._registrars.scroll, 'register');
         sinon.stub(control, '_onRegisterNewComponent');
         sinon.stub(control, '_onRegisterNewListScrollComponent');

         const registerTypes = ['scrollStateChanged', 'listScroll', 'scroll'];
         registerTypes.forEach((registerType) => {
            control._registerIt('event', registerType);
         });

         sinon.assert.called(control._registrars.scrollStateChanged.register);
         sinon.assert.called(control._registrars.listScroll.register);
         sinon.assert.called(control._registrars.scroll.register);
         sinon.restore();
      });
   });

   describe('_unRegisterIt', () => {
      it('should unregister on all registrars', () => {
         const control: ContainerBase = new ContainerBase(options);
         control._beforeMount(options);

         sinon.stub(control._registrars.scrollStateChanged, 'unregister');
         sinon.stub(control._registrars.listScroll, 'unregister');
         sinon.stub(control._registrars.scroll, 'unregister');

         const registerTypes = ['scrollStateChanged', 'listScroll', 'scroll'];
         registerTypes.forEach((registerType) => {
            control._unRegisterIt('event', registerType);
         });

         sinon.assert.called(control._registrars.scrollStateChanged.unregister);
         sinon.assert.called(control._registrars.listScroll.unregister);
         sinon.assert.called(control._registrars.scroll.unregister);
         sinon.restore();
      });
   });

   describe('scrollTo', () => {
      it('should scroll vertical', () => {
         const control: ContainerBase = new ContainerBase(options);
         const newPosition: number = 10;
         control._beforeMount(options);

         control._children = {
            content: {
               scrollTop: 0
            }
         };

         control.scrollTo(newPosition);

         assert.strictEqual(control._children.content.scrollTop, newPosition);
      });

      it('should scroll horizontal', () => {
         const control: ContainerBase = new ContainerBase(options);
         const newPosition: number = 10;
         control._beforeMount(options);

         control._children = {
            content: {
               scrollLeft: 0
            }
         };

         control.scrollTo(newPosition, SCROLL_DIRECTION.HORIZONTAL);

         assert.strictEqual(control._children.content.scrollLeft, newPosition);
      });
   });

   describe('canScrollTo', () => {
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
      }].forEach((test) => {
         it(`should return ${test.result} if offset = ${test.offset},  scrollHeight = ${test.scrollHeight},  clientHeight = ${test.clientHeight}`, () => {
            const control: ContainerBase = new ContainerBase(options);
            control._scrollModel = {
               scrollHeight: test.scrollHeight,
               clientHeight: test.clientHeight
            };

            if (test.result) {
               assert.isTrue(control.canScrollTo(test.offset));
            } else {
               assert.isFalse(control.canScrollTo(test.offset));
            }
         });
      });
   });

   describe('horizontalScrollTo', () => {
      it('should scroll', () => {
         const control: ContainerBase = new ContainerBase(options);
         const newPosition: number = 10;
         control._beforeMount(options);

         control._children = {
            content: {
               scrollLeft: 0
            }
         };

         control.horizontalScrollTo(newPosition);

         assert.strictEqual(control._children.content.scrollLeft, newPosition);
      });
   });

   describe('scrollTo edge', () => {
      [{
         position: 'Top',
         scrollPosition: 0,
         checkProperty: 'scrollTop'
      }, {
         position: 'Bottom',
         scrollPosition: 100,
         checkProperty: 'scrollTop'
      }, {
         position: 'Left',
         scrollPosition: 0,
         checkProperty: 'scrollLeft'
      }, {
         position: 'Right',
         scrollPosition: 100,
         checkProperty: 'scrollLeft'
      }].forEach((test) => {
         it(`should scroll to ${test.position}`, () => {
            const control: ContainerBase = new ContainerBase(options);
            control._beforeMount(options);

            control._children = {
               content: {
                  scrollTop: 10,
                  scrollHeight: 200,
                  clientHeight: 100,
                  scrollLeft: 10,
                  scrollWidth: 200,
                  clientWidth: 100,
                  getBoundingClientRect: getBoundingClientRectMock
               },
               userContent: {
                  children: [{
                     classList: {
                        contains: () => true
                     }
                  }]
               }
            };
            control._resizeObserver = {
               isResizeObserverSupported: () => {
                  return true;
               },
               observe: () => {
                  return 0;
               }
            };
            sinon.stub(control, '_resizeObserver');
            sinon.stub(control, '_observeContentSize');
            sinon.stub(control, '_isHorizontalScroll');
            control._afterMount();

            control._scrollModel._scrollTop = control._children.content.scrollTop;
            control._scrollModel._scrollHeight = control._children.content.scrollHeight;
            control._scrollModel._clientHeight = control._children.content.clientHeight;
            control._scrollModel._scrollLeft = control._children.content.scrollLeft;
            control._scrollModel._scrollWidth = control._children.content.scrollWidth;
            control._scrollModel._clientWidth = control._children.content.clientWidth;

            control[`scrollTo${test.position}`]();

            assert.strictEqual(control._children.content[test.checkProperty], test.scrollPosition);
            sinon.restore();
         });
      });
   });

   describe('_onRegisterNewComponent', () => {
      it('should propagate event to registered component', () => {
         const registeredControl: string = 'registeredControl';
         const control: ContainerBase = new ContainerBase(options);
         control._beforeMount(options);
         control._isStateInitialized = true;
         control._scrollModel = {
            clone: () => {
               return 0;
            }
         };
         control._oldScrollState = {
            clone: () => {
               return 0;
            }
         };

         sinon.stub(control._registrars.scrollStateChanged, 'startOnceTarget');
         control._onRegisterNewComponent(registeredControl);
         sinon.assert.calledWith(control._registrars.scrollStateChanged.startOnceTarget, registeredControl);
         sinon.restore();
      });
   });

   describe('_updateState', () => {
      it('scrollState and oldScrollState should be different', () => {
         const component = new ContainerBase();
         component._children = {
            content: {
               getBoundingClientRect: getBoundingClientRectMock,
               scrollTop: 100
            }
         };
         component._updateState({});
         assert.notEqual(component._scrollModel.scrollTop, component._oldScrollState.scrollTop);
         assert.isUndefined(component._oldScrollState.scrollTop);
      });

      it('should not update state if unchanged state arrives', () => {
         const inst:ContainerBase = new ContainerBase();
         inst._children = {
            content: {
               scrollTop: 0,
               getBoundingClientRect: getBoundingClientRectMock
            },
            userContent: {
               children: [{
                  classList: {
                     contains: () => true
                  }
               }]
            }
         };
         inst._resizeObserver = {
            isResizeObserverSupported: () => {
               return true;
            },
            observe: () => {
               return 0;
            }
         };
         sinon.stub(inst, '_resizeObserver');
         sinon.stub(inst, '_observeContentSize');
         sinon.stub(inst, '_isHorizontalScroll');
         inst._afterMount();
         assert.isFalse(inst._updateState({ scrollTop: 0 }));
         sinon.restore();
      });

      it('should update state if changed state arrives', () => {
         const inst = new ContainerBase();
         inst._children = {
            content: {
               scrollTop: 0,
               getBoundingClientRect: getBoundingClientRectMock
            },
            userContent: {
               children: [{
                  classList: {
                     contains: () => true
                  }
               }]
            }
         };
         inst._resizeObserver = {
            isResizeObserverSupported: () => {
               return true;
            },
            observe: () => {
               return 0;
            }
         };
         sinon.stub(inst, '_resizeObserver');
         sinon.stub(inst, '_observeContentSize');
         sinon.stub(inst, '_isHorizontalScroll');
         inst._afterMount();
         assert.isTrue(inst._updateState({ scrollTop: 1 }));
         sinon.restore();
      });
   });

   describe('_onRegisterNewListScrollComponent', () => {
      it('should propagate event to registered component', () => {
         const registeredControl: string = 'registeredControl';
         const control: ContainerBase = new ContainerBase(options);
         control._beforeMount(options);
         control._children = {
            content: {
               scrollTop: 0,
               scrollLeft: 0,
               clientHeight: 100,
               scrollHeight: 100,
               clientWidth: 100,
               scrollWidth: 100,
               getBoundingClientRect: () => { return { height: 100, width: 100 }}
            },
            userContent: {
               children: [{
                  classList: {
                     contains: () => true
                  }
               }]
            }
         };
          control._resizeObserver = {
              isResizeObserverSupported: () => {
                  return true;
              },
              observe: () => {
                  return 0;
              }
          };
          sinon.stub(control, '_resizeObserver');
          sinon.stub(control, '_observeContentSize');
         sinon.stub(control, '_isHorizontalScroll');
          control._afterMount();

         sinon.stub(control._registrars.listScroll, 'startOnceTarget');
         control._onRegisterNewListScrollComponent(registeredControl);
         sinon.assert.calledWith(control._registrars.listScroll.startOnceTarget, registeredControl, 'cantScroll');
         sinon.assert.calledWith(control._registrars.listScroll.startOnceTarget, registeredControl, 'viewportResize');
         sinon.restore();
      });
   });

   describe('_lockScrollPositionUntilKeyboardShown', () => {
      it('should set 0 if scroll state is not initialized', () => {
         const control: ContainerBase = new ContainerBase(options);
         control._lockScrollPositionUntilKeyboardShown();
         assert.strictEqual(control._scrollLockedPosition, 0);
      });

      it('should set value from scroll state', () => {
         const control: ContainerBase = new ContainerBase(options);
         control._scrollModel = { scrollTop: 10 }
         control._lockScrollPositionUntilKeyboardShown();
         assert.strictEqual(control._scrollLockedPosition, control._scrollModel.scrollTop);
      });
   });

   describe('_enableVirtualNavigationHandler, _disableVirtualNavigationHandler', () => {
      [
          '_enableVirtualNavigationHandler',
          '_disableVirtualNavigationHandler'
      ].forEach((method) => {
         it('should stop event propagation', () => {
            const control: ContainerBase = new ContainerBase(options);
            control._beforeMount(options)
            const event = {
               stopImmediatePropagation: fake()
            }
            control[method](event);
            sinonAssert.calledOnce(event.stopImmediatePropagation);
         });
      })
   });

});

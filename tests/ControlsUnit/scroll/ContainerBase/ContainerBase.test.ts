import {_ContainerBase as ContainerBase} from 'Controls/scroll';
import {IContainerBaseOptions} from 'Controls/_scroll/ContainerBase';
import {SCROLL_MODE} from 'Controls/_scroll/Container/Type';
import {SCROLL_DIRECTION} from 'Controls/_scroll/Utils/Scroll';

describe('Controls/scroll:ContainerBase', () => {
   const options: IContainerBaseOptions = {
      scrollMode: SCROLL_MODE.VERTICAL
   };

   const contains: Function = () => false;
   const classList = { contains: () => false };

   describe('_beforeMount', () => {
      it('should create models', () => {
         const control: ContainerBase = new ContainerBase(options);
         control._beforeMount(options);
         assert.isDefined(control._resizeObserver);
         assert.strictEqual(control._scrollCssClass, 'controls-Scroll-ContainerBase__scroll_vertical');
      });
   });

   describe('_afterMount', () => {
      it('should initialize models', () => {
         const control: ContainerBase = new ContainerBase(options);
         const children = [ { classList: {contains} }, { classList: {contains} } ];
         control._beforeMount(options);

         sinon.stub(control._resizeObserver, 'observe');
         control._controlResizeHandler = () => {};
         control._children = {
            content: {
               children: children,
               getBoundingClientRect: () => {}
            },
            userContent: {
               children: [{
                  classList: {
                     contains: () => true
                  }
               }]
            }
         };
         control._afterMount();
         sinon.assert.called(control._resizeObserver.observe);
         assert.sameMembers(control._observedElements, children);
         sinon.restore();
      });
   });

   describe('_beforeUpdate', () => {
      it('should update state and generate events if ResizeObserver is not supported ', () => {
         const control: ContainerBase = new ContainerBase(options);
         control._beforeMount(options);
         control._beforeUpdate({scrollMode: SCROLL_MODE.VERTICAL_HORIZONTAL});
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
         getBoundingClientRect: sinon.fake()
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
         const children = [ { classList: {contains} }, { classList: {contains} } ];
         control._beforeMount(options);
         control._resizeObserverSupported = true;

         sinon.stub(control._resizeObserver, 'observe');
         sinon.stub(control._resizeObserver, 'unobserve');
         control._children.content.children = children;
         control._observedElements = [children[0], 'children3'];

         control._afterUpdate();

         assert.sameMembers(control._observedElements, children);
      });
   });

   describe('_beforeUnmount', () => {
      it('should destroy models and controllers', () => {
         const control: ContainerBase = new ContainerBase(options);
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
            getBoundingClientRect: sinon.fake()
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
            closest: sinon.stub().returns(true)
         }

         sinon.stub(control, '_updateStateAndGenerateEvents');

         control._resizeObserverCallback();

         sinon.assert.notCalled(control._updateStateAndGenerateEvents);
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
               getBoundingClientRect: sinon.fake()
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

         control._registerIt();

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

         control._unRegisterIt();

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
                  getBoundingClientRect: sinon.fake()
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
      it('should not update state if unchanged state arrives', () => {
         const inst:ContainerBase = new ContainerBase();
         inst._children = {
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
         inst._afterMount();
         assert.isFalse(inst._updateState({ scrollTop: 0 }));
         sinon.restore();
      });

      it('should update state if changed state arrives', () => {
         const inst = new ContainerBase();
         inst._children = {
            content: {
               scrollTop: 0,
               getBoundingClientRect: () => {
                  return {};
               }
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
               getBoundingClientRect: sinon.fake()
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
          control._afterMount();

         sinon.stub(control._registrars.listScroll, 'startOnceTarget');
         control._onRegisterNewListScrollComponent(registeredControl);
         sinon.assert.calledWith(control._registrars.listScroll.startOnceTarget, registeredControl, 'cantScroll');
         sinon.assert.calledWith(control._registrars.listScroll.startOnceTarget, registeredControl, 'viewportResize');
         sinon.restore();
      });
   });

});

import {_ContainerBase as ContainerBase} from 'Controls/scroll';
import {IContainerBaseOptions} from 'Controls/_scroll/ContainerBase';
import {SCROLL_MODE} from 'Controls/_scroll/Container/Type';
import {SCROLL_DIRECTION} from 'Controls/_scroll/Utils/Scroll';

describe('Controls/scroll:ContainerBase', () => {
   const options: IContainerBaseOptions = {
      scrollMode: SCROLL_MODE.VERTICAL
   };

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
         const children: string[] = [ 'children1', 'children2' ];
         control._beforeMount(options);

         sinon.stub(control._resizeObserver, 'observe');
         control._children = {
            content: {
               children: children
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
            content: content
         };

         sinon.stub(control, '_sendByRegistrar');
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

         control._afterUpdate();

         assert.strictEqual(control._state.scrollTop, content.scrollTop);
         assert.strictEqual(control._state.scrollLeft, content.scrollLeft);
         assert.strictEqual(control._state.clientHeight, content.clientHeight);
         assert.strictEqual(control._state.scrollHeight, content.scrollHeight);
         assert.strictEqual(control._state.clientWidth, content.clientWidth);
         assert.strictEqual(control._state.scrollWidth, content.scrollWidth);
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
         const children: string[] = ['children1', 'children2'];
         control._beforeMount(options);
         control._resizeObserverSupported = true;

         sinon.stub(control._resizeObserver, 'observe');
         control._children.content.children = children;
         control._observedElements = ['children1', 'children3'];

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
         assert.isNull(control._state);
         assert.isNull(control._oldState);
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
            content: content
         };

         control._resizeHandler();

         assert.strictEqual(control._state.scrollTop, content.scrollTop);
         assert.strictEqual(control._state.scrollLeft, content.scrollLeft);
         assert.strictEqual(control._state.clientHeight, content.clientHeight);
         assert.strictEqual(control._state.scrollHeight, content.scrollHeight);
         assert.strictEqual(control._state.clientWidth, content.clientWidth);
         assert.strictEqual(control._state.scrollWidth, content.scrollWidth);
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
            }
         };

         control._scrollHandler({currentTarget: { scrollTop: position }});

         assert.strictEqual(control._children.content.scrollTop, position);
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
            control._state.scrollHeight = test.scrollHeight;
            control._state.clientHeight = test.clientHeight;

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
               }
            };
            control._state.scrollTop = control._children.content.scrollTop;
            control._state.scrollHeight = control._children.content.scrollHeight;
            control._state.clientHeight = control._children.content.clientHeight;
            control._state.scrollLeft = control._children.content.scrollLeft;
            control._state.scrollWidth = control._children.content.scrollWidth;
            control._state.clientWidth = control._children.content.clientWidth;

            control[`scrollTo${test.position}`]();

            assert.strictEqual(control._children.content[test.checkProperty], test.scrollPosition);
         });
      });
   });

   describe('_onRegisterNewComponent', () => {
      it('should propagate event to registered component', () => {
         const registeredControl: string = 'registeredControl';
         const control: ContainerBase = new ContainerBase(options);
         control._beforeMount(options);
         control._isStateInitialized = true;

         sinon.stub(control._registrars.scrollStateChanged, 'startOnceTarget');
         control._onRegisterNewComponent(registeredControl);
         sinon.assert.calledWith(control._registrars.scrollStateChanged.startOnceTarget, registeredControl);
         sinon.restore();
      });
   });

   describe('_updateState', () => {
      it('should not update state if unchanged state arrives', () => {
         const inst:ContainerBase = new ContainerBase();
         inst._state = {
            scrollTop: 0
         };
         assert.isFalse(inst._updateState({ scrollTop: 0 }));
      });

      it('should update state if changed state arrives', () => {
         const inst:ContainerBase = new ContainerBase();
         const sandBox = sinon.createSandbox();
         sandBox.stub(inst, '_updateCalculatedState');
         inst._state = {
            scrollTop: 0
         };
         assert.isTrue(inst._updateState({ scrollTop: 1 }));
         sandBox.restore();
      });
   });

});

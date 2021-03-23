define(
   [
      'Controls/popupSliding',
      'Controls/_popupSliding/Strategy',
      'Controls/popup'
   ],
   (popupSliding, Strategy, popupLib) => {
      'use strict';
      var StrategyConstructor = Strategy.Strategy;
      var StrategySingleton = Strategy.default;
      var Controller = popupSliding.Controller;
      var PopupController = popupLib.Controller;
      var getPopupItem = (height = 400, windowHeight) => {
         return {
            id: 'randomId',
            position: {
               left: 0,
               right: 0,
               height,
               top: windowHeight - height
            },
            sizes: {
               height: height
            },
            popupOptions: {
               className: '',
               desktopMode: 'stack',
               slidingPanelOptions: {
                  minHeight: 400,
                  position: 'bottom',
                  maxHeight: 800
               }
            },
            container: getPopupContainer(height)
         };
      };
      var getPopupContainer = (height, width) => {
         return {
            height,
            width,
            style: {},
            classList: {
               _classes: [],
               add(className) {
                  this._classes.push(className);
               },
               contains(className) {
                  return this._classes.includes(className);
               },
               toggle(className, state) {
                  if (state && !this.contains(className)) {
                     this.add(className);
                  } else {
                     const index = this._classes.indexOf(className);
                     if (index > -1) {
                        this._classes = this._classes.splice(index, number);
                     }
                  }
               }
            },
            getBoundingClientRect() {
               return {
                  height: this.height,
                  width: this.width
               };
            }
         };
      };

      describe('Controls/popupSliding', () => {
         describe('Strategy getPosition', () => {
            it('default case', () => {
               const item = getPopupItem();
               const SlidingPanelStrategy = new StrategyConstructor();
               SlidingPanelStrategy.getWindowHeight = () => 900;
               const position = SlidingPanelStrategy.getPosition(item);

               assert.deepEqual(position, {
                  left: 0,
                  right: 0,
                  top: 900,
                  maxHeight: 800,
                  minHeight: 400,
                  height: 400,
                  position: 'fixed'
               });
            });
            it('with initial position', () => {
               const SlidingPanelStrategy = new StrategyConstructor();
               const item = getPopupItem();
               SlidingPanelStrategy.getWindowHeight = () => 900;
               item.position = {
                  top: 900,
                  height: 500
               };
               const position = SlidingPanelStrategy.getPosition(item, item.position);

               assert.equal(position.height, item.position.height);
               assert.equal(position.top, 900 - item.position.height);
            });
            describe('check overflow', () => {
               it('window height < minHeight', () => {
                  const SlidingPanelStrategy = new StrategyConstructor();
                  const item = getPopupItem();
                  const heightForOverflow = 300;
                  SlidingPanelStrategy.getWindowHeight = () => heightForOverflow;
                  const position = SlidingPanelStrategy.getPosition(item);

                  assert.equal(position.height, heightForOverflow);
                  assert.equal(position.minHeight, heightForOverflow);
                  assert.equal(position.maxHeight, heightForOverflow);
                  assert.equal(position.top, heightForOverflow);
               });
               it('minHeight < window height < maxHeight', () => {
                  const SlidingPanelStrategy = new StrategyConstructor();
                  const item = getPopupItem();
                  const heightForOverflow = 500;
                  SlidingPanelStrategy.getWindowHeight = () => heightForOverflow;
                  const position = SlidingPanelStrategy.getPosition(item);

                  assert.equal(position.height, 400);
                  assert.equal(position.minHeight, 400);
                  assert.equal(position.maxHeight, heightForOverflow);
                  assert.equal(position.top, heightForOverflow);
               });
               it('initial height < minHeight', () => {
                  const SlidingPanelStrategy = new StrategyConstructor();
                  const item = getPopupItem();
                  SlidingPanelStrategy.getWindowHeight = () => 900;
                  item.position = {
                     top: 900,
                     height: 300
                  };
                  const position = SlidingPanelStrategy.getPosition(item);

                  assert.equal(position.height, position.minHeight);
               });
            });
            describe('position', () => {
               it('bottom', () => {
                  const SlidingPanelStrategy = new StrategyConstructor();
                  const item = getPopupItem();
                  SlidingPanelStrategy.getWindowHeight = () => 900;
                  item.popupOptions.slidingPanelOptions.position = 'bottom';
                  const position = SlidingPanelStrategy.getPosition(item);

                  assert.equal(position.top, 900);
               });
               it('bottom', () => {
                  const SlidingPanelStrategy = new StrategyConstructor();
                  const item = getPopupItem();
                  item.popupOptions.slidingPanelOptions.position = 'top';
                  SlidingPanelStrategy.getWindowHeight = () => 900;
                  const position = SlidingPanelStrategy.getPosition(item);

                  assert.equal(position.bottom, 900);
               });
            });
         });
         describe('Controller', () => {
            describe('elementCreated', () => {
               it('position bottom', () => {
                  const sandbox = sinon.sandbox.create();
                  sandbox.stub(StrategyConstructor.prototype, 'getWindowHeight').callsFake(() => 900);
                  const SlidingPanelStrategy = new StrategyConstructor();
                  const item = getPopupItem();
                  item.popupOptions.slidingPanelOptions.position = 'bottom';
                  Controller.getDefaultConfig(item);
                  item.position = SlidingPanelStrategy.getPosition(item);

                  assert.equal(item.position.top, 900);

                  const result = Controller.elementCreated(item, item.container);
                  assert.isTrue(item.popupOptions.className.includes('controls-SlidingPanel__animation-position-bottom'));

                  assert.equal(item.position.top, 900 - item.position.height);
                  assert.equal(result, true);
                  sandbox.restore();
               });
               it('position top', () => {
                  const sandbox = sinon.sandbox.create();
                  sandbox.stub(StrategyConstructor.prototype, 'getWindowHeight').callsFake(() => 900);
                  const SlidingPanelStrategy = new StrategyConstructor();
                  const item = getPopupItem();
                  item.popupOptions.slidingPanelOptions.position = 'top';
                  SlidingPanelStrategy.getWindowHeight = () => 900;
                  Controller.getDefaultConfig(item);
                  item.position = SlidingPanelStrategy.getPosition(item);

                  assert.equal(item.position.bottom, 900);

                  const result = Controller.elementCreated(item, item.container);
                  assert.isTrue(item.popupOptions.className.includes('controls-SlidingPanel__animation-position-top'));

                  assert.equal(item.position.bottom, 900 - item.position.height);
                  assert.equal(result, true);
                  sandbox.restore();
               });
            });
            it('elementUpdated', () => {
               const sandbox = sinon.sandbox.create();
               const item = getPopupItem();
               item.position = {
                  height: 500,
                  top: 900
               };

               sandbox.stub(StrategySingleton, 'getPosition');

               const result = Controller.elementUpdated(item, getPopupContainer(item.position.height));

               sinon.assert.called(StrategySingleton.getPosition);
               assert.equal(result, true);
               sandbox.restore();
            });
            it('elementDestroyed + elementAnimated', (resolve) => {
               const item = getPopupItem();
               const SlidingPanelStrategy = new StrategyConstructor();
               SlidingPanelStrategy.getWindowHeight = () => 900;

               Controller.getDefaultConfig(item);
               item.position = SlidingPanelStrategy.getPosition(item);
               let destroyedPromiseResolved = false;

               const result = Controller.elementDestroyed(item, getPopupContainer(item.position.height));

               assert.equal(result instanceof Promise, true);

               Controller.elementAnimated(item, getPopupContainer(item.position.height));

               const timeoutId = setTimeout(() => {
                  assert.equal(destroyedPromiseResolved, true);
                  resolve();
               }, 200);

               result.then(() => {
                  destroyedPromiseResolved = true;
                  assert.equal(destroyedPromiseResolved, true);
                  clearTimeout(timeoutId);
                  resolve();
               });
            });

            it('safari body dragging fix', () => {
               const sandbox = sinon.sandbox.create();
               const item1 = getPopupItem();
               const item2 = getPopupItem();

               sandbox.stub(Controller, '_toggleCancelBodyDragging');
               const container1 = getPopupContainer(item1.position.height);
               const container2 = getPopupContainer(item2.position.height);

               Controller.elementCreated(item1, container1);
               Controller.elementCreated(item2, container2);

               sinon.assert.calledOnce(Controller._toggleCancelBodyDragging);
               sinon.assert.calledWithMatch(Controller._toggleCancelBodyDragging, true);

               Controller.elementDestroyed(item1, container1);
               Controller.elementDestroyed(item2, container2);

               sinon.assert.calledTwice(Controller._toggleCancelBodyDragging);
               sinon.assert.calledWithMatch(Controller._toggleCancelBodyDragging, false);

               sandbox.restore();
            });
            describe('getDefaultConfig', () => {
               it('postion bottom', () => {
                  const sandbox = sinon.sandbox.create();
                  sandbox.stub(StrategyConstructor.prototype, 'getWindowHeight').callsFake(() => 900);
                  const item = getPopupItem();
                  item.popupOptions.slidingPanelOptions.position = 'bottom';
                  Controller.getDefaultConfig(item, item.container);

                  assert.deepEqual(item.popupOptions.slidingPanelData, {
                     minHeight: item.position.minHeight,
                     maxHeight: item.position.maxHeight,
                     height: item.position.height,
                     position: item.popupOptions.slidingPanelOptions.position,
                     desktopMode: 'stack'
                  });
                  assert.equal(item.popupOptions.hasOwnProperty('content'), true);
                  sandbox.restore();
               });

               it('postion top', () => {
                  const sandbox = sinon.sandbox.create();
                  sandbox.stub(StrategyConstructor.prototype, 'getWindowHeight').callsFake(() => 900);
                  const item = getPopupItem();
                  item.popupOptions.slidingPanelOptions.position = 'top';
                  Controller.getDefaultConfig(item);

                  assert.deepEqual(item.popupOptions.slidingPanelData, {
                     minHeight: item.position.minHeight,
                     maxHeight: item.position.maxHeight,
                     height: item.position.height,
                     position: item.popupOptions.slidingPanelOptions.position,
                     desktopMode: 'stack'
                  });
                  assert.equal(item.popupOptions.hasOwnProperty('content'), true);
                  sandbox.restore();
               });
            });
            describe('popupDragStart', () => {
               it('position bottom', () => {
                  const sandbox = sinon.sandbox.create();
                  let height = 0;
                  sandbox.stub(StrategySingleton, 'getPosition').callsFake((item) => {
                     height = item.position.height;
                     return item.position;
                  });

                  const item = getPopupItem();
                  const SlidingPanelStrategy = new StrategyConstructor();
                  SlidingPanelStrategy.getWindowHeight = () => 900;

                  item.popupOptions.slidingPanelOptions.position = 'bottom';
                  item.position = SlidingPanelStrategy.getPosition(item);
                  item.position.height = item.position.height + 100;
                  const startHeight = item.position.height;
                  const container = getPopupContainer(startHeight);

                  Controller.popupDragStart(item, container, {
                     x: 0,
                     y: 10
                  });
                  Controller.popupDragEnd(item, container);
                  assert.equal(height, startHeight - 10);
                  sandbox.restore();
               });

               it('position top', () => {
                  const sandbox = sinon.sandbox.create();
                  let height = 0;
                  sandbox.stub(StrategySingleton, 'getPosition').callsFake((item) => {
                     height = item.position.height;
                     return item.position;
                  });

                  const item = getPopupItem();
                  const SlidingPanelStrategy = new StrategyConstructor();
                  SlidingPanelStrategy.getWindowHeight = () => 900;

                  item.popupOptions.slidingPanelOptions.position = 'top';
                  Controller.getDefaultConfig(item);
                  item.position = SlidingPanelStrategy.getPosition(item);
                  item.position.height = item.position.height + 100;
                  const startHeight = item.position.height;

                  Controller.popupDragStart(item, item.container, {
                     x: 0, y: 10
                  });
                  Controller.popupDragEnd(item);
                  assert.equal(height, startHeight + 10);
                  sandbox.restore();
               });
               it('double drag', () => {
                  const sandbox = sinon.sandbox.create();
                  let height = 0;
                  sandbox.stub(StrategySingleton, 'getPosition').callsFake((item) => {
                     height = item.position.height;
                     return item.position;
                  });

                  const item = getPopupItem();
                  const SlidingPanelStrategy = new StrategyConstructor();
                  SlidingPanelStrategy.getWindowHeight = () => 900;

                  item.popupOptions.slidingPanelOptions.position = 'bottom';
                  Controller.getDefaultConfig(item);
                  item.position = SlidingPanelStrategy.getPosition(item);
                  item.position.height = item.position.height + 100;
                  const startHeight = item.position.height;

                  Controller.popupDragStart(item, item.container, {
                     x: 0,
                     y: 10
                  });
                  Controller.popupDragStart(item, item.container, {
                     x: 0,
                     y: -20
                  });
                  Controller.popupDragEnd(item, item.container);
                  assert.equal(height, startHeight + 20);
                  sandbox.restore();
               });
               it('overflow max', () => {
                  const sandbox = sinon.sandbox.create();
                  let height = 0;
                  sandbox.stub(StrategySingleton, 'getPosition').callsFake((item) => {
                     height = item.position.height;
                     return item.position;
                  });

                  const item = getPopupItem();
                  const SlidingPanelStrategy = new StrategyConstructor();
                  SlidingPanelStrategy.getWindowHeight = () => 900;

                  Controller.getDefaultConfig(item);
                  item.position = SlidingPanelStrategy.getPosition(item);
                  item.position.height = item.position.height + 100;
                  const startHeight = item.position.height;

                  Controller.popupDragStart(item, item.container, {
                     x: 0, y: -10000
                  });
                  Controller.popupDragEnd(item, item.container);

                  assert.equal(height, startHeight + 10000);
                  sinon.assert.called(StrategySingleton.getPosition);
                  sandbox.restore();
               });
               it('overflow min', () => {
                  const sandbox = sinon.sandbox.create();
                  let height = 0;
                  sandbox.stub(StrategySingleton, 'getPosition').callsFake((item) => {
                     height = item.position.height;
                     return item.position;
                  });

                  const item = getPopupItem();
                  const SlidingPanelStrategy = new StrategyConstructor();
                  SlidingPanelStrategy.getWindowHeight = () => 900;

                  Controller.getDefaultConfig(item);
                  item.position = SlidingPanelStrategy.getPosition(item);
                  item.position.height = item.position.height + 100;
                  const startHeight = item.position.height;

                  Controller.popupDragStart(item, item.container, {
                     x: 0, y: 10000
                  });
                  Controller.popupDragEnd(item, item.container);
                  assert.equal(height, startHeight - 10000);
                  sinon.assert.called(StrategySingleton.getPosition);
                  sandbox.restore();
               });
               it('close by drag', () => {
                  const sandbox = sinon.sandbox.create();
                  sandbox.stub(PopupController, 'remove').callsFake(() => null);

                  const item = getPopupItem();
                  const SlidingPanelStrategy = new StrategyConstructor();
                  SlidingPanelStrategy.getWindowHeight = () => 900;

                  Controller.getDefaultConfig(item);
                  item.position = SlidingPanelStrategy.getPosition(item);

                  Controller.popupDragStart(item, getPopupContainer(item.position.height), {
                     x: 0, y: 10
                  });
                  Controller.popupDragEnd(item);
                  sinon.assert.called(PopupController.remove);
                  sandbox.restore();
               });
               it('minHeight > windowHeight. try to drag top. window should not close', () => {
                  const sandbox = sinon.sandbox.create();
                  sandbox.stub(PopupController, 'remove').callsFake(() => null);

                  const item = getPopupItem(undefined, 300);
                  const SlidingPanelStrategy = new StrategyConstructor();
                  SlidingPanelStrategy.getWindowHeight = () => 300;

                  Controller.getDefaultConfig(item);
                  item.position = SlidingPanelStrategy.getPosition(item);

                  Controller.popupDragStart(item, item.container, {
                     x: 0, y: -10
                  });
                  Controller.popupDragEnd(item);
                  sinon.assert.notCalled(PopupController.remove);
                  sandbox.restore();
               });
            });
         });
      });
   }
);

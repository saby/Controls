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
      var getPopupItem = () => {
         return {
            id: 'randomId',
            position: {
               left: 0,
               right: 0
            },
            popupOptions: {
               desktopMode: 'stack',
               slidingPanelOptions: {
                  minHeight: 400,
                  position: 'bottom',
                  maxHeight: 800
               }
            }
         };
      };
      var getPopupContainer = () => {
         return {
            style: {},
            classList: {
               _classes: [],
               add(className): void {
                  this._classes.push(className);
               },
               contains(className) {
                  return this._classes.includes(className);
               }
            }
         };
      };

      describe('Controls/popupSliding', () => {
         describe('Strategy getPosition', () => {
            it('default case', () => {
               const item = getPopupItem();
               const SlidingPanelStrategy = new StrategyConstructor();
               SlidingPanelStrategy._getWindowHeight = () => 900;
               const position = SlidingPanelStrategy.getPosition(item);

               assert.deepEqual(position, {
                  left: 0,
                  right: 0,
                  bottom: -10000,
                  maxHeight: 800,
                  minHeight: 400,
                  height: 400,
                  position: 'fixed'
               });
            });
            it('with initial position', () => {
               const SlidingPanelStrategy = new StrategyConstructor();
               const item = getPopupItem();
               item.position = {
                  bottom: 0,
                  height: 500
               };
               SlidingPanelStrategy._getWindowHeight = () => 900;
               const position = SlidingPanelStrategy.getPosition(item);

               assert.equal(position.height, item.position.height);
               assert.equal(position.bottom, 0);
            });
            describe('check overflow', () => {
               it('window height < minHeight', () => {
                  const SlidingPanelStrategy = new StrategyConstructor();
                  const item = getPopupItem();
                  const heightForOverflow = 300;
                  SlidingPanelStrategy._getWindowHeight = () => heightForOverflow;
                  const position = SlidingPanelStrategy.getPosition(item);

                  assert.equal(position.height, heightForOverflow);
                  assert.equal(position.minHeight, heightForOverflow);
                  assert.equal(position.maxHeight, heightForOverflow);
                  assert.equal(position.bottom, -10000);
               });
               it('minHeight < window height < maxHeight', () => {
                  const SlidingPanelStrategy = new StrategyConstructor();
                  const item = getPopupItem();
                  const heightForOverflow = 500;
                  SlidingPanelStrategy._getWindowHeight = () => heightForOverflow;
                  const position = SlidingPanelStrategy.getPosition(item);

                  assert.equal(position.height, 400);
                  assert.equal(position.minHeight, 400);
                  assert.equal(position.maxHeight, heightForOverflow);
                  assert.equal(position.bottom, -10000);
               });
               it('initial height < minHeight', () => {
                  const SlidingPanelStrategy = new StrategyConstructor();
                  const item = getPopupItem();
                  item.position = {
                     bottom: 0,
                     height: 300
                  };
                  SlidingPanelStrategy._getWindowHeight = () => 900;
                  const position = SlidingPanelStrategy.getPosition(item);

                  assert.equal(position.height, position.minHeight);
               });
            });
            describe('position', () => {
               it('bottom', () => {
                  const SlidingPanelStrategy = new StrategyConstructor();
                  const item = getPopupItem();
                  SlidingPanelStrategy._getWindowHeight = () => 900;
                  item.popupOptions.slidingPanelOptions.position = 'bottom';
                  const position = SlidingPanelStrategy.getPosition(item);

                  assert.equal(position.bottom, -10000);
               });
               it('bottom', () => {
                  const SlidingPanelStrategy = new StrategyConstructor();
                  const item = getPopupItem();
                  item.popupOptions.slidingPanelOptions.position = 'top';
                  SlidingPanelStrategy._getWindowHeight = () => 900;
                  const position = SlidingPanelStrategy.getPosition(item);

                  assert.equal(position.top, -10000);
               });
            });
         });
         describe('Controller', () => {
            describe('elementCreated', () => {
               it('position bottom', () => {
                  const SlidingPanelStrategy = new StrategyConstructor();
                  const item = getPopupItem();
                  item.popupOptions.slidingPanelOptions.position = 'bottom';
                  SlidingPanelStrategy._getWindowHeight = () => 900;
                  item.position = SlidingPanelStrategy.getPosition(item);

                  assert.equal(item.position.bottom, -10000);

                  const container = getPopupContainer();
                  const result = Controller.elementCreated(item, container);
                  assert.equal(container.style.inset, '0 auto 0 0');
                  assert.isTrue(item.popupOptions.className.includes('controls-SlidingPanel__animation-position-bottom'));

                  assert.equal(item.position.bottom, 0);
                  assert.equal(result, true);
               });
               it('position top', () => {
                  const SlidingPanelStrategy = new StrategyConstructor();
                  const item = getPopupItem();
                  item.popupOptions.slidingPanelOptions.position = 'top';
                  SlidingPanelStrategy._getWindowHeight = () => 900;
                  item.position = SlidingPanelStrategy.getPosition(item);

                  assert.equal(item.position.top, -10000);

                  const result = Controller.elementCreated(item, getPopupContainer());
                  assert.isTrue(item.popupOptions.className.includes('controls-SlidingPanel__animation-position-top'));

                  assert.equal(item.position.top, 0);
                  assert.equal(result, true);
               });
            });
            it('elementUpdated', () => {
               const sandbox = sinon.sandbox.create();
               const item = getPopupItem();
               item.position = {
                  height: 500,
                  bottom: 0
               };

               sandbox.stub(StrategySingleton, 'getPosition');

               const result = Controller.elementUpdated(item, getPopupContainer());

               sinon.assert.called(StrategySingleton.getPosition);
               assert.equal(result, true);
               sandbox.restore();
            });
            it('elementDestroyed + elementAnimated', (resolve) => {
               const item = getPopupItem();
               const SlidingPanelStrategy = new StrategyConstructor();
               SlidingPanelStrategy._getWindowHeight = () => 900;

               item.position = SlidingPanelStrategy.getPosition(item);
               let destroyedPromiseResolved = false;

               const result = Controller.elementDestroyed(item, getPopupContainer());

               assert.equal(result instanceof Promise, true);

               Controller.elementAnimated(item, getPopupContainer());

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
               const container1 = getPopupContainer();
               const container2 = getPopupContainer();

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

                  const item = getPopupItem();
                  item.popupOptions.slidingPanelOptions.position = 'bottom';
                  Controller.getDefaultConfig(item, getPopupContainer());

                  assert.deepEqual(item.popupOptions.slidingPanelData, {
                     minHeight: item.position.minHeight,
                     maxHeight: item.position.maxHeight,
                     height: item.position.height,
                     position: item.popupOptions.slidingPanelOptions.position,
                     desktopMode: 'stack'
                  });
                  assert.equal(item.popupOptions.hasOwnProperty('content'), true);
               });

               it('postion top', () => {
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
                  SlidingPanelStrategy._getWindowHeight = () => 900;

                  item.popupOptions.slidingPanelOptions.position = 'bottom';
                  item.position = SlidingPanelStrategy.getPosition(item);
                  item.position.height = item.position.height + 100;
                  const startHeight = item.position.height;
                  const container = getPopupContainer()

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
                  SlidingPanelStrategy._getWindowHeight = () => 900;

                  item.popupOptions.slidingPanelOptions.position = 'top';
                  item.position = SlidingPanelStrategy.getPosition(item);
                  item.position.height = item.position.height + 100;
                  const startHeight = item.position.height;

                  Controller.popupDragStart(item, getPopupContainer(), {
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
                  SlidingPanelStrategy._getWindowHeight = () => 900;

                  item.popupOptions.slidingPanelOptions.position = 'bottom';
                  item.position = SlidingPanelStrategy.getPosition(item);
                  item.position.height = item.position.height + 100;
                  const startHeight = item.position.height;
                  const container = getPopupContainer();

                  Controller.popupDragStart(item, container, {
                     x: 0,
                     y: 10
                  });
                  Controller.popupDragStart(item, container, {
                     x: 0,
                     y: -20
                  });
                  Controller.popupDragEnd(item, container);
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
                  SlidingPanelStrategy._getWindowHeight = () => 900;

                  item.position = SlidingPanelStrategy.getPosition(item);
                  item.position.height = item.position.height + 100;
                  const startHeight = item.position.height;
                  const container = getPopupContainer();

                  Controller.popupDragStart(item, container, {
                     x: 0, y: -10000
                  });
                  Controller.popupDragEnd(item, container);

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
                  SlidingPanelStrategy._getWindowHeight = () => 900;

                  item.position = SlidingPanelStrategy.getPosition(item);
                  item.position.height = item.position.height + 100;
                  const startHeight = item.position.height;
                  const container = getPopupContainer();

                  Controller.popupDragStart(item, container, {
                     x: 0, y: 10000
                  });
                  Controller.popupDragEnd(item, container);
                  assert.equal(height, startHeight - 10000);
                  sinon.assert.called(StrategySingleton.getPosition);
                  sandbox.restore();
               });
               it('close by drag', () => {
                  const sandbox = sinon.sandbox.create();
                  sandbox.stub(PopupController, 'remove').callsFake(() => null);

                  const item = getPopupItem();
                  const SlidingPanelStrategy = new StrategyConstructor();
                  SlidingPanelStrategy._getWindowHeight = () => 900;

                  item.position = SlidingPanelStrategy.getPosition(item);

                  Controller.popupDragStart(item, getPopupContainer(), {
                     x: 0, y: 10
                  });
                  Controller.popupDragEnd(item);
                  sinon.assert.called(PopupController.remove);
                  sandbox.restore();
               });
               it('minHeight > windowHeight. try to drag top. window should not close', () => {
                  const sandbox = sinon.sandbox.create();
                  sandbox.stub(PopupController, 'remove').callsFake(() => null);

                  const item = getPopupItem();
                  const SlidingPanelStrategy = new StrategyConstructor();
                  SlidingPanelStrategy._getWindowHeight = () => 300;

                  item.position = SlidingPanelStrategy.getPosition(item);

                  Controller.popupDragStart(item, getPopupContainer(), {
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

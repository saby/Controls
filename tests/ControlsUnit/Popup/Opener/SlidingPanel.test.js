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
            popupOptions: {
               position: 'bottom',
               slidingPanelSizes: {
                  minHeight: 400,
                  maxHeight: 800
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
                  bottom: -400,
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
                  assert.equal(position.bottom, -heightForOverflow);
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
                  assert.equal(position.bottom, -400);
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
                  item.popupOptions.position = 'bottom';
                  const position = SlidingPanelStrategy.getPosition(item);

                  assert.equal(position.bottom, -400);
               });
               it('bottom', () => {
                  const SlidingPanelStrategy = new StrategyConstructor();
                  const item = getPopupItem();
                  item.popupOptions.position = 'top';
                  SlidingPanelStrategy._getWindowHeight = () => 900;
                  const position = SlidingPanelStrategy.getPosition(item);

                  assert.equal(position.top, -400);
               });
            });
         });
         describe('Controller', () => {
            describe('elementCreated', () => {
               it('position bottom', () => {
                  const SlidingPanelStrategy = new StrategyConstructor();
                  const item = getPopupItem();
                  item.popupOptions.position = 'bottom';
                  SlidingPanelStrategy._getWindowHeight = () => 900;
                  item.position = SlidingPanelStrategy.getPosition(item);

                  assert.equal(item.position.bottom, -400);

                  const result = Controller.elementCreated(item, {});

                  assert.equal(item.position.bottom, 0);
                  assert.equal(result, true);
               });
               it('position top', () => {
                  const SlidingPanelStrategy = new StrategyConstructor();
                  const item = getPopupItem();
                  item.popupOptions.position = 'top';
                  SlidingPanelStrategy._getWindowHeight = () => 900;
                  item.position = SlidingPanelStrategy.getPosition(item);

                  assert.equal(item.position.top, -400);

                  const result = Controller.elementCreated(item, {});

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

               const result = Controller.elementUpdated(item, {});

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

               const result = Controller.elementDestroyed(item);

               assert.equal(result instanceof Promise, true);

               Controller.elementAnimated(item);

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
            describe('getDefaultConfig', () => {
               it('postion bottom', () => {

                  const item = getPopupItem();
                  item.popupOptions.position = 'bottom';
                  Controller.getDefaultConfig(item);

                  assert.equal(item.popupOptions.className.includes('controls-SlidingPanel__animation-position-bottom'), true);
                  assert.deepEqual(item.popupOptions.slidingPanelPosition, {
                     minHeight: item.position.minHeight,
                     maxHeight: item.position.maxHeight,
                     height: item.position.height,
                     position: item.popupOptions.position
                  });
                  assert.equal(item.popupOptions.hasOwnProperty('content'), true);
               });

               it('postion top', () => {
                  const item = getPopupItem();
                  item.popupOptions.position = 'top';
                  Controller.getDefaultConfig(item);

                  assert.equal(
                     item.popupOptions.className.includes('controls-SlidingPanel__animation-position-top'),
                     true
                  );
                  assert.deepEqual(item.popupOptions.slidingPanelPosition, {
                     minHeight: item.position.minHeight,
                     maxHeight: item.position.maxHeight,
                     height: item.position.height,
                     position: item.popupOptions.position
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

                  item.popupOptions.position = 'bottom';
                  item.position = SlidingPanelStrategy.getPosition(item);
                  item.position.height = item.position.height + 100;
                  const startHeight = item.position.height;

                  Controller.popupDragStart(item, {}, {
                     x: 0,
                     y: 10
                  });
                  Controller.popupDragEnd(item);
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

                  item.popupOptions.position = 'top';
                  item.position = SlidingPanelStrategy.getPosition(item);
                  item.position.height = item.position.height + 100;
                  const startHeight = item.position.height;

                  Controller.popupDragStart(item, {}, {
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

                  item.popupOptions.position = 'bottom';
                  item.position = SlidingPanelStrategy.getPosition(item);
                  item.position.height = item.position.height + 100;
                  const startHeight = item.position.height;

                  Controller.popupDragStart(item, {}, {
                     x: 0,
                     y: 10
                  });
                  Controller.popupDragStart(item, {}, {
                     x: 0,
                     y: -20
                  });
                  Controller.popupDragEnd(item);
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

                  Controller.popupDragStart(item, {}, {
                     x: 0, y: -10000
                  });
                  Controller.popupDragEnd(item);

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

                  Controller.popupDragStart(item, {}, {
                     x: 0, y: 10000
                  });
                  Controller.popupDragEnd(item);
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

                  Controller.popupDragStart(item, {}, {
                     x: 0, y: 10
                  });
                  Controller.popupDragEnd(item);
                  sinon.assert.called(PopupController.remove);
                  sandbox.restore();
               });
            });
         });
      });
   }
);

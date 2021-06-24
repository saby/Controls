define(
   [
      'Controls/popupTemplate',
      'Controls/popup',
      'Controls/Application/SettingsController',
      'Controls/_popupTemplate/Dialog/Opener/DialogStrategy',
      'Controls/_popupTemplate/Dialog/Opener/DirectionUtil'
   ],
   (
      popupTemplate,
      popupLib,
      SettingsController,
      DialogStrategy,
      DirectionUtil
   ) => {
      'use strict';
      const {
         BaseController,
         DialogController
      } = popupTemplate;
      const DialogOpener = popupLib.Dialog;
      const mockedSettingsController = {
         storage: {
            'testDialogPosition': {
               top: 200,
               left: 500
            }
         },
         getSettings: function(propStorageIds) {
            var result = {};
            return new Promise((resolve) => {
               propStorageIds.forEach((id) => {
                  result[id] = this.storage[id];
               });
               resolve(result);
            });
         },
         setSettings: function(config) {
            for (let id in config) {
               if (config.hasOwnProperty(id)) {
                  for (let prop in config[id]) {
                     if (config.hasOwnProperty(id)) {
                        this.storage[id][prop] = config[id][prop];
                     }
                  }
               }
            }
         }
      };


      describe('Controls/_popup/Opener/Dialog', () => {
         let sizes = {
            width: 200,
            height: 300
         };

         let windowSize = {
            width: 1920,
            height: 960
         };

         let getRestrictiveContainer = DialogController._getRestrictiveContainerSize;

         DialogController._getRestrictiveContainerSize = () => windowSize;

         it('Opener: getConfig', () => {
            let getDialogConfig = DialogOpener.prototype._getDialogConfig;
            let config = getDialogConfig();
            assert.equal(config.isDefaultOpener, true);

            config = getDialogConfig({ isDefaultOpener: false });
            assert.equal(config.isDefaultOpener, false);
         });

         it('dialog positioning base', () => {
            let windowData = {
               width: 1920,
               height: 1080,
               topScroll: 0
            };
            let position = DialogStrategy.getPosition(windowData, sizes, { popupOptions: {} });
            assert.equal(position.top, 390);
            assert.equal(position.left, 860);

            windowData.topScroll = 70;
            windowData.leftScroll = 5;
            windowData.top = 10;
            windowData.left = 15;
            position = DialogStrategy.getPosition(windowData, sizes, { popupOptions: {} });
            assert.equal(position.top, 470);
            assert.equal(position.left, 880);

            let sizesCopy = { ...sizes };
            sizesCopy.height = 2000;
            DialogStrategy.getPosition(windowData, sizesCopy, { popupOptions: {} });
            position = DialogStrategy.getPosition(windowData, sizesCopy, { popupOptions: {} });
            assert.equal(position.height, windowData.height);
         });

         it('dialog positioning overflow container', () => {
            let windowData = {
               width: 300,
               height: 300,
               topScroll: 0
            };
            let position = DialogStrategy.getPosition(windowData, sizes, { popupOptions: {} });
            assert.equal(position.top, 0);
            assert.equal(position.left, 50);
            assert.equal(position.width, undefined);
            assert.equal(position.height, 300);
         });
         it('dialog positioning before mounting with minHeight', () => {
            let windowData = {
               width: 700,
               height: 700,
               topScroll: 0
            };
            let popupOptions = {
               minHeight: 200
            };
            let containerSizes = {
               width: 0,
               height: 0
            };
            let position = DialogStrategy.getPosition(windowData, containerSizes, { popupOptions: popupOptions });
            assert.equal(position.height, undefined);
         });

         it('dialog positioning overflow popup config', () => {
            let popupOptions = {
               minWidth: 300,
               maxWidth: 600
            };
            let windowData = {
               width: 500,
               height: 500,
               topScroll: 0
            };

            let sizesTest = { ...sizes };
            sizesTest.width = 600;

            let position = DialogStrategy.getPosition(windowData, sizesTest, { popupOptions });
            assert.equal(position.left, 0);
            assert.equal(position.width, 500);
         });

         it('dialog positioning overflow minWidth', () => {
            let popupOptions = {
               minWidth: 600,
               maxWidth: 700
            };
            let windowData = {
               width: 500,
               height: 500,
               topScroll: 0
            };
            let sizesTest = { ...sizes };
            sizesTest.width = 700;
            let position = DialogStrategy.getPosition(windowData, sizesTest, { popupOptions });
            assert.equal(position.left, 0);
            assert.equal(position.width, 500);
         });

         it('resetMargins', () => {
            let windowData = {
               width: 500,
               height: 500,
               topScroll: 0
            };
            let item = {
               popupOptions: {},
               targetCoords: {}
            }
            let position = DialogStrategy.getPosition(windowData, sizes, item);
            assert.equal(position.margin, 0);
         });

         it('dialog popupoptions sizes config', () => {
            let popupOptions = {
               maxWidth: 800,
               maxHeight: 800,
               minWidth: 400,
               minHeight: 400
            };
            let windowData = {
               width: 500,
               height: 500,
               topScroll: 0
            };

            let width = 800;
            let height = 800;

            let sizesTest = { ...sizes, width, height };
            let position = DialogStrategy.getPosition(windowData, sizesTest, { popupOptions });
            assert.equal(position.left, 0);
            assert.equal(position.top, 0);
            assert.equal(position.width, 500);
            assert.equal(position.height, 500);
            assert.equal(position.maxWidth, 500);
            assert.equal(position.minWidth, 400);
            assert.equal(position.maxHeight, 500);
            assert.equal(position.minHeight, 400);

            popupOptions.width = 550;
            position = DialogStrategy.getPosition(windowData, sizesTest, { popupOptions });
            assert.equal(position.width, 500);
            assert.equal(position.height, 500);
            popupOptions.height = 500;
            popupOptions.maxHeight = 400;
            position = DialogStrategy.getPosition(windowData, sizesTest, { popupOptions });
            assert.equal(position.width, 500);
            assert.equal(position.height, 400);

            popupOptions.maximize = true;
            windowData.topScroll = 10;
            position = DialogStrategy.getPosition(windowData, sizesTest, { popupOptions });
            assert.equal(position.left, 0);
            assert.equal(position.top, 0);
         });

         it('dialog container sizes after update', () => {
            DialogController.prepareConfig = (cfg) => {
               if (!cfg.popupOptions.width) {
                  assert.equal(container.style.width, 'auto');
               } else {
                  assert.equal(container.style.width, 10);
               }
               if (!cfg.popupOptions.height) {
                  assert.equal(container.style.height, 'auto');
               } else {
                  assert.equal(container.style.height, 10);
               }
               assert.equal(container.style.maxWidth, '20px');
               assert.equal(container.style.maxHeight, '30px');
            };
            let container = {
               style: {
                  width: 10,
                  height: 10,
               },
               querySelector: () => { return {} },
               getBoundingClientRect: () => {
                  return {
                     width: 10,
                     height: 10
                  };
               }
            };
            DialogController.elementUpdated({
               popupOptions: {
                  width: 15,
                  height: 15,
                  maxWidth: 20,
                  maxHeight: 30
               }
            }, container);
            DialogController.elementUpdated({
               popupOptions: {
                  maxWidth: 20,
                  maxHeight: 30
               }
            }, container);
            assert.equal(container.style.width, 10);
            assert.equal(container.style.height, 10);
            assert.equal(container.style.maxWidth, '20px');
            assert.equal(container.style.maxHeight, '30px');
         });

         it('dialog default position', () => {
            let item = {
               popupOptions: {
                  maxWidth: 100,
                  maxHeight: 100,
                  minWidth: 10,
                  minHeight: 10
               }
            };
            DialogController.getDefaultConfig(item);
            assert.equal(item.position.maxWidth, 100);
            assert.equal(item.position.minWidth, 10);
            assert.equal(item.position.minHeight, 10);
            assert.equal(item.position.maxHeight, 100);

            DialogController._getRestrictiveContainerSize = () => windowSize;

            item.popupOptions = {};
            DialogController.getDefaultConfig(item);
            assert.equal(item.position.maxWidth, 1920);
            assert.equal(item.position.maxHeight, 960);
         });

         it('dialog positioned on prop storage coordinates', () => {
            const directions = [
               {horizontal: 'right', vertical: 'bottom'},
               {horizontal: 'right', vertical: 'top'},
               {horizontal: 'right', vertical: 'bottom'},
               {horizontal: 'right', vertical: 'bottom'}
            ];
            const getItem = (direction) => {
               return {
                  popupOptions: {
                     resizeDirection: direction,
                     maxWidth: 100,
                     maxHeight: 100,
                     minWidth: 10,
                     minHeight: 10,
                     [direction.vertical === 'bottom' ? 'top' : 'bottom']: 100,
                     [direction.horizontal === 'right' ? 'left' : 'right']: 100
                  }
               };
            };
            directions.forEach((direction) => {
               const item = getItem(direction);
               DialogController.getDefaultConfig(item);
               assert.equal(item.position[direction.vertical === 'bottom' ? 'top' : 'bottom'], 100);
               assert.equal(item.position[direction.horizontal === 'right' ? 'left' : 'right'], 100);
            });
         });

         it('dialog positioned out of window at start without popupOptions position', () => {
            let item = {
               popupOptions: {
                  maxWidth: 100,
                  maxHeight: 100,
                  minWidth: 10,
                  minHeight: 10
               }
            };
            DialogController.getDefaultConfig(item);
            assert.equal(item.position.top, -10000);
            assert.equal(item.position.left, -10000);
         });

         it('dialog drag start', function() {
            let item = {
               position: {
                  left: 100,
                  top: 50
               },
               sizes: {
                  width: 50,
                  height: 50
               },
               popupOptions: {}
            };
            let offset = {
               x: 10,
               y: 20
            };
            let basePrepareConfig = DialogController._prepareConfig;
            DialogController._prepareConfig = (item, sizes) => {
               assert.equal(item.sizes, sizes);
            };
            DialogController.popupDragStart(item, {}, offset);
            assert.equal(item.startPosition.left, 100);
            assert.equal(item.startPosition.top, 50);
            assert.equal(item.position.left, 110);
            assert.equal(item.position.top, 70);
            DialogController._prepareConfig = basePrepareConfig;
         });

         it('dialog draggable position', () => {
            let itemPosition = { left: 100, top: 100 };
            let windowData = {
               width: 800,
               height: 600,
               left: 0,
               top: 0,
               topScroll: 0
            };
            let position = DialogStrategy.getPosition(windowData, sizes, {
               position: itemPosition,
               dragged: true,
               popupOptions: {
                  maxWidth: 100,
                  maxHeight: 100,
                  minWidth: 10,
                  minHeight: 10
               }
            });
            assert.equal(position.left, itemPosition.left);
            assert.equal(position.top, itemPosition.top);
            assert.equal(position.maxWidth, 100);
            assert.equal(position.minWidth, 10);
            assert.equal(position.minHeight, 10);
            assert.equal(position.maxHeight, 100);

            itemPosition = {
               left: 700, top: 500, width: sizes.width, height: sizes.height
            };
            windowData = {
               width: 800,
               height: 600,
               topScroll: 0,
               left: 10,
               top: 20,
            };
            position = DialogStrategy.getPosition(windowData, sizes, {
               position: itemPosition,
               dragged: true,
               popupOptions: {
                  maxWidth: 100,
                  maxHeight: 100,
                  minWidth: 10,
                  minHeight: 10
               }
            });
            assert.equal(position.left, 610);
            assert.equal(position.top, 320);
            assert.equal(position.width, 100);
            assert.equal(position.height, 100);
            assert.equal(position.maxWidth, 100);
            assert.equal(position.minWidth, 10);
            assert.equal(position.minHeight, 10);
            assert.equal(position.maxHeight, 100);
         });

         it('propStorageId initialized', (done) => {
            SettingsController.setController(mockedSettingsController);

            let item = {
               popupOptions: {
                  propStorageId: 'testDialogPosition'
               }
            };

            // get position from storage by propstorageid
            DialogController.getDefaultConfig(item).then(() => {
               try {
                  assert.strictEqual(item.position.top, 200);
                  assert.strictEqual(item.position.left, 500);
                  assert.strictEqual(item.popupOptions.top, 200);
                  assert.strictEqual(item.popupOptions.left, 500);
                  assert.strictEqual(item.dragged, true);
                  done();
               } catch (e) {
                  done(e);
               }
            });
         });

         it('propStorageId after dragndrop', (done) => {
            SettingsController.setController(mockedSettingsController);

            let item = {
               popupOptions: {
                  propStorageId: 'testDialogPosition'
               },
               position: {
                  top: 244,
                  left: 111,
               }
            };

            // check position after dragndrop
            DialogController.popupDragEnd(item);
            DialogController.getDefaultConfig(item).then(() => {
               try {
                  assert.equal(item.popupOptions.top, 244);
                  assert.equal(item.popupOptions.left, 111);
                  done();
               } catch (e) {
                  done(e);
               }
            });
         });

         it('position setted in popupOptions', () => {
            const dialogSizes = {
               width: 200,
               height: 100
            };
            const item = {
               popupOptions: {
                  left: 100,
                  top: 100
               },
               sizes: {
                  width: 50,
                  height: 50
               },
               position: {},
               dragged: false
            };
            const windowData = {
               width: 1920,
               height: 960,
               left: 0,
               top: 0,
               leftScroll: 0
            };
            let position = DialogStrategy.getPosition(windowData, dialogSizes, item);
            assert.equal(position.left, 100);
            assert.equal(position.top, 100);

            item.popupOptions.offset = {
               vertical: 10,
               horizontal: 5
            };
            position = DialogStrategy.getPosition(windowData, dialogSizes, item);
            assert.equal(position.left, 105);
            assert.equal(position.top, 110);

            delete item.popupOptions.offset;
            item.popupOptions.left = 1900;
            item.popupOptions.width = 50;
            position = DialogStrategy.getPosition(windowData, dialogSizes, item);
            assert.equal(position.left, 1870);
         });

         it('restrictive container, maximize = true', () => {

            let item = {
               popupOptions: {
                  maximize: true
               },
               position: {
                  top: 100,
                  left: 200,
               }
            };
            let bodySelector;
            let getCoordsByContainer = BaseController.getCoordsByContainer;
            DialogController._getRestrictiveContainerSize = getRestrictiveContainer;
            BaseController.getCoordsByContainer = (selector) => {
               bodySelector = selector;
            };
            DialogController._getRestrictiveContainerSize(item);
            assert.equal(bodySelector, 'body');
            BaseController.getRootContainerCoords = getCoordsByContainer;
         });
         describe('position with resizeDirection', () => {
            const dialogSizes = {
               width: 200,
               height: 100
            };
            const item = {
               popupOptions: {},
               sizes: {
                  width: 50,
                  height: 50
               },
               position: {},
               dragged: false
            };
            const windowData = {
               width: 1920,
               height: 960,
               left: 0,
               top: 0,
               leftScroll: 0
            };
            const HORIZONTAL_DIRECTION = DirectionUtil.HORIZONTAL_DIRECTION;
            const VERTICAL_DIRECTION = DirectionUtil.VERTICAL_DIRECTION;
            it('widthout direction', () => {
               let position = DialogStrategy.getPosition(windowData, dialogSizes, item);
               assert.equal(position.left, 860);
               assert.equal(position.top, 430);
            });
            it('direction left top', () => {
               item.popupOptions.resizeDirection = {
                  horizontal: HORIZONTAL_DIRECTION.LEFT,
                  vertical: VERTICAL_DIRECTION.TOP
               };
               let position = DialogStrategy.getPosition(windowData, dialogSizes, item);
               assert.equal(position.right, 860);
               assert.equal(position.bottom, 430);
            });
            it('direction left bottom', () => {
               item.popupOptions.resizeDirection = {
                  horizontal: HORIZONTAL_DIRECTION.LEFT,
                  vertical: VERTICAL_DIRECTION.BOTTOM
               };
               let position = DialogStrategy.getPosition(windowData, dialogSizes, item);
               assert.equal(position.right, 860);
               assert.equal(position.top, 430);
            });
            it('direction right top', () => {
               item.popupOptions.resizeDirection = {
                  horizontal: HORIZONTAL_DIRECTION.RIGHT,
                  vertical: VERTICAL_DIRECTION.TOP
               };
               let position = DialogStrategy.getPosition(windowData, dialogSizes, item);
               assert.equal(position.left, 860);
               assert.equal(position.bottom, 430);
            });
            it('direction right bottom', () => {
               item.popupOptions.resizeDirection = {
                  horizontal: HORIZONTAL_DIRECTION.RIGHT,
                  vertical: VERTICAL_DIRECTION.BOTTOM
               };
               let position = DialogStrategy.getPosition(windowData, dialogSizes, item);
               assert.equal(position.left, 860);
               assert.equal(position.top, 430);
            });
            it('inner resize with direction should update sizes', () => {
               item.popupOptions.resizeDirection = {
                  horizontal: HORIZONTAL_DIRECTION.RIGHT,
                  vertical: VERTICAL_DIRECTION.BOTTOM
               };
               item.popupState = 'created';
               const originGetPopupSizes = DialogController._getPopupSizes;
               const newPopupSizes = {
                  height: 123,
                  width: 123
               };
               DialogController._getPopupSizes = () => newPopupSizes;
               DialogController.resizeInner(item, {});
               DialogController._getPopupSizes = originGetPopupSizes;
               assert.equal(item.sizes.height, newPopupSizes.height);
               assert.equal(item.sizes.width, newPopupSizes.width);
            });
            it('dragging', () => {
               item.popupOptions.resizeDirection = {
                  horizontal: HORIZONTAL_DIRECTION.LEFT,
                  vertical: VERTICAL_DIRECTION.TOP
               };
               DialogController._getRestrictiveContainerSize = () => windowData;
               let position = DialogStrategy.getPosition(windowData, dialogSizes, item);
               assert.equal(position.right, 860);
               assert.equal(position.bottom, 430);
               item.position = {
                  ...position,
                  ...dialogSizes
               };
               DialogController.popupDragStart(item, null, {
                  x: 20,
                  y: 20
               });
               position = DialogStrategy.getPosition(windowData, dialogSizes, item);
               assert.equal(position.right, 840);
               assert.equal(position.bottom, 410);
               DialogController._getRestrictiveContainerSize = getRestrictiveContainer;
               item.position = {};
               item.dragged = false;
               item.startPosition = null;
            });

            it('dragging overflow', () => {
               item.popupOptions.resizeDirection = {
                  horizontal: HORIZONTAL_DIRECTION.LEFT,
                  vertical: VERTICAL_DIRECTION.TOP
               };
               DialogController._getRestrictiveContainerSize = () => windowData;
               let position = DialogStrategy.getPosition(windowData, dialogSizes, item);
               assert.equal(position.right, 860);
               assert.equal(position.bottom, 430);
               item.position = {
                  ...position,
                  ...dialogSizes
               };
               DialogController.popupDragStart(item, null, {
                  x: 2000,
                  y: 2000
               });
               position = DialogStrategy.getPosition(windowData, dialogSizes, item);
               assert.equal(position.right, 0);
               assert.equal(position.bottom, 0);
               DialogController._getRestrictiveContainerSize = getRestrictiveContainer;
               item.position = {};
               item.dragged = false;
               item.startPosition = null;
            });
         });
      });
   }
);

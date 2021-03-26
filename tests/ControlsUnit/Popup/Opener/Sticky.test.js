define(
   [
      'Controls/_popupTemplate/Sticky/StickyStrategy',
      'Controls/_popupTemplate/Sticky/StickyController',
      'Controls/popup',
      'UI/Base',
      'Core/core-clone'
   ],
   (StickyStrategy, StickyController, popupLib, UIBase, cClone) => {
      'use strict';

      describe('Controls/_popup/Opener/Sticky', () => {
         var targetCoords = {
            top: 200,
            left: 200,
            bottom: 400,
            right: 400,
            width: 200,
            height: 200,
            leftScroll: 0,
            topScroll: 0
         };

         StickyStrategy._private.getWindowSizes = () => ({
            width: 1920,
            height: 1040
         });

         const BODY_HEIGHT = 999;
         const BASE_VIEWPORT = {
            width: 1000,
            height: 1000,
            offsetLeft: 0,
            offsetTop: 0,
            pageLeft: 0,
            pageTop: 0
         };

         StickyStrategy._private.getBody = () => ({
            width: 1000,
            height: 1000
         });
         StickyStrategy._private.getViewportHeight = () => BODY_HEIGHT;
         StickyStrategy._private.getVisualViewport = () => BASE_VIEWPORT;

         function getPositionConfig() {
            return {
               targetPoint: {
                  vertical: 'top',
                  horizontal: 'left'
               },
               direction: {
                  horizontal: 'right',
                  vertical: 'top'
               },
               offset: {
                  horizontal: 0,
                  vertical: 0
               },
               config: {},
               sizes: {
                  width: 200,
                  height: 200,
                  margins: {
                     top: 0,
                     left: 0
                  }
               },
               fittingMode: {
                  vertical: 'adaptive',
                  horizontal: 'adaptive'
               }
            };
         }

         StickyStrategy._private.isPortrait = () => false;

         it('Sticky initializing state', () => {
            let itemConfig = {
               popupState: StickyController.POPUP_STATE_INITIALIZING
            };
            let destroyDef = StickyController._elementDestroyed(itemConfig);
            assert.equal(destroyDef.isReady(), true);
         });

         it('Sticky action on scroll', () => {
            const StickyOpener = new popupLib.Sticky();
            const config = {};
            StickyOpener._getConfig(config);
            assert.equal(StickyOpener._actionOnScroll, 'none');

            config.actionOnScroll = 'close';
            StickyOpener._getConfig(config);
            assert.equal(StickyOpener._actionOnScroll, 'close');
         });

         it('Sticky gets target node', () => {
            //Тестируем: передаем в опцию target платформенный Control
            let cfg = {};
            cfg.popupOptions = {};
            cfg.popupOptions.target = new UIBase.Control({});
            cfg.popupOptions.target._container = '123';
            assert.equal(cfg.popupOptions.target._container,
               StickyController.constructor._getTargetNode(cfg));
            cfg.popupOptions.target.destroy();

            //Тестируем: передаем в опцию target domNode
            cfg.popupOptions.target = '222';
            assert.equal(cfg.popupOptions.target,
               StickyController.constructor._getTargetNode(cfg));

            //Тестируем: передаем не контрол и не domNode
            cfg.popupOptions.target = null;
            assert.isFalse(StickyController.constructor._getTargetNode(cfg));
         });

         it('Sticky updated classes', () => {
            StickyController._isTargetVisible = () => true;
            let item = {
               position: {},
               popupOptions: {},
               sizes: {}
            };
            let container = {
               getBoundingClientRect: () => {
                  return {
                     width: 100,
                     height: 100
                  };
               }
            };
            StickyController.elementCreated(item, container);
            assert.equal(typeof item.positionConfig, 'object'); // Конфиг сохранился
            assert.equal(item.sizes.width, 100); // Конфиг сохранился
            var classes = item.popupOptions.className;

            StickyController.elementUpdated(item, container);
            assert.equal(item.popupOptions.className, classes); // Классы не поменялись
         });

         it('Sticky check visible target on elementCreated', () => {
            StickyController._isTargetVisible = () => false;
            let isRemoveCalled = false;
            let ManagerControllerRemove = popupLib.Controller.remove;
            popupLib.Controller.remove = () => {
               isRemoveCalled = true;
            };
            StickyController.elementCreated({});
            assert.equal(isRemoveCalled, false);

            popupLib.Controller.remove = ManagerControllerRemove;
            StickyController._isTargetVisible = () => true;
         });

         it('fixBottomPositionForIos', () => {
            let tCoords = {
               boundingClientRect: {
                  top: 800
               },
               topScroll: 10
            };
            let windowData = {
               innerHeight: 850,
               scrollY: 350,
               innerWidth: 1000
            };

            let baseWindowData = {
               innerHeight: 0,
               scrollY: 0,
               innerWidth: 0
            };
            let position = {
               bottom: 200
            };
            StickyStrategy._private.getWindow = () => windowData;
            StickyStrategy._private.getKeyboardHeight = () => 50;
            StickyStrategy._private.isIOS12 = () => true;
            StickyStrategy._private._fixBottomPositionForIos(position, tCoords);
            assert.equal(position.bottom, 50);
            position.bottom = 200;
            StickyStrategy._private.getKeyboardHeight = () => 0;
            StickyStrategy._private.getWindow = () => baseWindowData;
            StickyStrategy._private.considerTopScroll = () => true;
            StickyStrategy._private._fixBottomPositionForIos(position, tCoords);
            StickyStrategy._private.considerTopScroll = () => false;
            StickyStrategy._private.isIOS12 = () => false;
            assert.equal(position.bottom, 210);
         });

         it('Sticky with option fittingMode=overflow', () => {
            let left = 1700;
            let right = 1900;
            let top = 800;
            let bottom = 1000;
            let targetC = {
               ...targetCoords, left, right, top, bottom
            };

            var position = StickyStrategy.getPosition({
               fittingMode: {
                  vertical: 'overflow',
                  horizontal: 'overflow'
               },
               targetPoint: {
                  vertical: 'bottom',
                  horizontal: 'left'
               },
               direction: {
                  horizontal: 'right',
                  vertical: 'bottom'
               },
               offset: {
                  horizontal: 0,
                  vertical: 0
               },
               config: {},
               sizes: {
                  width: 400,
                  height: 400,
                  margins: {
                     top: 0,
                     left: 10
                  }
               }
            }, targetC);

            assert.equal(position.top, 640);
            assert.equal(position.left, 1520);
         });

         it('Sticky position', () => {
            StickyStrategy._private.getWindowSizes = () => ({
               width: 1000,
               height: 1000
            });
            let cfg = getPositionConfig();

            // 1 position
            let position = StickyStrategy.getPosition(cfg, targetCoords);
            assert.equal(position.left, 200);
            assert.equal(position.bottom, 800);
            assert.equal(Object.keys(position).length, 5);

            // 2 position
            cfg = getPositionConfig();
            cfg.targetPoint.horizontal = 'right';
            cfg.direction.vertical = 'bottom';


            position = StickyStrategy.getPosition(cfg, targetCoords);
            assert.equal(position.left, 400);
            assert.equal(position.top, 200);
            assert.equal(Object.keys(position).length, 5);

            // 3 position
            cfg = getPositionConfig();
            cfg.targetPoint.horizontal = 'right';
            cfg.targetPoint.vertical = 'bottom';
            cfg.direction.vertical = 'bottom';
            cfg.direction.horizontal = 'left';

            position = StickyStrategy.getPosition(cfg, targetCoords);
            assert.equal(position.right, 600);
            assert.equal(position.top, 400);
            assert.equal(Object.keys(position).length, 5);

            // 4 position
            cfg = getPositionConfig();
            cfg.targetPoint.horizontal = 'left';
            cfg.targetPoint.vertical = 'bottom';
            cfg.direction.vertical = 'top';
            cfg.direction.horizontal = 'left';

            position = StickyStrategy.getPosition(cfg, targetCoords);
            assert.equal(position.right, 800);
            assert.equal(position.bottom, 600);
            assert.equal(Object.keys(position).length, 5);
         });


         it('Sticky with body scroll', () => {
            StickyStrategy._private.getWindowSizes = () => ({
               width: 1000,
               height: 1000
            });
            var targetC = {
               top: 400,
               left: 400,
               bottom: 410,
               right: 410,
               width: 10,
               height: 10,
               leftScroll: 50,
               topScroll: 50
            };

            // 3 position
            let cfg = getPositionConfig();
            cfg.targetPoint.horizontal = 'right';
            cfg.targetPoint.vertical = 'bottom';
            cfg.direction.vertical = 'bottom';
            cfg.direction.horizontal = 'left';
            let position = StickyStrategy.getPosition(cfg, targetC);
            assert.equal(position.top, 410);
            assert.equal(position.right, 590);
            assert.equal(Object.keys(position).length, 5);
         });

         it('Sticky default Config', () => {
            let item = {
               popupOptions: {
                  maxWidth: 100,
                  maxHeight: 110,
                  width: 50,
                  height: 60
               }
            };
            StickyController.getDefaultConfig(item);
            assert.equal(item.position.width, item.popupOptions.width);
            assert.equal(item.position.height, item.popupOptions.height);
            assert.equal(item.position.maxWidth, item.popupOptions.maxWidth);
            assert.equal(item.position.maxHeight, item.popupOptions.maxHeight);
            assert.equal(item.position.left, -10000);
            assert.equal(item.position.top, -10000);
            assert.equal(item.position.position, 'fixed');
         });


         it('Sticky with margins', () => {
            StickyStrategy._private.getWindowSizes = () => ({
               width: 1000,
               height: 1000
            });
            let cfg = getPositionConfig();
            cfg.targetPoint.horizontal = 'right';
            cfg.direction.vertical = 'bottom';
            cfg.sizes.margins.top = 10;
            cfg.sizes.margins.left = 10;

            let position = StickyStrategy.getPosition(cfg, targetCoords);
            assert.equal(position.left, 410);
            assert.equal(position.top, 210);
            assert.equal(Object.keys(position).length, 5);

            cfg = getPositionConfig();
            cfg.targetPoint.horizontal = 'left';
            cfg.targetPoint.vertical = 'bottom';
            cfg.direction.vertical = 'top';
            cfg.direction.horizontal = 'left';
            cfg.sizes.margins.top = 10;
            cfg.sizes.margins.left = 10;
            cfg.sizes.width = 100;
            cfg.sizes.height = 100;

            position = StickyStrategy.getPosition(cfg, targetCoords);
            assert.equal(position.right, 790);
            assert.equal(position.bottom, 590);
            assert.equal(Object.keys(position).length, 5);
         });

         it('Sticky revert position', () => {
            StickyStrategy._private.getWindowSizes = () => ({
               width: 1000,
               height: 1000
            });
            let cfg = getPositionConfig();
            cfg.sizes.height = 400;
            let position = StickyStrategy.getPosition(cfg, targetCoords);
            assert.equal(position.left, 200);
            assert.equal(position.top, 400);
            assert.equal(Object.keys(position).length, 5);

            cfg = getPositionConfig();
            cfg.sizes.width = 400;
            cfg.targetPoint.horizontal = 'left';
            cfg.targetPoint.vertical = 'bottom';
            cfg.direction.vertical = 'top';
            cfg.direction.horizontal = 'left';
            targetCoords.topScroll = 10;
            targetCoords.leftScroll = 10;

            StickyStrategy._private.getTopScroll = () => targetCoords.topScroll;

            position = StickyStrategy.getPosition(cfg, targetCoords);
            targetCoords.topScroll = 0;
            targetCoords.leftScroll = 0;
            assert.equal(position.left, 400);
            assert.equal(position.bottom, 600);
            assert.equal(Object.keys(position).length, 5);

            const newTargetCoords = {
               top: 450,
               left: 450,
               bottom: 550,
               right: 550,
               width: 100,
               height: 100,
               leftScroll: 0,
               topScroll: 0
            };
            cfg = getPositionConfig();
            cfg.sizes.width = 1000;
            cfg.sizes.height = 1000;

            position = StickyStrategy.getPosition(cfg, newTargetCoords);
            assert.equal(position.left, 450);
            assert.equal(position.bottom, 550);
         });

         it('Sticky fittingMode fixed', () => {
            StickyStrategy._private.getWindowSizes = () => ({
               width: 1000,
               height: 1000
            });
            let cfg = getPositionConfig();
            cfg.fittingMode = {
               vertical: 'fixed',
               horizontal: 'fixed'
            };
            cfg.sizes.height = 400;
            let position = StickyStrategy.getPosition(cfg, targetCoords);
            assert.equal(position.left, 200);
            assert.equal(position.bottom, 800);
            assert.equal(position.height, 200);
            assert.equal(Object.keys(position).length, 6);

            cfg = getPositionConfig();
            cfg.fittingMode = {
               vertical: 'fixed',
               horizontal: 'fixed'
            };
            cfg.sizes.width = 400;
            cfg.targetPoint.horizontal = 'left';
            cfg.targetPoint.vertical = 'bottom';
            cfg.direction.vertical = 'top';
            cfg.direction.horizontal = 'left';

            position = StickyStrategy.getPosition(cfg, targetCoords);
            assert.equal(position.right, 800);
            assert.equal(position.bottom, 600);
            assert.equal(position.width, 200);
            assert.equal(Object.keys(position).length, 6);
         });



         it('Sticky fittingMode: vertical = fixed, horizontal = adaptive ', () => {
            StickyStrategy._private.getWindowSizes = () => ({
               width: 1000,
               height: 1000
            });
            let cfg = getPositionConfig();
            cfg.fittingMode = {
               vertical : 'fixed',
               horizontal: 'adaptive'
            };
            cfg.sizes.height = 400;
            let position = StickyStrategy.getPosition(cfg, targetCoords);
            assert.equal(position.left, 200);
            assert.equal(position.bottom, 800);
            assert.equal(position.height, 200);
            assert.equal(Object.keys(position).length, 6);
         });

         it('Sticky fittingMode', () => {
            let cfg = getPositionConfig();
            cfg.fittingMode = {
               vertical : 'fixed',
            };
            cfg.sizes.height = 400;
            assert.equal(StickyController._private.prepareOriginPoint(cfg).fittingMode.horizontal, 'adaptive');


            cfg = getPositionConfig();
            cfg.fittingMode = 'fixed';
            cfg.sizes.height = 400;
            assert.equal(StickyController._private.prepareOriginPoint(cfg).fittingMode.vertical, 'fixed');
            assert.equal(StickyController._private.prepareOriginPoint(cfg).fittingMode.horizontal, 'fixed');
         });

         it('Sticky check overflow', () => {
            StickyStrategy._private.getWindowSizes = () => ({
               width: 1920,
               height: 1040
            });
            let popupCfg = { ...getPositionConfig() };
            let tCoords = { ...targetCoords };
            let position = { right: 0 };
            let overflow = StickyStrategy._private.checkOverflow(popupCfg, tCoords, position, 'horizontal');
            assert.equal(overflow, 0);

            position = {
               left: 1800
            };
            popupCfg.sizes.width = 178;
            tCoords.leftScroll = 0;
            overflow = StickyStrategy._private.checkOverflow(popupCfg, targetCoords, position, 'horizontal');
            assert.equal(overflow, 58);
         });

         it('Sticky invert position', () => {
            let popupCfg = { ...getPositionConfig() };
            let direction = 'vertical';
            popupCfg.offset.vertical = 10;
            popupCfg.sizes.margins.top = 15;
            StickyStrategy._private.invertPosition(popupCfg, direction);
            assert.equal(popupCfg.targetPoint.vertical, 'bottom');
            assert.equal(popupCfg.direction.vertical, 'bottom');
            assert.equal(popupCfg.offset.vertical, -10);
            assert.equal(popupCfg.sizes.margins.top, -15);
         });

         it('Sticky fix position', () => {
            let cfg = getPositionConfig();
            cfg.targetPoint.horizontal = 'right';
            cfg.direction.vertical = 'bottom';
            let baseFixPosition = StickyStrategy._private.fixPosition;
            let baseCheckOverflow = StickyStrategy._private.checkOverflow;
            let i = 0;
            StickyStrategy._private.checkOverflow = () => (i++ === 0 ? 100 : -100);

            StickyStrategy._private.fixPosition = (position) => {
               if (position.bottom) { // метод вызвался, проставилась координата bottom
                  position.bottom = -10;
               }
            };

            let position = StickyStrategy._private.calculatePosition(cfg, targetCoords, 'vertical');
            assert.equal(position.bottom, -10);

            StickyStrategy._private.checkOverflow = baseCheckOverflow;
            StickyStrategy._private.fixPosition = baseFixPosition;
         });

         it('Sticky protect from wrong config', () => {
            let popupCfg = { ...getPositionConfig() };
            popupCfg.fittingMode.horizontal = 'fixed';
            popupCfg.offset.horizontal = -50;
            let targetC = {
               top: 200,
               left: 0,
               bottom: 400,
               right: 200,
               width: 200,
               height: 200,
               leftScroll: 0,
               topScroll: 0
            };
            let position = StickyStrategy.getPosition(popupCfg, targetC);
            assert.equal(position.left, 0);
         });

         it('Centered sticky', () => {
            const height = 1040;
            StickyStrategy._private.getWindowSizes = () => ({
               width: 1920,
               height: height
            });
            StickyStrategy._private.getVisualViewport = () => ({...BASE_VIEWPORT, ...{height}});
            StickyStrategy._private.getBody = () => ({
               width: 1000,
               height
            });
            let popupCfg = { ...getPositionConfig() };
            popupCfg.direction.horizontal = 'center';

            popupCfg.sizes.width = 100;
            popupCfg.sizes.height = 100;

            var position = StickyStrategy.getPosition(popupCfg, targetCoords);
            assert.equal(position.bottom, 840);
            assert.equal(position.left, 250);

         });

         it('StickyStrategy setMaxSizes', () => {
            let popupCfg = {
               config: {
                  maxWidth: 100,
                  width: 50,
                  minWidth: 10,
                  maxHeight: 200,
                  height: 150,
                  minHeight: 110
               },
               fittingMode: {}
            };
            let position = {};
            const PAGE_TOP = 40;
            const GET_BODY = 1200;
            const getViewPort = StickyStrategy._private.getVisualViewport;
            const getBody = StickyStrategy._private.getBody;
            StickyStrategy._private.getBody = () => ({
               height: GET_BODY
            });
            StickyStrategy._private.getVisualViewport = () => {
               return {
                  width: 1000,
                  height: 1000,
                  pageTop: PAGE_TOP
               }};
            StickyStrategy._private.setMaxSizes(popupCfg, position);
            assert.equal(position.maxWidth, popupCfg.config.maxWidth);
            assert.equal(position.width, popupCfg.config.width);
            assert.equal(position.minWidth, popupCfg.config.minWidth);
            assert.equal(position.maxHeight, popupCfg.config.maxHeight);
            assert.equal(position.height, popupCfg.config.height);
            assert.equal(position.minHeight, popupCfg.config.minHeight);

            popupCfg.config.maxHeight = undefined;
            popupCfg.fittingMode.vertical = 'adaptive';
            position = {};
            // vpHeight - padding + (bodyHeight - vpHeight + pageTop) = bodyHeight - padding- pageTop;
            StickyStrategy._private.setMaxSizes(popupCfg, position);
            assert.equal(position.maxHeight, GET_BODY - PAGE_TOP);

            position = {top: 20};
            StickyStrategy._private.setMaxSizes(popupCfg, position);
            assert.equal(position.maxHeight, BODY_HEIGHT - 20 + PAGE_TOP);

            position = {bottom: 50};
            StickyStrategy._private.setMaxSizes(popupCfg, position);
            assert.equal(position.maxHeight, GET_BODY - 50 - PAGE_TOP);

            popupCfg.config.maxWidth = undefined;
            popupCfg.fittingMode.horizontal = 'adaptive';
            position = {};
            StickyStrategy._private.setMaxSizes(popupCfg, position);
            assert.equal(position.maxWidth, 1920);
            position = {left: 20};
            StickyStrategy._private.setMaxSizes(popupCfg, position);
            assert.equal(position.maxWidth, 1900);

            position = {right: 200};
            StickyStrategy._private.setMaxSizes(popupCfg, position);
            assert.equal(position.maxWidth, 1720);

            popupCfg.config.maxHeight = undefined;
            popupCfg.fittingMode.vertical = 'fixed';
            position = {height:4096};
            StickyStrategy._private.setMaxSizes(popupCfg, position);
            assert.equal(position.maxHeight, GET_BODY - PAGE_TOP);

            position = {top: 20};
            StickyStrategy._private.setMaxSizes(popupCfg, position);
            assert.equal(position.maxHeight, BODY_HEIGHT - 20 + PAGE_TOP);

            position = {bottom: 50};
            StickyStrategy._private.setMaxSizes(popupCfg, position);
            assert.equal(position.maxHeight, GET_BODY - 50 - PAGE_TOP);

            popupCfg.config.maxWidth = undefined;
            popupCfg.fittingMode.horizontal = 'fixed';
            position = {};
            StickyStrategy._private.setMaxSizes(popupCfg, position);
            assert.equal(position.maxWidth, 1920);
            position = {left: 20};
            StickyStrategy._private.setMaxSizes(popupCfg, position);
            assert.equal(position.maxWidth, 1900);

            position = {right: 200};
            StickyStrategy._private.setMaxSizes(popupCfg, position);
            assert.equal(position.maxWidth, 1720);
            StickyStrategy._private.getVisualViewport = getViewPort;
            StickyStrategy._private.getBody = getBody;
         });

         it('Centered targetPoint sticky', () => {
            StickyStrategy._private.getWindowSizes = () => ({
               width: 1920,
               height: 1040
            });
            let popupCfg = { ...getPositionConfig() };
            popupCfg.targetPoint.horizontal = 'center';

            popupCfg.sizes.width = 100;
            popupCfg.sizes.height = 100;

            let position = StickyStrategy.getPosition(popupCfg, targetCoords);
            assert.equal(position.left, 300);

            popupCfg.targetPoint.horizontal = 'left';
            popupCfg.targetPoint.vertical = 'center';

            position = StickyStrategy.getPosition(popupCfg, targetCoords);
            assert.equal(position.bottom, 740);
         });

         it('getFakeDivMargins', () => {
            StickyController._private.getFakeDiv = () => {
               return {
                  currentStyle: {
                     marginTop: '10.2px',
                     marginLeft: '11.4px'
                  }
               };
            };
            StickyController._private.getContainerStyles = (container) => {
               return container.currentStyle;
            };

            const item = {
               popupOptions: {}
            };

            const margins = StickyController._private.getFakeDivMargins(item);
            assert.equal(margins.left, 11.4);
            assert.equal(margins.top, 10.2);
         });

         it('elementAfterUpdated', () => {
            let item = {
               popupOptions: {},
               position: {
                  height: 100
               }
            };
            let container = {
               querySelector: () => null,
               style: {
                  width: '100px',
                  height: '300px'
               }
            };
            let newContainer = {};
            let prepareConfig = StickyController.prepareConfig;
            let isTargetVisible = StickyController._isTargetVisible;
            StickyController.prepareConfig = (itemConfig, containerConfig) => newContainer = cClone(containerConfig);
            StickyController._isTargetVisible = () => true;
            StickyController.elementAfterUpdated(item, container);

            // сбрасываем размеры с контейнера
            assert.strictEqual(newContainer.style.width, 'auto');
            assert.strictEqual(newContainer.style.height, 'auto');
            assert.strictEqual(newContainer.style.maxHeight, '100vh');

            // возвращаем их обратно
            assert.strictEqual(container.style.width, '100px');
            assert.strictEqual(container.style.height, '100px');
            assert.strictEqual(container.style.maxHeight, '');

            item.popupOptions.maxHeight = 300;
            container.style.maxHeight = '200px';
            StickyController.elementAfterUpdated(item, container);
            assert.strictEqual(newContainer.style.maxHeight, '300px');
            assert.strictEqual(container.style.maxHeight, '');
            StickyController.prepareConfig = prepareConfig;
            StickyController._isTargetVisible = isTargetVisible;
         });

         it('getMargins', () => {
            let margins = {
               top: 1,
               left: 2,
            };
            StickyController._private.getFakeDivMargins = () => margins;
            let item = {
               popupOptions: {
                  maxWidth: 200,
                  width: 150,
                  maxHeight: 200
               }
            };
            assert.deepEqual({
               left: 0,
               top: 0
            }, StickyController._private.getMargins(item));

            item.popupOptions.className = '1';
            assert.deepEqual({
               left: 2,
               top: 1
            }, StickyController._private.getMargins(item));

            margins = {
               top: 3,
               left: 4,
            };
            assert.deepEqual({
               left: 2,
               top: 1
            }, StickyController._private.getMargins(item));

            item.popupOptions.className = '2';
            assert.deepEqual({
               left: 4,
               top: 3
            }, StickyController._private.getMargins(item));
         });
         it('moveContainer', () => {
            let position = {
               right: -10
            };
            let flagRestrict = false;
            let restrictContainer = StickyStrategy._private.restrictContainer;
            StickyStrategy._private.restrictContainer = () => { flagRestrict = !flagRestrict};

            // если начальная позиция отрицательная
            StickyStrategy._private.moveContainer({}, position, '', 80);
            assert.strictEqual(flagRestrict, false);

            // если начальная позиция положительная, но есть перекрытие
            position.right = 60;
            StickyStrategy._private.moveContainer({}, position, '', 80);
            assert.strictEqual(flagRestrict, true);

            StickyStrategy._private.restrictContainer = restrictContainer;
         });
         it('checkOverflow', () => {
            let position = {
               right: -10,
               bottom: -20
            };
            let result = 0;

            //TODO: will be fixed by https://online.sbis.ru/opendoc.html?guid=41b3a01c-72e1-418b-937f-ca795dacf508
            let _isMobileDevices = StickyStrategy._private._isMobileDevices;
            StickyStrategy._private._isMobileDevices = () => true;

            // правый и нижний край не влезли
            result = StickyStrategy._private.checkOverflow({direction: {}}, {}, position, 'horizontal');
            assert.strictEqual(result, 10);
            result = StickyStrategy._private.checkOverflow({direction: {}}, {}, position, 'vettical');
            assert.strictEqual(result, 20);

            position = {
               left: -10,
               top: -20
            };

            // левый и верхний край не влезли
            result = StickyStrategy._private.checkOverflow({direction: {}}, {}, position, 'horizontal');
            assert.strictEqual(result, 10);
            result = StickyStrategy._private.checkOverflow({direction: {}}, {}, position, 'vettical');
            assert.strictEqual(result, 20);

            StickyStrategy._private._isMobileDevices = _isMobileDevices;
         });

         it('revertPosition outsideOfWindow', () => {
            let popupCfg = {
               direction: {
                  horizontal: 'right'
               },
               sizes: {
                  width: 100
               },
               fittingMode: {
                  horizontal: 'adaptive'
               }
            };

            //TODO: will be fixed by https://online.sbis.ru/opendoc.html?guid=41b3a01c-72e1-418b-937f-ca795dacf508
            let isMobileIOS = StickyStrategy._private._isMobileIOS;
            StickyStrategy._private._isMobileIOS = () => true;

            let getMargins = StickyStrategy._private.getMargins;
            StickyStrategy._private.getMargins = () => 0;

            //правый край таргета за пределами области видимости экрана
            let getTargetCoords = StickyStrategy._private.getTargetCoords;
            StickyStrategy._private.getTargetCoords = (a, b, coord) => { return coord === 'right' ?  1930 :  1850};

            let invertPosition = StickyStrategy._private.invertPosition;
            StickyStrategy._private.invertPosition = () => { popupCfg.direction.horizontal = 'left' };

            const width = 1920;
            StickyStrategy._private.getVisualViewport = () => ({...BASE_VIEWPORT, ...{width}});
            StickyStrategy._private.getBody = () => ({
               width,
               height: 1000
            });

            let result = StickyStrategy._private.calculatePosition(popupCfg, {leftScroll: 0},'horizontal');
            //проверяем, что окно позиционируется с правого края и его ширина не обрезается
            assert.deepEqual(result, {right: 0});

            StickyStrategy._private._isMobileIOS = isMobileIOS;
            StickyStrategy._private.getMargins = getMargins;
            StickyStrategy._private.getTargetCoords = getTargetCoords;
            StickyStrategy._private.invertPosition = invertPosition;
         });

         it('initial position is outsideOfWindow', () => {
            let popupCfg = {
               direction: {
                  vertical: 'bottom'
               },
               sizes: {
                  height: 200
               },
               fittingMode: {
                  vertical: 'adaptive'
               }
            };

            //TODO: will be fixed by https://online.sbis.ru/opendoc.html?guid=41b3a01c-72e1-418b-937f-ca795dacf508
            let isMobileIOS = StickyStrategy._private._isMobileIOS;
            StickyStrategy._private._isMobileIOS = () => true;

            let getMargins = StickyStrategy._private.getMargins;
            StickyStrategy._private.getMargins = () => -20;

            // Таргет находится в верхней части экрана, но имеется отрицательный отступ
            let getTargetCoords = StickyStrategy._private.getTargetCoords;
            StickyStrategy._private.getTargetCoords = (a, b, coord) => { return coord === 'top' ? 0 : 20};

            let invertPosition = StickyStrategy._private.invertPosition;
            StickyStrategy._private.invertPosition = () => { popupCfg.direction.vertical = 'top' };

            const width = 1920;
            StickyStrategy._private.getVisualViewport = () => ({...BASE_VIEWPORT, ...{width}});
            StickyStrategy._private.getBody = () => ({
               width,
               height: 665
            });

            let result = StickyStrategy._private.calculatePosition(popupCfg, {topScroll: 0},'vertical');

            // проверяем, что окно позиционируется от верхнего края экрана и его высота не обрезается
            assert.deepEqual(result, {top: 0});
            assert.deepEqual(popupCfg.sizes.height, 200);


            StickyStrategy._private._isMobileIOS = isMobileIOS;
            StickyStrategy._private.getMargins = getMargins;
            StickyStrategy._private.getTargetCoords = getTargetCoords;
            StickyStrategy._private.invertPosition = invertPosition;
         });

         it('fittingMode vertical overflow', () => {
            let popupCfg = {
               direction: {
                  vertical: 'bottom'
               },
               sizes: {
                  width: 1500,
                  height: 1000
               },
               fittingMode: {
                  vertical: 'overflow',
                  horizontal: 'overflow'
               }
            };

            let getMargins = StickyStrategy._private.getMargins;
            StickyStrategy._private.getMargins = () => -20;

            // Таргет находится в верхней части экрана, но имеется отрицательный отступ
            let getTargetCoords = StickyStrategy._private.getTargetCoords;
            StickyStrategy._private.getTargetCoords = () => { return 20;};

            let invertPosition = StickyStrategy._private.invertPosition;
            StickyStrategy._private.invertPosition = () => { popupCfg.direction.vertical = 'top' };

            const getWindowSizes = StickyStrategy._private.getWindowSizes;
            const width = 1000;
            const height = 665;
            StickyStrategy._private.getWindowSizes = () => ({width, height});
            StickyStrategy._private.getVisualViewport = () => ({...BASE_VIEWPORT, ...{width, height}});
            StickyStrategy._private.getBody = () => ({
               width,
               height
            });

            const verticalPosition = StickyStrategy._private.calculatePosition(popupCfg, {topScroll: 0},'vertical');
            assert.equal(verticalPosition.height, height);

            const horizontalPosition = StickyStrategy._private.calculatePosition(popupCfg, {topScroll: 0},'horizontal');
            assert.equal(horizontalPosition.width, width);

            StickyStrategy._private.getWindowSizes = getWindowSizes;
            StickyStrategy._private.getMargins = getMargins;
            StickyStrategy._private.getTargetCoords = getTargetCoords;
            StickyStrategy._private.invertPosition = invertPosition;
         });

         it('getPositionProperty', () => {
            const positionRightBottom = {
               right: 100,
               bottom: 100
            };
            const positionTopLeft = {
               top: 100,
               left: 100
            };
            assert.equal(StickyStrategy._private.getPositionProperty(positionRightBottom, 'horizontal'), 'right');
            assert.equal(StickyStrategy._private.getPositionProperty(positionRightBottom, 'vertical'), 'bottom');
            assert.equal(StickyStrategy._private.getPositionProperty(positionTopLeft, 'horizontal'), 'left');
            assert.equal(StickyStrategy._private.getPositionProperty(positionTopLeft, 'vertical'), 'top');
         });

         it('update sizes from options', () => {
            let popupCfg = {
               config: {
                  width: 100,
                  maxWidth: 300,
                  minWidth: 100
               }
            };
            let popupOptions = {
               height: 200,
               minHeight: 200,
               maxHeight: 500,
               minWidth: 200
            };
            let resultConfig = {
               height: 200,
               minHeight: 200,
               maxHeight: 500,
               minWidth: 200,
               width: 100,
               maxWidth: 300
            };
            StickyController._private.updateSizes(popupCfg, popupOptions);
            assert.deepEqual(popupCfg.config, resultConfig);
         });

         it('restrictive container', () => {
            let getBody = StickyStrategy._private.getBody;

            StickyStrategy._private.getBody = () => ({
               height: 100,
               width: 100
               });


         let popupCfg = {
            restrictiveContainerCoords: {
               bottom: 50,
               right: 60
               },
               config: {
                  maxWidth: 300,
                  minWidth: 100
               },
               sizes: {
                  width: 5,
                  height: 5
               }
            };

            let position = {
               top: 60,
               left: 60
            };

            StickyStrategy._private.calculateRestrictionContainerCoords(popupCfg, position);
            assert.equal(position.top, 45);
            assert.equal(position.left, 55);

            popupCfg.restrictiveContainerCoords = {
               top: 20,
               left: 30
            };

            position = {
               bottom: 80,
               right: 80
            };

            StickyStrategy._private.calculateRestrictionContainerCoords(popupCfg, position);
            assert.equal(position.bottom, 75);
            assert.equal(position.right, 65);

            position = {
               top: 0,
               left: 10
            };

            StickyStrategy._private.calculateRestrictionContainerCoords(popupCfg, position);
            assert.equal(position.top, 20);
            assert.equal(position.left, 30);

            StickyStrategy._private.getBody = getBody;
         });
         it('restrictive container overflow', () => {
            let getBody = StickyStrategy._private.getBody;

            StickyStrategy._private.getBody = () => ({
               height: 600,
               width: 600
            });
            let popupCfg = {
               restrictiveContainerCoords: {
                  top: 100,
                  bottom: 400,
                  right: 400,
                  left: 100
               },
               config: {
                  maxWidth: 300,
                  minWidth: 100
               },
               sizes: {
                  width: 200,
                  height: 500,
                  margins: {
                     top: 0,
                     bottom: 0,
                     right: 0,
                     left: 0
                  }
               },
               offset: {
                  horizontal: 0,
                  vertical: 0
               },
               targetPoint: {
                  horizontal: 'left',
                  vertical: 'top'
               },
               direction: {
                  horizontal: 'right',
                  vertical: 'bottom'
               },
               fittingMode: {
                  horizontal: 'adaptive',
                  vertical: 'adaptive'
               }
            };
            const targetCoords = {
               top: 200,
               left: 200,
               bottom: 300,
               right: 300,
               width: 100,
               height: 100,
               leftScroll: 0,
               topScroll: 0
            };

            popupCfg.sizes.width = 200;
            popupCfg.sizes.height = 500;

            // bottom vertical overflow
            var position = StickyStrategy.getPosition(popupCfg, targetCoords);
            assert.equal(position.top, 200);
            assert.equal(position.left, 200);
            assert.equal(position.height, 200);

            targetCoords.top = 250;
            targetCoords.bottom = 350;

            // top vertical overflow
            position = StickyStrategy.getPosition(popupCfg, targetCoords);
            assert.equal(position.bottom, 250);
            assert.equal(position.left, 200);
            assert.equal(position.height, 250);

            popupCfg.restrictiveContainerCoords = {
               top: 100,
               bottom: 400,
               right: 300,
               left: 100
            };

            targetCoords.top = 200;
            targetCoords.bottom = 300;
            targetCoords.left = 150;
            targetCoords.right = 250;

            // right horizontal overflow
            position = StickyStrategy.getPosition(popupCfg, targetCoords);
            assert.equal(position.left, 150);
            assert.equal(position.width, 150);


            targetCoords.top = 200;
            targetCoords.bottom = 300;
            targetCoords.left = 150;
            targetCoords.right = 250;
            popupCfg.targetPoint.horizontal = 'right';
            popupCfg.direction.horizontal = 'left';

            // left horizontal overflow
            position = StickyStrategy.getPosition(popupCfg, targetCoords);
            assert.equal(position.right, 350);
            assert.equal(position.width, 150);

            StickyStrategy._private.getBody = getBody;
         });
      });
   }
);

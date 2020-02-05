define(['Controls/_tile/TileView/TileView',
   'Controls/_tile/TreeTileView/TreeTileViewModel',
   'Types/collection'
], function(TileView, TreeTileViewModel, collection) {
   'use strict';

   var hoveredSize = {
      width: 60,
      height: 60
   };

   var
      cfg,
      tileView;

   describe('Controls/List/TileView/TileView', function() {
      beforeEach(function() {
         var
            treeTileViewModel = new TreeTileViewModel({
               tileMode: 'static',
               tileHeight: 300,
               imageProperty: 'image',
               keyProperty: 'id',
               parentProperty: 'parent',
               nodeProperty: 'parent@',
               items: new collection.RecordSet({
                  rawData: [{
                     'id': 1,
                     'parent': null,
                     'parent@': true
                  }, {
                     'id': 2,
                     'parent': null,
                     'parent@': null
                  }],
                  keyProperty: 'id'
               })
            });

         cfg = {
            listModel: treeTileViewModel,
            keyProperty: 'id',
            tileScalingMode: 'outside'
         };
         tileView = new TileView(cfg);
         tileView.saveOptions(cfg);
         tileView._beforeMount(cfg);
      });

      describe('getPositionInContainer', function() {

         it('not fit left and right', function() {
            var position = TileView._private.getPositionInContainer(hoveredSize, {
               left: 5,
               right: 45,
               top: 15,
               bottom: 55,
               width: 40,
               height: 40
            }, {
               width: 50,
               height: 70,
               left: 0,
               right: 0,
               top: 0,
               bottom: 0
            }, 1.5);

            assert.equal(position, null);
         });

         it('not fit right and bottom', function() {
            var position = TileView._private.getPositionInContainer(hoveredSize, {
               left: 15,
               right: 55,
               top: 5,
               bottom: 45,
               width: 40,
               height: 40
            }, {
               width: 70,
               height: 50,
               left: 0,
               right: 0,
               top: 0,
               bottom: 0
            }, 1.5);

            assert.equal(position, null);
         });

         it('not fit left and top', function() {
            var position = TileView._private.getPositionInContainer(hoveredSize, {
               left: 5,
               right: 45,
               top: 5,
               bottom: 45,
               width: 40,
               height: 40
            }, {
               width: 70,
               height: 70,
               left: 0,
               top: 0,
               right: 70,
               bottom: 70
            }, 1.5);

            assert.deepEqual(position, {
               left: 0,
               right: 10,
               top: 0,
               bottom: 10
            });
         });

         it('not fit right and bottom', function() {
            var position = TileView._private.getPositionInContainer(hoveredSize, {
               left: 25,
               right: 65,
               top: 25,
               bottom: 65,
               width: 40,
               height: 40
            }, {
               width: 70,
               height: 70,
               left: 0,
               top: 0,
               right: 70,
               bottom: 70
            }, 1.5);

            assert.deepEqual(position, {
               left: 10,
               right: 0,
               top: 10,
               bottom: 0
            });
         });

         it('all fit', function() {
            var position = TileView._private.getPositionInContainer(hoveredSize, {
               left: 15,
               right: 55,
               top: 15,
               bottom: 55,
               width: 40,
               height: 40
            }, {
               width: 70,
               height: 70,
               left: 0,
               top: 0,
               right: 70,
               bottom: 70
            }, 1.5);

            assert.deepEqual(position, {
               left: 5,
               right: 5,
               top: 5,
               bottom: 5
            });
         });

         it('size * zoom < hoverSize', function() {
            var position = TileView._private.getPositionInContainer({
               width: 60,
               height: 70
            }, {
               left: 15,
               right: 55,
               top: 20,
               bottom: 60,
               width: 40,
               height: 40
            }, {
               width: 70,
               height: 80,
               left: 0,
               top: 0,
               right: 70,
               bottom: 80
            }, 1.5);

            assert.deepEqual(position, {
               left: 5,
               right: 5,
               top: 10,
               bottom: 0
            });

            position = TileView._private.getPositionInContainer({
               width: 40,
               height: 50
            }, {
               left: 15,
               right: 55,
               top: 20,
               bottom: 60,
               width: 40,
               height: 40
            }, {
               width: 70,
               height: 80,
               left: 0,
               top: 0,
               right: 70,
               bottom: 80
            }, 1);

            assert.deepEqual(position, {
               left: 15,
               right: 15,
               top: 20,
               bottom: 10
            });
         });
      });

      describe('getCorrectPosition', function() {
         it('all fit', function() {
            assert.deepEqual(TileView._private.getCorrectPosition(10, 10, 10, 10), {
               left: 10,
               right: 10,
               top: 10,
               bottom: 10
            });
         });

         it('not fit top', function() {
            assert.deepEqual(TileView._private.getCorrectPosition(-10, 10, 10, 10), {
               left: 10,
               right: 10,
               top: 0,
               bottom: 0
            });
         });

         it('not fit left', function() {
            assert.deepEqual(TileView._private.getCorrectPosition(10, 10, 10, -10), {
               left: 0,
               right: 0,
               top: 10,
               bottom: 10
            });
         });

         it('not fit', function() {
            assert.isNull(TileView._private.getCorrectPosition(10, 0, 10, -10));
            assert.isNull(TileView._private.getCorrectPosition(-10, 10, 0, 10));
            assert.isNull(TileView._private.getCorrectPosition(10, -10, 10, 0));
            assert.isNull(TileView._private.getCorrectPosition(0, 10, -10, 10));
            assert.isNull(TileView._private.getCorrectPosition(-10, -10, -10, -10));
            assert.isNull(TileView._private.getCorrectPosition(-10, 0, -10, 0));
            assert.isNull(TileView._private.getCorrectPosition(0, -10, 0, -10));
         });
      });

      describe('getPositionInDocument', function() {
         it('all fit (container === document)', function() {
            var position = TileView._private.getPositionInDocument({
               left: 10,
               right: 10,
               top: 10,
               bottom: 10,
            }, {
               left: 0,
               top: 0,
               right: 30,
               bottom: 30
            }, {
               width: 30,
               height: 30
            });

            assert.deepEqual(position, {
               left: 10,
               right: 10,
               top: 10,
               bottom: 10
            });
         });

         it('all fit', function() {
            var position = TileView._private.getPositionInDocument({
               left: 10,
               right: 10,
               top: 10,
               bottom: 10,
            }, {
               left: 10,
               top: 10,
               right: 40,
               bottom: 40
            }, {
               width: 50,
               height: 50
            });

            assert.deepEqual(position, {
               left: 20,
               right: 20,
               top: 20,
               bottom: 20
            });
         });

         it('not fit', function() {
            var position = TileView._private.getPositionInDocument({
               left: 0,
               right: 0,
               top: 0,
               bottom: 0,
            }, {
               left: 0,
               top: -20,
               right: 30,
               bottom: 10
            }, {
               width: 30,
               height: 10
            });

            assert.isNull(position);
         });
      });

      it('getPositionStyle', function() {
         var position = TileView._private.getPositionStyle(null);
         assert.equal(position, '');
         position = TileView._private.getPositionStyle({
            left: 5, right: 10, top: 15, bottom: 20
         });
         assert.equal(position, 'left: 5px; right: 10px; top: 15px; bottom: 20px; ');
      });

      it('_setHoveredItem', function() {
         var hoveredItem;

         tileView._setHoveredItem({
            key: 'itemKey1'
         }, {
            left: 5,
            right: 5,
            top: 5,
            bottom: 5
         }, {
            left: 10,
            right: 10,
            top: 10,
            bottom: 10
         });

         hoveredItem = tileView._listModel.getHoveredItem();
         assert.equal(hoveredItem.zoomCoefficient, 1.5);
         assert.isFalse(hoveredItem.canShowActions);
         assert.equal(hoveredItem.position, 'left: 10px; right: 10px; top: 10px; bottom: 10px; ');
         assert.equal(hoveredItem.endPosition, 'left: 5px; right: 5px; top: 5px; bottom: 5px; ');
         assert.equal(hoveredItem.key, 'itemKey1');

         cfg.tileScalingMode = 'none';
         tileView.saveOptions(cfg);

         tileView._setHoveredItem({
            key: 'itemKey1'
         }, {
            left: 5,
            right: 5,
            top: 5,
            bottom: 5
         });

         hoveredItem = tileView._listModel.getHoveredItem();
         assert.equal(hoveredItem.zoomCoefficient, 1);
         assert.isFalse(hoveredItem.canShowActions);
         assert.equal(hoveredItem.position, 'left: 5px; right: 5px; top: 5px; bottom: 5px; ');
         assert.equal(hoveredItem.key, 'itemKey1');


         cfg.tileScalingMode = 'overlap';
         tileView.saveOptions(cfg);

         tileView._setHoveredItem({
            key: 'itemKey1'
         }, {
            left: 5,
            right: 5,
            top: 5,
            bottom: 5
         });

         hoveredItem = tileView._listModel.getHoveredItem();
         assert.equal(hoveredItem.zoomCoefficient, 1);
         assert.isTrue(hoveredItem.canShowActions);
         assert.equal(hoveredItem.position, 'left: 5px; right: 5px; top: 5px; bottom: 5px; ');
         assert.equal(hoveredItem.key, 'itemKey1');

         tileView._setHoveredItem({
            key: 'itemKey2'
         });

         hoveredItem = tileView._listModel.getHoveredItem();
         assert.isTrue(hoveredItem.canShowActions);
         assert.equal(hoveredItem.position, '');
         assert.equal(hoveredItem.key, 'itemKey2');
      });

      it('_afterUpdate', function() {
         var hoveredItem,
            controlResizeFired = false;

         tileView._setHoveredItem({
            key: 'itemKey1'
         }, {
            left: 5,
            right: 5,
            top: 5,
            bottom: 5
         }, {
            left: 10,
            right: 10,
            top: 10,
            bottom: 10
         });

         tileView._hasFixedItemInDOM = function() {
            return true;
         };
         tileView._notify = function(eventName) {
            if (eventName === 'controlResize') {
               controlResizeFired = true;
            }
         };
         tileView._container = {
            getBoundingClientRect: function(){}
         };
         tileView._afterUpdate();
         hoveredItem = tileView._listModel.getHoveredItem();

         assert.equal(hoveredItem.position, 'left: 5px; right: 5px; top: 5px; bottom: 5px; ');
         assert.isTrue(hoveredItem.canShowActions);
         assert.equal(hoveredItem.key, 'itemKey1');
         assert.isOk(hoveredItem.isAnimated, 'startPosition does not match endPosition, hoveredItem should be animated');
         assert.isFalse(controlResizeFired, 'Invalid fire "controlResize" event from afterUpdate.');

         // Без анимации, когда
         tileView._setHoveredItem(
            {
               key: 'itemKey2'
            },
            {
               left: 20,
               right: 20,
               top: 20,
               bottom: 20
            },
            {
               left: 20,
               right: 20,
               top: 20,
               bottom: 20
            }
         );
         tileView._afterUpdate();
         hoveredItem = tileView._listModel.getHoveredItem();

         assert.equal(hoveredItem.position, 'left: 20px; right: 20px; top: 20px; bottom: 20px; ');
         assert.equal(hoveredItem.key, 'itemKey2');
         assert.isNotOk(hoveredItem.isAnimated, 'startPosition matches endPosition, hoveredItem should not be animated');
      });

      it('_afterMount', function() {
         var events = [];
         tileView._notify = function(eventName, args) {
            if (eventName === 'register') {
               events.push(args[0]);
            }
         };
         tileView._afterMount();
         assert.deepEqual(events, ['controlResize', 'scroll']);
      });

      it('_beforeUnmount', function() {
         var events = [];
         tileView._notify = function(eventName, args) {
            events.push(args[0]);
         };
         tileView._beforeUnmount();
         assert.deepEqual(events, ['controlResize', 'scroll']);
      });

      it('_beforeUpdate', function() {
         tileView._beforeUpdate({
            tileMode: 'dynamic',
            tileHeight: 200
         });
         assert.equal(tileView._listModel.getTileMode(), 'dynamic');
         assert.equal(tileView._listModel.getItemsHeight(), 200);
      });

      it('_onResize', function() {
         tileView._listModel.setHoveredItem({key: 1});
         tileView._onResize();
         assert.equal(tileView._listModel.getHoveredItem(), null);
      });

      it('_onScroll, _onItemWheel', function() {
         var
            timeout,
            clearTimeoutOrigin = clearTimeout;

         clearTimeout = function(id) {
            timeout = id;
         };

         tileView._listModel.setHoveredItem({key: 1});
         tileView._mouseMoveTimeout = 'timeoutId1';
         tileView._onScroll();
         assert.equal(tileView._listModel.getHoveredItem(), null);
         assert.equal(timeout, 'timeoutId1');

         tileView._listModel.setHoveredItem({key: 2});
         tileView._mouseMoveTimeout = 'timeoutId2';
         tileView._onItemWheel();
         assert.equal(tileView._listModel.getHoveredItem(), null);
         assert.equal(timeout, 'timeoutId2');
         clearTimeout = clearTimeoutOrigin;
      });

      it('_onItemMouseMove', function() {
         var
            shouldProcessHover,
            count = 0,
            event = {},
            originFn = tileView._calculateHoveredItemPosition;

         tileView._calculateHoveredItemPosition = function() {
            count++;
         };

         TileView._private.shouldProcessHover = () => shouldProcessHover;

         tileView._listModel.setHoveredItem({key: 1});
         shouldProcessHover = true;
         tileView._onItemMouseMove(event, {key: 1});
         assert.equal(count, 0);
         assert.equal(tileView._listModel.getHoveredItem().key, 1);

         tileView._onItemMouseMove(event, {key: 3});
         assert.equal(count, 1);

         tileView._listModel.setHoveredItem(null);
         shouldProcessHover = false;
         tileView._onItemMouseMove({}, {key: 2});
         assert.equal(count, 1);
         assert.isNull(tileView._listModel.getHoveredItem());

         tileView._listModel.setHoveredItem(null);
         shouldProcessHover = true;
         tileView._onItemMouseMove({}, {key: 3});
         assert.equal(count, 2);
         tileView._onItemMouseMove({}, {key: 3});
         assert.equal(count, 3);

         tileView._calculateHoveredItemPosition = originFn;
      });

      it('_getZoomCoefficient', function() {
         cfg.tileScalingMode = 'outside';
         tileView.saveOptions(cfg);
         assert.equal(tileView._getZoomCoefficient(), 1.5);

         cfg.tileScalingMode = 'none';
         tileView.saveOptions(cfg);
         assert.equal(tileView._getZoomCoefficient(), 1);
      });

      it('_onItemMouseLeave', function() {
         var event = {};
         tileView._listModel.setHoveredItem({key: 2});

         //active
         tileView._onItemMouseLeave(event, {key: 2, isActive: true});
         assert.equal(tileView._listModel.getHoveredItem().key, 2);

         //another
         tileView._onItemMouseLeave({}, {key: 1});
         assert.equal(tileView._listModel.getHoveredItem().key, 2);

         //hovered
         tileView._onItemMouseLeave({}, {key: 2});
         assert.equal(tileView._listModel.getHoveredItem(), null);
      });

      it('_calculateHoveredItemPosition', function() {
         var
            closestResult = false,
            document = {
               documentElement: {
                  getBoundingClientRect: () => {
                     return {
                        top: 0,
                        bottom: 500,
                        left: 0,
                        right: 500,
                        width: 500,
                        height: 500
                     };
                  }
               }
            },
            itemContainer = {
               getBoundingClientRect: () => {
                  return {
                     top: 100,
                     bottom: 100,
                     left: 100,
                     right: 100,
                     width: 100,
                     height: 100
                  };
               }
            },
            setHoveredItemCalled,
            event = {
               target: {
                  closest: function(str) {
                     if (str === '.controls-TileView__item') {
                        return itemContainer;
                     }
                     return closestResult;
                  }
               }
            };

         tileView._setHoveredItem = function(itemData, position, startPosition, noZoom) {
            setHoveredItemCalled = true;
            assert.isTrue(noZoom);
         };
         let itemData = {
            dispItem: {
               isNode: () => false
            },

         }
         cfg.tileScalingMode = 'none';
         tileView.saveOptions(cfg);
         tileView._calculateHoveredItemPosition(event, itemData, document);
         assert.isTrue(setHoveredItemCalled);

         cfg.tileScalingMode = 'outside';
         tileView.saveOptions(cfg);
         setHoveredItemCalled = null;
         closestResult = true;
         tileView._calculateHoveredItemPosition(event, itemData, document);
         assert.isTrue(setHoveredItemCalled);
      });
   });
});

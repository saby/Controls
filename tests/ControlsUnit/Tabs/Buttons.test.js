/**
 * Created by ps.borisov on 16.02.2018.
 */
define([
   'sinon',
   'Controls/event',
   'Controls/tabs',
   'Controls/_tabs/Buttons/Marker',
   'Types/source',
   'Types/entity',
   'Types/collection'
], function(sinon, event, tabsMod, Marker, sourceLib, entity, collection) {
   describe('Controls/_tabs/Buttons', function() {
      const data = [
         {
            id: 1,
            title: 'Первый',
            align: 'left'
         },
         {
            id: 2,
            title: 'Второй'
         },
         {
            id: 3,
            title: 'Третий',
            align: 'left'
         },
         {
            id: 4,
            title: 'Четвертый'
         },
         {
            id: 5,
            title: 'Пятый'
         },
         {
            id: 6,
            title: 'Шестой',
            align: 'left'
         },
         {
            id: 7,
            title: 'Седьмой'
         },
         {
            id: 8,
            title: 'Восьмой'
         },
         {
            id: 9,
            title: 'Девятый',
            align: 'left'
         },
         {
            id: 10,
            title: 'Десятый'
         },
         {
            id: 11,
            title: 'Одиннадцатый'
         },
         {
            id: 12,
            title: 'Двенадцатый',
            align: 'left'
         },
         {
            id: 13,
            title: 'Тринадцатый'
         }
      ];

      it('prepareItemOrder', function() {
         var
            expected = '-ms-flex-order:2; order:2';
         const tabInstance = new tabsMod.Buttons();
         tabInstance._itemsOrder = [2];
         assert.equal(expected, tabInstance._prepareItemOrder(0), 'wrong order cross-brwoser styles');
         tabInstance.destroy();
      });
      it('initItems by source', function(done) {
         var
            tabInstance = new tabsMod.Buttons(),
            source = new sourceLib.Memory({
               data: data,
               keyProperty: 'id'
            });

          tabInstance._initItems(source, tabInstance).addCallback(function(result) {
            var itemsOrder = result.itemsOrder;
            assert.equal(1, itemsOrder[0], 'incorrect  left order');
            assert.equal(30, itemsOrder[1], 'incorrect right order');
            assert.equal(5, itemsOrder[11], 'incorrect right order');
            assert.equal(36, itemsOrder[10], 'incorrect right order');
            assert.equal(37, tabInstance._lastRightOrder, 'incorrect last right order');
            tabInstance.destroy();
            done();
         });
      });
      it('initItems by items', function() {
         const tabInstance = new tabsMod.Buttons();
         let items = new collection.RecordSet({
            rawData: data,
            keyProperty: 'id'
         });

         const result = tabInstance._prepareItems(items);
         const itemsOrder = result.itemsOrder;
         assert.equal(1, itemsOrder[0], 'incorrect  left order');
         assert.equal(30, itemsOrder[1], 'incorrect right order');
         assert.equal(5, itemsOrder[11], 'incorrect right order');
         assert.equal(36, itemsOrder[10], 'incorrect right order');
         assert.equal(37, tabInstance._lastRightOrder, 'incorrect last right order');
         tabInstance.destroy();
      });
      it('prepareItemClass', function() {
         var
            item = {
               align: 'left',
               karambola: '15',
               _order: '144'
            },
            item2 = {
               karambola: '10',
               _order: '2',
               type: 'photo'
            },
            item3 = {
               karambola: '10',
               _order: '2',
               isMainTab: true
            },
            item4 = {
               karambola: '10',
               _order: '2',
               isMainTab: false
            },
            options = {
               style: 'additional',
               inlineHeight: 's',
               selectedKey: '15',
               keyProperty: 'karambola',
               theme: 'default'
            },
            expected = 'controls-Tabs__item ' +
               'controls-Tabs__item_inlineHeight-s ' +
               'controls-Tabs__item_align_left' +
               ' controls-Tabs__item_extreme ' +
               'controls-Tabs__item_extreme_first ' +
               'controls-Tabs__item_notShrink',
            expected2 = 'controls-Tabs__item' +
               ' controls-Tabs__item_inlineHeight-s' +
               ' controls-Tabs__item_align_right' +
               ' controls-Tabs__item_default' +
               ' controls-Tabs__item_type_photo ' +
               'controls-Tabs__item_notShrink',
            expected3 = 'controls-Tabs__item ' +
               'controls-Tabs__item_inlineHeight-s ' +
               'controls-Tabs__item_align_right' +
               ' controls-Tabs__item_default' +
               ' controls-Tabs__item_canShrink',
            expected4 = 'controls-Tabs__item ' +
               'controls-Tabs__item_inlineHeight-s ' +
               'controls-Tabs__item_align_right' +
               ' controls-Tabs__item_extreme' +
               ' controls-Tabs__item_extreme_last' +
               ' controls-Tabs__item_notShrink';
          const tabInstance = new tabsMod.Buttons();
          tabInstance.saveOptions(options);
          tabInstance._lastRightOrder = 144;
          tabInstance._itemsOrder = [1, 2, 2, 144];
         assert.equal(expected, tabInstance._prepareItemClass(item, 0), 'wrong order cross-brwoser styles');
         assert.equal(expected2, tabInstance._prepareItemClass(item2, 1), 'wrong order cross-brwoser styles');
         assert.equal(expected3, tabInstance._prepareItemClass(item3, 2));
         assert.equal(expected4, tabInstance._prepareItemClass(item4, 3));
         tabInstance.destroy();
      });
      it('prepareItemSelected', function() {
         var
            item = {
               karambola: '15',
               _order: '2',
               type: 'photo'
            },
            item2 = {
               karambola: '10',
               _order: '2',
               type: 'photo'
            },
            options = {
               style: 'additional',
               selectedKey: '15',
               keyProperty: 'karambola',
               theme: 'default'
            },
            expected = 'controls-Tabs_style_secondary__item_state_selected ' +
               'controls-Tabs__item_state_selected ',
            expected2 = 'controls-Tabs__item_state_default';
         const tabs = new tabsMod.Buttons();
         tabs.saveOptions(options);
         assert.equal(expected, tabs._prepareItemSelectedClass(item), 'wrong order cross-brwoser styles');
         assert.equal(expected2, tabs._prepareItemSelectedClass(item2), 'wrong order cross-brwoser styles');
          tabs.destroy();
      });

      it('_prepareItemMarkerClass', function() {
         var
            item = {
               karambola: '15',
               _order: '2',
               type: 'photo'
            },
            item2 = {
               karambola: '10',
               _order: '2',
               type: 'photo'
            },
            options = {
               style: 'additional',
               selectedKey: '15',
               keyProperty: 'karambola',
               theme: 'default'
            };
         const tabs = new tabsMod.Buttons();
         tabs.saveOptions(options);

         assert.equal(
            tabs._prepareItemMarkerClass(item),
            'controls-Tabs__itemClickableArea_marker controls-Tabs__itemClickableArea_markerThickness-undefined controls-Tabs_style_secondary__item-marker_state_selected');
         assert.equal(
            tabs._prepareItemMarkerClass(item2),
            'controls-Tabs__itemClickableArea_marker controls-Tabs__itemClickableArea_markerThickness-undefined controls-Tabs__item-marker_state_default');

         tabs.destroy();
      });

      it('_beforeMount with received state', function() {
         var tabs = new tabsMod.Buttons(),
            receivedState = {
               items: [{id: '1'}],
               itemsOrder: 'itemsOrder'
            },
            options = {
               source: null
            };
         tabs._beforeMount(options, null, receivedState);
         assert.equal(tabs._items, receivedState.items, 'items uncorrect in beforeMount with receivedState');
         assert.equal(tabs._itemsOrder, receivedState.itemsOrder, 'items uncorrect in beforeMount with receivedState');
         assert.equal(tabs._itemsArray, receivedState.itemsArray, 'items uncorrect in beforeMount with receivedState');
         tabs.destroy();
      });
      it('_beforeMount without received state', function() {
         var tabs = new tabsMod.Buttons(),
            data = [
               {
                  id: '1',
                  title: 'test1'
               }
            ],
            source = new sourceLib.Memory({
               data: data,
               keyProperty: 'id'
            }),
            options = {
               source: source
            };
         tabs._beforeMount(options).addCallback(function() {
            assert.equal(tabs._items.at(0).get('id') === '1', 'incorrect items _beforeMount without received state');
            assert.equal(tabs._items.at(0).get('title') === 'test1', 'incorrect items _beforeMount without received state');
            tabs.destroy();
            done();
         });
      });

      describe('_afterMount', function() {
         it('should subscribe on resize events', function() {
            const tabs = new tabsMod.Buttons();
            sinon.stub(event, 'RegisterUtil');
            tabs._afterMount();
            sinon.assert.calledOnce(event.RegisterUtil);
            sinon.assert.calledWith(event.RegisterUtil, tabs, 'controlResize', tabs._resizeHandler, { listenAll: true });
            sinon.restore();
         });
      });

      it('_afterMount', function() {
         var tabs = new tabsMod.Buttons(),
            data = [
               {
                  id: '1',
                  title: 'test1'
               }
            ],
            source = new sourceLib.Memory({
               data: data,
               keyProperty: 'id'
            }),
            options = {
               source: source
            },
            forceUpdateCalled = false;
         tabs._forceUpdate = function() {
            forceUpdateCalled = true;
             assert.equal(tabs._items.at(0).get('id') === '1', 'incorrect items _beforeUpdate without received state');
             assert.equal(tabs._items.at(0).get('title') === 'test1', 'incorrect items _beforeUpdate without received state');
             assert.equal(forceUpdateCalled, true, 'forceUpdate in _beforeUpdate does not called');
             tabs.destroy();
             done();
         };
         tabs._beforeUpdate(options);
      });

      describe('_beforeUnmount', function() {
         it('should subscribe on resize events', function() {
            const tabs = new tabsMod.Buttons();
            sinon.stub(event, 'UnregisterUtil');
            tabs._beforeUnmount();
            sinon.assert.calledOnce(event.UnregisterUtil);
            sinon.assert.calledWith(event.UnregisterUtil, tabs, 'controlResize', { listenAll: true });
            sinon.restore();
         });
      });

      it('_onItemClick', function() {
         var tabs = new tabsMod.Buttons(),
            notifyCorrectCalled = false;
         tabs._notify = function(eventName) {
            if (eventName === 'selectedKeyChanged') {
               notifyCorrectCalled = true;
            }
         };
         let event1 = {
            nativeEvent: {
               button: 1
            }
         };
         tabs._onItemClick(event1, 1);
         assert.equal(notifyCorrectCalled, false, 'rightButtonClick _onItemClick');

         event1.nativeEvent.button = 0;
         tabs._onItemClick(event1, 1);
         assert.equal(notifyCorrectCalled, true, 'leftButtonClick _onItemClick');
         tabs.destroy();
      });

      describe('_updateMarker', () => {
         it('should update marker model', () => {
            const tabs = new tabsMod.Buttons();

            sinon.stub(Marker.default, 'getComputedStyle').returns({ borderLeftWidth: 0 });

            let items = new collection.RecordSet({
               rawData: data,
               keyProperty: 'id'
            });

            const getBoundingClientRect = () => {
               return { width: 10, left: 20 };
            };

            tabs._container = { getBoundingClientRect };

            tabs._children = {};
            for (let i = 0; i < data.length; i++) {
               tabs._children[`Tab${i}`] = { getBoundingClientRect };
            }

            tabs._beforeUpdate({ items, selectedKey: 1 });
            tabs._updateMarker();
            assert.equal(tabs._marker.getOffset(), 0, 'leftButtonClick _onItemClick');
            assert.equal(tabs._marker.getWidth(), 10, 'leftButtonClick _onItemClick');

            tabs.destroy();
         });

      });

      describe('_resizeHandler', () => {
         it('should\'t update model if model does not initialized', () => {
            const tabs = new tabsMod.Buttons();

            sinon.stub(tabs._marker, 'reset');

            tabs._resizeHandler();

            sinon.assert.notCalled(tabs._marker.reset);
            sinon.restore();
            tabs.destroy();
         });

      });
   });
});

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

      describe('_beforeUpdate', () => {
         const items = new collection.RecordSet({
            rawData: data,
            keyProperty: 'id'
         });

         let tabs;

         beforeEach(function() {
            tabs = new tabsMod.Buttons();

            tabs._beforeMount({
               items: items,
               selectedKey: 1
            });
            tabs._options.items = items;
            tabs._options.selectedKey = 1;
            tabs._options.keyProperty = 'id';

            tabs._container = {
               getBoundingClientRect: () => {
                  return {
                     left: 0,
                     right: 0
                  };
               }
            };

            for (let i = 0; i < data.length; i++) {
               tabs._children[`TabContent${i}`] = {
                  getBoundingClientRect: () => {
                     return {
                        left: i*10,
                        right: i*10,
                        width: i*10
                     };
                  }
               };
            }
         });

         it('should\'t update _isAnimatedMakerVisible if align changed', function() {

            tabs._beforeUpdate({
               items: items,
               selectedKey: 2
            });
            assert.isFalse(tabs._isAnimatedMakerVisible);
         });

         it('should\'t update marker model if selectedKey changed', function() {
            sinon.stub(Marker.default, 'getComputedStyle').returns({ borderLeftWidth: 0, borderRightWidth: 0 });
            tabs._wrapperIncludesTarget = () => true;

            tabs._mouseEnterHandler({
               nativeEvent: {}
            });
            assert.strictEqual(tabs._marker.getOffset(), 0);

            tabs._beforeUpdate({
               items: items,
               selectedKey: 3,
               keyProperty: 'id'
            });
            assert.strictEqual(tabs._marker.getOffset(), 20);
            sinon.restore();
         });

         it('marker should be native after the mouseout event', function() {
            sinon.stub(Marker.default, 'getComputedStyle').returns({ borderLeftWidth: 0, borderRightWidth: 0 });
            tabs._wrapperIncludesTarget = () => true;

            tabs._mouseEnterHandler({
               nativeEvent: {}
            });
            assert.isTrue(tabs._isAnimatedMakerVisible);
            tabs._wrapperIncludesTarget = () => false;
            tabs._mouseOutHandler({
               nativeEvent: {}
            });
            assert.isFalse(tabs._isAnimatedMakerVisible);
            sinon.restore();
         });

         it('should\'t update _isAnimatedMakerVisible if items changed', function() {

            const items2 = new collection.RecordSet({
               rawData: data,
               keyProperty: 'id'
            });

            tabs._beforeUpdate({
               items: items2,
               selectedKey: 3
            });
            assert.isFalse(tabs._isAnimatedMakerVisible);
         });
      });

      describe('_afterRender', () => {
         let tabs;

         const items = new collection.RecordSet({
            rawData: data,
            keyProperty: 'id'
         });

         beforeEach(function() {
            tabs = new tabsMod.Buttons();

            tabs._beforeMount({
               items: items,
               selectedKey: 1
            });
            tabs._options.items = items;
            tabs._options.selectedKey = 1;
            tabs._children = {
               wrapper: {
                  scrollWidth: 200,
                  clientWidth: 100,
                  scrollTo: sinon.fake()
               },
               tab1: {
                  scrollIntoView: sinon.fake()
               }
            }
         });

         it('should\'t scroll into view if selectedKey does not changed', () => {
            tabs._afterRender({ selectedKey: 1 });
            sinon.assert.notCalled(tabs._children.tab1.scrollIntoView);
         });
      });

      describe('_afterUpdate', () => {
         const items = new collection.RecordSet({
            rawData: data,
            keyProperty: 'id'
         });

         let tabs;

         beforeEach(function() {
            tabs = new tabsMod.Buttons();

            tabs._beforeMount({
               items: items,
               selectedKey: 1
            });
            tabs._options.items = items;
            tabs._options.selectedKey = 1;
            tabs._options.keyProperty = 'id';
         });
      });

      it('prepareItemOrder', function() {
         var
            expected = '-ms-flex-order: 2; order: 2;';
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
               theme: 'default',
               horizontalPadding: 'xs',
               canShrink: true
            },
            expected = 'controls-Tabs__item' +
               ' controls-Tabs__item_inlineHeight-s' +
               ' controls-Tabs_horizontal-padding-xs_first' +
               ' controls-Tabs__item_align_left' +
               ' controls-Tabs__item_extreme' +
               ' controls-Tabs__item_extreme_first' +
               ' controls-Tabs__item_notShrink',
            expected2 = 'controls-Tabs__item' +
               ' controls-Tabs__item_inlineHeight-s' +
               ' controls-Tabs__item_align_right' +
               ' controls-Tabs__item_default' +
               ' controls-Tabs__item_type_photo' +
               ' controls-Tabs__item_notShrink',
            expected3 = 'controls-Tabs__item' +
               ' controls-Tabs__item_inlineHeight-s' +
               ' controls-Tabs__item_align_right' +
               ' controls-Tabs__item_default' +
               ' controls-Tabs__item_canShrink',
            expected4 = 'controls-Tabs__item' +
               ' controls-Tabs__item_inlineHeight-s' +
               ' controls-Tabs_horizontal-padding-xs_last' +
               ' controls-Tabs__item_align_right' +
               ' controls-Tabs__item_extreme' +
               ' controls-Tabs__item_extreme_last' +
               ' controls-Tabs__item_notShrink';
          const tabInstance = new tabsMod.Buttons();
          tabInstance.saveOptions(options);
          tabInstance._lastRightOrder = 144;
          tabInstance._itemsOrder = [1, 2, 2, 144];
         tabInstance._hasMainTab = true;
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
             item3 = {
                 karambola: '10',
                 _order: '2',
                 type: 'photo',
                 isMainTab: true
             },
            options = {
               style: 'additional',
               selectedKey: '15',
               keyProperty: 'karambola'
            },
            expected = 'controls-Tabs_style_secondary__item_state_selected ' +
                'controls-Tabs__item_view_selected ' +
               'controls-Tabs__item_state_selected ',
            expected2 = 'controls-Tabs__item_state_default',
            expected3 = 'controls-Tabs__item_view_main';
         const tabs = new tabsMod.Buttons();
         tabs.saveOptions(options);
         assert.equal(expected, tabs._prepareItemSelectedClass(item), 'wrong order cross-brwoser styles');
         assert.equal(expected2, tabs._prepareItemSelectedClass(item2), 'wrong order cross-brwoser styles');
         assert.equal(expected3, tabs._prepareItemSelectedClass(item3), 'wrong order cross-brwoser styles');
          tabs.destroy();
      });

      describe('_prepareItemMarkerClass', () => {
         describe('Main tab', () => {
            const item = {
               karambola: '15',
               isMainTab: true
            };
            const options = {
               selectedKey: '15',
               keyProperty: 'karambola',
               markerThickness: 'l'
            };
            it('should return marker css class if tab selected', () => {
               const tabs = new tabsMod.Buttons();
               tabs.saveOptions(options);

               assert.equal(tabs._prepareItemMarkerClass(item), 'controls-Tabs__main-marker');

               tabs.destroy();
            });

            it('should\'t return marker css class if tab not selected', () => {
               const tabs = new tabsMod.Buttons();
               tabs.saveOptions({ selectedKey: '16', keyProperty: 'karambola'} );

               assert.equal(tabs._prepareItemMarkerClass(item), '');

               tabs.destroy();
            });
         });

         describe('Regular tab', () => {
            const item = {
               karambola: '15'
            };
            const options = {
               selectedKey: '15',
               keyProperty: 'karambola'
            };
            it('should return marker css class if tab selected', () => {
               const tabs = new tabsMod.Buttons();
               tabs.saveOptions(options);

               assert.equal(
                  tabs._prepareItemMarkerClass(item),
                  'controls-Tabs__itemClickableArea_marker controls-Tabs__itemClickableArea_markerThickness controls-Tabs_style_undefined__item-marker_state_selected'
               );

               tabs.destroy();
            });
         });
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
            'controls-Tabs__itemClickableArea_marker controls-Tabs__itemClickableArea_markerThickness controls-Tabs_style_secondary__item-marker_state_selected');
         assert.equal(
            tabs._prepareItemMarkerClass(item2),
            'controls-Tabs__itemClickableArea_marker controls-Tabs__itemClickableArea_markerThickness controls-Tabs__item-marker_state_default');

         tabs.destroy();
      });

      it('_beforeMount with received state', function() {
         var tabs = new tabsMod.Buttons(),
            receivedState = {
               items: [{id: '1'}],
               itemsArray: [{id: '1'}],
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

             sinon.stub(Marker.default, 'getComputedStyle').returns({ borderLeftWidth: 0, borderRightWidth: 0 });

            let items = new collection.RecordSet({
               rawData: data,
               keyProperty: 'id'
            });

            const getBoundingClientRect = () => {
               return { width: 10, left: 20, right: 30 };
            };

            tabs._container = { getBoundingClientRect };

            tabs._children = {};
            for (let i = 0; i < data.length; i++) {
               tabs._children[`TabContent${i}`] = { getBoundingClientRect };
            }

            tabs._beforeUpdate({ items, selectedKey: 1 });
            tabs._updateMarker();
            assert.equal(tabs._marker.getOffset(), 0, 'leftButtonClick _onItemClick');
            assert.equal(tabs._marker.getWidth(), 10, 'leftButtonClick _onItemClick');

            tabs.destroy();
            sinon.restore();
         });

      });

      describe('_prepareItemStyles', () => {
         it('flex-order without width restrictions', () => {
            const tabs = new tabsMod.Buttons();
            const orders = [1, 2, 3, 4];
            tabs._itemsOrder = orders;
            const item = {};
            const index = 3;
            const styleValue = tabs._prepareItemStyles(item, index);
            assert.isTrue(styleValue.includes(`order: ${orders[index]};`));
         });
         it('number width restrictions', () => {
            const tabs = new tabsMod.Buttons();
            tabs._itemsOrder = [1, 2, 3, 4];
            const item = {
               width: 123,
               maxWidth: 1234,
               minWidth: 12
            };
            const index = 3;
            const styleValue = tabs._prepareItemStyles(item, index);
            assert.isTrue(styleValue.includes(`width: ${item.width}px`));
            assert.isTrue(styleValue.includes('flex-shrink: 0'));
            assert.isTrue(styleValue.includes(`max-width: ${item.maxWidth}px`));
            assert.isTrue(styleValue.includes(`min-width: ${item.minWidth}px`));
         });
         it('percent width restrictions', () => {
            const tabs = new tabsMod.Buttons();
            tabs._itemsOrder = [1, 2, 3, 4];
            const item = {
               width: '20%',
               maxWidth: '25%',
               minWidth: '10%'
            };
            const index = 3;
            const styleValue = tabs._prepareItemStyles(item, index);
            assert.isTrue(styleValue.includes(`width: ${item.width}`));
            assert.isTrue(styleValue.includes('flex-shrink: 0'));
            assert.isTrue(styleValue.includes(`max-width: ${item.maxWidth}`));
            assert.isTrue(styleValue.includes(`min-width: ${item.minWidth}`));
         });
      });
      describe('_tabCanShrink', () => {
         it('should return true', () => {
            const tabs = new tabsMod.Buttons();
            tabs._options = { canShrink: true };
            const item = {
               isMainTab: true
            };
            const result = tabs._tabCanShrink(item);
            assert.isTrue(result);
         });
         it('should return true', () => {
            const tabs = new tabsMod.Buttons();
            tabs._options = { canShrink: true };
            const item = {
               minWidth: '20px'
            };
            const result = tabs._tabCanShrink(item);
            assert.isTrue(result);
         });
         it('should return true', () => {
            const tabs = new tabsMod.Buttons();
            tabs._options = { canShrink: true };
            const item = {
               maxWidth: '20px'
            };
            const result = tabs._tabCanShrink(item);
            assert.isTrue(result);
         });
         it('should return false', () => {
            const tabs = new tabsMod.Buttons();
            tabs._options = { canShrink: true };
            const item = {
               width: '20px'
            };
            const result = tabs._tabCanShrink(item);
            assert.isFalse(result);
         });
         it('should return true', () => {
            const tabs = new tabsMod.Buttons();
            tabs._options = { canShrink: true };
            const item = {};
            tabs._hasMainTab = false;
            const result = tabs._tabCanShrink(item);
            assert.isTrue(result);
         });
         it('should return false', () => {
            const tabs = new tabsMod.Buttons();
            tabs._options = { canShrink: true };
            const item = {};
            tabs._hasMainTab = true;
            const result = tabs._tabCanShrink(item);
            assert.isFalse(result);
         });
         it('should return false', () => {
            const tabs = new tabsMod.Buttons();
            tabs._options = { canShrink: false };
            const item = {};
            const result = tabs._tabCanShrink(item);
            assert.isFalse(result);
         });
      });
   });
});

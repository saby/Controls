/**
 * Created by ps.borisov on 16.02.2018.
 */
define([
   'Controls/tabs',
   'Types/source',
   'Types/entity',
   'Types/collection'
], function(tabsMod, sourceLib, entity, collection) {
   describe('Controls/_tabs/Buttons', function() {
      it('prepareItemOrder', function() {
         var
            expected = '-ms-flex-order:2; order:2';
         const tabInstance = new tabsMod.Buttons();
         tabInstance._itemsOrder = [2];
         assert.equal(expected, tabInstance._prepareItemOrder(0), 'wrong order cross-brwoser styles');
         tabInstance.destroy();
      });
      it('initItems', function(done) {
         var
            tabInstance = new tabsMod.Buttons(),
            data = [
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
            ],
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
      it('prepareItemClass', function() {
         var
            item = new entity.Record({
               rawData: {
                  align: 'left',
                  karambola: '15',
                  _order: '144'
               }
            }),
            item2 = new entity.Record({
               rawData: {
                  karambola: '10',
                  _order: '2',
                  type: 'photo'
               }
            }),
            item3 = new entity.Record({
               rawData: {
                  karambola: '10',
                  _order: '2',
                  isMainTab: true
               }
            }),
            item4 = new entity.Record({
               rawData: {
                  karambola: '10',
                  _order: '2',
                  isMainTab: false
               }
            }),
            options = {
               style: 'additional',
               selectedKey: '15',
               keyProperty: 'karambola',
               theme: 'default'
            },
            expected = 'controls-Tabs__item controls-Tabs__item_theme_default ' +
               'controls-Tabs__item_align_left controls-Tabs__item_align_left_theme_default' +
               ' controls-Tabs__item_extreme controls-Tabs__item_extreme_theme_default ' +
               'controls-Tabs__item_extreme_first controls-Tabs__item_extreme_first_theme_default ' +
               'controls-Tabs__item_notShrink',
            expected2 = 'controls-Tabs__item controls-Tabs__item_theme_default' +
               ' controls-Tabs__item_align_right controls-Tabs__item_align_right_theme_default' +
               ' controls-Tabs__item_default controls-Tabs__item_default_theme_default' +
               ' controls-Tabs__item_type_photo controls-Tabs__item_type_photo_theme_default ' +
               'controls-Tabs__item_notShrink',
            expected3 = 'controls-Tabs__item controls-Tabs__item_theme_default ' +
               'controls-Tabs__item_align_right controls-Tabs__item_align_right_theme_default' +
               ' controls-Tabs__item_default controls-Tabs__item_default_theme_default' +
               ' controls-Tabs__item_canShrink',
            expected4 = 'controls-Tabs__item controls-Tabs__item_theme_default ' +
               'controls-Tabs__item_align_right controls-Tabs__item_align_right_theme_default' +
               ' controls-Tabs__item_extreme controls-Tabs__item_extreme_theme_default' +
               ' controls-Tabs__item_extreme_last controls-Tabs__item_extreme_last_theme_default' +
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
            item = new entity.Record({
               rawData: {
                  align: 'left',
                  karambola: '15',
                  _order: '144'
               }
            }),
            item2 = new entity.Record({
               rawData: {
                  karambola: '10',
                  _order: '2',
                  type: 'photo'
               }
            }),
            options = {
               style: 'additional',
               selectedKey: '15',
               keyProperty: 'karambola',
               theme: 'default'
            },
            expected = 'controls-Tabs_style_secondary__item_state_selected ' +
            'controls-Tabs_style_secondary__item_state_selected_theme_default' +
            ' controls-Tabs__item_state_selected controls-Tabs__item_state_selected_theme_default',
            expected2 = 'controls-Tabs__item_state_default controls-Tabs__item_state_default_theme_default';
         const tabs = new tabsMod.Buttons();
         tabs.saveOptions(options);
         assert.equal(expected, tabs._prepareItemSelectedClass(item), 'wrong order cross-brwoser styles');
         assert.equal(expected2, tabs._prepareItemSelectedClass(item2), 'wrong order cross-brwoser styles');
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
      it('checkHasFunction', function() {
         var tabs = new tabsMod.Buttons(),
            data = [
               {
                  id: '1',
                  title: 'test1'
               }
            ],
            source = new sourceLib.Memory({
               data: data,
               idProperty: 'id'
            }),
            options = {
               source: source
            };
         //Тестируем: receivedState.items - RecordSet и есть функция
         let receivedState = {};
         receivedState.items = new collection.RecordSet({
            rawData: [
               {
                  id: 1, 'title': '1_Номенклатура', hierarchy: false,
                  func: function f() {
                     return 123;
                  }
               },
               {id: 2, 'title': '2_Ответственный', hierarchy: true},
               {id: 3, 'title': '3_Покупатель', hierarchy: null},
               {id: 4, 'title': '4_Склад', hierarchy: false}
            ],
         });
         const tabInstance = new tabsMod.Buttons();
         assert.equal(true, tabsMod.Buttons._checkHasFunction(receivedState, tabInstance));
         receivedState.items.destroy();

         //Тестируем: receivedState.items - RecordSet и нет функции
         receivedState.items = new collection.RecordSet({
            rawData: [
               { id: 1, 'title': '1_Номенклатура', hierarchy: false },
               { id: 2, 'title': '2_Ответственный', hierarchy: true },
               { id: 3, 'title': '3_Покупатель', hierarchy: null },
               { id: 4, 'title': '4_Склад', hierarchy: false },
            ],
         });
         assert.equal(false, tabsMod.Buttons._checkHasFunction(receivedState, tabInstance));
         receivedState.items.destroy();

         //Тестируем: receivedState.items - массив объектов и есть функция
         receivedState.items = [
            {
               id: 1, 'title': '1_Номенклатура', hierarchy: false,
               func: function f() {
                  return 123;
               }
            },
            {id: 2, 'title': '2_Ответственный', hierarchy: true},
            {id: 3, 'title': '3_Покупатель', hierarchy: null},
            {id: 4, 'title': '4_Склад', hierarchy: false}
         ];
         assert.equal(true, tabsMod.Buttons._checkHasFunction(receivedState, tabInstance));

         //Тестируем: receivedState.items - массив объектов и нет функции
         receivedState.items = [
            { id: 1, 'title': '1_Номенклатура', hierarchy: false },
            { id: 2, 'title': '2_Ответственный', hierarchy: true },
            { id: 3, 'title': '3_Покупатель', hierarchy: null },
            { id: 4, 'title': '4_Склад', hierarchy: false },
         ];
         assert.equal(false, tabsMod.Buttons._checkHasFunction(receivedState, tabInstance));
        tabInstance.destroy();
      });
      it('_beforeUpdate', function() {
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
         tabs._onItemClick(null, 1);
         assert.equal(notifyCorrectCalled, true, 'uncorrect _onItemClick');
         tabs.destroy();
      });
   });
});

/**
 * Created by kraynovdo on 17.11.2017.
 */
define([
   'Controls/list',
   'Types/collection',
   'Controls/Constants'
], function(list, collection, ControlsConstants){
   describe('Controls.List.ListControl.ItemsViewModel', function () {
      var data, data2, data3, display;
      beforeEach(function() {
         data = [
            {
               id : 1,
               title : 'Первый',
               type: 1
            },
            {
               id : 2,
               title : 'Второй',
               type: 2
            },
            {
               id : 3,
               title : 'Третий',
               type: 2
            }
         ];
         data2 = [
            {
               id : 4,
               title : 'Четвертый',
               type: 1
            },
            {
               id : 5,
               title : 'Пятый',
               type: 2
            },
            {
               id : 6,
               title : 'Шестой',
               type: 2
            }
         ];
         data3 = [
            {
               id : 7,
               title : 'Седьмой',
               type: 1
            }
         ];

      });
      it('Display', function () {
         var cfg = {
            items: data,
            keyProperty: 'id'
         };
         var iv = new list.ItemsViewModel(cfg);

         var disp = iv._display;
         assert.equal(data.length, disp.getCount(), 'Incorrect display\'s creating before mounting');

      });

      it('Enumeration', function () {
         var cfg = {
            items: data,
            keyProperty: 'id'
         };

         var iv = new list.ItemsViewModel(cfg);



         assert.equal(0, iv._curIndex, 'Incorrect start enumeration index after constructor');

         iv._curIndex = 3;
         iv.reset();
         assert.equal(0, iv._curIndex, 'Incorrect current enumeration index after reset()');

         iv.goToNext();
         iv.goToNext();
         assert.equal(2, iv._curIndex, 'Incorrect current enumeration index after 2x_goToNext');

         var condResult = iv.isEnd();
         assert.isTrue(condResult, 'Incorrect condition value enumeration index after 2x_goToNext');
         iv.goToNext();
         condResult = iv.isEnd();
         assert.isFalse(condResult, 'Incorrect condition value enumeration index after 3x_goToNext');
      });

      it('shouldn\'t  update prefix item version on setIndexes', function () {

         var cfg = {
            items: data,
            keyProperty: 'id',
            displayProperty: 'title'
         },
         setted = false;

         var iv = new list.ItemsViewModel(cfg);
         iv._startIndex = 10;
         iv._stopIndex = 20;

         iv._nextModelVersion = function (notUpdatePrefixItemVersion, changesType) {
            assert.isTrue(notUpdatePrefixItemVersion);
            assert.equal(changesType, 'indexesChanged');
            setted = true;
         };

         var cur = iv.setIndexes(0, 1);
         assert.isTrue(setted);
      });
      it('setIndexes should return true only if indexes have been updated', function () {
         let iv = new list.ItemsViewModel({
            items: data,
            keyProperty: 'id'
         });
         iv.getCount = () => 20;
         assert.isTrue(iv.setIndexes(10, 20));
         assert.isFalse(iv.setIndexes(10, 30));
         assert.isTrue(iv.setIndexes(10, 15));

      });
      it('Other', function () {
         var cfg = {
            items: data,
            keyProperty: 'id',
            displayProperty: 'title'
         };

         var iv = new list.ItemsViewModel(cfg);

         var cur = iv.getCurrent();
         assert.equal('id', cur.keyProperty, 'Incorrect field set on getCurrent()');
         assert.equal('title', cur.displayProperty, 'Incorrect field set on getCurrent()');
         assert.equal(0, cur.index, 'Incorrect field set on getCurrent()');
         assert.deepEqual(data[0], cur.item, 'Incorrect field set on getCurrent()');


      });

      it('getItemData key of breadcrumbs', function () {
         // Simple item

         var
             cfg = {
                items: data,
                keyProperty: 'id',
                displayProperty: 'title'
             },
             iv = new list.ItemsViewModel(cfg),
             dispItem = {
                getInstanceId: function() {
                   return '123';
                },
                getContents: function () {
                   return {
                      getId: function () {
                         return '123';
                      }
                   }
                }
             },
             itemData = iv.getItemDataByItem(dispItem);


         assert.equal('123', itemData.key);

         // Breadcrumbs item
         dispItem = {
            getInstanceId: function() {
               return 'breadcrumbs_item';
            },
            getContents: function () {
               return [
                  {
                     getId: function () {
                        return '1';
                     }
                  },
                  {
                     getId: function () {
                        return '2';
                     }
                  },
                  {
                     getId: function () {
                        return '3';
                     }
                  }
               ]
            }
         };

         itemData = iv.getItemDataByItem(dispItem);
         assert.equal('3', itemData.key);

      });

      it('setItems', function () {
         var rs1 = new collection.RecordSet({
            rawData: data,
            idProperty : 'id'
         });

         var rs2 = new collection.RecordSet({
            rawData: data2,
            idProperty : 'id'
         });

         var rs3 = new collection.RecordSet({
            rawData: data3,
            keyProperty: 'id'
         });

         var rs4 = new collection.RecordSet({
            rawData: data3,
            keyProperty: 'key'
         });

         var cfg1 = {
            items: data,
            keyProperty: 'id',
            displayProperty: 'title'
         };

         var cfg2 = {
            items: rs1,
            keyProperty: 'id',
            displayProperty: 'title'
         };

         //первый кейс - были items - массив, а ставим рекордсет. Должен полностью смениться инстанс
         var iv = new list.ItemsViewModel(cfg1);
         iv.setItems(rs2);
         assert.equal(rs2, iv._items, 'Incorrect items after setItems');
         assert.equal(2, iv.getVersion(), 'Incorrect version setItems');
         assert.equal(0, iv._startIndex, 'Incorrect startIndex after setItems');
         assert.equal(3, iv._stopIndex, 'Incorrect stopIndex after setItems');


         //второй кейс - были items - рекордсет, и ставим рекордсет. Должен остаться инстанс старого, но данные новые
         iv = new list.ItemsViewModel(cfg2);
         iv.setItems(rs2);
         assert.equal(rs1, iv._items, 'Incorrect items after setItems');
         assert.equal(4, iv._items.at(0).get('id'), 'Incorrect items after setItems');
         assert.equal(1, iv.getVersion(), 'Incorrect version setItems');

         iv.setItems(rs3);
         assert.equal(2, iv.getVersion(), 'Incorrect version setItems');
         assert.equal(iv._items.getIdProperty(), 'id', 'Incorrect keyProperty');

         iv.setItems(rs4);
         assert.equal(4, iv.getVersion(), 'Incorrect version setItems');
         assert.equal(iv._items.getIdProperty(), 'key', 'Incorrect keyProperty');

      });

      it('Append', function () {
         var metaData = {
            hasMore: true
         };
         var rs1 = new collection.RecordSet({
            rawData: data,
            idProperty : 'id'
         });
         var rs2 = new collection.RecordSet({
            rawData: data2,
            idProperty : 'id'
         });
         rs2.setMetaData(metaData);
         var cfg1 = {
            items: rs1,
            keyProperty: 'id',
            displayProperty: 'title'
         };

         var iv = new list.ItemsViewModel(cfg1);
         iv.appendItems(rs2);

         assert.equal(6, iv._items.getCount(), 'Incorrect items count after appendItems');
         assert.equal(4, iv._items.at(3).get('id'), 'Incorrect items after appendItems');
         assert.equal(1, iv.getVersion(), 'Incorrect version appendItems');
         assert.equal(iv._items.getMetaData(), metaData, 'Incorrect metaData appendItems');

         const rsEmpty = new collection.RecordSet({
            rawData: [],
            keyProperty: 'id'
         });
         iv.appendItems(rsEmpty);

         assert.strictEqual(iv.getVersion(), 1, 'Version should not change when appending an empty RecordSet');
      });

      it('Prepend', function () {
         var metaData = {
            hasMore: true
         };
         var rs1 = new collection.RecordSet({
            rawData: data,
            idProperty : 'id'
         });
         var rs2 = new collection.RecordSet({
            rawData: data2,
            idProperty : 'id'
         });
         rs2.setMetaData(metaData);
         var cfg1 = {
            items: rs1,
            keyProperty: 'id',
            displayProperty: 'title'
         };

         var iv = new list.ItemsViewModel(cfg1);
         iv.prependItems(rs2);

         assert.equal(6, iv._items.getCount(), 'Incorrect items count after prependItems');
         assert.equal(1, iv._items.at(3).get('id'), 'Incorrect items after prependItems');
         assert.equal(1, iv.getVersion(), 'Incorrect version prependItems');
         assert.strictEqual(metaData, iv._items.getMetaData(), 'metadata should change when prepending');

         const rsEmpty = new collection.RecordSet({
            rawData: [],
            keyProperty: 'id'
         });
         iv.prependItems(rsEmpty);

         assert.strictEqual(iv.getVersion(), 1, 'Version should not change when prepending an empty RecordSet');
      });

      it('itemsReadyCallback', function () {
         var rs1 = new collection.RecordSet({
            rawData: data,
            keyProperty : 'id'
         });
         var rs2 = new collection.RecordSet({
            rawData: data2,
            keyProperty : 'id'
         });




         var result, callback, cfg;

         callback = function() {
            result = 1;
         };

         cfg = {
            items: data,
            keyProperty: 'id',
            displayProperty: 'title',
            itemsReadyCallback: callback
         };

         result = 0;
         var iv = new list.ItemsViewModel(cfg);
         assert.equal(1, result, 'itemsReadycallback wasn\'t call');

         result = 0;
         iv.setItems(rs2);
         assert.equal(1, result, 'itemsReadycallback wasn\'t call');
      });

      it('setFilter', function () {
         var rs = new collection.RecordSet({
            rawData: data,
            keyProperty : 'id'
         });

         var cfg = {
            items: data,
            keyProperty: 'id',
            displayProperty: 'title'
         };

         var itemsViewModel = new list.ItemsViewModel(cfg);
         var modelVersion = itemsViewModel._prefixItemVersion;

         itemsViewModel.setFilter(function testFilter(){});
         assert.isTrue(itemsViewModel._prefixItemVersion > modelVersion, 'setFilter should change model version')
      });

      it('groupingKeyCallback', function() {
         var
            current,
            data = [
               { id: 1, title: 'item_1', group: 'hidden' },
               { id: 1, title: 'item_2', group: 'group_1' },
               { id: 2, title: 'item_3', group: 'group_1' },
               { id: 3, title: 'item_4', group: 'group_1' },
               { id: 4, title: 'item_5', group: 'group_2' },
               { id: 5, title: 'item_6', group: 'group_2' }
            ],
            items = new collection.RecordSet({
               rawData: data,
               keyProperty : 'id'
            }),
            cfg = {
               items: items,
               keyProperty: 'id',
               groupingKeyCallback: function(item) {
                  if (item.get('group') === 'hidden') {
                     return ControlsConstants.view.hiddenGroup;
                  }
                  return item.get('group');
               },
               displayProperty: 'title'
            },
            itemsViewModel = new list.ItemsViewModel(cfg),
            notifyArray = [],
            expectedNotifyArray = ['group_1', 'group_2', 'group_1', 'group_2'];
         assert.equal(itemsViewModel._display.getGroup(), cfg.groupingKeyCallback, 'Grouping for display not applied. Error sending to display grouping method.');
         assert.equal(itemsViewModel._display.getCount(), 8, 'Grouping for display not applied. Display items count (with groups) not equal 8.');
         itemsViewModel._notify = function(event, params) {
            if (event === 'onGroupsExpandChange') {
               notifyArray.push(params.group);
            }
         };
         itemsViewModel.toggleGroup('group_1');
         assert.equal(itemsViewModel._display.getCount(), 6, 'Invalid display items count after collapsing "group_1".');
         itemsViewModel.toggleGroup('group_2');
         assert.equal(itemsViewModel._display.getCount(), 4, 'Invalid display items count after collapsing "group_2".');
         itemsViewModel.toggleGroup('group_1');
         assert.equal(itemsViewModel._display.getCount(), 6, 'Invalid display items count after expanding "group_1".');
         itemsViewModel.toggleGroup('group_2');
         assert.equal(itemsViewModel._display.getCount(), 8, 'Invalid display items count after expanding "group_2".');
         assert.deepEqual(notifyArray, expectedNotifyArray);
         current = itemsViewModel.getCurrent();
         assert.equal(current.isGroup, true, 'Invalid value isGroup for current item.');
         assert.equal(current.isHiddenGroup, true, 'Invalid value isHiddenGroup for current item.');
         assert.equal(current.isGroupExpanded, true, 'Invalid value isGroupExpanded for current item.');
         itemsViewModel.goToNext();
         current = itemsViewModel.getCurrent();
         assert.equal(current.isGroup, undefined, 'Invalid value isGroup for current item.');
         assert.equal(current.isHiddenGroup, undefined, 'Invalid value isHiddenGroup for current item.');
         assert.equal(current.isGroupExpanded, undefined, 'Invalid value isGroupExpanded for current item.');
         itemsViewModel.toggleGroup('group_1');
         itemsViewModel.goToNext();
         current = itemsViewModel.getCurrent();
         assert.equal(current.isGroup, true, 'Invalid value isGroup for current item.');
         assert.equal(current.isHiddenGroup, false, 'Invalid value isHiddenGroup for current item.');
         assert.equal(current.isGroupExpanded, false, 'Invalid value isGroupExpanded for current item.');
      });

      it('isLast', function() {
         var cfg = {
            items: data,
            keyProperty: 'id'
         };

         var iv = new list.ItemsViewModel(cfg);

         var condResult = iv.isLast();
         assert.isFalse(condResult);
         iv.goToNext();
         iv.goToNext();
         condResult = iv.isLast();
         assert.isTrue(condResult);
      });

      it('getItemDataByItem', function() {
         let cfg = {
            items: data,
            keyProperty: 'id'
         };
         let model = new list.ItemsViewModel(cfg);
         let itemData = model.getItemDataByItem({ getInstanceId: () => 0, getContents: () => [] });

         assert.isFalse(!!itemData.isGroup);
      });

      it('getItemDataByItem caches results', function() {
         const
            cfg = {
               items: data,
               keyProperty: 'id'
            },
            model = new list.ItemsViewModel(cfg),
            dispItem = {
               getInstanceId: function() {
                  return 1;
               },
               getContents: function () {
                  return {
                     getId: function() {
                        return 1;
                     }
                  };
               }
            };

         const itemData = model.getItemDataByItem(dispItem);
         const beforeCacheReset = model.getItemDataByItem(dispItem);

         assert.strictEqual(beforeCacheReset, itemData, 'getItemDataByItem should cache the result');

         model.nextModelVersion();

         const afterCacheReset = model.getItemDataByItem(dispItem);

         assert.notStrictEqual(afterCacheReset, itemData, 'changing model version should reset getItemDataByItem cache');
      });

      it('getItemDataByItem some changes do not reset cache', function() {
         const
            cfg = {
               items: data,
               keyProperty: 'id'
            },
            model = new list.ItemsViewModel(cfg),
            dispItem = {
               getInstanceId: function() {
                  return 1;
               },
               getContents: function () {
                  return {
                     getId: function() {
                        return 1;
                     }
                  };
               }
            },
            noCacheResetChangeTypes = ['itemActionsUpdated', 'indexesChanged'];

         const itemData = model.getItemDataByItem(dispItem);
         noCacheResetChangeTypes.forEach((changesType) => {
            model.nextModelVersion(false, changesType);
            const afterNextVersion = model.getItemDataByItem(dispItem);
            assert.strictEqual(afterNextVersion, itemData, changesType + ' change should not reset getItemDataByItem cache');
         });
      });

      it('getItemDataByItem addition and removal reset cache', () => {
         const cfg = {
            items: data,
            keyProperty: 'id'
         };
         const model = new list.ItemsViewModel(cfg);
         const dispItem = {
            getInstanceId: function() {
               return 1;
            },
            getContents: function () {
               return {
                  getId: function() {
                     return 1;
                  }
               };
            }
         };
         const cacheResetActions = ['itemActionsUpdated', 'indexesChanged'];

         let itemData = model.getItemDataByItem(dispItem);
         cacheResetActions.forEach((action) => {
            model._nextModelVersion(true, 'collectionChanged', action);
            const afterNextVersion = model.getItemDataByItem(dispItem);
            assert.notStrictEqual(afterNextVersion, itemData, action + ' change should reset getItemDataByItem cache');
            itemData = afterNextVersion;
         });
      });

      it('_getDisplayItemCacheKey works based on key property', function() {
         const cfg = {
            items: data,
            keyProperty: 'id'
         };
         const model = new list.ItemsViewModel(cfg);
         const dispItem = {
            getInstanceId: () => {
               return '123';
            }
         };

         assert.strictEqual(
            model._getDisplayItemCacheKey(dispItem),
            dispItem.getInstanceId()
         );
      });

      it('isAllGroupsCollapsed', function () {
         const
             cfg = {
                items: [
                   {
                      id: 1,
                      group: '1'
                   },
                   {
                      id: 2,
                      group: '2'
                   }
                ],
                keyProperty: 'id',
                groupingKeyCallback: (item) => {
                   return item.group;
                },
                collapsedGroups: ['1', '2']
             },
             model = new list.ItemsViewModel(cfg);

         assert.isTrue(model.isAllGroupsCollapsed());
         model.setCollapsedGroups(['1']);
         assert.isFalse(model.isAllGroupsCollapsed());
      });

       it('updatePrefix should notify collectionChanged', function () {
           const cfg = {
               keyProperty: 'id',
               items: new collection.RecordSet({
                   rawData: [
                       {id: 0},
                       {id: 1}
                   ],
                   idProperty: 'id'
               }),
           };

           const model = new list.ItemsViewModel(cfg);
           const orNotify = model._notify;
           const orNMV = model._nextModelVersion;
           let isUpdated = false;


           model._notify = (name) => {
               if (name === 'onCollectionChange') {
                   return 'updatePrefix';
               }
               orNotify.apply(model, arguments);
           };

           model._nextModelVersion = (notUpdatePrefixItemVersion, changesType, action, newItems, newItemsIndex, removedItems, removedItemsIndex) => {
               assert.equal(changesType, 'collectionChanged');
               assert.isFalse(notUpdatePrefixItemVersion);
               assert.equal(action, 'a');
               assert.isTrue(!!newItems);
               assert.equal(newItemsIndex, 2);
               isUpdated = true;
               orNMV.apply(model, arguments);
           };

           model.appendItems(new collection.RecordSet({
               rawData: [
                   {id: 10},
                   {id: 11}
               ],
               idProperty: 'id'
           }));

           assert.isTrue(isUpdated);

       });
       
       it('should update prefix on move items', function () {
         const cfg = {
             keyProperty: 'id',
             items: new collection.RecordSet({
                 rawData: [
                     {id: 0},
                     {id: 1}
                 ],
                 idProperty: 'id'
             }),
         };

         const model = new list.ItemsViewModel(cfg);
         const orNMV = model._nextModelVersion;
         let isUpdated = false;

         model._nextModelVersion = (notUpdatePrefixItemVersion, changesType, action, newItems, newItemsIndex, removedItems, removedItemsIndex) => {
             assert.equal(changesType, 'collectionChanged');
             assert.isFalse(notUpdatePrefixItemVersion);
             assert.equal(action, 'm');
             isUpdated = true;
             orNMV.apply(model, arguments);
         };

         model._onCollectionChangeFnc({}, 'm', [], void 0, [], void 0);

         assert.isTrue(isUpdated);

     });
   })
});

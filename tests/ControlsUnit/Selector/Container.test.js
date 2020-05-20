define(['Controls/lookupPopup', 'Types/entity', 'Types/source', 'Types/collection', 'Controls/operations'], function(lookupPopup, entity, sourceLib, collection, operations) {

   var getRawData = function(id) {
      return {
         id: id
      };
   };

   var getItems = function() {
      var items = [];
      var i;

      for (i = 0; i < 5; i++) {
         items.push(new entity.Model(
            {
               rawData: getRawData(i),
               keyProperty: 'id'
            })
         );
      }

      return items;
   };

   describe('Controls/_lookupPopup/Container', function() {

      it('_private::getSelectedItems', () => {
          const options = {
             selectedItems: 'testOptionsItems'
          };
          const emptyOptions = {};

          const context = {
             selectorControllerContext: {
                selectedItems: 'testContextItems'
             }
          };

          const emptyContext = {
             selectorControllerContext: {}
          };

          assert.equal(lookupPopup.Container._private.getSelectedItems(options, emptyContext), 'testOptionsItems');
          assert.equal(lookupPopup.Container._private.getSelectedItems(emptyOptions, context), 'testContextItems');
          assert.equal(lookupPopup.Container._private.getSelectedItems(emptyOptions, emptyContext).getCount(), 0);
      });

      it('_private::getInitialSelectedItems', () => {
         const self = {};
         self._selectedKeys = [1];
         const options = {
            selectedItems: new collection.List({items: getItems()})
         };
         const context = {
            selectorControllerContext: {},
            dataOptions: {
               keyProperty: 'id'
            }
         };

         assert.equal(lookupPopup.Container._private.getInitialSelectedItems(self, options, context).getCount(), 1);
      });

      it('getFilteredItems', function() {
         var items = ['toRemoveItem', 'toSaveItem', 'toSaveItem'];
         var filterFunc = function(item) {
            return item !== 'toRemoveItem';
         };
         var retTrue = function() {
            return true;
         };

         assert.deepEqual(lookupPopup.Container._private.getFilteredItems(items, retTrue), items);
         assert.deepEqual(lookupPopup.Container._private.getFilteredItems(items, filterFunc), ['toSaveItem', 'toSaveItem']);
      });

      it('getKeysByItems', function() {
         assert.deepEqual(lookupPopup.Container._private.getKeysByItems(getItems(), 'id'), [0, 1, 2, 3, 4]);
      });

      it('getEmptyItems', function() {
         var listWithItems = new collection.List({items: getItems()});

         assert.equal(lookupPopup.Container._private.getEmptyItems(listWithItems).getCount(), 0);
         assert.equal(lookupPopup.Container._private.getEmptyItems(listWithItems)._moduleName, 'Types/collection:List');
      });


      it('getValidSelectionType', function() {
         assert.equal(lookupPopup.Container._private.getValidSelectionType('all'), 'all');
         assert.equal(lookupPopup.Container._private.getValidSelectionType('leaf'), 'leaf');
         assert.equal(lookupPopup.Container._private.getValidSelectionType('node'), 'node');
         assert.equal(lookupPopup.Container._private.getValidSelectionType('test'), 'all');
      });

      it('getFilterFunction', function() {
         var retFalse = function() {
            return false;
         }

         assert.isTrue(lookupPopup.Container._private.getFilterFunction()());
         assert.isFalse(lookupPopup.Container._private.getFilterFunction(retFalse)());
      });

      it('getSelectedKeys', function() {
         var context = {
            selectorControllerContext: {
               selectedItems: getItems()
            },
            dataOptions: {
               keyProperty: 'id'
            }
         };
         var options = {
            selectionFilter: function(item) {
               var id = item.get('id');
               return id !== 1 && id !== 3;
            }
         };

         assert.deepEqual(lookupPopup.Container._private.getSelectedKeys(options, context), [0, 2, 4]);

         options.selectedItems = getItems();
         options.selectedItems[0].set('id', 'testId');
         assert.deepEqual(lookupPopup.Container._private.getSelectedKeys(options, context), ['testId', 2, 4]);
      });

      it('prepareFilter', function() {
         var filter = {
            searchParam: 'test',
            parent: 123
         };
         var source = new sourceLib.Memory();
         var selection = operations.selectionToRecord({ selected: [1, 2], excluded: [3, 4] }, source.getAdapter());
         var preparedFilter = lookupPopup.Container._private.prepareFilter(filter, selection, 'searchParam', 'parent');

         assert.deepEqual(preparedFilter.selection.get('marked'), ['1', '2']);
         assert.deepEqual(preparedFilter.selection.get('excluded'), ['3', '4']);
         assert.isTrue(preparedFilter !== filter);
         assert.isTrue(!preparedFilter.searchParam);
         assert.isTrue(!preparedFilter.parent);

         selection = operations.selectionToRecord({ selected: [null], excluded: [null] }, source.getAdapter());
         preparedFilter = lookupPopup.Container._private.prepareFilter(filter, selection, 'searchParam');
         assert.deepEqual(preparedFilter.selection.get('marked'), [null]);
         assert.deepEqual(preparedFilter.selection.get('excluded'), [null]);
         assert.isTrue(preparedFilter !== filter);
         assert.isTrue(preparedFilter.searchParam === 'test');
      });

      it('prepareResult', function() {
         var result = 'result';
         var selectedKeys = [];
         var keyProperty = 'id';
         var selectCompleteInitiator = true;

         assert.deepEqual(lookupPopup.Container._private.prepareResult(result, selectedKeys, keyProperty, selectCompleteInitiator), {
            resultSelection: result,
            initialSelection: selectedKeys,
            keyProperty: keyProperty,
            selectCompleteInitiator: selectCompleteInitiator
         });
      });

      it('getCrudWrapper', function() {
         var source = new sourceLib.Memory();
         var navigation = {};
         var crudWrapper = lookupPopup.Container._private.getCrudWrapper(source);

         assert.include(
            ['Controls/dataSource:CrudWrapper', 'Controls/_dataSource/CrudWrapper'],
             crudWrapper._moduleName
         );
      });

      it('_selectedKeysChanged', function() {
         let container = new lookupPopup.Container();
         let eventFired = false;

         container._notify = (e) => {
            if (e === 'selectedKeysChanged') {
               eventFired = true;
            }
         };

         container._selectedKeysChanged();
         assert.isTrue(eventFired);
      });

      it('_excludedKeysChanged', function() {
         let container = new lookupPopup.Container();
         let eventFired = false;

         container._notify = (e) => {
            if (e === 'excludedKeysChanged') {
               eventFired = true;
            }
         };

         container._excludedKeysChanged();
         assert.isTrue(eventFired);
      });


      it('_private::prepareRecursiveSelection', () => {
         let items = new collection.RecordSet({
            rawData: [
               {
                  'id': 0,
                  'parent': null,
                  '@parent': false
               },
               {
                  'id': 1,
                  'parent': null,
                  '@parent': true
               },
               {
                  'id': 2,
                  'parent': null,
                  '@parent': true
               },
               {
                  'id': 3,
                  'parent': 2,
                  '@parent': false
               },
               {
                  'id': 4,
                  'parent': 2,
                  '@parent': false
               }
            ],
            keyProperty: 'id'
         });
         let selection = {
            selected: [0, 1, 2, 'notInRecordSet'],
            excluded: [3]
         };

         let preparedSelection = lookupPopup.Container._private.prepareNotRecursiveSelection(
            selection,
            items,
            'id',
            'parent',
            '@parent'
         );

         assert.deepEqual(preparedSelection, {
            selected: [0, 1, 2, 'notInRecordSet'],
            excluded: [3, 2]
         });
      });

      it('_private::getSelection', () => {
         let selectionType = 'invalidSelectionType';
         let selection = {
            selected: [1, 2, 3],
            excluded: [1]
         };
         let adapter = (new sourceLib.Memory()).getAdapter();
         let selectionRecord = lookupPopup.Container._private.getSelection(selection, adapter, selectionType, false);

         assert.deepEqual(
            selectionRecord.getRawData(),
            {
               marked: ['1', '2', '3'],
               excluded: ['1'],
               type: 'all',
               recursive: false
            });

         selectionType = 'node';
         selectionRecord = lookupPopup.Container._private.getSelection(selection, adapter, selectionType, true);
         assert.deepEqual(
            selectionRecord.getRawData(),
            {
               marked: ['1', '2', '3'],
               excluded: ['1'],
               type: 'node',
               recursive: true
            });
      });

      describe('_selectComplete', function() {
         const getContainer = () => {
            let
               container = new lookupPopup.Container(),
               isSelectionLoad = false,
               items = getItems(),
               recordSet = new collection.List({ items: items });

            container.saveOptions({
               recursiveSelection: true,
               selectionLoadMode: true
            });

            recordSet.getRecordById = function(id) {
               return items[id];
            };

            container._selectedKeys = [];
            container._excludedKeys = [];
            container.context = {
               get: function() {
                  return {
                     source: new sourceLib.Memory(),
                     items: recordSet,
                     filter: {}
                  };
               }
            };

            container._notify = function(eventName, result) {
               if (eventName === 'selectionLoad') {
                  container.isSelectionLoad = true;
                  container.loadDef = result[0];
               }
            };
            return container;
         };

         it('selected keys is empty', function() {
            let container = getContainer();
            let clearRecordSet = new collection.List({items: getItems().slice()});

            clearRecordSet.clear();
            container._selectComplete();

            assert.isTrue(container.isSelectionLoad);

            return new Promise((resolve) => {
               container.loadDef.then((result) => {
                  assert.deepEqual(result.resultSelection, clearRecordSet);
                  resolve();
               });
            });
         });

         it('single select', function() {
            let container = getContainer();
            container._selectedKeys = [1];
            container._selectCompleteInitiator = true;
            container._selectComplete();

            return new Promise((resolve) => {
               container.loadDef.then((result) => {
                  assert.deepEqual(result.resultSelection.at(0).getRawData(), getItems()[1].getRawData());


                  container._selectCompleteInitiator = false;
                  container._selectComplete();

                  container.loadDef.then((result) => {
                     assert.equal(result.resultSelection.getCount(), 0);
                     resolve();
                  });
               });
            });
         });

         it('selectionLoadMode: false', function() {
            let container = getContainer();
            container._selectedKeys = [1];
            container._options.selectionLoadMode = false;
            container._selectComplete();

            return new Promise((resolve) => {
               container.loadDef.then((result) => {
                  assert.deepEqual(result.selection.get('marked'), ['1']);
                  resolve();
               });
            });
         });

         it('multi select, check toggle indicator', function() {
            let
               hideIndicatorParam,
               indicatorId = 'fw54dw54d46q46d5',
               isShowIndicator = false,
               isHideIndicator = false,
               container = getContainer(),
               loadDef;

            container._notify = function(eventName, result) {
               switch (eventName){
                  case 'showIndicator':
                     isShowIndicator = true;
                     return indicatorId;

                  case 'hideIndicator':
                     isHideIndicator = true;
                     hideIndicatorParam = result[0];
                     break;

                  case 'selectionLoad':
                     loadDef = result[0];
                     break;
               }
            };
            container._selectedKeys = [1];
            container._options.multiSelect = true;
            container._selectComplete();

            assert.isTrue(isShowIndicator);

            return new Promise((resolve) => {
               loadDef.then(() => {
                  assert.isTrue(isHideIndicator);
                  assert.equal(hideIndicatorParam, indicatorId);
                  resolve();
               });
            });
         });
      });
   });

});

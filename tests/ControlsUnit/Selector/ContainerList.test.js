define(['Controls/lookupPopup', 'Types/entity'], function(lookupPopup, entity) {


   describe('Controls/_lookupPopup/Container', function() {

      it('getItemClickResult', function() {
         var itemKey;
         var selectedKeys = [1, 2, 3];

         itemKey = 4;
         assert.deepEqual(lookupPopup.ListContainer._private.getItemClickResult(itemKey, selectedKeys, true), [[1, 2, 3, 4], [4], []]);

         itemKey = 1;
         assert.deepEqual(lookupPopup.ListContainer._private.getItemClickResult(itemKey, selectedKeys, true), [[2, 3], [], [1]]);

         selectedKeys = [];
         itemKey = 1;
         assert.deepEqual(lookupPopup.ListContainer._private.getItemClickResult(itemKey, selectedKeys, false), [[1], [1], []]);

         selectedKeys = [1];
         itemKey = 2;
         assert.deepEqual(lookupPopup.ListContainer._private.getItemClickResult(itemKey, selectedKeys, false), [[2], [2], [1]]);

         selectedKeys = [2];
         itemKey = 2;
         assert.deepEqual(lookupPopup.ListContainer._private.getItemClickResult(itemKey, selectedKeys, false), [[2], [], []]);
      });

      it('getItemActions', function() {
         var options = {};

         var itemActionsEmpty = [];
         var itemActions = [{id: 'test'}];

         options.itemActions = itemActionsEmpty;
         assert.equal(lookupPopup.ListContainer._private.getItemActions(options)[0].id, 'selector.action');

         options.itemActions = itemActions;
         assert.equal(lookupPopup.ListContainer._private.getItemActions(options)[0].id, 'test');
         assert.equal(lookupPopup.ListContainer._private.getItemActions(options)[1].id, 'selector.action');

         options.selectionType = 'leaf';
         options.itemActions = itemActionsEmpty;
         assert.isFalse(!!lookupPopup.ListContainer._private.getItemActions(options)[0]);
         options.itemActions = itemActions;
         assert.equal(lookupPopup.ListContainer._private.getItemActions(options).length, 1);
      });

      it('getItemActionVisibilityCallback', function() {
         var actionVisibility = true;
         var visibilityCallback = function() {
            return actionVisibility;
         };
         var itemNode = new entity.Model({
            keyProperty: 'id',
            rawData: {
               id: 'test',
               'Раздел@': true
            }
         });

         var itemLeaf = new entity.Model({
            keyProperty: 'id',
            rawData: {
               id: 'test',
               'Раздел@': false
            }
         });


         //Without user callback
         assert.isTrue(lookupPopup.ListContainer._private.getItemActionVisibilityCallback({})({id: 'test'}));

         //With user callback
         assert.isTrue(lookupPopup.ListContainer._private.getItemActionVisibilityCallback({itemActionVisibilityCallback: visibilityCallback})({id: 'test'}));
         actionVisibility = false;
         assert.isFalse(lookupPopup.ListContainer._private.getItemActionVisibilityCallback({itemActionVisibilityCallback: visibilityCallback})({id: 'test'}));

         //With user callback and selector action
         actionVisibility = true;
         assert.isTrue(lookupPopup.ListContainer._private.getItemActionVisibilityCallback({itemActionVisibilityCallback: visibilityCallback})({id: 'test'}, itemNode));
         actionVisibility = false;
         assert.isFalse(lookupPopup.ListContainer._private.getItemActionVisibilityCallback({itemActionVisibilityCallback: visibilityCallback})({id: 'test'}, itemLeaf));
         actionVisibility = true;

         assert.isTrue(lookupPopup.ListContainer._private.getItemActionVisibilityCallback({
            itemActionVisibilityCallback: visibilityCallback,
            multiSelect: true,
            selectedKeys: [],
            selectionType: 'node'
         })({id: 'selector.action'}, itemNode));
         assert.isFalse(lookupPopup.ListContainer._private.getItemActionVisibilityCallback({
            itemActionVisibilityCallback: visibilityCallback,
            multiSelect: true,
            selectedKeys: ['test'],
            selectionType: 'node'
         })({id: 'selector.action'}, itemNode));

         assert.isFalse(lookupPopup.ListContainer._private.getItemActionVisibilityCallback({
            itemActionVisibilityCallback: visibilityCallback,
            multiSelect: true,
            selectedKeys: [],
            nodeProperty: 'Раздел@',
            selectionType: 'all'
         })({id: 'selector.action'}, itemLeaf));
         assert.isFalse(lookupPopup.ListContainer._private.getItemActionVisibilityCallback({
            itemActionVisibilityCallback: visibilityCallback,
            multiSelect: true,
            selectedKeys: ['test'],
            nodeProperty: 'Раздел@',
            selectionType: 'all'
         })({id: 'selector.action'}, itemLeaf));
      });

      it('itemClick', function() {
         var self = {
            _options: {}
         };
         var selectCompleted = false;
         var clickSelection = false;
         var isByItemClick = false;

         self._notify = function(eventName, args) {
            if (eventName === 'listSelectedKeysChanged') {
               clickSelection = true;
            }
            if (eventName === 'selectComplete') {
               selectCompleted = true;
               isByItemClick = args[1];
            }
         };

         lookupPopup.ListContainer._private.itemClick(self, 'test', false, []);
         assert.isTrue(selectCompleted);
         assert.isTrue(clickSelection);
         assert.isTrue(isByItemClick);

         selectCompleted = false;
         clickSelection = false;
         lookupPopup.ListContainer._private.itemClick(self, 'test', true, []);
         assert.isTrue(selectCompleted);
         assert.isTrue(clickSelection);

         selectCompleted = false;
         clickSelection = false;
         lookupPopup.ListContainer._private.itemClick(self, 'test', true, [1]);
         assert.isTrue(clickSelection);
         assert.isFalse(selectCompleted);
      });

      it('_itemClick handler', function() {
         var listContainer = new lookupPopup.ListContainer();
         var selectedKeys = [];
         var options = {
            keyProperty: 'id',
            multiSelect: false,
            nodeProperty: 'Раздел@',
            selectedKeys: selectedKeys
         };
         var selectCompleted = false;
         var selectionResult = null;
         var selectedItem = new entity.Model({
            keyProperty: 'id',
            rawData: {
               id: 'test',
               'Раздел@': false,
            }
         });
         var otherSelectedItem = new entity.Model({
            keyProperty: 'id',
            rawData: {
               id: 'test1',
               'Раздел@': false
            }
         });



         listContainer.saveOptions(options);
         listContainer._notify = function(event, result) {
            if (event === 'selectComplete') {
               selectCompleted = true;
            }
            if (event === 'listSelectedKeysChanged') {
               selectedKeys = result[1];
               selectionResult = result;
            }
         };

         listContainer._itemClick(null, selectedItem);

         assert.equal(selectedKeys.length, 1);
         assert.equal(selectedKeys[0], 'test');
         assert.isTrue(selectCompleted);

         selectCompleted = false;
         listContainer._itemClick(null, otherSelectedItem);

         assert.equal(selectedKeys.length, 1);
         assert.equal(selectedKeys[0], 'test1');
         assert.isTrue(selectCompleted);
      });

      it('_beforeMount', () => {
         const listContainer = new lookupPopup.ListContainer();
         let options = {
            multiSelect: true,
            selectedKeys: [1, 2, 3]
         };

         listContainer._beforeMount(options);
         assert.deepEqual(listContainer._selectedKeys, [1, 2, 3]);
         assert.equal(listContainer._markedKey, null);

         options.selectedKeys = [1];
         listContainer._beforeMount(options);
         assert.deepEqual(listContainer._selectedKeys, [1]);
         assert.equal(listContainer._markedKey, 1);

         options.multiSelect = false;
         listContainer._beforeMount(options);
         assert.deepEqual(listContainer._selectedKeys, []);
         assert.equal(listContainer._markedKey, 1);
      });

   });

});

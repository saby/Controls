define(['Controls/toggle', 'UI/Vdom', 'Types/source'], function(toggles, Vdom, sourceLib) {
   'use strict';

   var btn;

   describe('Controls.toggle:CheckboxGroup', function() {
      describe('methods', function() {
         it('prepare items', function() {
            const source = new sourceLib.Memory({
               keyProperty: 'id',
               data: [
                  {
                     id: '1',
                     tittle: 'test1',
                     node: true
                  },
                  {
                     id: '2',
                     tittle: 'test2',
                     parent: '1',
                     node: false
                  }
               ]
            });
            const options = {
               source
            };
            const Group = new toggles.CheckboxGroup({ options });

            Group._initItems(options).addCallback(function() {
               assert.equal(Group._items.at(0).get('id'), 1, '_initItems wrong item id');
               assert.equal(Group._items.at(1).get('id'), 2, '_initItems wrong item id');

               Group.sortGroup(options, Group._items);
               assert.equal(Group._groups[2].get('id'), 1, 'sortGroup set uncorrect items in _group');

               Group._setItemsSelection = function(item) {
                  assert.equal(this._items.indexOf(item) !== -1, false, '_prepareSelected uncorrect');
               };
               Group._prepareSelected({ selectedKeys: [1] });
               Vdom.Synchronizer.unMountControlFromDOM(Group, {});
               done();
            });
         });
         it('operations with key', function() {
            const Group = new toggles.CheckboxGroup({});
            Group._triStateKeys = ['4'];

            Group._addTriStateKey('4');
            assert.equal(Group._triStateKeys.length, 1, '_addTriStateKey wrong result');

            Group._addTriStateKey('5');
            assert.equal(Group._triStateKeys.length, 2, '_addTriStateKey wrong result');

            Group._removeTriStateKey('4');
            assert.equal(Group._triStateKeys.length, 1, '_removeTriStateKey wrong result');

            Group._removeTriStateKey('5');
            assert.equal(Group._triStateKeys.length, 0, '_removeTriStateKey wrong result');

            Group._removeTriStateKey = function() {
               return true;
            };
            Group._updateItemChildSelection = function() {
               return true;
            };

            Group._selectedKeys = ['4', '3'];
            Group._addKey('5');
            assert.equal(Group._selectedKeys.length, 3, '_addKey wrong result');

            Group._removeKey('5');
            assert.equal(Group._selectedKeys.length, 2, '_addTriStateKey wrong result');

            Vdom.Synchronizer.unMountControlFromDOM(Group, {});
         });

         it('_isSelected', function() {
            const Group = new toggles.CheckboxGroup({});
            Group._selectedKeys = ['1', '2'];
            Group._triStateKeys = ['3', '4'];
            Group._getItemKey = function(key) {
               return key;
            };
            assert.equal(Group._isSelected('5'), false, '_isSelected, unselected item has uncorrect result');
            assert.equal(Group._isSelected('2'), true, '_isSelected, selected item has uncorrect result');
            assert.equal(Group._isSelected('3'), null, '_isSelected, tristate item has uncorrect result');

            Vdom.Synchronizer.unMountControlFromDOM(Group, {});
         });

         it('_getItemKey', function() {
            const Group = new toggles.CheckboxGroup({});
            const item = {};
            item.get = function(key) {
               return '5';
            };
            const options = {
               keyProperty: 'key'
            };
            assert.equal(Group._getItemKey(item, options), '5', '_getItemKey, unselected item has uncorrect result');
            Vdom.Synchronizer.unMountControlFromDOM(Group, {});
         });

         it('_valueChangedHandler', function() {
            const Group = new toggles.CheckboxGroup({});
            let result = '';
            Group._addKey = function() {
               result += '_addKey';
            };
            Group._removeKey = function() {
               result += '_removeKey';
            };
            Group._updateItemChildSelection = function() {
               result += '_updateItemChildSelection';
            };
            Group._notifySelectedKeys = function() {
               result += '_notifySelectedKeys';
            };
            Group._getItemKey = function() {
               return true;
            };
            Group._valueChangedHandler(null, null, true);
            assert.equal(result, '_addKey_notifySelectedKeys', '_valueChangedHandler, unselected item has uncorrect result');

            result = '';
            Group._valueChangedHandler(null, null, null);
            assert.equal(result, '_removeKey_updateItemChildSelection_notifySelectedKeys', '_valueChangedHandler, unselected item has uncorrect result');

            result = '';
            Group._valueChangedHandler(null, null, false);
            assert.equal(result, '_removeKey_updateItemChildSelection_notifySelectedKeys', '_valueChangedHandler, unselected item has uncorrect result');
            Vdom.Synchronizer.unMountControlFromDOM(Group, {});
         });


         it('Selection', function() {
            const Group = new toggles.CheckboxGroup({});
            let result = '';
            let fakeItem = {
               get(arg) {
                  return arg !== 1;
               }
            };
            let baseUpdateItemChildSelection = Group._updateItemChildSelection;
            Group._addKey = function() {
               result += '_addKey';
            };
            Group._removeKey = function() {
               result += '_removeKey';
            };
            Group._notifySelectedKeys = function() {
               result += '_notifySelectedKeys';
            };
            Group._setItemsSelection = function() {
               result += '_setItemsSelection';
            };
            Group._getItemKey = function() {
               return '3';
            };
            Group._groups = {
               '3': [fakeItem]
            };
            Group.keyProperty = 'key';
            Group.parentProperty = 'parent';
            Group._items = {
               getRecordById: function() {
                  return fakeItem;
               }
            };

            Group._options = { keyProperty: true };
            Group._updateItemChildSelection('3', true);
            assert.equal(result, '_addKey_removeKey_setItemsSelection', '_updateItemChildSelection, unselected item has uncorrect result');

            result = '';
            Group._updateItemChildSelection('2', false);
            assert.equal(result, '_removeKey_setItemsSelection', '_updateItemChildSelection, selected item has uncorrect result');

            Group._items = {
               getRecordById: function() {
                  return 2;
               }
            };
            Group._selectedKeys = ['8', '4'];
            Group._nodeProperty = true;
            result = '';
            Group._setItemsSelection(fakeItem, Group._options);
            assert.equal(result, '_setItemsSelection', '_updateItemChildSelection, item has uncorrect result');

            Group._nodeProperty = 2;
            Group._options = { parentProperty: 1 };
            Group._setItemsSelection(fakeItem, Group._options);
            assert.equal(result, '_setItemsSelection_setItemsSelection', '_updateItemChildSelection, item has uncorrect result');
            Vdom.Synchronizer.unMountControlFromDOM(Group, {});
         });
      });
   });
});

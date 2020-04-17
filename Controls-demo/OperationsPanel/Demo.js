define('Controls-demo/OperationsPanel/Demo', [
   'Core/Control',
   'wml!Controls-demo/OperationsPanel/Demo/Demo',
   'Types/source',
   'Controls-demo/List/Tree/TreeMemory',
   'Controls-demo/OperationsPanel/Demo/Data',
   'Controls-demo/OperationsPanelNew/DemoHelpers/DataCatalog',
   'Controls/list',
   'css!Controls-demo/OperationsPanel/Demo/Demo',
   'wml!Controls-demo/OperationsPanel/Demo/PersonInfo',
   'wml!Controls-demo/OperationsPanel/Demo/resources/filterButtonEngineTemplate',
   'wml!Controls-demo/OperationsPanel/Demo/resources/filterPanelItemsTemplate'
], function(Control, template, source, TreeMemory, Data, DataCatalog, lists) {
   'use strict';

   var filterButtonData = [{
      id: 'owner',
      resetValue: '0',
      value: '0',
      source: new source.Memory({
         data: Data.owners,
         keyProperty: 'owner'
      })
   }];

   return Control.extend({
      _panelExpanded: false,
      _template: template,
      _panelSource: undefined,
      _nodeProperty: 'Раздел@',
      _parentProperty: 'Раздел',
      _keyProperty: 'id',
      _viewSource: null,
      _moveDialogColumns: null,
      _gridColumns: null,
      _moveDialogFilter: null,
      _selectedKeys: null,
      _excludedKeys: null,
      _selectedKey: 0,
      _expanded: false,
      _markedKeyMoveDialog: 15,

      _beforeMount: function() {
         this._filterButtonSource = filterButtonData;
         this._panelSource = this._getPanelSource([]);
         this._itemActions = Data.itemActions;
         this._selectionChangeHandler = this._selectionChangeHandler.bind(this);
         this._itemsReadyCallback = this._itemsReadyCallback.bind(this);
         this._itemActionVisibilityCallback = this._itemActionVisibilityCallback.bind(this);
         this._moveDialogFilter = {};
         this._gridColumns = [{
            template: 'wml!Controls-demo/OperationsPanel/Demo/PersonInfo'
         }];
         this._moveDialogColumns = [{
            displayProperty: 'department'
         }];
         this._viewSource = new TreeMemory({
            keyProperty: 'id',
            data: DataCatalog.getListData()
         });
         this._moverSource = new source.HierarchicalMemory({
            keyProperty: 'id',
            data: DataCatalog.getListData(),
            parentProperty: 'Раздел',
            filter: function(item, where) {
               var filter = Object.keys(where);

               return item.get('Раздел@') && (!filter.length || filter.some(function(field) {
                  var value = item.get(field),
                     needed = where[field];
                  return String(value).indexOf(needed) !== -1;
               }));
            }
         });
         this._selectedKeys = [];
         this._excludedKeys = [];
      },

      _panelItemClick: function(event, item) {
         var itemId = item.get('id');
         switch (itemId) {
            case 'remove':
               this._removeItems();
               break;
            case 'move':
               this._moveItems();
               break;
            case 'PDF':
            case 'Excel':
               this._showPopup('Выгрузка в ' + itemId);
               break;
            case 'print':
               this._showPopup('Печать');
               break;
            case 'plainList':
               this._showPopup('Развернуть без подразделений');
               break;
            case 'sum':
               this._showPopup('Суммирование');
               break;
            case 'merge':
               this._showPopup('Объединение');
               break;
         }
      },

      _itemActionVisibilityCallback: function(action, item) {
         var
            direction,
            result = true;

         if (action.id === 'moveUp' || action.id === 'moveDown') {
            direction = lists.ItemActionsHelpers.MOVE_DIRECTION[action.id === 'moveUp' ? 'UP' : 'DOWN'];
            result = lists.ItemActionsHelpers.reorderMoveActionsVisibility(direction, item, this._items, this._parentProperty, this._nodeProperty);
         }

         return result;
      },

      _itemActionsClick: function(event, action, item) {
         switch (action.id) {
            case 'moveUp':
               this._children.dialogMover.moveItemUp(item);
               break;
            case 'moveDown':
               this._children.dialogMover.moveItemDown(item);
               break;
            case 'remove':
               this._children.remover.removeItems([item.get('id')]);
               break;
         }
      },

      _onClickAddBlock: function() {
         this._showPopup('Клик в блок доп. операций');
      },

      _showPopup: function(text) {
         this._children.popupOpener.open({
            message: text,
            type: 'ok'
         });
      },

      _selectionChangeHandler: function() {
         this._panelSource = this._getPanelSource();
         this._forceUpdate();
      },

      _moveItems: function() {
         this._children.dialogMover.moveItemsWithDialog({
            selected: this._selectedKeys,
            excluded: this._excludedKeys
         });
      },

      _removeItems: function() {
         this._children.remover.removeItems({
            selected: this._selectedKeys,
            excluded: this._excludedKeys
         });
      },

      _beforeItemsRemove: function(event, items) {
         var
            item,
            self = this,
            removeFolders;

         items.forEach(function(key) {
            item = self._items.getRecordById(key);
            if (item && item.get(self._nodeProperty) === true) {
               removeFolders = true;
            }
         });

         return removeFolders ? this._children.popupOpener.open({
            message: 'Are you sure you want to delete the department?',
            type: 'yesno'
         }) : true;
      },

      _afterItemsRemove: function(event, items, result) {
         var
            hasErrors = result instanceof Error,
            title = 'The result of the delete operation.';

         this._children.operationsResultOpener.open({
            templateOptions: {
               operationsCount: items.length,
               operationsSuccess: items.length - (hasErrors ? 1 : 0),
               errors: hasErrors ? [result.message] : [],
               title: title
            }
         });

         if (hasErrors) {
            this._children.list.reload();
         }

         return false;
      },

      _itemsReadyCallback: function(items) {
         this._items = items;
      },

      _getPanelSource: function() {
         var items = DataCatalog.getPanelData().slice();

         if (this._selectedKeys && this._selectedKeys.length) {
            items.unshift(Data.removeOperation);
            items.unshift(Data.moveOperation);
         }

         return new source.Memory({
            keyProperty: 'id',
            data: items
         });
      }
   });
});

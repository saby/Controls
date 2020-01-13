import {Control, TemplateFunction, IControlOptions} from 'UI/Base';
import * as template from 'wml!Controls-demo/OperationsPanel/OperationsPanel';
import {Memory, HierarchicalMemory} from 'Types/source';
import TreeMemory = require('Controls-demo/List/Tree/TreeMemory');
import Data = require('Controls-demo/OperationsPanel/Demo/Data');
import employeesData from 'Controls-demo/resources/Data/Employees'
import 'wml!Controls-demo/OperationsPanel/Demo/PersonInfo';
import 'css!Controls-demo/OperationsPanel/Demo/Demo';

export default class extends Control {
   _template: TemplateFunction = template;
   _panelSource = undefined;
   _nodeProperty = 'Раздел@';
   _parentProperty = 'Раздел';
   _keyProperty = 'id';
   _viewSource = null;
   _gridColumns = null;
   _selectedKeys = null;
   _excludedKeys = null;
   _filter = null;
   _moveDialogColumns = null;
   _moveDialogFilter = null;
   _expandedItemsMoveDialog = null;
   _markedKeyMoveDialog = 15;

   _beforeMount() {
      this._filter = {};
      this._selectedKeys = [];
      this._excludedKeys = [];
      this._panelSource = this._getPanelSource([]);
      this._itemsReadyCallback = this._itemsReadyCallback.bind(this);
      this._selectionChangeHandler = this._selectionChangeHandler.bind(this);
      this._gridColumns = [{
         template: 'wml!Controls-demo/OperationsPanel/Demo/PersonInfo'
      }];
      this._viewSource = new TreeMemory({
         keyProperty: 'id',
         data: employeesData
      });
      this._moveDialogColumns = [{
         displayProperty: 'department'
      }];
      this._moveDialogFilter = {};
      this._expandedItemsMoveDialog = [2];
      this._moverSource = new HierarchicalMemory({
         keyProperty: 'id',
         data: employeesData,
         parentProperty: 'Раздел',
         filter: function(item, where) {
            let filter = Object.keys(where);

            return item.get('Раздел@') && (!filter.length || filter.some(function(field) {
               let value = item.get(field), needed = where[field];
               return String(value).indexOf(needed) !== -1;
            }));
         }
      });
   }

   _expandedChangedHandler(e, expanded) {
      this._expandedOperationsPanel = expanded;

      if (!expanded) {
         this._notify('selectedKeysChanged', [[], [], this._selectedKeys]);
      }
   }

   _panelItemClick(event, item, selection) {
      let itemId = item.get('id');
      
      if (!['sum', 'merge'].includes(itemId) || this._children.baseAction.validate(selection)) {
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
      }
   }

   _onClickAddBlock() {
      this._showPopup('Клик в блок доп. операций');
   }

   _showPopup(text) {
      this._children.popupOpener.open({
         message: text,
         type: 'ok'
      });
   }

   _selectionChangeHandler() {
      this._panelSource = this._getPanelSource();
      this._forceUpdate();
   }

   _moveItems() {
      this._children.dialogMover.moveItemsWithDialog({
         selected: this._selectedKeys,
         excluded: this._excludedKeys
      });
   }

   _removeItems() {
      this._children.remover.removeItems({
         selected: this._selectedKeys,
         excluded: this._excludedKeys
      });
   }

   _getPanelSource() {
      let items = Data.panelItems.slice();

      if (this._selectedKeys.length) {
         items.unshift(Data.removeOperation);
         items.unshift(Data.moveOperation);
      }

      return new Memory({
         keyProperty: 'id',
         data: items
      });
   }

   _itemsReadyCallback(items) {
      this._items = items;
   }

   _beforeItemsRemove(event, items) {
      let removeFolders: boolean = false;

      items.forEach((key) => {
         let item = this._items.getRecordById(key);
         if (item && item.get(this._nodeProperty) === true) {
            removeFolders = true;
         }
      });

      return removeFolders ? this._children.popupOpener.open({
            message: 'Are you sure you want to delete the department?',
            type: 'yesno'
      }) : true;
   }

   _afterItemsRemove(event, items, result) {
      let hasErrors: boolean = result instanceof Error;

      this._children.operationsResultOpener.open({
         templateOptions: {
            operationsCount: items.length,
            operationsSuccess: items.length - (hasErrors ? 1 : 0),
            errors: hasErrors ? [result.message] : [],
            title: 'The result of the delete operation.'
         }
      });

      if (hasErrors) {
         this._children.list.reload();
      }
   }
}

import {Control, TemplateFunction} from 'UI/Base';
import * as template from 'wml!Controls-demo/OperationsPanel/PanelWithList/PanelWithList';
import {Memory} from 'Types/source';
import TreeMemory = require('Controls-demo/List/Tree/TreeMemory');
import Data = require('Controls-demo/OperationsPanel/Demo/Data');
import 'wml!Controls-demo/OperationsPanel/Demo/PersonInfo';
import 'css!Controls-demo/OperationsPanel/Demo/Demo';

export default class extends Control {
   _template: TemplateFunction = template;
   _panelSource = null;
   _nodeProperty = 'Раздел@';
   _parentProperty = 'Раздел';
   _keyProperty = 'id';
   _viewSource = null;
   _gridColumns = null;
   _selectedKeys = null;
   _excludedKeys = null;

   _beforeMount() {
      this._selectedKeys = [];
      this._excludedKeys = [];
      this._panelSource = new Memory({
         keyProperty: 'id',
         data: Data.panelItems.slice()
      });
      this._gridColumns = [{
         template: 'wml!Controls-demo/OperationsPanel/Demo/PersonInfo'
      }];
      this._viewSource = new TreeMemory({
         keyProperty: 'id',
         data: Data.employees
      });
   }

   _expandedChangedHandler(e, expanded) {
      this._expandedOperationsPanel = expanded;

      if (!expanded) {
         this._notify('selectedKeysChanged', [[], [], this._selectedKeys]);
      }
   }

   _panelItemClick(event, item, nativeEvent, selection) {
      let itemId = item.get('id');
      
      if (!['sum', 'merge', 'print', 'PDF', 'Excel'].includes(itemId) || this._children.baseAction.validate(selection)) {
         switch (itemId) {
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

   _showPopup(text) {
      this._children.popupOpener.open({
         message: text,
         type: 'ok'
      });
   }
}

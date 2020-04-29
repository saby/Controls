import {Control, TemplateFunction} from 'UI/Base';
import * as template from 'wml!Controls-demo/OperationsPanelNew/PanelWithList/Default/Default';
import {Memory} from 'Types/source';
import TreeMemory = require('Controls-demo/List/Tree/TreeMemory');
import {getPanelData, getListData} from 'Controls-demo/OperationsPanelNew/DemoHelpers/DataCatalog';
import 'wml!Controls-demo/OperationsPanelNew/Templates/PersonInfo';

export default class extends Control {
   protected _template: TemplateFunction = template;
   protected _panelSource = null;
   protected _nodeProperty = 'Раздел@';
   protected _parentProperty = 'Раздел';
   protected _keyProperty = 'id';
   protected _viewSource = null;
   protected _gridColumns = null;
   protected _selectedKeys = null;
   protected _excludedKeys = null;
   protected _expandedOperationsPanel: boolean;
   protected _navigation: object = null;

   _beforeMount() {
      this._selectedKeys = [];
      this._excludedKeys = [];
      this._panelSource = new Memory({
         keyProperty: 'id',
         data: getPanelData()
      });
      this._gridColumns = [{
         template: 'wml!Controls-demo/OperationsPanelNew/Templates/PersonInfo'
      }];
      this._viewSource = new TreeMemory({
         keyProperty: 'id',
         data: getListData()
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

   static _styles: string[] = ['Controls-demo/OperationsPanel/Demo/Demo'];
}

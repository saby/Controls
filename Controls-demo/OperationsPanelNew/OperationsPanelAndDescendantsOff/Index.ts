import {Control, TemplateFunction} from 'UI/Base';
import * as template from 'wml!Controls-demo/OperationsPanelNew/OperationsPanelAndDescendantsOff/OperationsPanelAndDescendantsOff';
import {Memory} from 'Types/source';
import TreeMemory = require('Controls-demo/List/Tree/TreeMemory');
import {getPanelData, getListData} from 'Controls-demo/OperationsPanelNew/DemoHelpers/DataCatalog';
import 'wml!Controls-demo/OperationsPanelNew/Templates/PersonInfo';
import {Model} from 'Types/entity';

export default class extends Control {
   protected _template: TemplateFunction = template;
   protected _panelSource: Memory = null;
   protected _nodeProperty: string = 'Раздел@';
   protected _parentProperty: string = 'Раздел';
   protected _keyProperty: string = 'id';
   protected _viewSource: TreeMemory = null;
   protected _gridColumns: object[] = null;
   protected _selectedKeys: string[] = null;
   protected _excludedKeys: string[] = null;
   protected _expandedOperationsPanel: boolean;
   protected _navigation: object = null;

   _beforeMount(): void {
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

   _expandedChangedHandler(e: Event, expanded: boolean): void {
      this._expandedOperationsPanel = expanded;

      if (!expanded) {
         this._notify('selectedKeysChanged', [[], [], this._selectedKeys]);
      }
   }

   _panelItemClick(event: Event, item: Model, nativeEvent: Event, selection: unknown[]): void {
      const itemId = item.get('id');
      if (!['sum', 'merge', 'print', 'PDF', 'Excel'].includes(itemId) ||
          this._children.baseAction.validate(selection)) {
         switch (itemId) {
            case 'PDF':
            case 'Excel':
               this._showPopup('Выгрузка в ' + itemId);
               break;
            case 'print':
               this._showPopup('Печать', selection);
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

   _showPopup(text: string, selection?: unknown[]): void {
      const selectedRecord = !this._selectedKeys.length && selection
         ? getListData().find((item) => item.id === selection.selected[0])
         : '';

      this._children.popupOpener.open({
         message: text + `${selectedRecord ? ` ${selectedRecord.name}` : ''}`,
         type: 'ok'
      });
   }

   static _styles: string[] = ['Controls-demo/OperationsPanelNew/Index'];
}

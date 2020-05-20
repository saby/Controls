import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/OperationsPanelNew/Base/Base';
import {Memory} from 'Types/source';
import {getPanelData, getPanelDataWithLongCaption} from 'Controls-demo/OperationsPanelNew/DemoHelpers/DataCatalog';

export default class extends Control {
   protected _template: TemplateFunction = Template;
   protected _selectedKeys: number[] = null;
   protected _excludedKeys: number[] = null;
   protected _selectedKeysForPanelWithLongCaption: number[] = null;
   protected _excludedKeysForPanelWithLongCaption: number[] = null;
   protected _isAllSelected: boolean;
   protected _panelSource: Memory;
   protected _panelSourceWithLongCaption: Memory;

   protected _beforeMount(): void {
      this._selectedKeys = [];
      this._excludedKeys = [];
      this._selectedKeysForPanelWithLongCaption = [];
      this._excludedKeysForPanelWithLongCaption = [];
      this._panelSource = new Memory({
         keyProperty: 'id',
         data: getPanelData()
      });
      this._panelSourceWithLongCaption = new Memory({
         keyProperty: 'id',
         data: getPanelDataWithLongCaption()
      });
   }

   protected _selectedTypeChangedHandler(event, type: string) {
      switch (type) {
         case 'selectAll':
            this._isAllSelected = true;
            break;

         case 'unselectAll':
            this._isAllSelected = false;
            break;

         case 'toggleAll':
            this._isAllSelected = !this._isAllSelected;
      }
   }

   static _styles: string[] = ['Controls-demo/Controls-demo'];
}

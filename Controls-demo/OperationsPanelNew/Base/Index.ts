import {Control, TemplateFunction} from 'UI/Base'
import * as Template from 'wml!Controls-demo/OperationsPanelNew/Base/Base'
import {Memory} from 'Types/source'
import {getPanelData} from 'Controls-demo/OperationsPanelNew/DemoHelpers/DataCatalog';
import 'css!Controls-demo/Controls-demo'

export default class extends Control {
   protected _template: TemplateFunction = Template;
   protected _selectedKeys = [];
   protected _excludedKeys = [];
   protected _isAllSelected: boolean;
   protected _panelSource: Memory;

   protected _beforeMount() {
      this._panelSource = new Memory({
         keyProperty: 'id',
         data: getPanelData()
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
}
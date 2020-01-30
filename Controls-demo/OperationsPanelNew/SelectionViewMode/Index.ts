import {Control, TemplateFunction} from 'UI/Base'
import * as Template from 'wml!Controls-demo/OperationsPanelNew/SelectionViewMode/SelectionViewMode'
import {Memory} from 'Types/source'
import {getPanelData} from 'Controls-demo/OperationsPanelNew/DemoHelpers/DataCatalog';
import 'css!Controls-demo/Controls-demo'

export default class extends Control {
   protected _template: TemplateFunction = Template;
   protected _selectionViewMode: string|null = 'all';
   protected _selectedKeys = [null];
   protected _excludedKeys = [];
   protected _panelSource: Memory;

   protected _beforeMount() {
      this._panelSource = new Memory({
         keyProperty: 'id',
         data: getPanelData()
      });
   }
}

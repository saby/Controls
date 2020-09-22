import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/OperationsPanelNew/SelectionViewMode/SelectionViewMode';
import {Memory} from 'Types/source';
import {getPanelData} from 'Controls-demo/OperationsPanelNew/DemoHelpers/DataCatalog';

export default class extends Control {
   protected _template: TemplateFunction = Template;
   protected _selectionViewMode: string|null = 'all';
   protected _selectedKeys: string[] = [null];
   protected _excludedKeys: string[] = [];
   protected _panelSource: Memory;

   protected _beforeMount(): void {
      this._panelSource = new Memory({
         keyProperty: 'id',
         data: getPanelData()
      });
   }

   protected _selectedTypeChangedHandler(event: Event, type: string): void {
      if (['all', 'selected'].includes(type)) {
         this._selectionViewMode = type;
      }
   }

   static _styles: string[] = ['Controls-demo/Controls-demo'];
}

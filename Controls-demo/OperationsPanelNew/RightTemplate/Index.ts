import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/OperationsPanelNew/RightTemplate/RightTemplate';
import {Memory} from 'Types/source';
import {getPanelData} from 'Controls-demo/OperationsPanelNew/DemoHelpers/DataCatalog';

export default class extends Control {
   protected _template: TemplateFunction = Template;
   protected _selectedKeys: string[] = [];
   protected _excludedKeys: string[] = [];
   protected _panelSource: Memory;

   protected _beforeMount(): void {
      this._panelSource = new Memory({
         keyProperty: 'id',
         data: getPanelData()
      });
   }

   static _styles: string[] = ['Controls-demo/Controls-demo'];
}

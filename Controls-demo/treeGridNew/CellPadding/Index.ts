import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/treeGridNew/CellPadding/CellPadding';
import {Memory} from 'Types/source';
import {Gadgets} from '../DemoHelpers/DataCatalog';
import { IHeader } from 'Controls-demo/types';

export default class extends Control {
   protected _template: TemplateFunction = Template;
   protected _viewSource: Memory;
   protected _columns: unknown = Gadgets.getGridColumnsWithCellPadding();
   protected _header: IHeader[] = Gadgets.getCellPaddingHeader();

   protected _beforeMount(): void {
      this._viewSource = new Memory({
         keyProperty: 'id',
         data: Gadgets.getFlatData()
      });
   }

   static _styles: string[] = ['Controls-demo/Controls-demo'];
}

import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/treeGridNew/Expander/ExpanderIcon/None/None';
import {CrudEntityKey, Memory} from 'Types/source';
import {Gadgets} from '../../../DemoHelpers/DataCatalog';
import { IColumn } from 'Controls/grid';

export default class extends Control {
   protected _template: TemplateFunction = Template;
   protected _viewSource: Memory;
   protected _columns: IColumn[] = Gadgets.getColumnsForFlat();
   protected _expandedItems: CrudEntityKey[] = [null];

   protected _beforeMount(): void {
      this._viewSource = new Memory({
         keyProperty: 'id',
         data: Gadgets.getDataSet(),
         filter: () => true
      });
   }

   static _styles: string[] = ['Controls-demo/Controls-demo'];
}

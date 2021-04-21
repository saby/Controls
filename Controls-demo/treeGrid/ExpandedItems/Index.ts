import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/treeGrid/ExpandedItems/ExpandedItems';
import {CrudEntityKey, Memory} from 'Types/source';
import {Gadgets} from '../DemoHelpers/DataCatalog';
import { IColumn } from 'Controls/gridOld';

export default class extends Control {
   protected _template: TemplateFunction = Template;
   protected _viewSource: Memory;
   protected _columns: IColumn[] = Gadgets.getColumnsForFlat();
   protected _expandedItems: CrudEntityKey[] = [1];

   protected _beforeMount(): void {
      this._viewSource = new Memory({
         keyProperty: 'id',
         data: Gadgets.getDataSet()
      });
   }

   static _styles: string[] = ['Controls-demo/Controls-demo'];
}

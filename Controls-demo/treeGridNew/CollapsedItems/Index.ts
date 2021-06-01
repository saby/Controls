import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/treeGridNew/CollapsedItems/CollapsedItems';
import {CrudEntityKey, Memory} from 'Types/source';
import { IColumn } from 'Controls/grid';
import {Gadgets} from "Controls-demo/treeGridNew/DemoHelpers/Data/Gadgets";

export default class extends Control {
   protected _template: TemplateFunction = Template;
   protected _viewSource: Memory;
   protected _columns: IColumn[] = [
        {
            displayProperty: 'title'
        }
    ];
   protected _collapsedItems: CrudEntityKey[] = [1];
   protected _expandedItems: CrudEntityKey[] = [null];

   protected _beforeMount(): void {
      this._viewSource = new Memory({
         keyProperty: 'id',
         data: Gadgets.getData()
      });
   }

   static _styles: string[] = ['Controls-demo/Controls-demo'];
}

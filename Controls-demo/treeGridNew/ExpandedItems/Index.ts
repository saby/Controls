import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/treeGridNew/ExpandedItems/ExpandedItems';
import {CrudEntityKey, HierarchicalMemory} from 'Types/source';
import { IColumn } from 'Controls/grid';
import {Gadgets} from "Controls-demo/treeGridNew/DemoHelpers/Data/Gadgets";

export default class extends Control {
   protected _template: TemplateFunction = Template;
   protected _viewSource: HierarchicalMemory;
   protected _columns: IColumn[] = [
        {
            displayProperty: 'title'
        }
    ];
   protected _expandedItems: CrudEntityKey[] = [1];

   protected _beforeMount(): void {
      this._viewSource = new HierarchicalMemory({
         keyProperty: 'key',
         data: Gadgets.getData(),
         parentProperty: 'parent'
      });
   }

   static _styles: string[] = ['Controls-demo/Controls-demo'];
}

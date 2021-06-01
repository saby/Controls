import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/treeGridNew/Offsets/LevelIndentSize/All/SizeS/SizeS';
import {Memory, CrudEntityKey} from 'Types/source';
import { IColumn } from 'Controls/grid';
import {Flat} from "Controls-demo/treeGridNew/DemoHelpers/Data/Flat";

export default class extends Control {
   protected _template: TemplateFunction = Template;
   protected _viewSource: Memory;
   protected _columns: IColumn[] = [
        {
            displayProperty: 'title'
        }
    ];
   // tslint:disable-next-line
   protected _expandedItems: CrudEntityKey[] = [1, 11, 12, 13, 14, 15, 16, 153];

   protected _beforeMount(): void {
      this._viewSource = new Memory({
         keyProperty: 'key',
         data: Flat.getData(),
         filter: (): boolean => true
      });
   }

   static _styles: string[] = ['Controls-demo/Controls-demo'];
}

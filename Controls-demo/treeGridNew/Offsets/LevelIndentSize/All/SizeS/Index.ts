import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/treeGridNew/Offsets/LevelIndentSize/All/SizeS/SizeS';
import {Memory, CrudEntityKey} from 'Types/source';
import {Gadgets} from '../../../../DemoHelpers/DataCatalog';
import { IColumn } from 'Controls/gridOld';

export default class extends Control {
   protected _template: TemplateFunction = Template;
   protected _viewSource: Memory;
   protected _columns: IColumn[] = Gadgets.getColumnsForFlat();
   // tslint:disable-next-line
   protected _expandedItems: CrudEntityKey[] = [1, 11, 12, 13, 14, 15, 16, 153];

   protected _beforeMount(): void {
      this._viewSource = new Memory({
         keyProperty: 'id',
         data: Gadgets.getFlatData(),
         filter: (): boolean => true
      });
   }

   static _styles: string[] = ['Controls-demo/Controls-demo'];
}

import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/treeGridNew/Offsets/LevelIndentSize/All/All';
import {CrudEntityKey, Memory} from 'Types/source';
import {Gadgets} from '../../../DemoHelpers/DataCatalog';
import { IColumn } from 'Controls/grid';

export default class extends Control {
   protected _template: TemplateFunction = Template;
   protected _viewSource: Memory;
   protected _columns: IColumn[] = Gadgets.getColumnsForFlat();
   protected _expandedItems: CrudEntityKey[] = [1];
   // tslint:disable-next-line
   protected _expandedItemsS: CrudEntityKey[] = [1, 11, 12, 13, 14, 15, 16, 153];
   protected _expandedItemsM: CrudEntityKey[] = [1];
   protected _expandedItemsL: CrudEntityKey[] = [1];
   protected _expandedItemsXl: CrudEntityKey[] = [1];

   protected _beforeMount(): void {
      this._viewSource = new Memory({
         keyProperty: 'id',
         data: Gadgets.getFlatData(),
         filter: (): boolean => true
      });
   }

   static _styles: string[] = ['Controls-demo/Controls-demo'];
}

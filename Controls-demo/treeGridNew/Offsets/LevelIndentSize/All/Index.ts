import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/treeGridNew/Offsets/LevelIndentSize/All/All';
import {Memory} from 'Types/source';
import {Gadgets} from '../../../DemoHelpers/DataCatalog';
import { IColumn } from 'Controls/grid';
import { TExpandOrColapsItems } from 'Controls-demo/types';

export default class extends Control {
   protected _template: TemplateFunction = Template;
   protected _viewSource: Memory;
   protected _columns: IColumn[] = Gadgets.getColumnsForFlat();
   protected _expandedItems: TExpandOrColapsItems = [1];
   // tslint:disable-next-line
   protected _expandedItemsS: TExpandOrColapsItems = [1, 11, 12, 13, 14, 15, 16, 153];
   protected _expandedItemsM: TExpandOrColapsItems = [1];
   protected _expandedItemsL: TExpandOrColapsItems = [1];
   protected _expandedItemsXl: TExpandOrColapsItems = [1];

   protected _beforeMount(): void {
      this._viewSource = new Memory({
         keyProperty: 'id',
         data: Gadgets.getFlatData(),
         filter: (): boolean => true
      });
   }

   static _styles: string[] = ['Controls-demo/Controls-demo'];
}

import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/treeGrid/Expander/ExpanderSize/All/All';
import {Memory} from 'Types/source';
import {Gadgets} from '../../../DemoHelpers/DataCatalog';
import { IColumn } from 'Controls/_grid/interface/IColumn';
import { TExpandOrColapsItems } from 'Controls-demo/types';

export default class extends Control {
   protected _template: TemplateFunction = Template;
   protected _viewSource: Memory;
   protected _columns: IColumn[] = Gadgets.getColumnsForFlat();
   protected _expandedItems: TExpandOrColapsItems = [null];
   protected _expandedItemsS: TExpandOrColapsItems = [null];
   protected _expandedItemsM: TExpandOrColapsItems = [null];
   protected _expandedItemsL: TExpandOrColapsItems = [null];
   protected _expandedItemsXl: TExpandOrColapsItems = [null];

   protected _beforeMount(): void {
      this._viewSource = new Memory({
         keyProperty: 'id',
         data: Gadgets.getDataSet(),
         filter: () => true,
      });
   }

   static _styles: string[] = ['Controls-demo/Controls-demo'];
}

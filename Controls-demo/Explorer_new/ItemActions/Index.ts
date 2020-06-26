import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/Explorer_new/ItemActions/ItemActions';
import {Gadgets} from '../DataHelpers/DataCatalog';
import {Memory} from 'Types/source';
import * as MemorySource from 'Controls-demo/Explorer/ExplorerMemory';
import { IColumn } from 'Controls/_grid/interface/IColumn';
import { TRoot } from 'Controls-demo/types';
import { IItemAction } from 'Controls/itemActions';

interface IFilter {
   demo: number
}

export default class extends Control {
   protected _template: TemplateFunction = Template;
   protected _viewSource: Memory;
   protected _columns: IColumn[] = Gadgets.getSearchColumns();
   protected _root: TRoot = null;
   protected _searchStartingWith: string = 'root';
   protected _searchStartingWithSource: Memory = null;
   protected _filter: IFilter = { demo: 123 };
   protected _itemActions: IItemAction;

   protected _beforeMount(): void {
      this._viewSource = new MemorySource({
         keyProperty: 'id',
         data: Gadgets.getSearchData()
      });
      this._searchStartingWithSource = new Memory({
         keyProperty: 'id',
         data: [
            {
               id: 'root', title: 'root'
            },
            {
               id: 'current', title: 'current'
            }
         ]
      });
      this._itemActions = [
         {
            id: 1,
            icon: 'icon-PhoneNull',
            title: 'phone',
            showType: 2
         },
         {
            id: 2,
            icon: 'icon-EmptyMessage',
            title: 'message',
            showType: 2
         }
      ];
   }

   static _styles: string[] = ['Controls-demo/Controls-demo'];
}

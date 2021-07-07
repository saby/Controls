import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/Explorer_new/Search/Search';
import {Gadgets} from '../DataHelpers/DataCatalog';
import {Memory} from 'Types/source';
import * as MemorySource from 'Controls-demo/Explorer/ExplorerMemory';
import { IColumn } from 'Controls/_grid/interface/IColumn';
import { TRoot } from 'Controls-demo/types';
import {IItemAction} from "../../../Controls/_itemActions/interface/IItemAction";

export default class extends Control {
   protected _template: TemplateFunction = Template;
   protected _viewSource: MemorySource;
   protected _columns: IColumn[] = Gadgets.getSearchColumns();
   protected _root: TRoot = null;
   protected _searchStartingWith: string = 'root';
   protected _searchStartingWithSource: Memory = null;
   // tslint:disable-next-line
   protected _filter: object = { demo: 123 };

   protected _itemActions: IItemAction[] = [
      {
         id: 0,
         icon: 'icon-Erase',
         iconStyle: 'danger',
         title: 'delete pls',
         showType: 0,
         handler: ( item) => {
            this._children.remover.removeItems([item.getKey()]);
         }
      },
   ]

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
   }

   static _styles: string[] = ['Controls-demo/Controls-demo'];
}

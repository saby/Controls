import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/explorerNew/SearchWithPhoto/SearchWithPhoto';
import {Gadgets} from '../DataHelpers/DataCatalog';
import {HierarchicalMemory, Memory} from 'Types/source';
import {IItemAction} from 'Controls/itemActions';
import {IRemovableList} from 'Controls/list';
import { IColumn } from 'Controls/grid';
import { TRoot } from 'Controls-demo/types';

export default class extends Control {
   protected _template: TemplateFunction = Template;
   protected _viewSource: HierarchicalMemory;
   protected _columns: IColumn[] = Gadgets.getSearchColumnsWithPhoto();
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
            (this._children.view as IRemovableList).removeItemsWithConfirmation({
               selected: [item.getKey()],
               excluded: []
            }).then(() => {
               this._children.view.reload();
            });
         }
      },
   ]

   protected _beforeMount(): void {
      this._viewSource = new HierarchicalMemory({
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

   static _styles: string[] = ['Controls-demo/Controls-demo', 'Controls-demo/explorerNew/SearchWithPhoto/styles'];
}

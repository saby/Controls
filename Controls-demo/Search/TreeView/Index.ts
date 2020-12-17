import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/Search/TreeView/TreeView';
import {Gadgets} from '../../Explorer_new/DataHelpers/DataCatalog';
import * as MemorySource from 'Controls-demo/Explorer/ExplorerMemory';
import { IColumn } from 'Controls/grid';
import {TRoot} from 'Controls-demo/types';
import {IItemAction} from 'Controls/_itemActions/interface/IItemAction';

export default class TreeView extends Control<IControlOptions> {
   protected _template: TemplateFunction = Template;
   protected _viewSource: MemorySource;
   protected _columns: IColumn[] = Gadgets.getSearchColumns();
   protected _root: TRoot = 1;
   protected _startingWith: 'root' | 'current' = 'root';
   protected _filter: object = {demo: 123};

   protected _itemActions: IItemAction[] = [
      {
         id: 0,
         icon: 'icon-Erase',
         iconStyle: 'danger',
         title: 'delete pls',
         showType: 0,
         handler: (item) => {
            this._children.remover.removeItems([item.getKey()]);
         }
      }
   ];

   protected _beforeMount(): void {
      this._viewSource = new MemorySource({
         keyProperty: 'id',
         data: Gadgets.getSearchData()
      });
   }

   static _styles: string[] = ['Controls-demo/Controls-demo'];
}

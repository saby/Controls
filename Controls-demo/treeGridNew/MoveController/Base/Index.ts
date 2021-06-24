import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/treeGridNew/MoveController/Base/Base';
import {HierarchicalMemory} from 'Types/source';
import {IColumn} from 'Controls/grid';
import {IItemAction, TItemActionShowType} from 'Controls/itemActions';
import {Gadgets} from '../../DemoHelpers/DataCatalog';

export default class extends Control {
   protected _template: TemplateFunction = Template;
   protected _viewSource: HierarchicalMemory;
   protected _columns: IColumn[];
   protected _itemActions: IItemAction[];

   protected _beforeMount(): void {
      this._columns = [{
         displayProperty: 'title',
         width: ''
      }];
      this._viewSource = new HierarchicalMemory({
         keyProperty: 'id',
         data: Gadgets.getFlatData(),
         filter: (item, filter) => {
            const parent = filter.hasOwnProperty('parent') ? filter.parent : null;
            if (parent && parent.forEach) {
               for (let i = 0; i < parent.length; i++) {
                  if (item.get('parent') === parent[i]) {
                     return true;
                  }
               }
               return false;
            } else {
               return item.get('parent') === parent;
            }
         }
      });
      this._itemActions = [
         {
            id: 0,
            icon: 'icon-ArrowUp',
            showType: TItemActionShowType.TOOLBAR,
            handler: (item) => {
               this._children.treeGrid.moveItemUp(item.getKey()).then(() => {
                  this._children.treeGrid.reload();
               });
            }
         },
         {
            id: 1,
            icon: 'icon-ArrowDown',
            showType: TItemActionShowType.TOOLBAR,
            handler: (item) => {
               this._children.treeGrid.moveItemDown(item.getKey()).then(() => {
                  this._children.treeGrid.reload();
               });
            }
         }];
   }

   static _styles: string[] = ['Controls-demo/Controls-demo'];
}

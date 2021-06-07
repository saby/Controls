import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import {Memory} from 'Types/source';
import * as clone from 'Core/core-clone';
import {IItemAction, TItemActionShowType} from 'Controls/itemActions';

import * as Template from 'wml!Controls-demo/list_new/MoveController/MoveController';

export default class Mover extends Control<IControlOptions> {
   protected _template: TemplateFunction = Template;
   protected _countClicked: number = 0;
   protected _reloadCaption: string = 'Reload';
   protected _itemActions: IItemAction[];
   protected _itemActionsSecond: IItemAction[];
   protected _selectedKeys: any;
   protected _filter: {[p: string]: string};
   protected _viewSource: Memory;
   protected _viewSourceSecond: Memory;
   protected demoItems: any;

   protected _beforeMount() {
      this.demoItems = [{
         id: 0,
         title: 'Перемещение записей 1'
      }, {
         id: 1,
         title: 'Перемещение записей 2'
      }, {
         id: 2,
         title: 'Перемещение записей 3'
      }, {
         id: 3,
         title: 'Перемещение записей 4'
      }];
      this._viewSource = this._createSource(this.demoItems);
      this._viewSourceSecond = this._createSource(this.demoItems);
      this._selectedKeys = [];

      this._itemActions = this._createItemsActions('listMover');
      this._itemActionsSecond = this._createItemsActions('listSecondMover');
   }

   protected _onClick(): void {
      this._children.listMover.reload();
      this._children.listSecondMover.reload();
      this._countClicked += 1;
      this._reloadCaption = 'Reload ' + this._countClicked;
   }

   private _createSource(items): Memory {
      return new Memory({
         keyProperty: 'id',
         data: clone(items)
      });
   }

   private _createItemsActions(moverName): IItemAction[] {
      return [{
         id: 0,
         icon: 'icon-ArrowUp icon-primary',
         showType: TItemActionShowType.TOOLBAR,
         handler: (item) => {
            this._children[moverName].moveItemUp(item.getKey()).then(() => {
               this._children[moverName].reload();
            });
         }
      }, {
         id: 1,
         icon: 'icon-ArrowDown icon-primary',
         showType: TItemActionShowType.TOOLBAR,
         handler: (item) => {
            this._children[moverName].moveItemDown(item.getKey()).then(() => {
               this._children[moverName].reload();
            });
         }
      }];
   }

   static _styles: string[] = ['Controls-demo/List/Mover/Mover'];
}

import {Control, TemplateFunction} from 'UI/Base';
import {Model} from 'Types/entity';
import {CrudEntityKey} from 'Types/source';
import {IoC} from 'Env/Env';
import * as cClone from 'Core/core-clone';

import {IItemAction, TItemActionShowType} from 'Controls/itemActions';
import {ISelectionObject} from 'Controls/interface';
import {IRemovableList} from 'Controls/list';

import {RemoveDemoSource} from './RemoveDemoSource';
import * as template from 'wml!Controls-demo/list_new/RemoveController/RemoveController';

const data: Array<{id: number, title: string}> = [
   {
      id: 0,
      title: 'Стандартное удаление записи'
   },
   {
      id: 1,
      title: 'Стандартное удаление записи'
   },
   {
      id: 2,
      title: 'Стандартное удаление записи'
   },
   {
      id: 3,
      title: 'Стандартное удаление записи'
   },
   {
      id: 4,
      title: 'Стандартное удаление записи'
   },
   {
      id: 5,
      title: 'Удаление записи с вопросом'
   },
   {
      id: 6,
      title: 'Удаление записи с ошибкой'
   },
   {
      id: 7,
      title: 'Долгое удаление записи'
   }
];

export default class RemoveControllerDemo extends Control {
   protected _template: TemplateFunction = template;
   protected _viewSource: RemoveDemoSource;
   protected _itemActions: IItemAction[];
   protected _selectedKeys: number[] = [];
   protected _excludedKeys: number[] = [];
   protected _markedKey: CrudEntityKey;
   protected _currentMessage: string;

   protected _beforeMount(options?: {}, contexts?: object, receivedState?: void): Promise<void> | void {
      this._viewSource = new RemoveDemoSource({
         keyProperty: 'id',
         data: cClone(data)
      });
      const removeItemsOnDeleteKeyDown = this._removeItemsOnDeleteKeyDown.bind(this);
      const removeItemOnActionClick = this._removeItemOnActionClick.bind(this);

      this._itemActions = [
         {
            id: 'delete',
            handler: removeItemsOnDeleteKeyDown
         },
         {
            id: 'deleteAction',
            icon: 'icon-Erase icon-error',
            showType: TItemActionShowType.TOOLBAR,
            handler: removeItemOnActionClick
         }
      ];

      this._markedKey = 1;
   }

   protected _itemActionsVisibilityCallback(action: IItemAction, item: Model): boolean {
      return action.id !== 'delete';
   }

   private _removeItemsOnDeleteKeyDown(item: Model): void {
      const selection = {
         selected: this._selectedKeys && this._selectedKeys.length ? this._selectedKeys : [item.getKey()],
         excluded: this._excludedKeys
      };
      const method: (selection: ISelectionObject) => Promise<void> =
          this._selectedKeys.length || (selection.selected[0] && selection.selected[0] === 5) ?
             (this._children.list as undefined as IRemovableList).removeItemsWithConfirmation.bind(this._children.list) :
             (this._children.list as undefined as IRemovableList).removeItems.bind(this._children.list);

      method(selection).then(() => {
         this._children.list.reload();
         this._currentMessage = 'Нажата клавиша "delete". Удалили запись(и) с id ' + selection.selected.join(', ');
      })
      .catch((error) => {
         this._currentMessage = 'Нажата клавиша "delete". Произошла ошибка';
         IoC.resolve('ILogger').error(error);
      });
   }

   private _removeItemOnActionClick(item: Model): void {
      const selection: ISelectionObject = {
         selected: [item.getKey()],
         excluded: []
      };
      const method: (selection: ISelectionObject) => Promise<void> =
          selection.selected[0] && selection.selected[0] === 5 ?
              (this._children.list as undefined as IRemovableList).removeItemsWithConfirmation.bind(this._children.list) :
              (this._children.list as undefined as IRemovableList).removeItems.bind(this._children.list);
      method(selection)
          .then(() => {
             this._children.list.reload();
             this._currentMessage = 'Кликнули по операции "delete". Удалили запись(и) с id ' + selection.selected.join(', ');
          })
          .catch((error) => {
             this._currentMessage = 'Кликнули по операции "delete". Произошла ошибка';
             IoC.resolve('ILogger').error(error);
          });
   }

   static _styles: string[] = ['Controls-demo/list_new/RemoveController/RemoveController', 'Controls-demo/Controls-demo'];
}

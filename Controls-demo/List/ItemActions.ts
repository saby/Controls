/**
 * Created by kraynovdo on 31.01.2018.
 */
import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import {Model} from 'Types/entity';
import {IItemAction, TItemActionShowType} from 'Controls/itemActions';
import {IoC} from 'Env/Env';
import {SyntheticEvent} from 'Vdom/Vdom';
import {Memory} from 'Types/source';

import * as template from 'wml!Controls-demo/List/ItemActions/ItemActions';

interface ISrcData {
   id: number;
   title: string;
   description: string;
}

const srcData: ISrcData[] = [
   {
      id: 1,
      title: 'Настолько длинное название папки что оно не влезет в максимальный размер 1',
      description: 'Другое название 1'
   },
   {
      id: 2,
      title: 'Notebooks 2',
      description: 'Описание вот такое'
   },
   {
      id: 3,
      title: 'Smartphones 3 ',
      description: 'Хватит страдать'
   }
];

const itemActions: IItemAction[] = [
   {
      id: 5,
      title: 'прочитано',
      showType: TItemActionShowType.TOOLBAR,
      handler(model: Model): void {
         IoC.resolve('ILogger').info('action read Click');
      }
   },
   {
      id: 1,
      icon: 'icon-PhoneNull',
      title: 'phone',
      handler(model: Model): void {
         IoC.resolve('ILogger').info('action phone Click ', model);
      }
   },
   {
      id: 2,
      icon: 'icon-EmptyMessage',
      title: 'message',
      parent: null,
      'parent@': true,
      handler(model: Model): void {
         alert('Message Click');
      }
   },
   {
      id: 3,
      icon: 'icon-Profile',
      title: 'profile',
      showType: TItemActionShowType.MENU_TOOLBAR,
      parent: 2,
      'parent@': null,
      handler(model: Model): void {
         IoC.resolve('ILogger').info('action profile Click');
      }
   },
   {
      id: 6,
      title: 'call',
      parent: 2,
      'parent@': null,
      handler(model: Model): void {
         IoC.resolve('ILogger').info('action profile Click');
      }
   },
   {
      id: 4,
      icon: 'icon-Erase',
      iconStyle: 'danger',
      title: 'delete pls',
      showType: TItemActionShowType.TOOLBAR,
      handler(model: Model): void {
         IoC.resolve('ILogger').info('action delete Click');
      }
   }
];

export default class ItemActions extends Control<IControlOptions> {
   protected _lastClickedTitle: string = 'false';
   protected _itemActions: IItemAction[] = itemActions;
   protected _template: TemplateFunction = template;
   protected _viewSource: Memory;
   protected _viewSource2: Memory;

   protected _markedKey: number | string;
   protected _markedKey2: number | string;

   protected _beforeMount(options?: IControlOptions, contexts?: object, receivedState?: void): Promise<void> | void {
      const srcMore = [];
      for (let i = 0; i < 7; i++) {
         srcMore.push({
            id: i,
            title: 'number #' + i,
            description: 'пожалейте разрабочиков ' + i
         });
      }
      this._viewSource = new Memory({
         keyProperty: 'id',
         data: srcData
      });
      this._viewSource2 = new Memory({
         keyProperty: 'id',
         data: srcMore
      });
      this._markedKey = 2;
      this._markedKey2 = 2;
   }

   protected _itemActionVisibilityCallback(action: IItemAction, item: Model): boolean {
      if (item.get('id') === 2) {
         if (action.id === 2 || action.id === 3) {
            return false;
         } else {
            return true;
         }
      }
      if (action.id === 5) {
         return false;
      }
      if (item.get('id') === 4) {
         return false;
      }
      return true;
   }

   _onActionClick(event: SyntheticEvent, action: IItemAction, item: Model): void {
      IoC.resolve('ILogger').info(arguments);
      this._lastClickedTitle = action.title;
   }

   _contentClick(): void {
      IoC.resolve('ILogger').info(arguments);
   }

   changeSource(): void {
      const srcMore = [];
      for (let i = 0; i < 4; i++) {
         srcMore.push({
            id: i,
            title: 'Новые ресурсы №' + i,
            description: 'в цикле задаю я ' + i
         });
      }
      this._viewSource = new Memory({
         keyProperty: 'id',
         data: srcMore
      });
   }

   static _styles: string[] = ['Controls-demo/List/ItemActions/ItemActions'];
}

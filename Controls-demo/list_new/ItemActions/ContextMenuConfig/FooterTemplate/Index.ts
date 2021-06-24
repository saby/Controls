import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import {IItemAction, TItemActionShowType} from 'Controls/itemActions';
import {Memory} from 'Types/source';
import {Model} from 'Types/entity';
import {IoC} from 'Env/Env';

import * as template from 'wml!Controls-demo/list_new/ItemActions/ContextMenuConfig/FooterTemplate/FooterTemplate';

interface ISrcData {
   id: number;
   title: string;
   menuFooterText: string;
}

const itemActions: IItemAction[] = [
   {
      id: 1,
      icon: 'icon-DownloadNew',
      title: 'Download',
      showType: TItemActionShowType.MENU_TOOLBAR,
      handler(model: Model): void {
         IoC.resolve('ILogger').info('action download Click');
      }
   },
   {
      id: 'delete',
      icon: 'icon-Erase',
      iconStyle: 'danger',
      title: 'Remove',
      showType: TItemActionShowType.MENU_TOOLBAR,
      handler(model: Model): void {
         IoC.resolve('ILogger').info('action delete Click');
      }
   }
];

const data: ISrcData[] = [
   {
      id: 1,
      title: 'Кнопка "Ещё" по свайпу будет показана, т.к. указан footerTemplate',
      menuFooterText: 'В шаблоне footerTemplate может быть размещена дополнительная информация'
   }
];

export default class FooterTemplate extends Control<IControlOptions> {
   protected _template: TemplateFunction = template;
   protected _viewSource: Memory;
   protected _itemActions: IItemAction[] = itemActions;

   protected _beforeMount(options?: IControlOptions, contexts?: object, receivedState?: void): Promise<void> | void {
      this._viewSource = new Memory({
         keyProperty: 'id',
         data
      });
   }

   static _styles: string[] = ['Controls-demo/list_new/ItemActions/ContextMenuConfig/FooterTemplate/FooterTemplate'];
}

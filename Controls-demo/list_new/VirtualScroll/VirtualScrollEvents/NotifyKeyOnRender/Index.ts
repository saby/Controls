import {Control, TemplateFunction} from 'UI/Base';
import * as template from 'wml!Controls-demo/list_new/VirtualScroll/VirtualScrollEvents/NotifyKeyOnRender/NotifyKeyOnRender';
import {Memory} from 'Types/source';
import {generateData} from 'Controls-demo/list_new/DemoHelpers/DataCatalog';

interface IItem {
   key: number;
   title: string;
}

export default class extends Control {
   protected _template: TemplateFunction = template;
   protected _source: Memory;
   protected _notifiedKeys: string = '';
   protected _beforeMount(): void {
      this._source = new Memory({
         keyProperty: 'key',
         data: generateData<IItem>({
            count: 50,
            entityTemplate: {title: 'lorem_alter'},
            beforeCreateItemCallback(item: IItem): void {
               item.title = `Запись с id="${item.key}" .${item.title}`;
            }
         })
      });

   }
   protected _trackNotifiedKeys(event, keys): void {
      if (keys.length) {
         keys.forEach((key) => {
            this._notifiedKeys += 'Загружаемый id : ' + keys + '\n';
         });
      }
   }

   static _styles: string[] = ['Controls-demo/Controls-demo'];
}
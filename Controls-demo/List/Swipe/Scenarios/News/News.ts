import Control = require('Core/Control');
import cConstants = require('Core/constants');
import * as template from 'wml!Controls-demo/List/Swipe/Scenarios/News/News';
import { Memory } from 'Types/source';
import { Model } from 'Types/entity';

export default class News extends Control {
   protected _template: Function = template;
   static _styles: string[] = ['Controls-demo/List/Swipe/Scenarios/News/News'];
   protected _itemActions: object[];
   protected _source: Memory;

   _beforeMount(): void {
      const data = [{
         id: 0,
         authorPhoto: cConstants.resourceRoot + 'Controls-demo/resources/images/mili.png',
         author: '"Мили"',
         date: 'сегодня 15:00',
         title: 'Бизнес-ланч',
         text: 'Соскучились по чему - то новенькому? Приглашаем Вас на обед - сегодня в "Мили" паста по - флорентийски, картофельный суп с сырными шариками и лёгкий салат с редисом и сельдереем - специально для тех, кто следит за фигурой. 😊',
         photo: cConstants.resourceRoot + 'Controls-demo/resources/images/menu.jpg',
         isNew: true
      }, {
         id: 1,
         authorPhoto: cConstants.resourceRoot + 'Controls-demo/resources/images/development.png',
         author: 'Чиркова В.',
         orgName: 'Организация разработки',
         date: 'сегодня 13:48',
         title: 'Предварительный план выпуска 3.18.600',
         text: '09.11.18 - Пятница\nВыпускающий - Рескайс А\nОбновление окружения\nИ ещё текст',
         isNew: true
      }, {
         id: 2,
         authorPhoto: cConstants.resourceRoot + 'Controls-demo/resources/images/development.png',
         author: 'Суконина М.',
         orgName: 'Организация разработки',
         date: 'сегодня 12:31',
         title: 'Опубликован план выпуска на ноябрь 2018',
         text: 'ссылка\nв две строки',
         isNew: true
      }, {
         id: 3,
         authorPhoto: cConstants.resourceRoot + 'Controls-demo/resources/images/development.png',
         author: 'Суконина М.',
         orgName: 'Организация разработки',
         date: 'сегодня 12:33',
         title: 'Маленькая новость',
         text: '',
         isNew: true
      }, {
         id: 4,
         authorPhoto: cConstants.resourceRoot + 'Controls-demo/resources/images/development.png',
         author: 'Суконина М.',
         orgName: 'Организация разработки',
         date: 'сегодня 12:30',
         title: 'Опубликован план выпуска на ноябрь 2017',
         text: 'текст\nв\nцелых\nпять\nстрок',
         isNew: true
      }, {
         id: 5,
         authorPhoto: cConstants.resourceRoot + 'Controls-demo/resources/images/golubev.png',
         author: 'Голубев А.',
         orgName: 'HL/HA',
         date: 'сегодня 11:08',
         title: 'HL/HA: Гороскоп на неделю',
         text: 'Всегда с вами, любящая вас, группа HL/HA',
         banner: cConstants.resourceRoot + 'Controls-demo/resources/images/banner.jpg',
         isNew: false
      }, {
         id: 6,
         authorPhoto: cConstants.resourceRoot + 'Controls-demo/resources/images/sbis.png',
         author: 'Гребенкина А.',
         orgName: 'Тензор Ярославль',
         date: '1 ноя 14:37',
         text: 'Ваша машина мешает',
         isNew: false
      }];
      this._itemActions = [
         {
            id: 1,
            icon: 'icon-PhoneNull',
            title: 'Прочитано',
            showType: 2
         },
         {
            id: 2,
            icon: 'icon-Erase',
            title: 'Удалить',
            iconStyle: 'danger',
            showType: 2
         },
         {
            id: 3,
            icon: 'icon-EmptyMessage',
            title: 'В избранные',
            showType: 2
         },
         {
            id: 4,
            icon: 'icon-EmptyMessage',
            title: 'В избранные2',
            showType: 2
         }
      ];
      this._source = new Memory({
         keyProperty: 'id',
         data
      });
   }

   protected _visibilityCallback(action: IItemAction, item: Model): boolean {
      if (action.title === 'Прочитано') {
         return item.get('isNew');
      }
      return true;
   }
}

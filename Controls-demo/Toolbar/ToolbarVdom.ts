import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import controlTemplate = require('wml!Controls-demo/Toolbar/ToolbarVdom');
import itemTemplate = require('wml!Controls-demo/Toolbar/resources/itemTemplate');
import itemTemplateContent = require('wml!Controls-demo/Toolbar/resources/itemTemplateContent');
import {showType} from 'Controls/Utils/Toolbar';
import {Memory} from 'Types/source';

class ToolbarVdom extends Control<IControlOptions> {
   protected _template: TemplateFunction = controlTemplate;
   protected _defaultItems =  null;
   protected _flatItems = null;
   protected _currentClick = 'Нажми на тулбар';
   protected _defaultItemsWithoutToolbutton = null;

   private _getDefaultMemory(): Memory {
      return new Memory({
         keyProperty: 'id',
         data: this._defaultItems
      });
   }

   private _getMemorySource(items): Memory {
      return new Memory({
         keyProperty: 'id',
         data: items
      });
   }

   protected _beforeMount(): void {
      this._itemClick = this._itemClick.bind(this);
      this._defaultItems = [
         {
            id: '1',
            showType: showType.TOOLBAR,
            icon: 'icon-Time',
            '@parent': false,
            parent: null
         },
         {
            id: '3',
            icon: 'icon-Print',
            title: 'Распечатать',
            '@parent': false,
            parent: null
         },
         {
            id: '4',
            icon: 'icon-Linked',
            fontColorStyle: 'secondary',
            viewMode: 'toolButton',
            iconStyle: 'secondary',
            contrastBackground: true,
            title: 'Связанные документы',
            '@parent': true,
            parent: null
         },
         {
            id: '5',
            viewMode: 'icon',
            icon: 'icon-Link',
            title: 'Скопировать в буфер',
            '@parent': false,
            parent: null
         },
         {
            id: '6',
            showType: showType.MENU,
            title: 'Прикрепить к',
            '@parent': false,
            parent: null,
            readOnly: true
         },
         {
            id: '7',
            showType: showType.MENU_TOOLBAR,
            title: 'Проекту',
            '@parent': false,
            parent: '4'
         },
         {
            id: '8',
            showType: showType.MENU,
            title: 'Этапу',
            '@parent': false,
            parent: '4'
         },
         {
            id: '9',
            showType: showType.MENU,
            title: 'Согласование',
            '@parent': false,
            parent: '2'
         },
         {
            id: '10',
            showType: showType.MENU,
            title: 'Задача',
            '@parent': false,
            parent: '2'
         },
         {
            id: '11',
            icon: 'icon-EmptyMessage',
            fontColorStyle: 'secondary',
            showHeader: true,
            viewMode: 'link',
            iconStyle: 'secondary',
            contrastBackground: true,
            title: 'Обсудить',
            '@parent': true,
            parent: null,
            readOnly: true
         },
         {
            id: '12',
            showType: showType.MENU,
            title: 'Видеозвонок',
            '@parent': false,
            parent: '11'
         },
         {
            id: '13',
            showType: showType.MENU,
            title: 'Сообщение',
            '@parent': false,
            parent: '11'
         },
         {
            id: '14',
            showType: showType.MENU,
            icon: 'icon-Groups',
            fontColorStyle: 'secondary',
            title: 'Совещания',
            '@parent': false,
            parent: null,
            additional: true
         },
         {
            id: '2',
            showType: showType.MENU,
            icon: 'icon-Report',
            fontColorStyle: 'secondary',
            title: 'Список задач',
            '@parent': true,
            parent: null,
            additional: true
         }
      ];
      this._defaultItemsWithoutToolbutton = [
         {
            id: '1',
            icon: 'icon-Print',
            title: 'Распечатать',
            readOnly: false,
            '@parent': false,
            parent: null
         },
         {
            id: '2',
            viewMode: 'icon',
            icon: 'icon-Link',
            title: 'Скопировать в буфер',
            '@parent': false,
            parent: null
         },
         {
            id: '3',
            showType: showType.MENU,
            title: 'Прикрепить к',
            '@parent': false,
            parent: null
         },
         {
            id: '4',
            showType: showType.MENU,
            title: 'Проекту',
            '@parent': false,
            parent: '3'
         },
         {
            id: '5',
            showType: showType.MENU,
            title: 'Этапу',
            '@parent': false,
            parent: '3'
         },
         {
            id: '6',
            icon: 'icon-EmptyMessage',
            fontColorStyle: 'secondary',
            showHeader: true,
            viewMode: 'link',
            iconStyle: 'secondary',
            contrastBackground: true,
            title: 'Обсудить',
            '@parent': true,
            parent: null,
            readOnly: true
         },
         {
            id: '7',
            showType: showType.MENU,
            title: 'Видеозвонок',
            '@parent': false,
            parent: '6'
         },
         {
            id: '8',
            showType: showType.MENU,
            title: 'Сообщение',
            '@parent': false,
            parent: '6'
         }
      ];
      this._flatItems = [
         {
            id: '1',
            showType: showType.TOOLBAR,
            icon: 'icon-Time',
            fontColorStyle: 'secondary',
            viewMode: 'toolButton',
            iconStyle: 'secondary',
            contrastBackground: true,
            title: 'Время',
            '@parent': true,
            parent: null
         },
         {
            id: '2',
            showType: showType.TOOLBAR,
            icon: 'icon-Linked',
            fontColorStyle: 'secondary',
            viewMode: 'toolButton',
            iconStyle: 'secondary',
            contrastBackground: true,
            title: 'Связанные документы'
         },
         {
            id: '3',
            showType: showType.TOOLBAR,
            icon: 'icon-Author',
            fontColorStyle: 'secondary',
            viewMode: 'toolButton',
            iconStyle: 'secondary',
            contrastBackground: true,
            title: 'Автор'
         },
         {
            id: '4',
            showType: showType.TOOLBAR,
            icon: 'icon-RoundPlus',
            fontColorStyle: 'secondary',
            viewMode: 'functionalButton',
            iconStyle: 'contrast',
            title: 'Добавить',
            '@parent': true,
            parent: null
         }
      ];
   }

   private _itemClick(event, item): void {
      this._currentClick = 'Вы нажали на ' + item.getId();
   }
   static _theme: string[] = ['Controls/Classes'];

   static _styles: string[] = ['Controls-demo/Toolbar/ToolbarVdom', 'Controls-demo/Controls-demo'];
}
export default ToolbarVdom;

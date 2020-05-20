define('Controls-demo/List/ItemActionsCustom', [
   'Env/Env',
   'Core/Control',
   'wml!Controls-demo/List/ItemActions/ItemActionsCustom',
   'wml!Controls-demo/List/ItemActions/newsTmpl',
   'Types/source',
   'Core/constants',
], function(
   Env,
   BaseControl,
   template,
   newsTmpl,
   source,
   cConstants
) {
   'use strict';
   var showType = {

      //show only in Menu
      MENU: 0,

      //show in Menu and Toolbar
      MENU_TOOLBAR: 1,

      //show only in Toolbar
      TOOLBAR: 2
   };
   var srcData = [
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
      ],
      newsData = [{
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
      },
      {
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
      }],
      _firstItemActionsArray = [
         {
            id: 1,
            title: 'прочитано',
            icon: 'icon-ShowBig',
            showType: showType.MENU_TOOLBAR,
            handler: function() {
               Env.IoC.resolve('ILogger').info('action read Click');
            }
         },
         {
            id: 2,
            icon: 'icon-Erase',
            title: 'Удалить',
            iconStyle: 'danger',
            showType: showType.MENU_TOOLBAR,
            handler: function() {
               Env.IoC.resolve('ILogger').info('action delete Click');
            }
         },
         {
            id: 3,
            icon: 'icon-Unfavorite',
            title: 'В избранное',
            showType: showType.MENU_TOOLBAR,
            'parent@': true,
            handler: function() {
               Env.IoC.resolve('ILogger').info('action favorite Click');
            }
         },
         {
            id: 4,
            icon: 'icon-Link',
            title: 'Ссылка',
            showType: showType.MENU_TOOLBAR,
            'parent@': true,
            handler: function() {
               Env.IoC.resolve('ILogger').info('action link Click');
            }
         }
      ];

   var ModuleClass = BaseControl.extend(
      {
         __lastClicked: false,
         _showAction: function(action, item) {
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
         },
         _newsItemTemplate: newsTmpl,
         _itemActions: _firstItemActionsArray,
         _template: template,
         _onActionClick: function(event, action, item) {
            Env.IoC.resolve('ILogger').info(arguments);
            this.__lastClicked = action.title;
         },
         _contentClick: function() {
            Env.IoC.resolve('ILogger').info(arguments);
         },

         constructor: function() {
            ModuleClass.superclass.constructor.apply(this, arguments);
            var
               srcMore = [];
            for (var i = 0; i < 7; i++) {
               srcMore.push({
                  id: i,
                  title: 'number #' + i,
                  description: 'пожалейте разрабочиков ' + i
               });
            }
            this._viewSource = new source.Memory({
               keyProperty: 'id',
               data: srcData
            });
            this._viewSource2 = new source.Memory({
               keyProperty: 'id',
               data: srcMore
            });
            this._viewSource3 = new source.Memory({
              keyProperty: 'id',
              data: newsData
            });
         },
         changeSource: function() {
            var
               srcMore = [];
            for (var i = 0; i < 4; i++) {
               srcMore.push({
                  id: i,
                  title: 'Новые ресурсы №' + i,
                  description: 'в цикле задаю я ' + i
               });
            }
            this._viewSource = new source.Memory({
               keyProperty: 'id',
               data: srcMore
            });
         }
      });
   ModuleClass._styles = ['Controls-demo/List/ItemActions/ItemActionsCustom'];

   return ModuleClass;
});

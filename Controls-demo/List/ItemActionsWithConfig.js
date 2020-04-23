/**
 * Created by kraynovdo on 31.01.2018.
 */
define('Controls-demo/List/ItemActionsWithConfig', [
   'Env/Env',
   'Core/Control',
   'wml!Controls-demo/List/ItemActions/ItemActionsWithConfig',
   'Types/source',
   'Controls/Constants',
], function(
   Env,
   BaseControl,
   template,
   source,
   ControlsConstants
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
      _firstItemActionsArray = [

         {
            id: 1,
            icon: 'icon-PhoneNull',
            title: 'phone',
            handler: function(item) {
               Env.IoC.resolve('ILogger').info('action phone Click ', item);
            },
            group: ControlsConstants.view.hiddenGroup
         },
         {
            id: 2,
            icon: 'icon-EmptyMessage',
            title: 'message',
            parent: null,
            'parent@': true,
            handler: function() {
               alert('Message Click');
            },
            group: 1
         },
         {
            id: 3,
            icon: 'icon-Profile',
            title: 'profile',
            showType: showType.MENU_TOOLBAR,
            parent: null,
            group: 1,
            'parent@': null,
            handler: function() {
               Env.IoC.resolve('ILogger').info('action profile Click');
            }
         },
         {
            id: 6,
            title: 'call',
            parent: null,
            group: 2,
            'parent@': null,
            handler: function() {
               Env.IoC.resolve('ILogger').info('action profile Click');
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
         _itemActions: _firstItemActionsArray,
         _template: template,
         _styles: ['Controls-demo/List/ItemActions/ItemActions'],
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
         },
         _groupingKeyCallback: function(item) {
            if (item.get('group') === 'hidden' || !item.get('group')) {
               return ControlsConstants.view.hiddenGroup;
            }
            return item.get('group');
         }
      });
   return ModuleClass;
});

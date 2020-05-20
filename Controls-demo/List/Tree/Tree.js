define('Controls-demo/List/Tree/Tree', [
   'Env/Env',
   'Core/Control',
   'Controls-demo/List/Tree/GridData',
   'wml!Controls-demo/List/Tree/Tree',
   'Controls-demo/List/Tree/TreeMemory',
   'Controls/scroll',
   'Controls/treeGrid',
   'wml!Controls-demo/List/Tree/DemoContentTemplate'
], function(Env, BaseControl, GridData, template, MemorySource) {
   'use strict';
   var
      ModuleClass = BaseControl.extend({
         _template: template,
         _actionClicked: '',
         _groupingKeyCallback: null,
         _itemActions: null,
         _viewSource: null,
         gridData: null,
         gridColumns: null,
         showType: null,
         _beforeMount: function() {
            this.gridColumns = [
               {
                  displayProperty: 'Наименование',
                  width: '1fr',
                  template: 'wml!Controls-demo/List/Tree/DemoContentTemplate'
               }
            ];
            this.showType = {
               // show only in Menu
               MENU: 0,
               // show in Menu and Toolbar
               MENU_TOOLBAR: 1,
               // show only in Toolbar
               TOOLBAR: 2
            };
            this.gridData = GridData;
            this._viewSource = new MemorySource({
               keyProperty: 'id',
               data: GridData.catalog
            });
            this._itemActions = [
               {
                  id: 5,
                  title: 'прочитано',
                  showType: this.showType.TOOLBAR,
                  handler: function() {
                     Env.IoC.resolve('ILogger').info('action read Click');
                  }
               },
               {
                  id: 1,
                  icon: 'icon-primary icon-PhoneNull',
                  title: 'phone',
                  handler: function(item) {
                     Env.IoC.resolve('ILogger').info('action phone Click ', item);
                  }
               },
               {
                  id: 2,
                  icon: 'icon-primary icon-EmptyMessage',
                  title: 'message',
                  handler: function() {
                     alert('Message Click');
                  }
               },
               {
                  id: 3,
                  icon: 'icon-primary icon-Profile',
                  title: 'profile',
                  showType: this.showType.MENU_TOOLBAR,
                  handler: function() {
                     Env.IoC.resolve('ILogger').info('action profile Click');
                  }
               },
               {
                  id: 4,
                  icon: 'icon-Erase icon-error',
                  title: 'delete pls',
                  showType: this.showType.TOOLBAR,
                  handler: function() {
                     Env.IoC.resolve('ILogger').info('action delete Click');
                  }
               }
            ];
            this._groupingKeyCallback = function(item, index, displayItem) {
               return item.get('Группа');
            };
         },
         _nodeFooterVisibilityCallback: function(item) {
            return item.get('Наименование') !== 'Presto';
         },
         _showAction: function(action, item) {
            if (action.id === 5) {
               return false;
            }

            return true;
         },
         _onActionClick: function(event, action) {
            this._actionClicked = action.title;
         }
      });

   ModuleClass._styles = ['Controls-demo/List/Tree/Tree'];

   return ModuleClass;
});

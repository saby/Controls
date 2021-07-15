define('Controls-demo/dropdown_new/Button/MenuAlignSublevel/MenuAlignSublevel', [
   'UI/Base',
   'wml!Controls-demo/dropdown_new/Button/MenuAlignSublevel/MenuAlignSublevel',
   'Types/source',
   'Controls/list',
   'Controls-demo/dropdown_new/Button/HistoryId/historySourceMenu',

   'wml!Controls-demo/Buttons/Menu/itemTemplateSub',
   'wml!Controls-demo/Buttons/Menu/itemTemplateComment'
], function(Base, template, source, ControlsConstants) {
   'use strict';

   var ModuleClass = Base.Control.extend(
      {
         _template: template,
         _multiItemsWithIcons: null,
         _multiItems: null,

         _beforeMount(): void  {
            this._multiItemsWithIcons = [
               {
                  id: 1,
                  title: 'Task',
                  '@parent': true,
                  icon: 'icon-Attach',
                  parent: null
               },
               {
                  id: 2,
                  title: 'Error in the development',
                  '@parent': false,
                  icon: 'icon-Attach',
                  parent: null
               },
               { id: 3, title: 'Commission', parent: 1, icon: 'icon-Attach' },
               {
                  id: 4,
                  title: 'Coordination',
                  parent: 1,
                  icon: 'icon-Attach',
                  '@parent': true
               },
               { id: 5, title: 'Application', parent: 1, icon: 'icon-Attach' },
               { id: 6, title: 'Development', parent: 1, icon: 'icon-Attach' },
               { id: 7, title: 'Exploitation', parent: 1, icon: 'icon-Attach' },
               { id: 8, title: 'Coordination', parent: 4, icon: 'icon-Attach' },
               { id: 9, title: 'Negotiate the discount', parent: 4, icon: 'icon-Attach' },
               { id: 10, title: 'Coordination of change prices', parent: 4, icon: 'icon-Attach' },
               { id: 11, title: 'Matching new dish', parent: 4, icon: 'icon-Attach' }
            ];
            this._multiItems = [
               {
                  id: 1,
                  title: 'Task',
                  '@parent': true,
                  parent: null
               },
               { id: 2, title: 'Error in the development', '@parent': false, parent: null },
               { id: 3, title: 'Commission', parent: 1 },
               {
                  id: 4,
                  title: 'Coordination',
                  parent: 1,
                  '@parent': true
               },
               { id: 5, title: 'Application', parent: 1 },
               { id: 6, title: 'Development', parent: 1 },
               { id: 7, title: 'Exploitation', parent: 1 },
               { id: 8, title: 'Coordination', parent: 4 },
               { id: 9, title: 'Negotiate the discount', parent: 4 },
               { id: 10, title: 'Coordination of change prices', parent: 4 },
               { id: 11, title: 'Matching new dish', parent: 4 }
            ];
         },

         _createBigItems(): any[] {
            var items = [];
            for (var i = 0; i < 100; i++) {
               items.push({id: i, title: i % 10 === 0 ? ('Are we testing if there are very long records in the menu with unlimited width? This is a very long record. ' + i) : ('New record ' + i)});
            }
            return items;
         },

         _createMemory(items): any {
            return new source.Memory({
               keyProperty: 'id',
               data: items
            });
         },

         _groupingKeyCallback(item): string {
            if (item.get('group') === 'hidden' || !item.get('group')) {
               return ControlsConstants.groupConstants.hiddenGroup;
            }
            return item.get('group');
         }
      }
   );
   ModuleClass._styles = ['Controls-demo/Buttons/Menu/Menu'];

   return ModuleClass;
});

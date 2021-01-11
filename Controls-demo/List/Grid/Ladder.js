define('Controls-demo/List/Grid/Ladder', [
   'UI/Base',
   'wml!Controls-demo/List/Grid/resources/Ladder/Ladder',
   'Controls-demo/List/Grid/GridData',
   'Types/source',


   'Controls/scroll',
   'Controls/grid',

   'Controls/list',
   'Controls/operations',

   'wml!Controls-demo/List/Grid/resources/Ladder/TasksPhoto',
   'wml!Controls-demo/List/Grid/resources/Ladder/TasksDescr',
   'wml!Controls-demo/List/Grid/resources/Ladder/TasksReceived'
], function(Base, template, GridData, source) {
   'use strict';
   var

      ModuleClass = Base.Control.extend({
         _template: template,
         _viewSource: null,
         _viewColumns: null,
         _selectedKeys: null,
         _ladderProperties: [
            'photo',
            'date'
         ],

         _beforeMount: function() {
            this._selectedKeys = [];

            this._viewSource = new source.Memory({
               keyProperty: 'id',
               data: GridData.tasks
            });

            this._viewColumns = [
               {
                  template: 'wml!Controls-demo/List/Grid/resources/Ladder/TasksPhoto',
                  width: '98px',
                  stickyProperty: 'photo'
               },
               {
                  template: 'wml!Controls-demo/List/Grid/resources/Ladder/TasksDescr',
                  width: '1fr'
               },
               {
                  template: 'wml!Controls-demo/List/Grid/resources/Ladder/TasksReceived',
                  width: 'auto'
               }
            ];
         }
      });

   ModuleClass._styles = ['Controls-demo/List/Grid/resources/Ladder/Ladder'];

   return ModuleClass;
});

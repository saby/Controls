define('Controls-demo/operations/SelectionStrategies', [
   'Core/Control',
   'wml!Controls-demo/operations/SelectionStrategies',
   'Controls-demo/operations/SelectionViewMode/Memory',

   // Зависит от другой демки, надо переписать
   'Controls-demo/OperationsPanel/Demo/Data',
   'wml!Controls-demo/OperationsPanel/Demo/PersonInfo',
   'css!Controls-demo/OperationsPanel/Demo/Demo'
], function(Control, template, MemorySource, Data) {
   'use strict';

   return Control.extend({
      _template: template,
      _treeSelectionStrategy: null,
      _gridColumns: null,

      _beforeMount: function() {
         this._gridColumns = [{
            template: 'wml!Controls-demo/OperationsPanel/Demo/PersonInfo'
         }];
         this._viewSource = new MemorySource.default({
            keyProperty: 'id',
            data: Data.employees
         });
      },

      _dataLoadCallback: function() {
         var entryPath = Data.employees.map(function(employeeData) {
            return {
               id: employeeData.id,
               parent: employeeData['Раздел']
            }
         });

         this.items.setMetaData({
            ENTRY_PATH: entryPath
         });
      }
   });
});

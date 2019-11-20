define('Controls-demo/SelectionStrategies/SelectionStrategies', [
   'Core/Control',
   'wml!Controls-demo/SelectionStrategies/SelectionStrategies',
   'Engine-demo/Selector/SelectorData',
   'Engine-demo/Selector/TreeListSelector/SelectorMemory',

   // Зависит от другой демки, надо переписать
   'Controls-demo/OperationsPanel/Demo/Data',
   'wml!Controls-demo/OperationsPanel/Demo/PersonInfo',
   'css!Controls-demo/OperationsPanel/Demo/Demo'
], function(Control, template, SelectorData, MemorySource, Data) {
   'use strict';

   return Control.extend({
      _template: template,
      _treeSelectionStrategy: null,
      _gridColumns: null,

      _beforeMount: function() {
         this._gridColumns = [{
            template: 'wml!Controls-demo/OperationsPanel/Demo/PersonInfo'
         }];
         this._viewSource = new MemorySource({
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

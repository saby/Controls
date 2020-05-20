define('Controls-demo/List/Tree/ExpandedItemsBinding', [
   'Core/Control',
   'Controls-demo/List/Tree/GridData',
   'wml!Controls-demo/List/Tree/ExpandedItemsBinding',
   'Types/source',
   'Controls-demo/Utils/MemorySourceFilter',
   'Controls/scroll',
   'Controls/treeGrid',
   'wml!Controls-demo/List/Tree/DemoContentTemplate'
], function(BaseControl, GridData, template, Source, memorySourceFilter) {
   'use strict';
   var ModuleClass = BaseControl.extend({
      _template: template,
      _groupingKeyCallback: null,
      _viewSource: null,
      gridData: null,
      gridColumns: null,
      _expandedItemsForBind: null,
      _collapsedItemsForBind: null,
      _expandedItems: [2246],
      _beforeMount: function() {
         this._expandedItemsForBind = [null];
         this._collapsedItemsForBind = [];
         this.gridColumns = [
            {
               displayProperty: 'Наименование',
               width: '1fr',
               template: 'wml!Controls-demo/List/Tree/DemoContentTemplate'
            }
         ];
         this.gridData = GridData;
         this._viewSource = new Source.Memory({
            keyProperty: 'id',
            data: GridData.catalog,

            filter: memorySourceFilter()
         });
      }
   });

   ModuleClass._styles = ['Controls-demo/List/Tree/Tree'];

   return ModuleClass;
});

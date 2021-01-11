define('Controls-demo/List/Tree/ExpandedItemsBinding', [
   'UI/Base',
   'Controls-demo/List/Tree/GridData',
   'wml!Controls-demo/List/Tree/ExpandedItemsBinding',
   'Types/source',
   'Controls-demo/Utils/MemorySourceFilter',
   'Controls/scroll',
   'Controls/treeGrid',
   'wml!Controls-demo/List/Tree/DemoContentTemplate'
], function(Base, GridData, template, Source, memorySourceFilter) {
   'use strict';
   var ModuleClass = Base.Control.extend({
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

define('Controls-demo/List/Tree/SingleExpand', [
   'UI/Base',
   'Controls-demo/List/Tree/GridData',
   'wml!Controls-demo/List/Tree/SingleExpand',
   'Controls-demo/List/Tree/TreeMemory',
   'Controls/scroll',
   'Controls/treeGrid',
   'wml!Controls-demo/List/Tree/DemoContentTemplate'
], function(Base, GridData, template, MemorySource) {
   'use strict';
   var ModuleClass = Base.Control.extend({
      _template: template,
      _groupingKeyCallback: null,
      _viewSource: null,
      gridData: null,
      gridColumns: null,
      _beforeMount: function() {
         this.gridColumns = [
            {
               displayProperty: 'Наименование',
               width: '1fr',
               template: 'wml!Controls-demo/List/Tree/DemoContentTemplate'
            }
         ];
         this.gridData = GridData;
         this._viewSource = new MemorySource({
            keyProperty: 'id',
            data: GridData.catalog
         });
      }

   });

   ModuleClass._styles = ['Controls-demo/List/Tree/Tree'];

   return ModuleClass;
});

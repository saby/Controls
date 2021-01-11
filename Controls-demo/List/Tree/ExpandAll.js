define('Controls-demo/List/Tree/ExpandAll', [
   'UI/Base',
   'wml!Controls-demo/List/Tree/resources/ExpandAll/ExpandAll',
   'Types/source',
   'Controls-demo/List/Tree/resources/Data',
   'Controls/treeGrid',
], function (Base, template, source, TreeData) {
   'use strict';

   var
      ModuleClass = Base.Control.extend({
         _template: template,
         _viewSource: null,
         _columns: [
            {
               displayProperty: 'title'
            }
         ],
         _expandedItems: [null],

         _beforeMount: function() {
            this._viewSource = new source.Memory({
               keyProperty: 'id',
               data: TreeData.generate()
            });
         }
      });
   ModuleClass._styles = ['Controls-demo/List/Tree/resources/ExpandAll/ExpandAll'];

   return ModuleClass;
});

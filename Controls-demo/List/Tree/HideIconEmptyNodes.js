define('Controls-demo/List/Tree/HideIconEmptyNodes', [
   'Core/Control',
   'Controls-demo/List/Tree/TreeData',
   'wml!Controls-demo/List/Tree/resources/HideIconEmptyNodes/HideIconEmptyNodes',
   'Controls/scroll',
   'Controls/treeGrid'
], function(Control, TreeData, template) {
   'use strict';
   var
      HideIconEmptyNodes = Control.extend({
         _template: template,
         _styles: ['Controls-demo/List/Tree/resources/HideIconEmptyNodes/HideIconEmptyNodes'],
         _treeSource: null,
         _beforeMount: function() {
            this._treeSource = TreeData.getTasksFoldersMemory();
         }
      });

   return HideIconEmptyNodes;
});

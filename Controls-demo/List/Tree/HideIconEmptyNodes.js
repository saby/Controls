define('Controls-demo/List/Tree/HideIconEmptyNodes', [
   'UI/Base',
   'Controls-demo/List/Tree/TreeData',
   'wml!Controls-demo/List/Tree/resources/HideIconEmptyNodes/HideIconEmptyNodes',
   'Controls/scroll',
   'Controls/treeGrid'
], function(Base, TreeData, template) {
   'use strict';
   var
      HideIconEmptyNodes = Base.Control.extend({
         _template: template,
         _treeSource: null,
         _beforeMount: function() {
            this._treeSource = TreeData.getTasksFoldersMemory();
         }
      });

   HideIconEmptyNodes._styles = ['Controls-demo/List/Tree/resources/HideIconEmptyNodes/HideIconEmptyNodes'];

   return HideIconEmptyNodes;
});

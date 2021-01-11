define('Controls-demo/List/Tree/SelectExpanderIcon', [
   'UI/Base',
   'Controls-demo/List/Tree/TreeData',
   'wml!Controls-demo/List/Tree/resources/SelectExpanderIcon/SelectExpanderIcon',
   'Controls/scroll',
   'Controls/treeGrid'
], function(Base, TreeData, template) {
   'use strict';
   var
      SelectExpanderIcon = Base.Control.extend({
         _template: template,
         _tasksSource: null,
         _beforeMount: function() {
            this._tasksSource = TreeData.getTasksMemory();
         },
         onClickSubTaskExpander: function(event, key) {
            this._children.tasksTreeGrid.toggleExpanded(key);
         }
      });

   SelectExpanderIcon._styles = ['Controls-demo/List/Tree/resources/SelectExpanderIcon/SelectExpanderIcon'];

   return SelectExpanderIcon;
});

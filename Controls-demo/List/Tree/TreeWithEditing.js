define('Controls-demo/List/Tree/TreeWithEditing', [
   'Core/Control',
   'Controls-demo/List/Tree/TreeWithEditingData',
   'wml!Controls-demo/List/Tree/TreeWithEditing',
   'Controls-demo/List/Tree/TreeMemory',
   'wml!Controls-demo/List/Tree/treeEditingTemplate',
   'Core/core-clone',
], function(
   BaseControl,
   TreeWithEditingData,
   template,
   MemorySource,
   treeEditingTemplate,
   cClone
) {

   'use strict';

   var
      TreeWithEditing = BaseControl.extend({
         _template: template,
         _styles: ['Controls-demo/List/Tree/Tree'],
         _viewSource: null,
         gridColumns: null,
         _beforeMount: function() {
            this.gridColumns = [
               {
                  displayProperty: 'Наименование',
                  width: '1fr',
                  template: treeEditingTemplate
               },
               {
                  displayProperty: 'Описание',
                  width: '1fr',
                  template: treeEditingTemplate
               }
            ];
            this._viewSource = new MemorySource({
               keyProperty: 'id',
               data: cClone(TreeWithEditingData.catalog)
            });
         },

         _onBeforeBeginEdit: function(e, options, isAdd) {
            if (!isAdd) {
               return;
            }
            return this._viewSource.create().addCallback(function(model) {
               model.set('Раздел', null);
               model.set('Раздел@', true);
               model.set('Раздел$', null);
               return {
                  item: model
               };
            });
         }
      });

   return TreeWithEditing;
});

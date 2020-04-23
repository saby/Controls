define('Controls-demo/List/EditInPlace/Hover', [
   'Core/Control',
   'wml!Controls-demo/List/EditInPlace/Hover',
   'Types/source',
], function(Control,
   template,
   source
) {
   'use strict';

   var srcData = [
      {
         id: 1,
         title: 'Record1'
      },
      {
         id: 2,
         title: 'Record2'
      }
   ];

   var Hover = Control.extend({
      _template: template,
      _styles: ['Controls-demo/List/EditInPlace/EditInPlace'],
      editingConfig: null,
      _enabled: true,

      _beforeMount: function() {
         this._viewSource = new source.Memory({
            keyProperty: 'id',
            data: srcData
         });
      }
   });
   return Hover;
});

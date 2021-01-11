define('Controls-demo/List/EditInPlace/Hover', [
   'UI/Base',
   'wml!Controls-demo/List/EditInPlace/Hover',
   'Types/source',
], function(Base,
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

   var Hover = Base.Control.extend({
      _template: template,
      editingConfig: null,
      _enabled: true,

      _beforeMount: function() {
         this._viewSource = new source.Memory({
            keyProperty: 'id',
            data: srcData
         });
      }
   });
   Hover._styles = ['Controls-demo/List/EditInPlace/EditInPlace'];

   return Hover;
});

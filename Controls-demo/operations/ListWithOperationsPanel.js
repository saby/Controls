define('Controls-demo/operations/ListWithOperationsPanel', [
   'UI/Base',
   'wml!Controls-demo/operations/ListWithOperationsPanel'
], function(Base, template) {
   'use strict';

   return Base.Control.extend({
      _template: template,
      _expanded: false,
      _operationsPanelVisible: false,
      _selectedKeys: null,
      _excludedKeys: null,

      _beforeMount: function() {
         this._selectedKeys = [28];
         this._excludedKeys = [];
      }
   });
});

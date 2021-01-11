define('Controls-demo/DragNDrop/Container', [
   'UI/Base',
   'wml!Controls-demo/DragNDrop/Container/Container',
], function(Base, template) {
   'use strict';

   var ModuleClass = Base.Control.extend({
      _template: template,
      _hasList: true,
      _hasGrid: false,
      _hasTree: false,
      _hasNotes: false,
      _hasMasterDetail: false,
      _selectedKeys: []
   });
   ModuleClass._styles = ['Controls-demo/DragNDrop/Container/Container'];

   return ModuleClass;
});

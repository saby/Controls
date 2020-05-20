define('Controls-demo/DragNDrop/List', [
   'Core/Control',
   'Core/core-clone',
   'Types/source',
   'Controls-demo/DragNDrop/ListEntity',
   'Controls-demo/DragNDrop/DemoData',
   'wml!Controls-demo/DragNDrop/List/List',
   'Controls/Utils/Toolbar',
   'Controls/dragnDrop',
], function(BaseControl, cClone, source, ListEntity, DemoData, template, Toolbar) {
   'use strict';

   var ModuleClass = BaseControl.extend({
      _template: template,
      _itemActions: null,
      _viewSource: null,

      _beforeMount: function() {
         this._selectedKeys = [];
         this._itemsReadyCallback = this._itemsReady.bind(this);
         this._itemActions = [{
            title: 'Action',
            showType: Toolbar.showType.TOOLBAR,
            id: 0
         }];
         this._viewSource = new source.Memory({
            keyProperty: 'id',
            data: cClone(DemoData)
         });
      },

      _itemsReady: function(items) {
         this._items = items;
      },

      _dragEnd: function(event, entity, target, position) {
         this._children.listMover.moveItems(entity.getItems(), target, position);
      },

      _dragStart: function(event, items) {
         var
            hasBadItems = false,
            firstItem = this._items.getRecordById(items[0]);

         items.forEach(function(item) {
            if (item === 0) {
               hasBadItems = true;
            }
         });
         return hasBadItems ? false : new ListEntity({
            items: items,
            mainText: firstItem.get('title'),
            image: firstItem.get('image'),
            additionalText: firstItem.get('additional')
         });
      }
   });
   ModuleClass._styles = ['Controls-demo/DragNDrop/List/List'];

   return ModuleClass;
});

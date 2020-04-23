define('Controls-demo/DragNDrop/Notes', [
   'Core/Control',
   'Core/core-instance',
   'Types/source',
   'wml!Controls-demo/DragNDrop/Notes/Notes',
   'Controls-demo/DragNDrop/Notes/EntityTriangle',
   'Controls-demo/DragNDrop/Notes/EntityNote',
], function(BaseControl, cInstance, source, template, EntityTriangle, EntityNote) {
   'use strict';

   var Notes = BaseControl.extend({
      _template: template,
      _styles: ['Controls-demo/DragNDrop/Notes/Notes'],
      _itemActions: undefined,
      _items: null,
      _startPosition: undefined,
      _startSize: undefined,
      _draggingItemId: undefined,

      reload: function() {
         this._children.notesList.reload();
      },

      _onMouseDownTriangle: function(event, itemData) {
         this._children.dragNDrop.startDragNDrop(new EntityTriangle({
            item: itemData.item
         }), event);
         event.stopPropagation();
      },

      _onMouseDownNote: function(event, itemData) {
         this._children.dragNDrop.startDragNDrop(new EntityNote({
            item: itemData.item
         }), event);
      },

      _beforeMount: function() {
         this._items = [{
            id: 0,
            title: 'Заметка 1',
            dragging: false,
            position: {
               top: 700,
               left: 5
            },
            size: {
               width: 150,
               height: 50
            }
         }, {
            id: 1,
            title: 'Заметка 2',
            dragging: false,
            position: {
               top: 755,
               left: 5
            },
            size: {
               width: 150,
               height: 50
            }
         }];
         this._viewSource = new source.Memory({
            keyProperty: 'id',
            data: this._items
         });
      },

      _dragStart: function(event, dragObject) {
         var entity = dragObject.entity;

         if (cInstance.instanceOfModule(entity, 'Controls-demo/DragNDrop/Notes/EntityNote')) {
            this._draggingItemId = entity.getItem().get('id');
         }
      },

      _dragEnd: function(event, dragObject) {
         var
            item,
            entity = dragObject.entity;

         if (cInstance.instanceOfModule(entity, 'Controls-demo/DragNDrop/Notes/EntityNote')) {
            item = entity.getItem();
            if (!this._allowDrop(item.getId(), dragObject.position)) {
               item.set('position', entity.getStartPosition());
            }
            this._draggingItemId = null;
            this._viewSource.update(item);
         } else if (cInstance.instanceOfModule(entity, 'Controls-demo/DragNDrop/Notes/EntityTriangle')) {
            this._viewSource.update(entity.getItem());
         }
      },

      _allowDrop: function(id, position) {
         var
            badPosition,
            result = true;
         this._items.forEach(function(item) {
            if (item.id !== id) {
               badPosition = position.y > item.position.top && position.y < (item.position.top + item.size.height) &&
                             position.x > item.position.left && position.x < (item.position.left + item.size.width);

               result = result && !badPosition;
            }
         });

         return result;
      },

      _dragMove: function(event, dragObject) {
         var
            size,
            top, left,
            height, width,
            maxTop, maxLeft,
            entity = dragObject.entity;

         dragObject.domEvent.preventDefault();
         if (cInstance.instanceOfModule(entity, 'Controls-demo/DragNDrop/Notes/EntityTriangle')) {
            height = entity.getStartSize().height + dragObject.offset.y;
            width = entity.getStartSize().width + dragObject.offset.x;
            entity.getItem().set('size', {
               height: height < 50 ? 50 : (height > 500 ? 500 : height),
               width: width < 150 ? 150 : (width > 500 ? 500 : width)
            });
         } else if (cInstance.instanceOfModule(entity, 'Controls-demo/DragNDrop/Notes/EntityNote')) {
            size = entity.getItem().get('size');
            top = entity.getStartPosition().top + dragObject.offset.y;
            left = entity.getStartPosition().left + dragObject.offset.x;
            maxTop = window.innerHeight - size.height;
            maxLeft = window.innerWidth - size.width;
            entity.getItem().set('position', {
               top: top < 0 ? 0 : (top > maxTop ? maxTop : top),
               left: left < 0 ? 0 : (left > maxLeft ? maxLeft : left)
            });
         }
      }
   });

   return Notes;
});

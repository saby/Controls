define('Controls-demo/List/Remove', [
   'Core/Control',
   'Core/core-clone',
   'Controls/Utils/Toolbar',
   'Controls-demo/List/Remove/RemoveDemoSource',
   'wml!Controls-demo/List/Remove/Remove',
   'css!Controls-demo/List/Remove/Remove'
], function(BaseControl, cClone, Toolbar, DemoSource, template) {
   'use strict';
   var ModuleClass = BaseControl.extend({
      _template: template,
      _itemActions: undefined,
      _items: null,
      _beforeMount: function() {
         this._items = [
            {
               id: 0,
               title: 'Стандартное удаление записи'
            },
            {
               id: 1,
               title: 'Удаление записи с вопросом'
            },
            {
               id: 2,
               title: 'Удаление записи с ошибкой'
            },
            {
               id: 3,
               title: 'Долгое удаление записи'
            }
         ];
         this._viewSource = this._createSource(DemoSource, this._items);
         this._viewSourceSecond = this._createSource(DemoSource, this._items);

         this._itemActions = this._createItemsActions('listRemoveFirst');
         this._itemActionsSecond = this._createItemsActions('listRemoveSecond');
      },

      _createSource: function(Source, items) {
         return new Source({
            idProperty: 'id',
            data: cClone(items)
         });
      },

      _createItemsActions: function(listName) {
         var self = this;
         return [
            {
               id: 0,
               icon: 'icon-Erase icon-error',
               showType: Toolbar.showType.TOOLBAR,
               handler: function(item) {
                  self._children[listName].removeItems([item.getId()]);
               }
            }
         ];
      },

      _beforeItemsRemove: function(event, items) {
         if (items.indexOf(1) !== -1) {
            return this._children.popupOpener.open({
               message: 'Remove items?',
               type: 'yesno'
            });
         }
      },

      _afterItemsRemove: function() {
         return false;
      }
   });
   return ModuleClass;
});

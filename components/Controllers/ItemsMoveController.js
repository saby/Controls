define('SBIS3.CONTROLS/Controllers/ItemsMoveController', [
   'Core/Abstract'
], function (cAbstract) {
   /**
    * Контроллер, позволяющий добавить в представление данных возможность перемещения элементов
    * @mixin SBIS3.CONTROLS/Controllers/ItemsMoveController
    * @public
    * @author Авраменко А.С.
    */
   var ItemsMoveController = cAbstract.extend(/**@lends SBIS3.CONTROLS/Controllers/ItemsMoveController.prototype*/{
      $protected: {
         _options: {
            linkedView: undefined
         }
      },

      $constructor: function() {
         var
            linkedView = this._options.linkedView;
         linkedView.setItemsActions(this._prepareItemsActions(linkedView._options.itemsActions));
         linkedView.subscribe('onChangeHoveredItem', this._onChangeHoveredItem.bind(this));
         this._publish('onItemMove');
      },

      moveItem: function(item, at) {
         var
            linkedView = this._options.linkedView,
            items = linkedView.getItems(),
            moveTo = items.at(items.getIndex(item) + (at === 'before' ? -1 : 1));
         // При перемещении записи необходимо менять её позицию в рекордсете
         linkedView.move([item], moveTo, at);
         this._notify('onItemMove', item);
      },

      _prepareItemsActions: function(itemsActions) {
         var
            self = this;
         itemsActions.unshift(
            {
               name: 'moveDown',
               tooltip: 'Переместить вниз',
               icon: 'icon-16 icon-ArrowDown icon-primary',
               isMainAction: true,
               onActivated: function(element, id, item) {
                  self.moveItem(item, 'after');
               }
            },
            {
               name: 'moveUp',
               tooltip: 'Переместить вверх',
               icon: 'icon-16 icon-ArrowUp icon-primary',
               isMainAction: true,
               onActivated: function(element, id, item) {
                  self.moveItem(item, 'before');
               }
            });
         return itemsActions;
      },

      _updateItemsActions: function(item) {
         var linkedView = this._options.linkedView,
            itemsActions = linkedView.getItemsActions();

         itemsActions.ready().addCallback(function() {
            var
               itemsInstances = itemsActions.getItemsInstances(),
               items = linkedView.getItems(),
               nextItem = items.at(items.getIndex(item) + 1),
               prevItem = items.at(items.getIndex(item) - 1);
            itemsInstances['moveUp'].toggle(prevItem);
            itemsInstances['moveDown'].toggle(nextItem);
         });
      },

      _onChangeHoveredItem: function(event, hoveredItem) {
         if (hoveredItem.record) {
            this._updateItemsActions(hoveredItem.record);
         }
      }
   });

   return ItemsMoveController;

});
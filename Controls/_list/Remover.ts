import BaseAction from 'Controls/_list/BaseAction';
import Deferred = require('Core/Deferred');
import getItemsBySelection = require('Controls/Utils/getItemsBySelection');
import {ContextOptions as dataOptions} from 'Controls/context';

let _private = {
   removeFromSource(self, items) {
      return self._source.destroy(items);
   },

   removeFromItems(self, items) {
      self._items.setEventRaising(false, true);
      for (let i = 0; i < items.length; i++) {
         let item = self._items.getRecordById(items[i]);
         if (item) {
            self._items.remove(item);
         }
      }
      self._items.setEventRaising(true, true);
   },

   beforeItemsRemove(self, items) {
      let beforeItemsRemoveResult = self._notify('beforeItemsRemove', [items]);
      return beforeItemsRemoveResult instanceof Deferred || beforeItemsRemoveResult instanceof Promise ?
         beforeItemsRemoveResult : Deferred.success(beforeItemsRemoveResult);
   },

   afterItemsRemove(self, items, result) {
      self._notify('afterItemsRemove', [items, result]);

      //According to the standard, after moving the items, you need to unselect all in the table view.
      //The table view and Mover are in a common container (Control.Container.MultiSelector) and do not know about each other.
      //The only way to affect the selection in the table view is to send the selectedTypeChanged event.
      //You need a schema in which Mover will not work directly with the selection.
      //Will be fixed by: https://online.sbis.ru/opendoc.html?guid=dd5558b9-b72a-4726-be1e-823e943ca173
      self._notify('selectedTypeChanged', ['unselectAll'], {
         bubbling: true
      });
   },

   updateDataOptions(self, dataOptions) {
      if (dataOptions) {
         self._items = dataOptions.items;
         self._source = dataOptions.source;
         self._filter = dataOptions.filter;
         self._keyProperty = dataOptions.keyProperty;
      }
   }
};

/**
 * Контрол для удаления элементов списка в recordSet и dataSource.
 * Контрол должен располагаться в том же контейнере (см. {@link Controls/list:DataContainer}), что и список.
 * <a href="/materials/demo-ws4-operations-panel">Демо-пример</a>.
 * @class Controls/_list/Remover
 * @extends Controls/_list/BaseAction
 * @mixes Controls/interface/IRemovable
 * @control
 * @public
 * @author Авраменко А.С.
 * @category List
 */

/*
 * Сontrol to remove the list items in recordSet and dataSource.
 * Сontrol must be in one Controls.Container.Data with a list.
 * <a href="/materials/demo-ws4-operations-panel">Demo examples</a>.
 * @class Controls/_list/Remover
 * @extends Controls/_list/BaseAction
 * @mixes Controls/interface/IRemovable
 * @control
 * @public
 * @author Авраменко А.С.
 * @category List
 */

export default class Remover extends BaseAction {
   static contextTypes() {
      return {
         dataOptions: dataOptions
      };
   }

   _beforeMount(options, context) {
      _private.updateDataOptions(this, context.dataOptions);
   }

   _beforeUpdate(options, context) {
      _private.updateDataOptions(this, context.dataOptions);
   }

   removeItems(items) {
      let itemsDeferred;
      
      //Support removing with mass selection.
      //Full transition to selection will be made by: https://online.sbis.ru/opendoc.html?guid=080d3dd9-36ac-4210-8dfa-3f1ef33439aa
      itemsDeferred = items instanceof Array ? Deferred.success(items) : getItemsBySelection(items, this._source, this._items, this._filter);

      itemsDeferred.addCallback((items) => {
         _private.beforeItemsRemove(this, items).addCallback((result) => {
            if (result !== false) {
               _private.removeFromSource(this, items).addCallback((result) => {
                  _private.removeFromItems(this, items);
                  return result;
               }).addBoth((result) => {
                  _private.afterItemsRemove(this, items, result);
               });
            }
         });
      });
   }
};

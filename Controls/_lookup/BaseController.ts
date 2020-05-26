import Control = require('Core/Control');
import template = require('wml!Controls/_lookup/BaseController/BaseController');
import clone = require('Core/core-clone');
import Deferred = require('Core/Deferred');
import tmplNotify = require('Controls/Utils/tmplNotify');
import ToSourceModel = require('Controls/Utils/ToSourceModel');
import {Controller as SourceController} from 'Controls/source';
import {isEqual} from 'Types/object';
import {List, RecordSet} from 'Types/collection';
import {descriptor} from 'Types/entity';
import {Logger} from 'UI/Utils';

var _private = {
      loadItems: function(self, options, selectedKeys, sourceIsChanged) {
         var filter = clone(options.filter || {});
         var resultDef = new Deferred();

         filter[options.keyProperty] = selectedKeys;

         if (sourceIsChanged || !self.sourceController) {
            self.sourceController = new SourceController({
               source: options.source
            });
         }
         self.sourceController.load(filter)
            .addCallback(function(result) {
               if (options.dataLoadCallback) {
                  options.dataLoadCallback(result);
               }

               _private.checkLoadedItems(result, options.keyProperty, selectedKeys);
               resultDef.callback(self._items = result);
               return result;
            })
            .addErrback(function(result) {
               resultDef.callback(null);
               return result;
            });

         return resultDef;
      },

      checkLoadedItems(
          loadedItems: RecordSet,
          keyProperty: string,
          selectedKeys: unknown[]
      ): void {
         loadedItems.each((item) => {
            if (selectedKeys.indexOf(item.get(keyProperty)) === -1) {
               Logger.error(`Controls/lookup: ошибка при загрузке записи с ключом ${item.get(keyProperty)}`);
            }
         });
      },

      notifyChanges: function(self, selectedKeys) {
         _private.notifySelectedKeys(self, selectedKeys);
         _private.notifyItemsChanged(self, _private.getItems(self));
         _private.notifyTextValueChanged(self, _private.getTextValue(self));
      },

      notifyItemsChanged: function(self, items) {
         self._notify('itemsChanged', [items]);
      },

      notifySelectedKeys: function(self, selectedKeys) {
         self._notify('selectedKeysChanged', [selectedKeys]);
      },

      notifyTextValueChanged: function(self, textValue) {
         self._notify('textValueChanged', [textValue]);
      },

      prepareItems: function(self) {
         ToSourceModel(_private.getItems(self), self._options.source, self._options.keyProperty);
      },

      addItem: function(self, item) {
         var
            selectedKeys = self._selectedKeys.slice(),
            key = item.get(self._options.keyProperty),

            //That would not change on the link, and it was possible to track changes in child controls
            selectedItems = _private.getItems(self).clone(true);

         if (selectedKeys.indexOf(key) === -1) {
            if (self._options.multiSelect) {
               selectedKeys.push(key);
               selectedItems.append([item]);
            } else {
               selectedKeys = [key];
               selectedItems.assign([item]);
            }

            _private.setItems(self, selectedItems);
            _private.prepareItems(self);
            _private.notifyChanges(self, selectedKeys);
            _private.setSelectedKeys(self, selectedKeys);
         }
      },

      removeItem: function(self, item) {
         var
            selectedKeys = self._selectedKeys.slice(),
            keyProperty = self._options.keyProperty,
            key = item.get(keyProperty),
            indexKey = selectedKeys.indexOf(key),
            selectedItems = _private.getItems(self).clone(true),
            indexItem = selectedItems.getIndexByValue(keyProperty, key);

         if (indexKey !== -1) {
            selectedKeys.splice(indexKey, 1);
            selectedItems.removeAt(indexItem);
            _private.setItems(self, selectedItems);
            _private.notifyChanges(self, selectedKeys);
            _private.setSelectedKeys(self, selectedKeys);
         }
      },

      setSelectedKeys: function(self, keys) {
         self._selectedKeys = keys;
         self._forceUpdate();
      },

      getTextValue: function(self) {
         var titleItems = [];

         _private.getItems(self).each(function(item) {
            titleItems.push(item.get(self._options.displayProperty));
         });

         return titleItems.join(', ');
      },

      getItems: function(self) {
         if (!self._items) {
            self._items = new List();
         }
         return self._items;
      },

      setItems: function(self, items) {
         self._items = items;
      },

      getHistoryService: function(self) {
         if (!self._historyServiceLoad) {
            self._historyServiceLoad = new Deferred();
            require(['Controls/suggestPopup'], function(result) {
               result.LoadService({
                  historyId: self._options.historyId
               }).addCallback((result) => {
                  self._historyServiceLoad.callback(result);
                  return result;
               });
            });
         }
         return self._historyServiceLoad;
      }
   };

   /**
    * Контроллер выбранной коллекции, используется в полях связи и кнопках выбора из справочника.
    * Загружает выбранную коллекцию по ключам и источнику, совершает операции над коллекцией: добавление, удалением элементов и т.д, работает со справочником.
    * 
    * @remark
    * Полезные ссылки:
    * * <a href="https://github.com/saby/wasaby-controls/blob/rc-20.4000/Controls-default-theme/aliases/_lookup.less">переменные тем оформления</a>
    * 
    * @class Controls/_lookup/SelectedCollection/Controller
    * @extends Core/Control
    * @control
    * @private
    * @author Герасимов А.М.
    */
   /*
    * The controller of the selected collection is used in the communication fields and the selection buttons from the directory.
    * Loads the selected collection by key and source, performs operations on the collection: adding, deleting items, etc., works with the directory.
    * @class Controls/_lookup/SelectedCollection/Controller
    * @extends Core/Control
    * @control
    * @private
    * @author Герасимов А.М.
    */

   var CollectionController = Control.extend({
      _template: template,
      _notifyHandler: tmplNotify,
      _selectedKeys: null,
      _items: null,
      _historyServiceLoad: null,

      _beforeMount: function(options, context, receivedState) {
         this._selectCallback = this._selectCallback.bind(this);
         this._selectedKeys = options.selectedKeys.slice();

         if (this._selectedKeys.length) {
            if (receivedState) {
               this._items = receivedState;
            } else {
               return _private.loadItems(this, options, options.selectedKeys);
            }
         }
      },

      _beforeUpdate: function(newOptions) {
         var
            self = this,
            keysChanged = newOptions.selectedKeys !== this._options.selectedKeys &&
               !isEqual(newOptions.selectedKeys, this._selectedKeys),
            sourceIsChanged = newOptions.source !== this._options.source;

         if (sourceIsChanged) {
            this.sourceController = null;
         }

         if (keysChanged || sourceIsChanged) {
            this._selectedKeys = newOptions.selectedKeys.slice();
         } else if (newOptions.keyProperty !== this._options.keyProperty) {
            this._selectedKeys = [];
            _private.getItems(this).each(function(item) {
               self._selectedKeys.push(item.get(newOptions.keyProperty));
            });
         }

         if (!newOptions.multiSelect && this._selectedKeys.length > 1) {
            this._setItems(new List());
         } else if (sourceIsChanged || keysChanged) {
            if (this._selectedKeys.length) {
               return _private.loadItems(this, newOptions, this._selectedKeys, sourceIsChanged).addCallback(function(result) {
                  _private.notifyItemsChanged(self, result);
                  _private.notifyTextValueChanged(self, _private.getTextValue(self));
                  self._forceUpdate();

                  return result;
               });
            } else {
               this._setItems(new List());
            }
         }
      },

      _getItems: function() {
         return _private.getItems(this);
      },

      _setItems: function(newItems: List|RecordSet): void {
         var
            selectedKeys = [],
            keyProperty = this._options.keyProperty,
            selectedItems = newItems.clone();

         _private.setItems(this, selectedItems);
         _private.prepareItems(this);

         selectedItems.each(function(item) {
            selectedKeys.push(item.get(keyProperty));
         });

         _private.notifyChanges(this, selectedKeys);
         _private.setSelectedKeys(this, selectedKeys);
      },

      showSelector: function() {

      },

      _selectCallback: function(event, result) {
         var prepareItems;
         var self = this;

         result = this._notify('selectorCallback', [_private.getItems(this), result]) || result;
         this._setItems(result);
         prepareItems = _private.getItems(this); // give the record in the correct format

         if (prepareItems && prepareItems.getCount() && this._options.historyId) {
            _private.getHistoryService(this).addCallback(function(historyService) {
               historyService.update({ids: self._selectedKeys}, {$_history: true});
               return historyService;
            });
         }
         if (this._options.value) {
            this._notify('valueChanged', ['']);
         }
      },

      _onShowSelectorHandler: function(event, popupOptions) {
         if (this._notify('showSelector') !== false) {
            this.showSelector(popupOptions);
         }

         return false;
      },

      _onAddItemHandler: function(event, item) {
         this._notify('choose', [item]);
         _private.addItem(this, item);
      },

      _onRemoveItemHandler: function(event, item) {
         _private.removeItem(this, item);
      },

      _onUpdateItemsHandler: function(event, items) {
         this._setItems(items);
      },

      _closeHandler: function() {
         this.activate();
      }
   });

   CollectionController._private = _private;
   CollectionController.getDefaultOptions = function getDefaultOptions(): object {
      return {
         selectedKeys: [],
         multiSelect: false
      };
   };
   CollectionController.getOptionTypes = function getOptionsTypes(): object {
      return {
         multiSelect: descriptor(Boolean)
      };
   };

   export = CollectionController;


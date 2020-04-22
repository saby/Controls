import rk = require('i18n!Controls');
import Control = require('Core/Control');
import template = require('wml!Controls/_filter/Fast/Fast');
import chain = require('Types/chain');
import collection = require('Types/collection');
import cInstance = require('Core/core-instance');
import clone = require('Core/core-clone');
import pDeferred = require('Core/ParallelDeferred');
import Deferred = require('Core/Deferred');
import Utils = require('Types/util');
import Merge = require('Core/core-merge');
import {PrefetchProxy} from 'Types/source';
import {Controller as SourceController} from 'Controls/source';
import {isEqual} from 'Types/object';
import {dropdownHistoryUtils as historyUtils} from 'Controls/dropdown';
import {getItemsWithHistory, getUniqItems, deleteHistorySourceFromConfig} from 'Controls/_filter/HistoryUtils';

      /**
       * Контрол "Быстрый фильтр". Использует выпадающие списки для выбора параметров фильтрации.
       *
       * @remark
       * См. <a href="/materials/Controls-demo/app/Controls-demo%2FFilterSearch%2FFilterSearch">демо-пример</a>
       * Подробнее об организации поиска и фильтрации в реестре читайте {@link https://wi.sbis.ru/doc/platform/developmentapl/interface-development/controls/list-environment/filter-search/ здесь}.
       * Подробнее о классификации контролов Wasaby и схеме их взаимодействия читайте {@link https://wi.sbis.ru/doc/platform/developmentapl/interface-development/controls/list-environment/component-kinds/ здесь}.
       *
       * @class Controls/_filter/Fast
       * @extends Core/Control
       * @mixes Controls/interface/IFastFilter
       * @demo Controls-demo/FastFilter/fastPG
       * @control
       * @public
       * @deprecated Данный контрол устарел и будет удалён. Вместо него используйте {@link Controls/filter:View}.
       * @author Герасимов А.М.
       */

      /*
       * Control "Fast Filter".
       * Use dropDown lists for filter data.
       *
       * Here you can see a <a href="/materials/Controls-demo/app/Controls-demo%2FFilterSearch%2FFilterSearch">demo</a>.
       *
       * @class Controls/_filter/Fast
       * @extends Core/Control
       * @mixes Controls/interface/IFastFilter
       * @mixes Controls/_filter/Fast/FastStyles
       * @demo Controls-demo/FastFilter/fastPG
       * @control
       * @public
       * @author Герасимов А.М.
       */


      var getPropValue = Utils.object.getPropertyValue.bind(Utils);
      var setPropValue = Utils.object.setPropertyValue.bind(Utils);

      var _private = {

         prepareItems: function(self, items) {
            if (!cInstance.instanceOfModule(items, 'Types/collection:List')) {
               // TODO need to support serialization of History/Source, will be done on the task https://online.sbis.ru/opendoc.html?guid=60a7e58e-44ff-4d82-857f-356e7c9007c9
               self._items = new collection.List({
                  items: clone(items)
               });
            } else {
               self._items = Utils.object.clone(items);
            }
         },

         createSourceController: function(self, source, navigation, keyProperty) {
            if (!self._sourceController) {
               self._sourceController = new SourceController({
                  source: source,
                  navigation: navigation,
                  keyProperty: keyProperty
               });
            }
            return self._sourceController;
         },

          getSourceController: function(self, options) {
             return historyUtils.getSource(options.source, options.historyId, {pinned: true}).addCallback((source) => {
                 self._source = source;
                 return _private.createSourceController(self, self._source, options.navigation, options.keyProperty);
             });
          },

         getItemPopupConfig: function(properties) {
            var itemConfig = {};
            itemConfig.keyProperty = properties.keyProperty;
            itemConfig.displayProperty = properties.displayProperty;
            itemConfig.itemTemplate = properties.itemTemplate;
            itemConfig.itemTemplateProperty = properties.itemTemplateProperty;
            itemConfig.headerTemplate = properties.headerTemplate;
            itemConfig.footerTemplate = properties.footerTemplate;
            itemConfig.multiSelect = properties.multiSelect;
            itemConfig.emptyText = properties.emptyText;
            itemConfig.selectorTemplate = properties.selectorTemplate;
            return itemConfig;
         },

         loadItemsFromSource: function(instance, {source, keyProperty, filter, navigation, historyId, dataLoadCallback}, withHistory = true) {
            // As the data source can be history source, then you need to merge the filter
            return _private.getSourceController(instance, {source, navigation, keyProperty, historyId}).addCallback((sourceController) => {
               let queryFilter = withHistory ? historyUtils.getSourceFilter(filter, instance._source) : filter;
                return sourceController.load(queryFilter).addCallback((items) => {
                    instance._items = items;
                    if (dataLoadCallback) {
                        dataLoadCallback(items);
                    }
                    return items;
                });
            });
         },

         loadItems: function(self, item, index) {
            var properties = getPropValue(item, 'properties');

            self._configs[index] = Merge(self._configs[index] || {}, _private.getItemPopupConfig(properties));

            if (properties.items) {
               _private.prepareItems(self._configs[index], properties.items);
               return Deferred.success(self._configs[index]._items);
            } else if (properties.source) {
               if (self._configs[index]._sourceController) {
                  self._configs[index]._sourceController = null;
               }
               self._configs[index]._source = null;
               self._configs[index].popupItems = null;
               return _private.loadItemsFromSource(self._configs[index], properties);
            }
         },

         reload: function(self) {
            if (self._loadDeferred && !self._loadDeferred.isReady()) {
               self._loadDeferred.cancel();
               self._loadDeferred = null;
            }
            var pDef = new pDeferred();
            chain.factory(self._items).each(function(item, index) {
               var result = _private.loadItems(self, item, index);
               pDef.push(result);
            });
            self._loadDeferred = pDef.done().getResult();
            // At first, we will load all the lists in order not to cause blinking of the interface and many redraws.
            return self._loadDeferred.addCallback(function() {
               return _private.loadNewItems(self, self._items, self._configs).addCallback(() => {

                  // FIXME https://online.sbis.ru/opendoc.html?guid=0c3738a7-6e8f-4a12-8459-9c6a2034d927
                  // history.Source не умеет сериализоваться - удаляем его из receivedState
                  return {
                     configs: deleteHistorySourceFromConfig(self._configs, '_source'),
                     items: self._items
                  };
               });
            });
         },

         notifyChanges: function(self, items) {
            self._notify('filterChanged', [_private.getFilter(items)]);
            self._notify('itemsChanged', [items]);
         },

         getFilter: function(items) {
            var filter = {};
            chain.factory(items).each(function(item) {
               if (!isEqual(getPropValue(item, 'value'), getPropValue(item, 'resetValue'))) {
                  filter[getPropValue(item, 'id')] = getPropValue(item, 'value');
               }
            });
            return filter;
         },

         setValue: function(self, selectedKeys) {
            const resetValue = getPropValue(self._items.at(self.lastOpenIndex), 'resetValue');
            if (!selectedKeys.length || isEqual(selectedKeys, resetValue)) {
               setPropValue(self._items.at(self.lastOpenIndex), 'value', resetValue);
            } else if (self._configs[self.lastOpenIndex].multiSelect) {
               setPropValue(self._items.at(self.lastOpenIndex), 'value', selectedKeys);
            } else {
               setPropValue(self._items.at(self.lastOpenIndex), 'value', selectedKeys[0]);
            }
         },

         selectItems: function(items) {
            var self = this,
               selectedKeys = [];

            // Get keys of selected items
            chain.factory(items).each(function(item) {
               var key = getPropValue(item, self._configs[self.lastOpenIndex].keyProperty);
               if (key !== getPropValue(self._items.at(self.lastOpenIndex), 'resetValue') &&
                   // select empty item
                   !(self._configs[self.lastOpenIndex].emptyText && key === null)) {
                  selectedKeys.push(key);
               }
            });

            _private.setValue(this, selectedKeys);

            this._setText();
         },

         getNewItems: function(config, selectedItems) {
            var newItems = [],
               curItems = config._items,
               keyProperty = config.keyProperty;

            chain.factory(selectedItems).each(function(item) {
               if (!curItems.getRecordById(item.get(keyProperty))) {
                  newItems.push(item);
               }
            });
            return newItems;
         },

         updateHistory: function(currentFilter, items) {
             if (historyUtils.isHistorySource(currentFilter._source)) {
                 currentFilter._source.update(items, historyUtils.getMetaHistory());

                 if (currentFilter._sourceController && currentFilter._source.getItems) {
                     currentFilter._items = currentFilter._source.getItems();
                 }
             }
         },

         onSelectorResult: function (curConfig, selectedItems) {
            var newItems = _private.getNewItems(curConfig, selectedItems);
            _private.updateHistory(curConfig, chain.factory(selectedItems).toArray());
            _private.setItems(curConfig, newItems);

            // From selector dialog records may return not yet been loaded, so we save items in the history and then load data.
            if (historyUtils.isHistorySource(curConfig._source) && newItems.length) {
               curConfig._sourceController = null;
            }
         },

         onResult: function(event, action, data) {
            if (data) {
               const items = action === 'itemClick' ? [data] : data;
               if (action === 'selectorResult') {
                  this.lastOpenIndex = this._indexOpenedFilter;
                  _private.onSelectorResult(this._configs[this._indexOpenedFilter], items);
               } else {
                  _private.updateHistory(this._configs[this.lastOpenIndex], items);
               }
               _private.selectItems.call(this, items);
               _private.notifyChanges(this, this._items);
            }
            if (action !== 'menuOpened') {
               this._children.DropdownOpener.close();
            }
         },

         setTextValue: function(item, textValue) {
            if (getPropValue(item, 'textValue') !== undefined) {
               setPropValue(item, 'textValue', textValue);
            }
         },

         isNeedReload: function(oldItems, newItems) {
            var isChanged = false;

            if (newItems.length !== oldItems.length) {
               isChanged = true;
            } else {
               chain.factory(newItems).each(function(item, index) {
                  if (!isEqual(item.properties.source, oldItems[index].properties.source) ||
                     !isEqual(item.properties.filter, oldItems[index].properties.filter) ||
                     !isEqual(item.properties.navigation, oldItems[index].properties.navigation)) {
                     isChanged = true;
                  }
               });
            }

            return isChanged;
         },

         // TODO: DropdownList can not work with source.
         // Remove after execution: https://online.sbis.ru/opendoc.html?guid=96f11250-4bbd-419f-87dc-3a446ffa20ed
         calculateStateSourceControllers: function(configs, items) {
            chain.factory(configs).each(function(config, index) {

               // History/Source does not support serialization.
               // If there is no source in the receivedState, load the data before opening to initialize the history.
               // TODO: DropdownList can not work with source.
               // Remove after execution: https://online.sbis.ru/opendoc.html?guid=96f11250-4bbd-419f-87dc-3a446ffa20ed
               if (!config._source) {
                  config._needQuery = true;
               }

               _private.getSourceController(config, getPropValue(items.at(index), 'properties')).addCallback((sourceController) => {
                    sourceController.calculateState(config._items);
               });
            });
         },

         getKeysLoad: function(config, keys) {
            let result = [];
            chain.factory(keys).each(function(key) {
               if (key !== undefined && !config._items.getRecordById(key) && !(key === null && config.emptyText)) {
                  result.push(key);
               }
            });
            return result;
         },

         setItems: function(config, newItems) {
            config.popupItems = getItemsWithHistory(config.popupItems || config._items, newItems,
                config._sourceController, config._source, config.keyProperty);
            config._items = getUniqItems(config._items, newItems, config.keyProperty);
         },

         loadNewItems: function(self, items, configs) {
            let pDef = new pDeferred();
            chain.factory(items).each(function(item, index) {
               let keys = _private.getKeysLoad(configs[index], item.value instanceof Array ? item.value: [item.value]);
               if (keys.length) {
                  let itemProperties = clone(getPropValue(item, 'properties'));
                  let properties = {source: itemProperties.source};
                  properties.filter = itemProperties.filter || {};
                  properties.filter[itemProperties.keyProperty] = keys;
                  let result = _private.loadItemsFromSource({}, properties, false).addCallback(function(items) {
                     // FIXME https://online.sbis.ru/opendoc.html?guid=b6ca9523-38ce-42d3-a3ec-36be075bccfe
                     if (itemProperties.dataLoadCallback) {
                        itemProperties.dataLoadCallback(items);
                     }
                     _private.setItems(configs[index], items);
                  });
                  pDef.push(result);
               } else {
                  pDef.push(Deferred.success());
               }
            });
            return pDef.done().getResult().addCallback(() => {
               self._setText();
            });
         },

         hasSelectorTemplate: function(configs) {
            let hasSelectorTemplate = configs.find((config) => {
               if (config.selectorTemplate) {
                  return true;
               }
            });
            return !!hasSelectorTemplate;
         },

         loadConfigFromSource: function(self, options) {
            return _private.loadItemsFromSource(self, options).addCallback(() => {
               return _private.reload(self).addCallback((result) => {
                  self._hasSelectorTemplate = _private.hasSelectorTemplate(self._configs);
                  return result;
               });
            });
         },

         isNeedHistoryReload: function(configs) {
            let needReload = false;
            chain.factory(configs).each((config) => {
               if (!config._sourceController) {
                  needReload = true;
               }
            });
            return needReload;
         }
      };

      var Fast = Control.extend(/** @lends Controls/_filter/Fast.prototype */{
         _template: template,
         _configs: null,
         _items: null,

         _beforeMount: function(options, context, receivedState) {
            this._configs = [];
            this._onResult = _private.onResult.bind(this);

            var resultDef;

            if (receivedState) {
               this._configs = receivedState.configs;
               this._items = receivedState.items;
               if (options.items) {
                  _private.prepareItems(this, options.items);
               }
               _private.calculateStateSourceControllers(this._configs, this._items);
            } else if (options.items) {
               _private.prepareItems(this, options.items);
               resultDef = _private.reload(this);
            } else if (options.source) {
               resultDef = _private.loadConfigFromSource(this, options);
            }
            this._hasSelectorTemplate = _private.hasSelectorTemplate(this._configs);
            return resultDef;
         },

         _beforeUpdate: function(newOptions) {
            var resultDef;
            if (newOptions.items && (newOptions.items !== this._options.items)) {
               _private.prepareItems(this, newOptions.items);
               if (_private.isNeedReload(this._options.items, newOptions.items) || _private.isNeedHistoryReload(this._configs)) {
                  resultDef = _private.reload(this);
               } else {
                  resultDef = _private.loadNewItems(this, newOptions.items, this._configs);
               }
               this._hasSelectorTemplate = _private.hasSelectorTemplate(this._configs);
            } else if (newOptions.source && !isEqual(newOptions.source, this._options.source)) {
               this._sourceController = null;
               resultDef = _private.loadConfigFromSource(this, newOptions);
            } else if (_private.isNeedHistoryReload(this._configs)) {
                resultDef = _private.reload(this);
            }
            return resultDef;
         },

         _open: function(event, item, index) {
            const sourceController = this._configs[index]._sourceController;

            if (this._options.readOnly || sourceController.isLoading()) {
               return;
            }

            const open = (config) => {
               this._children.DropdownOpener.open(config, this);
            };

            var selectedKeys = getPropValue(this._items.at(index), 'value');
            var templateOptions = {
               source: new PrefetchProxy({
                  target: this._configs[index]._source,
                  data: {
                     query: (this._configs[index].popupItems || this._configs[index]._items).clone()
                  }
               }),
               selectorItems: this._configs[index]._items,
               selectedKeys: selectedKeys instanceof Array ? selectedKeys : [selectedKeys],
               isCompoundTemplate: getPropValue(this._items.at(index), 'properties').isCompoundTemplate,
               hasMoreButton: this._configs[index]._sourceController.hasMoreData('down'),
               selectorOpener: this._children.selectorOpener,
               selectorDialogResult: this._onSelectorTemplateResult.bind(this),
               afterSelectorOpenCallback: this._afterSelectorOpenCallback.bind(this),
               dropdownClassName: `controls-FastFilter_width-popup_theme-${this._options.theme}`
            };
            var config = {
               templateOptions: Merge(_private.getItemPopupConfig(this._configs[index]), templateOptions),
               className: (this._configs[index].multiSelect ? 'controls-FastFilter_multiSelect-popup' : 'controls-FastFilter-popup') + '_theme_' + this._options.theme,
               fittingMode: {
                  horizontal: 'overflow',
                  vertical: 'adaptive'
               },

               // FIXME: this._container - jQuery element in old controls envirmoment https://online.sbis.ru/opendoc.html?guid=d7b89438-00b0-404f-b3d9-cc7e02e61bb3
               target: (this._container[0] || this._container).children[index]
            };

            // Save the index of the last open list. To get the list in method selectItem
            this.lastOpenIndex = index;

            if (this._configs[index]._needQuery) {
               this._configs[index]._needQuery = false;
               _private.loadItemsFromSource(this._configs[index], getPropValue(this._items.at(index), 'properties')).addCallback(() => {
                  open(config);
               });
            } else {
               open(config);
            }
         },

         _onSelectorTemplateResult: function(event, items) {
            let resultSelectedItems = this._notify('selectorCallback', [this._configs[this._indexOpenedFilter].initSelectorItems, items, this._indexOpenedFilter]) || items;
            this._onResult(event, {action: 'selectorResult', data: resultSelectedItems});
         },

         _afterSelectorOpenCallback: function(selectedItems) {
            this._indexOpenedFilter = this.lastOpenIndex;
            this._configs[this._indexOpenedFilter].initSelectorItems = selectedItems;
            this._children.DropdownOpener.close();
         },

         _setText: function() {
            var self = this;
            chain.factory(this._configs).each(function(config, index) {
               var sKey = getPropValue(self._items.at(index), 'value'),
                  text = [];
               if (!(sKey instanceof Array)) {
                  sKey = [sKey];
               }
               if ((sKey[0] === null || !sKey.length) && config.emptyText) {
                  text.push(config.emptyText);
               } else {
                  chain.factory(config._items).each(function(item) {
                     if (sKey.indexOf(getPropValue(item, config.keyProperty)) !== -1) {
                        text.push(getPropValue(item, config.displayProperty));
                     }
                  });
               }
               config.text = text[0];
               config.title = text.join(', ');
               if (text.length > 1) {
                  config.hasMoreText = ', ' + rk('еще') + ' ' + (text.length - 1);
               } else {
                  config.hasMoreText = '';
               }
               _private.setTextValue(self._items.at(index), config.title);
            });
            this._forceUpdate();
         },

         _needShowCross: function(item) {
            return !this._options.readOnly && getPropValue(item, 'resetValue') !== undefined && !isEqual(getPropValue(item, 'value'), getPropValue(item, 'resetValue'));
         },

         _reset: function(event, item, index) {
            if (this._children.DropdownOpener.isOpened()) {
               this._children.DropdownOpener.close();
            }
            var newValue = getPropValue(this._items.at(index), 'resetValue');
            setPropValue(this._items.at(index), 'value', newValue);
            _private.setTextValue(this._items.at(index), '');
            _private.notifyChanges(this, this._items);
            this._setText();
         }
      });

      Fast._private = _private;
      Fast._theme = ['Controls/filter'];
      export = Fast;


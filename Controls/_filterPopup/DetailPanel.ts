import rk = require('i18n!Controls');
import Control = require('Core/Control');
import chain = require('Types/chain');
import Utils = require('Types/util');
import Clone = require('Core/core-clone');
import Deferred = require('Core/Deferred');
import find = require('Core/helpers/Object/find');
import ParallelDeferred = require('Core/ParallelDeferred');
import _FilterPanelOptions = require('Controls/_filterPopup/Panel/Wrapper/_FilterPanelOptions');
import template = require('wml!Controls/_filterPopup/Panel/Panel');
import {isEqual} from 'Types/object';
import {factory, List} from 'Types/collection';
import {HistoryUtils, FilterUtils} from 'Controls/filter';
import 'Controls/form';
import {Logger} from 'UI/Utils';
/**
    * Контрол для отображения шаблона панели фильтров. Отображает каждый фильтр по заданным шаблонам.
    * Он состоит из трех блоков: Отбираются, Еще можно отобрать, Ранее отбирались.
    * <a href="/materials/demo-ws4-filter-button">Демо-пример</a>.
    *
    *
    * @class Controls/_filterPopup/DetailPanel
    * @extends Core/Control
    * @mixes Controls/interface/IFilterPanel
    * @demo Controls-demo/Filter/Button/panelOptions/panelPG
    * @control
    * @public
    * @author Золотова Э.Е.
    *
    * @cssModifier controls-FilterPanel__width-s Маленькая ширина панели.
    * @cssModifier controls-FilterPanel__width-m Средняя ширина панели.
    * @cssModifier controls-FilterPanel__width-l Большая ширина панели.
    * @cssModifier controls-FilterPanel__width-xl Очень большая ширина панели.
    *
    * @cssModifier controls-FilterPanel__DateRange Кастомизирует контрол DateRange для отображения на панели фильтров.
    * Необходимо навесить на шаблон фильтра DateRange.
    */

   /*
    * Component for displaying a filter panel template. Displays each filters by specified templates.
    * It consists of three blocks: Selected, Also possible to select, Previously selected.
    * Here you can see <a href="/materials/demo-ws4-filter-button">demo-example</a>.
    *
    *
    * @class Controls/_filterPopup/DetailPanel
    * @extends Core/Control
    * @mixes Controls/interface/IFilterPanel
    * @demo Controls-demo/Filter/Button/panelOptions/panelPG
    * @control
    * @public
    * @author Золотова Э.Е.
    *
    * @cssModifier controls-FilterPanel__width-s Маленькая ширина панели.
    * @cssModifier controls-FilterPanel__width-m Средняя ширина панели.
    * @cssModifier controls-FilterPanel__width-l Большая ширина панели.
    * @cssModifier controls-FilterPanel__width-xl Очень большая ширина панели.
    */

   /**
    * @event Controls/_filterPopup/DetailPanel#sendResult Происходит при клике по кнопке "Отобрать".
    * @param {Object} filter Объект фильтра {'filter_id': 'filter_value'}.
    * @param {Object} items Набор элементов.
    */

   /*
    * @event Controls/_filterPopup/DetailPanel#sendResult Happens when clicking the button "Select".
    * @param {Object} filter Filter object view {'filter_id': 'filter_value'}
    * @param {Object} items items
    */


   var getPropValue = Utils.object.getPropertyValue.bind(Utils);
   var setPropValue = Utils.object.setPropertyValue.bind(Utils);

   var _private = {

      resolveItems: function(self, options, context) {
         self._contextOptions = context && context.filterPanelOptionsField && context.filterPanelOptionsField.options;
         if (options.items) {
            self._items = this.cloneItems(options.items);
         } else if (self._contextOptions) {
            self._items = this.cloneItems(context.filterPanelOptionsField.options.items);
            Logger.error('Controls/filterPopup:Panel: You must pass the items option for the panel.', self);
         } else {
            throw new Error('Controls/filterPopup:Panel::items option is required');
         }
      },

      resolveHistoryId: function(self, options, context) {
         if (options.historyId) {
            self._historyId = options.historyId;
         } else if (context && context.historyId) {
            self._historyId = context.historyId;
            Logger.error('Controls/filterPopup:Panel:', 'You must pass the historyId option for the panel.', self);
         }
      },

      //TODO: Delete with old favorite
      loadFavoriteItems: function(self, historyId) {
         let loadDef = new Deferred();
         require(['SBIS3.CONTROLS/History/HistoryList'], (HistoryStorage) => {
            let pDef = new ParallelDeferred();
            self._historyGlobalStorage = new HistoryStorage({
               historyId: historyId,
               isGlobalUserConfig: true
            });
            self._historyStorage = new HistoryStorage({
               // to save old user favorites
               historyId: historyId + '-favorite'
            });
            pDef.push(self._historyStorage.getHistory(true));
            pDef.push(self._historyGlobalStorage.getHistory(true));

            return pDef.done().getResult().addCallback((items) => {
               self._favoriteList = items[0].clone();
               self._favoriteList.prepend(items[1]);
               loadDef.callback();
            });
         });
         return loadDef;
      },

      loadHistoryItems: function(self, historyId, isReportPanel) {
         if (historyId) {
            const pDef = new ParallelDeferred();
            const config = {
                historyId,
                recent: isReportPanel ? 'MAX_HISTORY_REPORTS' : 'MAX_HISTORY',
                favorite: isReportPanel
            };
            const historyLoad = HistoryUtils.loadHistoryItems(config)
                .addCallback((items) => {
                   const historySource = HistoryUtils.getHistorySource(config);
                   let historyItems;

                   if (isReportPanel) {
                       // Поправится, как будем хранить избранное на сервисе истории
                       // https://online.sbis.ru/opendoc.html?guid=68e3c08e-3064-422e-9d1a-93345171ac39
                      historySource.historySource._pinned = false;
                      historyItems = historySource.getItems();
                   } else {
                      historyItems = items;
                   }
                   self._historyItems = _private.filterHistoryItems(self, historyItems);
                   return self._historyItems;
                })
                .addErrback(() => {
                   self._historyItems = new List({ items: [] });
                });

            pDef.push(historyLoad);

            if (isReportPanel) {
               pDef.push(_private.loadFavoriteItems(self, historyId));
            }
            return pDef.done().getResult().addCallback(() => {
               return self._historyItems;
            });
         }
      },

      filterHistoryItems: function(self, items: object[]): object[] {
         function getOriginalItem(self, historyItem: object): object {
            return find(self._items, (originalItem) => {
               return originalItem.id === historyItem.id || originalItem.value[historyItem.id];
            });
         }

         let result;
         let originalItem;
         let hasResetValue;

         if (items) {
            result = chain.factory(items).filter((item) => {
               let validResult = false;

               const objectData = JSON.parse(item.get('ObjectData'));
               if (objectData) {
                  const history = objectData.items || objectData;

                  for (let i = 0, length = history.length; i < length; i++) {
                     const textValue = getPropValue(history[i], 'textValue');
                     const value = getPropValue(history[i], 'value');

                     // 0 and false is valid
                     if (textValue !== '' && textValue !== undefined && textValue !== null) {
                        originalItem = getOriginalItem(self, history[i]);
                        hasResetValue = originalItem && originalItem.hasOwnProperty('resetValue');

                        if (!originalItem) {
                           validResult = false;
                           break;
                        }
                        if (!hasResetValue || hasResetValue && !isEqual(value, getPropValue(originalItem, 'resetValue'))) {
                           validResult = true;
                        }
                     }
                  }
               }
               return validResult;
            }).value(factory.recordSet, {adapter: items.getAdapter()});
         } else {
            result = items;
         }

         return result;
      },

      reloadHistoryItems: function(self, historyId) {
         self._historyItems = _private.filterHistoryItems(self, HistoryUtils.getHistorySource({historyId: historyId}).getItems());
      },

      cloneItems: function(items) {
         if (items['[Types/_entity/CloneableMixin]']) {
            return items.clone();
         }
         return Clone(items);
      },

      getFilter: function(items) {
         var filter = {};
         chain.factory(items).each(function(item) {
            if (!isEqual(getPropValue(item, 'value'), getPropValue(item, 'resetValue')) &&
               (getPropValue(item, 'visibility') === undefined || getPropValue(item, 'visibility'))) {
               filter[item.id] = getPropValue(item, 'value');
            }
         });
         return filter;
      },

      isChangedValue: function(items) {
         var isChanged = false;
         chain.factory(items).each(function(item) {
            if ((getPropValue(item, 'resetValue') !== undefined && !isEqual(getPropValue(item, 'value'), getPropValue(item, 'resetValue')) &&
                getPropValue(item, 'visibility') === undefined) || getPropValue(item, 'visibility')) {
               isChanged = true;
            }
         });
         return isChanged;
      },

      validate: function(self) {
         return self._children.formController.submit();
      },

      isPassedValidation: function(result) {
         var isPassedValidation = true;
         chain.factory(result).each(function(value) {
            if (value) {
               isPassedValidation = false;
            }
         });
         return isPassedValidation;
      },

      hasAdditionalParams: function(items) {
         var hasAdditional = false;
         chain.factory(items).each(function(item) {
            if (getPropValue(item, 'visibility') === false) {
               hasAdditional = true;
            }
         });
         return hasAdditional;
      },

      prepareItems: function(items) {
         let value, isValueReseted;
         chain.factory(items).each(function(item) {
            value = getPropValue(item, 'value');
            if (item.hasOwnProperty('resetValue')) {
               isValueReseted = isEqual(value, getPropValue(item, 'resetValue'));
            } else {
               // if the missing resetValue field, by value field we determine that the filter should be moved
               isValueReseted = !value || value.length === 0;
            }
            if (getPropValue(item, 'visibility') === true && isValueReseted) {
               setPropValue(item, 'visibility', false);
            }
         });
         return items;
      }
   };

   var FilterPanel = Control.extend({
      _template: template,
      _isChanged: false,
      _hasResetValue: false,
      _hasAdditionalParams: false,

      _beforeMount: function(options, context) {
         _private.resolveItems(this, options, context);
         _private.resolveHistoryId(this, options, this._contextOptions);
         this._hasAdditionalParams = (options.additionalTemplate || options.additionalTemplateProperty) && _private.hasAdditionalParams(this._items);
         this._isChanged = _private.isChangedValue(this._items);
         this._hasResetValue = FilterUtils.hasResetValue(this._items);
         const isReportPanel = options.orientation === 'horizontal';
         return _private.loadHistoryItems(this, this._historyId, isReportPanel);
      },

      _beforeUpdate: function(newOptions, context) {
         if (!isEqual(this._options.items, newOptions.items)) {
            _private.resolveItems(this, newOptions, context);
         }
         this._isChanged = _private.isChangedValue(this._items);
         this._hasAdditionalParams = (newOptions.additionalTemplate || newOptions.additionalTemplateProperty) && _private.hasAdditionalParams(this._items);
         this._hasResetValue = FilterUtils.hasResetValue(this._items);
         if (this._options.historyId !== newOptions.historyId) {
            _private.resolveHistoryId(this, newOptions, context);
            return _private.loadHistoryItems(this, this._historyId);
         }
      },

      _historyItemsChanged: function() {
         _private.reloadHistoryItems(this, this._historyId);
      },

      _itemsChangedHandler: function(event, items) {
         this._items = _private.cloneItems(items);
         this._notify('itemsChanged', [this._items]);
      },

      _applyHistoryFilter: function(event, history) {
         const items = history.items || history;
         this._applyFilter(event, items, history);
      },

      _applyFilter: function(event, items, history) {
         var self = this,
             curItems = items || this._items;

         let apply = (preparedItems) => {
            /*
               Due to the fact that a bar can be created as you like (the bar will be not in the root, but a bit deeper)
               and the popup captures the sendResult operation from the root node, bubbling must be set in true.
            */
            self._notify('sendResult', [{
               filter: _private.getFilter(preparedItems),
               items: preparedItems,
               history
            }], {bubbling: true});
            self._notify('close', [], {bubbling: true});
         };

         if (history) {
            apply(curItems);
         } else {
            _private.validate(this).addCallback(function (result) {
               if (_private.isPassedValidation(result)) {
                  apply(_private.prepareItems(curItems));
               }
            });
         }
      },

      _resetFilter: function(): void {
         this._items = _private.cloneItems(this._options.items || this._contextOptions.items);
         FilterUtils.resetFilter(this._items);
         this._isChanged = false;
         this._notify('itemsChanged', [this._items]);
      }
   });

   FilterPanel.getDefaultOptions = function getDefaultOptions() {
      return {
         headingCaption: rk('Отбираются'),
         headingStyle: 'secondary',
         orientation: 'vertical',
         applyButtonCaption: rk('Отобрать')
      };
   };

   FilterPanel.contextTypes = function() {
      return {
         filterPanelOptionsField: _FilterPanelOptions
      };
   };
   FilterPanel._theme = ['Controls/filterPopup'];

   FilterPanel._private = _private;
   export = FilterPanel;


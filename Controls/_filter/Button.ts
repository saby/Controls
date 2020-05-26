/**
 * Created by am.gerasimov on 21.02.2018.
 */
import Control = require('Core/Control');
import template = require('wml!Controls/_filter/Button/Button');
import chain = require('Types/chain');
import Utils = require('Types/util');
import Deferred = require('Core/Deferred');
import libHelper = require('Core/library');
import {isEqual} from 'Types/object';
import {resetFilter} from 'Controls/_filter/resetFilterUtils';
/**
 * Контрол "Кнопка фильтров". Предоставляет возможность отображать и редактировать фильтр в удобном для пользователя виде. Состоит из кнопки-иконки и строкового представления выбранного фильтра.
 * @remark
 * Полезные ссылки:
 * * <a href="/materials/Controls-demo/app/Controls-demo%2FFilter%2FButton%2FPanelVDom">демо-пример</a>
 * * <a href="/doc/platform/developmentapl/interface-development/controls/list-environment/filter-search/">руководство разработчика по организации поиска и фильтрации в реестре</a>
 * * <a href="/doc/platform/developmentapl/interface-development/controls/list-environment/component-kinds/">руководство разработчика по классификации контролов Wasaby и схеме их взаимодействия</a>
 * * <a href="https://github.com/saby/wasaby-controls/blob/rc-20.4000/Controls-default-theme/aliases/_filter.less">переменные тем оформления filter</a>
 * * <a href="https://github.com/saby/wasaby-controls/blob/rc-20.4000/Controls-default-theme/aliases/_filterPopup.less">переменные тем оформления filterPopup</a>
 * 
 * @class Controls/_filter/Button
 * @extends Core/Control
 * @mixes Controls/interface/IFilterButton
 * @demo Controls-demo/Filter/Button/ButtonPG
 * @deprecated Данный контрол устарел и будет удалён. Вместо него используйте {@link Controls/filter:View}.
 * @control
 * @public
 * @author Герасимов А.М.
 *
 */

/*
 * Control for data filtering. Consists of an icon-button and a string representation of the selected filter.
 * Clicking on a icon-button or a string opens the panel. {@link Controls/filterPopup:DetailPanel}
 * Supports the insertion of a custom template between the button and the filter string.
 * The detailed description and instructions on how to configure the control you can read <a href='/doc/platform/developmentapl/interface-development/controls/filterbutton-and-fastfilters/'>here</a>.
 * Here you can see <a href="/materials/Controls-demo/app/Controls-demo%2FFilter%2FButton%2FPanelVDom">demo-example</a>.
 *
 * Information on filtering settings in the list using the "Filter Button" control you can read <a href='/doc/platform/developmentapl/interface-development/controls/filter-search/'>here</a>.
 *
 * @class Controls/_filter/Button
 * @extends Core/Control
 * @mixes Controls/interface/IFilterButton
 * @demo Controls-demo/Filter/Button/ButtonPG
 * @control
 * @public
 * @author Герасимов А.М.
 *
 */

var _private = {
   getText: function(items) {
      var textArr = [];

      chain.factory(items).each(function(item) {
         if (_private.isItemChanged(item) && !Utils.object.getPropertyValue(item, 'isFast')
             && (Utils.object.getPropertyValue(item, 'visibility') === undefined || Utils.object.getPropertyValue(item, 'visibility'))) {
            let textValue = Utils.object.getPropertyValue(item, 'textValue');
            let resetTextValue = Utils.object.getPropertyValue(item, 'resetTextValue');

            if (textValue && textValue !== resetTextValue) {
               textArr.push(textValue);
            }
         }
      });

      return textArr.join(', ');
   },

   isItemsChanged: function(items) {
      var isChanged = false;

      chain.factory(items).each(function(item) {
         if (!isChanged) {
            isChanged = Utils.object.getPropertyValue(item, 'resetValue') !== undefined && _private.isItemChanged(item);
         }
      });

      return isChanged;
   },

   isItemChanged: function(item) {
      return !isEqual(Utils.object.getPropertyValue(item, 'value'), Utils.object.getPropertyValue(item, 'resetValue'));
   },

   resolveItems: function(self, items) {
      self._items = items;
      self._text = _private.getText(items);
      self._isItemsChanged = _private.isItemsChanged(items);
   },
   setPopupOptions: function(self, alignment) {
      self._popupOptions = {
         closeOnOutsideClick: true,
         className: 'controls-FilterButton-popup-orientation-' + (alignment === 'right' ? 'left' : 'right')
      };

      if (alignment === 'right') {
         self._popupOptions.targetPoint = {
            vertical: 'top',
            horizontal: 'right'
         };
         self._popupOptions.direction = {
            horizontal: 'left'
         };
      }
   },

   requireDeps: function(self) {
      if (!self._depsDeferred) {
         self._depsDeferred = new Deferred();
         if (typeof self._options.templateName === 'string') {
            libHelper.load(self._options.templateName).then((mod) => {
               self._depsDeferred.callback(mod);
            });
         } else {
            self._depsDeferred.callback();
         }
      }
      return self._depsDeferred;

   },

   resetItems: function(self, items) {
      let textValue;
      let resetValue;

      chain.factory(items).each(function(item) {
         // Fast filters could not be reset from the filter button.
         if (!Utils.object.getPropertyValue(item, 'isFast')) {
            textValue = Utils.object.getPropertyValue(item, 'textValue');
            resetValue = Utils.object.getPropertyValue(item, 'resetValue');

            if (resetValue !== undefined) {
               Utils.object.setPropertyValue(item, 'value', resetValue);
            }
            if (Utils.object.getPropertyValue(item, 'visibility') !== undefined) {
               Utils.object.setPropertyValue(item, 'visibility', false);
            }
            if (textValue !== undefined) {
               Utils.object.setPropertyValue(item, 'textValue', textValue === null ? textValue : '');
            }
         }
      });
   },
   getPopupConfig: function(self) {
      return {
         templateOptions: {
            template: self._options.templateName,
            items: self._options.items,
            historyId: self._options.historyId
         },
         fittingMode: 'fixed',
         template: 'Controls/filterPopup:_FilterPanelWrapper',
         target: self._children.panelTarget
      };
   }
};

var FilterButton = Control.extend(/** @lends Controls/_filter/Button.prototype */{

   _template: template,
   _oldPanelOpener: null,
   _text: '',
   _isItemsChanged: false,
   _historyId: null,
   _popupOptions: null,
   _depsDeferred: null,

   _beforeMount: function(options) {
      if (options.items) {
         _private.resolveItems(this, options.items);
      }
      _private.setPopupOptions(this, options.alignment);
   },

   _beforeUpdate: function(options) {
      if (!isEqual(this._options.items, options.items)) {
         _private.resolveItems(this, options.items);
      }
      if (this._options.alignment !== options.alignment) {
         _private.setPopupOptions(this, options.alignment);
      }
   },

   _getFilterState: function() {
      return this._options.readOnly ? 'disabled' : 'default';
   },

   reset: function() {
      resetFilter(this._items);
      this._notify('filterChanged', [{}]);
      this._notify('itemsChanged', [this._items]);
      this._text = '';
   },

   _clearClick: function() {
      _private.resetItems(this, this._items);
      this._notify('filterChanged', [{}]);
      this._notify('itemsChanged', [this._items]);
      this._text = '';
   },

   openDetailPanel: function() {
      var self = this;
      if (!this._options.readOnly) {
         _private.requireDeps(this).addCallback(function(res) {
            self._children.filterStickyOpener.open(_private.getPopupConfig(self));
            return res;
         });
      }
   },

   _onFilterChanged: function(event, data) {
      this._notify('filterChanged', [data.filter]);
      if (data.history) {
         this._notify('historyApply', [data.history,  {bubbling: true}]);
      }
      // The format of the items from the history is different from the items in filter button, so a flag is added to the event
      this._notify('itemsChanged', [data.items, !!data.history]);
   }
});

FilterButton.getDefaultOptions = function() {
   return {
      alignment: 'right'
   };
};

FilterButton._theme = ['Controls/filter'];
FilterButton._private = _private;
export = FilterButton;


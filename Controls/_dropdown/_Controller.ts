// @ts-ignore
import Control = require('Core/Control');
// @ts-ignore
import template = require('wml!Controls/_dropdown/_Controller');
import {Sticky as StickyOpener} from 'Controls/popup';
import chain = require('Types/chain');
import historyUtils = require('Controls/_dropdown/dropdownHistoryUtils');
import dropdownUtils = require('Controls/_dropdown/Util');
import Env = require('Env/Env');
import {Controller as SourceController} from 'Controls/source';
import {isEqual} from 'Types/object';
import * as mStubs from 'Core/moduleStubs';
import {descriptor, Model} from 'Types/entity';
import {RecordSet} from 'Types/collection';
import {SyntheticEvent} from 'Vdom/Vdom';
import * as cInstance from 'Core/core-instance';
import {PrefetchProxy} from 'Types/source';
import * as Merge from 'Core/core-merge';

const PRELOAD_DEPENDENCIES_HOVER_DELAY = 80;

var _private = {
   createSourceController: function(self, options) {
      if (!self._sourceController) {
         self._sourceController = new SourceController({
            source: self._source,
            navigation: options.navigation
         });
      }
      return self._sourceController;
   },

   hasHistory(options): boolean {
      return options.historyId || historyUtils.isHistorySource(options.source);
   },

   isLocalSource(source): boolean {
     return cInstance.instanceOfModule(source, 'Types/source:Local');
   },

   loadError(self, error: Error): void {
      if (self._options.dataLoadErrback) {
         self._options.dataLoadErrback(error);
      }
   },

   prepareFilterForQuery(self, options): object {
      let filter = options.filter;

      if (_private.hasHistory(options)) {
         if (_private.isLocalSource(options.source) || !options.historyNew) {
            filter = historyUtils.getSourceFilter(options.filter, self._source);
         } else {
            filter.historyIds = [options.historyId];
         }
      }

      return filter;
   },

   pinClick(self, item): void {
      const preparedItem = _private.prepareItem(item, self._options.keyProperty, self._source);
      self._notify('pinClick', [preparedItem]);
      self._setItems(null);
      self._oldPopupId = self._popupId;
      self._open();
   },

   getSourceController(self, options): Promise<SourceController> {
      let sourcePromise;

      if (_private.hasHistory(options) && _private.isLocalSource(options.source) && !options.historyNew) {
         sourcePromise = historyUtils.getSource(options.source, options.historyId);
      } else {
         sourcePromise = Promise.resolve(options.source);
      }
      return sourcePromise.then((source) => {
         self._source = source;
         return _private.createSourceController(self, options);
      });
   },

   loadItems: function (self, options) {
      return _private.getSourceController(self, options).then(
          (sourceController) => {
             self._filter = _private.prepareFilterForQuery(self, options);

             return sourceController.load(self._filter).addCallback((items) => {
                if (options.dataLoadCallback) {
                   options.dataLoadCallback(items);
                }
                self._setItems(items);
                _private.updateSelectedItems(self,
                    options.emptyText,
                    options.selectedKeys,
                    options.keyProperty,
                    options.selectedItemsChangedCallback);
                return items;
             }).addErrback((error) => {
                _private.loadError(self, error);
                return error;
             });
          });
   },

   resetLoadPromises(self) {
      self._loadMenuTempPromise = null;
      self._loadItemsPromise = null;
      self._loadItemsTempPromise = null;
   },

   getItemByKey(items: RecordSet, key: string, keyProperty: string): void|Model {
      let item;

      if (items) {
         item = items.at(items.getIndexByValue(keyProperty, key));
      }

      return item;
   },

   updateSelectedItems: function (self, emptyText, selectedKeys, keyProperty, selectedItemsChangedCallback) {
      const selectedItems = [];

      const addToSelected = (key: string) => {
         const selectedItem = _private.getItemByKey(self._items, key, keyProperty);

         if (selectedItem) {
            selectedItems.push(selectedItem);
         }
      };

      if (!selectedKeys.length || selectedKeys[0] === null) {
         if (emptyText) {
            selectedItems.push(null);
         } else {
            addToSelected(null);
         }
      } else {
         chain.factory(selectedKeys).each( (key) => {
            // fill the array of selected items from the array of selected keys
            addToSelected(key);
         });
      }
      if (selectedItemsChangedCallback) {
         selectedItemsChangedCallback(selectedItems);
      }
   },

   getNewItems(items: RecordSet, selectedItems: RecordSet, keyProperty: string): Model[] {
      const newItems = [];

      chain.factory(selectedItems).each((item) => {
         if (!_private.getItemByKey(items, item.get(keyProperty), keyProperty)) {
            newItems.push(item);
         }
      });
      return newItems;
   },

   onSelectorResult: function (self, selectedItems) {
      var newItems = _private.getNewItems(self._items, selectedItems, self._options.keyProperty);

      // From selector dialog records may return not yet been loaded, so we save items in the history and then load data.
      if (historyUtils.isHistorySource(self._source)) {
         if (newItems.length) {
            self._sourceController = null;
         }
         _private.updateHistory(self, chain.factory(selectedItems).toArray());
      } else {
         self._items.prepend(newItems);
         self._setItems(self._items);
      }
   },

   prepareItem: function(item, keyProperty, source) {
      if (historyUtils.isHistorySource(source)) {
         return source.resetHistoryFields(item, keyProperty);
      } else {
         return item;
      }
   },

   updateHistory: function (self, items) {
      if (historyUtils.isHistorySource(self._source)) {
         self._source.update(items, historyUtils.getMetaHistory());

         if (self._sourceController && self._source.getItems) {
            self._setItems(self._source.getItems());
         }
      }
   },

   onResult: function (action, data) {
      switch (action) {
         case 'pinClick':
            _private.pinClick(this, data);
            break;
         case 'applyClick':
            this._notify('selectedItemsChanged', [data]);
            _private.updateHistory(this, data);
            _private.closeDropdownList(this);
            break;
         case 'itemClick':
            data = _private.prepareItem(data, this._options.keyProperty, this._source);
            var res = this._notify('selectedItemsChanged', [[data]]);

            // dropDown must close by default, but user can cancel closing, if returns false from event
            if (res !== false) {
               _private.updateHistory(this, data);
               _private.closeDropdownList(this);
            }
            break;
         case 'selectorResult':
            _private.onSelectorResult(this, data);
            this._notify('selectedItemsChanged', [data]);
            break;
         case 'selectorDialogOpened':
            this._initSelectorItems = data;
            _private.closeDropdownList(this);
            break;
         case 'footerClick':
            this._notify('footerClick', [data]);
      }
   },

   closeDropdownList: function (self) {
      StickyOpener.closePopup(self._popupId);
      self._isOpened = false;
   },

   setHandlers: function (self, options) {
      self._onOpen = function (event, args) {
         self._notify('dropDownOpen');
         if (typeof (options.open) === 'function') {
            options.open(args);
         }
      };
      self._onClose = function(event, args) {
         self._isOpened = false;
         self._notify('dropDownClose');
         if (typeof (options.close) === 'function') {
            options.close(args);
         }
      };
   },

   templateOptionsChanged: function(newOptions, options) {
      const isTemplateChanged = (tplOption) => {
         return typeof newOptions[tplOption] === 'string' && newOptions[tplOption] !== options[tplOption];
      };

      if (isTemplateChanged('headTemplate') ||
          isTemplateChanged('itemTemplate') ||
          isTemplateChanged('footerTemplate')) {
         return true;
      }
   },

   loadItemsTemplates: function(self, options) {
      if (!self._loadItemsTempPromise) {
         const templatesToLoad = _private.getItemsTemplates(self, options);
         self._loadItemsTempPromise = mStubs.require(templatesToLoad);
      }
      return self._loadItemsTempPromise;
   },

   loadMenuTemplates(self, options: object) {
      if (!self._loadMenuTempPromise) {
         let templatesToLoad = ['Controls/menu'];
         let templates = ['headTemplate', 'itemTemplate', 'footerTemplate'];
         templates.forEach((template) => {
            if (typeof options[template] === 'string') {
               templatesToLoad.push(options[template]);
            }
         });
         self._loadMenuTempPromise = mStubs.require(templatesToLoad);
      }
      return self._loadMenuTempPromise;
   },

   getItemsTemplates: function(self, options) {
      let
          templates = {},
          itemTemplateProperty = options.itemTemplateProperty;

      if (itemTemplateProperty) {
         self._items.each(function(item) {
            let itemTemplate = item.get(itemTemplateProperty);

            if (typeof itemTemplate === 'string') {
               templates[itemTemplate] = true;
            }
         });
      }

      return Object.keys(templates);
   },

   getPopupOptions(self, popupOptions?): object {
      let templateOptions = {
         closeButtonVisibility: false,
         emptyText: self._getEmptyText(),
         allowPin: self._options.allowPin && self._hasHistory(),
         headerTemplate: self._options.headTemplate || self._options.headerTemplate,
         footerContentTemplate: self._options.footerContentTemplate || self._options.footerTemplate,
         items: self._items,
         source: self._menuSource,
         filter: self._filter,
         // FIXME self._container[0] delete after
         // https://online.sbis.ru/opendoc.html?guid=d7b89438-00b0-404f-b3d9-cc7e02e61bb3
         width: self._options.width !== undefined ?
             (self._container[0] || self._container).offsetWidth :
             undefined,
         hasMoreButton: self._sourceController.hasMoreData('down'),
         selectorOpener: self._children.selectorOpener,
         selectorDialogResult: self._onSelectorTemplateResult.bind(self)
      };
      let options = {...self._options};
      const config = {
         templateOptions: Object.assign(options, templateOptions),
         className: self._options.popupClassName,
         template: 'Controls/menu:Popup',
         actionOnScroll: 'close',
         target: self._container,
         targetPoint: self._options.targetPoint,
         opener: self,
         fittingMode: {
            vertical: 'adaptive',
            horizontal: 'overflow'
         },
         eventHandlers: {
            onOpen: () => {
               if (self._oldPopupId) {
                  StickyOpener.closePopup(self._oldPopupId);
               }
               self._onOpen();
            },
            onClose: () => {
               if (self._oldPopupId) {
                  self._oldPopupId = null;
               } else {
                  self._popupId = null;
               }
               self._onClose();
            },
            onResult: self._onResult
         },
         autofocus: false,
         closeOnOutsideClick: true
      };
      const popupConfig = popupOptions || self._options.menuPopupOptions;
      return Merge(config, popupConfig || {});
   }
};

/**
 * Контроллер для выпадающих списков.
 *
 * @class Controls/_dropdown/_Controller
 * @extends Core/Control
 * @mixes Controls/_interface/ISource
 * @mixes Controls/_interface/IFilter
 * @mixes Controls/_interface/IHierarchy
 * @mixes Controls/_interface/INavigation
 * @mixes Controls/_interface/IMultiSelectable
 * @mixes Controls/interface/IDropdown
 * @mixes Controls/interface/IDropdownEmptyText
 * @mixes Controls/_interface/ICaption
 * @mixes Controls/_interface/IIcon
 * @mixes Controls/_interface/IIconStyle
 * @mixes Controls/interface/IGroupedList
 * @author Красильников А.С.
 * @control
 * @private
 */

/*
 * Controller for dropdown lists
 *
 * @class Controls/_dropdown/_Controller
 * @extends Core/Control
 * @mixes Controls/_interface/ISource
 * @mixes Controls/_interface/IFilter
 * @mixes Controls/_interface/IHierarchy
 * @mixes Controls/_interface/INavigation
 * @mixes Controls/_interface/IMultiSelectable
 * @mixes Controls/interface/IDropdown
 * @mixes Controls/interface/IDropdownEmptyText
 * @mixes Controls/_interface/ICaption
 * @mixes Controls/_interface/IIcon
 * @mixes Controls/_interface/IIconStyle
 * @mixes Controls/interface/IGroupedList
 * @author Красильников А.С.
 * @control
 * @private
 */

/**
 * @event Controls/_dropdown/_Controller#selectedItemsChanged Происходит при изменении набора выбранных элементов.
 * @param {Vdom/Vdom:SyntheticEvent} eventObject Дескриптор события.
 * @param {Types/collection:RecordSet} items Выбранные элементы.
 */

/*
 * @event Controls/_dropdown/_Controller#selectedItemsChanged Occurs when the selected items change.
 */

/**
 * @name Controls/_dropdown/_Controller#typeShadow
 * @cfg {String} Задает тип тени вокруг всплывающего окна.
 * @variant default Тень по умолчанию.
 * @variant suggestionsContainer Тень справа, слева, снизу.
 */

/*
 * @name Controls/_dropdown/_Controller#typeShadow
 * @cfg {String} Specifies the type of shadow around the popup.
 * @variant default Default shadow.
 * @variant suggestionsContainer Shadow on the right, left, bottom.
 */

/**
 * @name Controls/_dropdown/_Controller#marker
 * @cfg {Boolean} Определяет, будет ли маркер отображаться рядом с выбранным элементом.
 */

/*
 * @name Controls/_dropdown/_Controller#marker
 * @cfg {Boolean} Determines whether the marker is displayed around the selected item.
 */

/**
 * @name Controls/_dropdown/_Controller#showClose
 * @cfg {Boolean} Определяет, отображается ли крестик закрытия.
 */

/*
 * @name Controls/_dropdown/_Controller#showClose
 * @cfg {Boolean} Determines whether the cross is displayed.
 */

var _Controller = Control.extend({
   _template: template,
   _items: null,
   _loadItemsTempPromise: null,

   _beforeMount: function (options, context, receivedState) {
      let result;
      this._onResult = _private.onResult.bind(this);
      _private.setHandlers(this, options);
      if (!options.lazyItemsLoading) {
         if (receivedState) {
            result = _private.getSourceController(this, options).addCallback((sourceController) => {
               this._setItems(receivedState.items);
               sourceController.calculateState(this._items);

               if (receivedState.history) {
                  this._source.setHistory(receivedState.history);
                  this._setItems(this._source.prepareItems(this._items));
               }

               _private.updateSelectedItems(this, options.emptyText, options.selectedKeys, options.keyProperty, options.selectedItemsChangedCallback);
               if (options.dataLoadCallback) {
                  options.dataLoadCallback(this._items);
               }

               return sourceController;
            });
         } else if (options.source) {
            result = _private.loadItems(this, options).addCallback((items) => {
               const beforeMountResult = {};

               if (historyUtils.isHistorySource(this._source)) {
                  beforeMountResult.history = this._source.getHistory();
                  beforeMountResult.items = this._source.getItems(false);
               } else {
                  beforeMountResult.items = items;
               }

               return beforeMountResult;
            });
         }
      }

      return result;
   },

   _beforeUpdate: function (newOptions) {
      if (newOptions.readOnly && newOptions.readOnly !== this._options.readOnly) {
         _private.closeDropdownList(this);
      }

      if (_private.templateOptionsChanged(newOptions, this._options)) {
         this._loadMenuTempPromise = null;
         if (this._isOpened) {
            this._open();
         }
      }
      if ((newOptions.source && (newOptions.source !== this._options.source || !this._sourceController)) ||
          !isEqual(newOptions.navigation, this._options.navigation) ||
          !isEqual(newOptions.filter, this._options.filter)) {
         if (this._sourceController && !this._sourceController.isLoading()) {
            this._source = null;
            this._sourceController = null;
         }

         if (newOptions.source !== this._options.source) {
            _private.resetLoadPromises(this);
         }
         if (newOptions.lazyItemsLoading && !this._isOpened) {
            /* source changed, items is not actual now */
            this._setItems(null);
         } else {
            return _private.loadItems(this, newOptions).addCallback((items) => {
               if (items && this._isOpened) {
                  this._open();
               }
            });
         }
      } else if (newOptions.selectedKeys !== this._options.selectedKeys && this._items) {
         _private.updateSelectedItems(this, newOptions.emptyText, newOptions.selectedKeys, newOptions.keyProperty, newOptions.selectedItemsChangedCallback);
      }
   },

   _keyDown: function(event) {
      if (event.nativeEvent.keyCode === Env.constants.key.esc && this._popupId) {
         _private.closeDropdownList(this);
         event.stopPropagation();
      }
   },

   _loadItems() {
      if (this._items) {
         // Обновляем данные в источнике, нужно для работы истории
         this._setItems(this._items);
         this._loadItemsPromise = Promise.resolve();
      } else if (!this._loadItemsPromise || this._loadItemsPromise.resolved && !this._items) {
         if (this._options.source && !this._items) {
            this._loadItemsPromise = _private.loadItems(this, this._options);
         }
      }
      return this._loadItemsPromise;
   },

   loadDependencies(): void {
      return Promise.all([_private.loadMenuTemplates(this, this._options), this._loadItems()]).then( () => {
         return _private.loadItemsTemplates(this, this._options);
       });
   },

   _open(popupOptions?: object): void {
      if (this._options.readOnly) {
         return;
      }
      return this.loadDependencies().then( () => {
         const count = this._items.getCount();
         if (count > 1 || count === 1 && (this._options.emptyText || this._options.footerTemplate)) {
            let config = _private.getPopupOptions(this, popupOptions);
            this._isOpened = true;
            StickyOpener.openPopup(config, this).then((popupId) => {
               this._popupId = popupId;
            });
         } else if (count === 1) {
            this._notify('selectedItemsChanged', [
               [this._items.at(0)]
            ]);
         }
      });
   },

   _onSelectorTemplateResult: function(event, selectedItems) {
      let result = this._notify('selectorCallback', [this._initSelectorItems, selectedItems]) || selectedItems;
      this._onResult('selectorResult', result);
   },

   _clickHandler(event: SyntheticEvent): void {
      // stop bubbling event, so the list does not handle click event.
      event.stopPropagation();
   },

   _mouseDownHandler(): void {
      if (this._popupId) {
         _private.closeDropdownList(this);
      } else {
         this._open();
      }
   },

   _mouseEnterHandler: function() {
      this._loadDependenciesTimer = setTimeout(this.loadDependencies.bind(this), PRELOAD_DEPENDENCIES_HOVER_DELAY);
   },

   _mouseLeaveHandler: function() {
      clearTimeout(this._loadDependenciesTimer);
   },

   _beforeUnmount: function() {
      if (this._sourceController) {
         this._sourceController.cancelLoading();
         this._sourceController = null;
      }
      this._setItems(null);
   },

   _getEmptyText: function () {
      return dropdownUtils.prepareEmpty(this._options.emptyText);
   },

   _setItems: function(items) {
      if (items) {
         this._menuSource = new PrefetchProxy({
            target: this._source,
            data: {
               query: items.clone()
            }
         });
      } else {
         this._loadItemsPromise = null;
      }
      this._items = items;
   },

   _hasHistory(): boolean {
      return _private.hasHistory(this._options);
   },

   _deactivated(): void {
      this.closeMenu();
   },

   openMenu(popupOptions?: object): void {
      return this._open(popupOptions);
   },

   closeMenu(): void {
      _private.closeDropdownList(this);
   }
});

_Controller.getDefaultOptions = function getDefaultOptions() {
   return {
      filter: {},
      selectedKeys: [],
      allowPin: true
   };
};

_Controller.getOptionTypes = function getOptionTypes() {
   return {
      selectedKeys: descriptor(Array)
   };
};

_Controller._private = _private;
export = _Controller;

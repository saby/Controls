// @ts-ignore
import Control = require('Core/Control');
// @ts-ignore
import {Sticky as StickyOpener, Stack as StackOpener} from 'Controls/popup';
import IDropdownController, {IDropdownControllerOptions} from 'Controls/_dropdown/interface/IDropdownController';
import chain = require('Types/chain');
import historyUtils = require('Controls/_dropdown/dropdownHistoryUtils');
import dropdownUtils = require('Controls/_dropdown/Util');
import {Controller as SourceController} from 'Controls/source';
import {isEqual} from 'Types/object';
import * as mStubs from 'Core/moduleStubs';
import {descriptor, Model} from 'Types/entity';
import {RecordSet} from 'Types/collection';
import * as cInstance from 'Core/core-instance';
import {PrefetchProxy} from 'Types/source';
import * as Merge from 'Core/core-merge';
import {RegisterUtil, UnregisterUtil} from 'Controls/event';
import isEmpty = require('Core/helpers/Object/isEmpty');

/**
 * Контроллер для выпадающих списков.
 *
 * @class Controls/_dropdown/_Controller
 * @extends Core/Control
 * @mixes Controls/_dropdown/interface/IDropdownController
 * @author Красильников А.С.
 * @control
 * @private
 */

/*
 * Controller for dropdown lists
 *
 * @class Controls/_dropdown/_Controller
 * @extends Core/Control
 * @mixes Controls/_dropdown/interface/IDropdownController
 * @author Красильников А.С.
 * @control
 * @private
 */

/**
 * @event Controls/_dropdown/_Controller#selectedItemsChanged Происходит при изменении набора выбранных элементов.
 * @param {Vdom/Vdom:SyntheticEvent} eventObject Дескриптор события.
 * @param {Types/collection:RecordSet} items Выбранные элементы.
 */

class _Controller implements IDropdownController {
   protected _items: RecordSet = null;
   protected _loadItemsTempPromise: Promise<any> = null;
   protected _options: IDropdownControllerOptions = null;

   constructor(options: IDropdownControllerOptions) {
      this._options = options;
   }

   loadItems(recievedState: {items?: RecordSet, history?: RecordSet}): Promise<RecordSet>|RecordSet {
      if (!recievedState || isEmpty(recievedState)) {
         return new Promise((resolve) => {
            this._loadItems(this._options).addCallback((items) => {
               const beforeMountResult = {};

               if (historyUtils.isHistorySource(this._source)) {
                  beforeMountResult.history = this._source.getHistory();
                  beforeMountResult.items = this._source.getItems(false);
               } else {
                  beforeMountResult.items = items;
               }

               resolve(beforeMountResult);
            });
         });
      } else {
         this.setItems(recievedState);
      }
   }

   registerScrollEvent(): void {
      RegisterUtil(this._options.openerControl, 'scroll', this._handleScroll.bind(this));
   }

   update(newOptions: IDropdownControllerOptions): Promise<RecordSet>|void {
      const oldOptions = {...this._options};
      this._options = newOptions;
      if (newOptions.readOnly && newOptions.readOnly !== oldOptions.readOnly) {
         this._closeDropdownList();
      }

      if (this._templateOptionsChanged(newOptions, oldOptions)) {
         this._loadMenuTempPromise = null;
         if (this._isOpened) {
            this._open();
         }
      }
      if ((newOptions.source && (newOptions.source !== oldOptions.source || !this._sourceController)) ||
          !isEqual(newOptions.navigation, oldOptions.navigation) ||
          !isEqual(newOptions.filter, oldOptions.filter)) {
         if (this._sourceController && !this._sourceController.isLoading()) {
            this._source = null;
            this._sourceController = null;
         }

         if (newOptions.source !== oldOptions.source) {
            this._resetLoadPromises();
         }
         if (newOptions.lazyItemsLoading && !this._isOpened) {
            /* source changed, items is not actual now */
            this._setItems(null);
         } else {
            return this._loadItems(newOptions).addCallback((items) => {
               if (items && this._isOpened) {
                  this._open();
               }
            });
         }
      } else if (newOptions.selectedKeys !== oldOptions.selectedKeys && this._items) {
         this._updateSelectedItems(newOptions.emptyText, newOptions.selectedKeys,
                                   newOptions.keyProperty, newOptions.selectedItemsChangedCallback);
      }
   }

   loadDependencies(): Promise<any> {
      const deps = [this._loadMenuTemplates(this._options)];

      if (!this._items) {
         deps.push(this._getloadItemsPromise().then(() => this._loadItemsTemplates(this._options)));
      } else {
         deps.push(this._loadItemsTemplates(this, this._options));
      }

      return Promise.all(deps);
   }

   setMenuPopupTarget(target): void {
      if (!this.target) {
         this.target = target;
      }
   }

   openMenu(popupOptions?: object): void {
      return this._open(popupOptions);
   }

   closeMenu(): void {
      this._closeDropdownList();
   }

   destroy(): void {
      if (this._sourceController) {
         this._sourceController.cancelLoading();
         this._sourceController = null;
      }
      this._setItems(null);
      this._closeDropdownList();
      UnregisterUtil(this._options.openerControl, 'scroll');
   }

   applyClick(data): void {
      this._updateHistory(data);
      this._closeDropdownList();
   }

   getPreparedItem(data, keyProperty, source) {
      return this._prepareItem(data, keyProperty, source);
   }

   onSelectorResult(selectedItems): void {
      var newItems = this._getNewItems(this._items, selectedItems, this._options.keyProperty);

      // From selector dialog records may return not yet been loaded, so we save items in the history and then load data.
      if (historyUtils.isHistorySource(this._source)) {
         if (newItems.length) {
            this._sourceController = null;
         }
         this._updateHistory(chain.factory(selectedItems).toArray());
      } else {
         this._items.prepend(newItems);
         this._setItems(this._items);
      }
   }

   private _open(loadedDe ,popupOptions?: object): Promise<any> {
      if (this._options.readOnly) {
         return;
      }
      const openPopup = () => {
         return StickyOpener.openPopup(this._getPopupOptions(popupOptions)).then((popupId) => {
            return this._popupId = popupId;
         });
      };

      return this.loadDependencies().then(
          () => {
             const count = this._items.getCount();
             if (count > 1 || count === 1 && (this._options.emptyText || this._options.footerTemplate)) {
                this._createMenuSource(this._items);
                this._isOpened = true;
                return openPopup();
             } else if (count === 1) {
                return Promise.resolve(this._items.at(0));
             }
          },
          () => {
             if (this._menuSource) {
                return openPopup();
             }
          }
       );
   }

   private setItems(recievedState): Promise<any> {
      return this._getSourceController(this._options).addCallback((sourceController) => {
         this._setItems(recievedState.items);
         sourceController.calculateState(this._items);

         if (recievedState.history) {
            this._source.setHistory(recievedState.history);
            this._setItems(this._source.prepareItems(this._items));
         }

         this._updateSelectedItems(this._options.emptyText, this._options.selectedKeys, this._options.keyProperty, this._options.selectedItemsChangedCallback);
         if (this._options.dataLoadCallback) {
            this._options.dataLoadCallback(this._items);
         }

         return sourceController;
      });
   }

   private _getloadItemsPromise(): Promise<any> {
      if (this._items) {
         // Обновляем данные в источнике, нужно для работы истории
         this._setItems(this._items);
         this._loadItemsPromise = Promise.resolve();
      } else if (!this._loadItemsPromise || this._loadItemsPromise.resolved && !this._items) {
         if (this._options.source && !this._items) {
            this._loadItemsPromise = this._loadItems(this._options);
         }
      }
      return this._loadItemsPromise;
   }

   private _handleScroll(): void {
      if (this._popupId) {
         this._closeDropdownList();
      }
   }

   private _getEmptyText(): string {
      return dropdownUtils.prepareEmpty(this._options.emptyText);
   }

   private _setItems(items: RecordSet|null): void {
      if (items) {
         this._createMenuSource(items);
      } else {
         this._loadItemsPromise = null;
      }
      this._items = items;
   }

   private _createMenuSource(items: RecordSet|Error): void {
      this._menuSource = new PrefetchProxy({
         target: this._source,
         data: {
            query: items
         }
      });
   }

   private _createSourceController(options) {
      if (!this._sourceController) {
         this._sourceController = new SourceController({
            source: this._source,
            navigation: options.navigation
         });
      }
      return this._sourceController;
   }

   private _hasHistory(options): boolean {
      return options.historyId || historyUtils.isHistorySource(options.source);
   }

   private _isLocalSource(source): boolean {
      return cInstance.instanceOfModule(source, 'Types/source:Local');
   }

   private _loadError(error: Error): void {
      if (this._options.dataLoadErrback) {
         this._options.dataLoadErrback(error);
      }
      this._loadItemsPromise = null;
      this._createMenuSource(error);
   }

   private _prepareFilterForQuery(options): object {
      let filter = options.filter;

      if (this._hasHistory(options)) {
         if (this._isLocalSource(options.source) || !options.historyNew) {
            filter = historyUtils.getSourceFilter(options.filter, this._source);
         } else {
            filter.historyIds = [options.historyId];
         }
      }

      return filter;
   }

   private _pinClick(item): void {
      const preparedItem = this._prepareItem(item, this._options.keyProperty, this._source);
      this._options.source.update(item.clone(), {
         $_pinned: !item.get('pinned')
      });
      this._setItems(null);
      this._open();
   }

   private _getSourceController(options): Promise<SourceController> {
      let sourcePromise;

      if (this._hasHistory(options) && this._isLocalSource(options.source) && !options.historyNew) {
         sourcePromise = historyUtils.getSource(options.source, options.historyId);
      } else {
         sourcePromise = Promise.resolve(options.source);
      }
      return sourcePromise.then((source) => {
         this._source = source;
         return this._createSourceController(options);
      });
   }

   private _loadItems(options) {
      return this._getSourceController(options).then(
          (sourceController) => {
             this._filter = this._prepareFilterForQuery(options);

             return sourceController.load(this._filter).addCallback((items) => {
                if (options.dataLoadCallback) {
                   options.dataLoadCallback(items);
                }
                this._setItems(items);
                this._updateSelectedItems(
                    options.emptyText,
                    options.selectedKeys,
                    options.keyProperty,
                    options.selectedItemsChangedCallback);
                return items;
             }).addErrback((error) => {
                this._loadError(error);
                return error;
             });
          });
   }

   private _resetLoadPromises(): void {
      this._loadMenuTempPromise = null;
      this._loadItemsPromise = null;
      this._loadItemsTempPromise = null;
   }

   private _getItemByKey(items: RecordSet, key: string, keyProperty: string): void|Model {
      let item;

      if (items) {
         item = items.at(items.getIndexByValue(keyProperty, key));
      }

      return item;
   }

   private _updateSelectedItems(emptyText, selectedKeys, keyProperty, selectedItemsChangedCallback) {
      const selectedItems = [];

      const addToSelected = (key: string) => {
         const selectedItem = this._getItemByKey(this._items, key, keyProperty);

         if (selectedItem) {
            selectedItems.push(selectedItem);
         }
      };

      if (!selectedKeys || !selectedKeys.length || selectedKeys[0] === null) {
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
   }

   private _getNewItems(items: RecordSet, selectedItems: RecordSet, keyProperty: string): Model[] {
      const newItems = [];

      chain.factory(selectedItems).each((item) => {
         if (!this._getItemByKey(items, item.get(keyProperty), keyProperty)) {
            newItems.push(item);
         }
      });
      return newItems;
   }

   private _prepareItem(item, keyProperty, source) {
      if (historyUtils.isHistorySource(source)) {
         return source.resetHistoryFields(item, keyProperty);
      } else {
         return item;
      }
   }

   private _updateHistory(items): void {
      if (historyUtils.isHistorySource(this._source)) {
         this._source.update(items, historyUtils.getMetaHistory());

         if (this._sourceController && this._source.getItems) {
            this._setItems(this._source.getItems());
         }
      }
   }

   private _closeDropdownList(): void {
      StickyOpener.closePopup(this._popupId);
      this._isOpened = false;
   }

   private _templateOptionsChanged(newOptions, options): boolean {
      const isTemplateChanged = (tplOption) => {
         return typeof newOptions[tplOption] === 'string' && newOptions[tplOption] !== options[tplOption];
      };

      if (isTemplateChanged('headTemplate') ||
          isTemplateChanged('itemTemplate') ||
          isTemplateChanged('footerTemplate')) {
         return true;
      }
   }

   private _loadItemsTemplates(options): Promise<any> {
      if (!this._loadItemsTempPromise) {
         const templatesToLoad = this._getItemsTemplates(options);
         this._loadItemsTempPromise = mStubs.require(templatesToLoad);
      }
      return this._loadItemsTempPromise;
   }

   private _loadMenuTemplates(options: object): Promise<any> {
      if (!this._loadMenuTempPromise) {
         let templatesToLoad = ['Controls/menu'];
         let templates = ['headTemplate', 'itemTemplate', 'footerTemplate'];
         templates.forEach((template) => {
            if (typeof options[template] === 'string') {
               templatesToLoad.push(options[template]);
            }
         });
         this._loadMenuTempPromise = mStubs.require(templatesToLoad).then((loadedDeps) => {
            return loadedDeps[0].Control.loadCSS(options.theme);
         });
      }
      return this._loadMenuTempPromise;
   }

   private _getItemsTemplates(options) {
      let
          templates = {},
          itemTemplateProperty = options.itemTemplateProperty;

      if (itemTemplateProperty) {
         this._items.each(function(item) {
            let itemTemplate = item.get(itemTemplateProperty);

            if (typeof itemTemplate === 'string') {
               templates[itemTemplate] = true;
            }
         });
      }

      return Object.keys(templates);
   }

   private _getPopupOptions(popupOptions?): object {
      let baseConfig = {...this._options};
      const ignoreOptions = [
         'iWantBeWS3',
         '_$createdFromCode',
         '_logicParent',
         'theme',
         'vdomCORE',
         'name',
         'esc'
      ];

      for (let i = 0; i < ignoreOptions.length; i++) {
         const option = ignoreOptions[i];
         if (this._options[option] !== undefined) {
            delete baseConfig[option];
         }
      }
      let templateOptions = {
         closeButtonVisibility: false,
         emptyText: this._getEmptyText(),
         allowPin: this._options.allowPin && this._hasHistory(this._options),
         headerTemplate: this._options.headTemplate || this._options.headerTemplate,
         footerContentTemplate: this._options.footerContentTemplate || this._options.footerTemplate,
         items: this._items,
         source: this._menuSource,
         filter: this._filter,
         // FIXME this._container[0] delete after
         // https://online.sbis.ru/opendoc.html?guid=d7b89438-00b0-404f-b3d9-cc7e02e61bb3
         width: this._options.width !== undefined ?
             (this.target[0] || this.target).offsetWidth :
             undefined,
         hasMoreButton: this._sourceController.hasMoreData('down'),
         selectorOpener: StackOpener
      };
      const config = {
         id: this._popupId,
         templateOptions: Object.assign(baseConfig, templateOptions),
         className: this._options.popupClassName,
         template: 'Controls/menu:Popup',
         actionOnScroll: 'close',
         target: this.target,
         targetPoint: this._options.targetPoint,
         opener: this._options.openerControl,
         fittingMode: {
            vertical: 'adaptive',
            horizontal: 'overflow'
         },
         autofocus: false,
         closeOnOutsideClick: true
      };
      const popupConfig = popupOptions || this._options.menuPopupOptions;
      return Merge(config, popupConfig || {});
   }
}

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
export = _Controller;

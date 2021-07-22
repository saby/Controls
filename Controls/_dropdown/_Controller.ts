import {StickyOpener} from 'Controls/popup';
import IDropdownController, {IDropdownControllerOptions} from 'Controls/_dropdown/interface/IDropdownController';
import {getSourceFilter, isHistorySource, getSource, getMetaHistory} from 'Controls/_dropdown/dropdownHistoryUtils';
import {DropdownReceivedState} from 'Controls/_dropdown/BaseDropdown';
import {isEmptyItem, prepareEmpty} from 'Controls/_dropdown/Util';
import {error as dataSourceError, NewSourceController as SourceController} from 'Controls/dataSource';
import {factory} from 'Types/chain';
import {isEqual} from 'Types/object';
import {descriptor, Model} from 'Types/entity';
import {RecordSet} from 'Types/collection';
import {PrefetchProxy, ICrudPlus, Memory} from 'Types/source';
import * as mStubs from 'Core/moduleStubs';
import * as cInstance from 'Core/core-instance';
import * as Merge from 'Core/core-merge';
import {TSelectedKeys} from 'Controls/interface';

/**
 * Контроллер для выпадающих списков.
 *
 * @class Controls/_dropdown/_Controller
 * @extends UI/Base:Control
 * @mixes Controls/_dropdown/interface/IDropdownController
 * @author Красильников А.С.
 *
 * @private
 */

/*
 * Controller for dropdown lists
 *
 * @class Controls/_dropdown/_Controller
 * @extends UI/Base:Control
 * @mixes Controls/_dropdown/interface/IDropdownController
 * @author Красильников А.С.
 *
 * @private
 */
export default class _Controller implements IDropdownController {
   protected _items: RecordSet = null;
   protected _loadItemsTempPromise: Promise<any> = null;
   protected _options: IDropdownControllerOptions = null;
   protected _source: ICrudPlus = null;
   protected _preloadedItems: RecordSet = null;
   protected _selectedKeys: TSelectedKeys = null;
   protected _sourceController: SourceController = null;
   private _filter: object;
   private _selectedItems: RecordSet<Model>;
   private _sticky: StickyOpener;

   constructor(options: IDropdownControllerOptions) {
      this._options = options;
      this._selectedKeys = options.selectedKeys;
      this._sticky = new StickyOpener();
   }

   loadItems(): Promise<DropdownReceivedState> {
      return new Promise((resolve, reject) => {
         this._loadItems(this._options).then(
             (items) => {
                const beforeMountResult = {};

                if (isHistorySource(this._source)) {
                   beforeMountResult.history = this._source.getHistory();
                   beforeMountResult.items = this._source.getItems(false);
                } else {
                   beforeMountResult.items = items;
                }
                resolve(beforeMountResult);
             },
             (error) => {
                reject(error);
             }
         );
      });
   }

   loadSelectedItems(): Promise<DropdownReceivedState> {
      return this._loadSelectedItems(this._options).then((newItems) => {
         this._selectedItems = newItems;
         this._sourceController = null;
         this._setItemsAndMenuSource(null);
         return {
            items: newItems,
            history: null
         };
      });
   }

   updateSelectedItems(items: RecordSet<Model>): void {
      if (items) {
         this._selectedItems = items;
         this._updateSelectedItems(this._options, items);
      }
   }

   setItems(items?: RecordSet): Promise<void> {
      this._items = items;
      if (this._options.dataLoadCallback) {
         this._options.dataLoadCallback(this._items);
      }
      this._updateSelectedItems(this._options);
      return this._getSourceController(this._options).then((sourceController) => {
         this._setItemsAndMenuSource(items);
         sourceController.setItems(this._items);
      });
   }

   setHistoryItems(history?: RecordSet): void {
      if (history) {
         this._source.setHistory(history);
         this._setItemsAndMenuSource(this._source.prepareItems(this._items));
      }
   }

   update(newOptions: IDropdownControllerOptions): Promise<RecordSet|void>|void {
      const oldOptions = {...this._options};
      this._options = newOptions;
      if (newOptions.readOnly && newOptions.readOnly !== oldOptions.readOnly) {
         this._closeDropdownList();
      }

      if (this._templateOptionsChanged(newOptions, oldOptions)) {
         this._loadMenuTempPromise = null;
         this._loadDependsPromise = null;
         if (this._isOpened) {
            this._open();
         }
      }
      const selectedKeysChanged = newOptions.selectedKeys && newOptions.selectedKeys !== this._selectedKeys;
      const sourceChanged = newOptions.source !== oldOptions.source;
      const navigationChanged = !isEqual(newOptions.navigation, oldOptions.navigation);
      const filterChanged = !isEqual(newOptions.filter, oldOptions.filter);

      if (selectedKeysChanged) {
         this._selectedKeys = newOptions.selectedKeys;
      }

      let newKeys = [];
      if (selectedKeysChanged && newOptions.navigation) {
         newKeys = this._getUnloadedKeys(this._items, newOptions);
      }
      if ((newOptions.source && (sourceChanged || !this._sourceController)) || navigationChanged || filterChanged) {
         if (this._sourceController && !this._sourceController.isLoading()) {
            this._source = null;
            this._sourceController = null;
         }

         if (sourceChanged) {
            this._resetLoadPromises();
            if (!this._opening) {
               this._loadDependsPromise = null;
            }
         }

         if (newOptions.lazyItemsLoading && !this._isOpened) {
            /* source changed, items is not actual now */
            this._preloadedItems = null;
            this._setItemsAndMenuSource(null);
         } else if (selectedKeysChanged && newKeys.length) {
            return this._reloadSelectedItems(newOptions);
         } else {
            return this.reload();
         }
      } else if (selectedKeysChanged && this._items && this._items.getCount()) {
         if (newKeys.length) {
            this._reloadSelectedItems(newOptions);
         } else {
            this._updateSelectedItems(newOptions);
         }
      }
   }

   reload(): Promise<RecordSet> {
      this._preloadedItems = null;
      return this._loadItems(this._options);
   }

   tryPreloadItems(): Promise<void> {
      let source = this._options.source;
      if (isHistorySource(source) && source.getOriginSource && source.getOriginSource()) {
         source = source.getOriginSource();
      }
      if (source instanceof PrefetchProxy) {
         source = source.getOriginal();
      }

      const sourceController = new SourceController({
         source,
         filter: this._options.filter,
         keyProperty: this._options.keyProperty,
         navigation: {
            source: 'page',
            view: 'pages',
            sourceConfig: {
               pageSize: 1,
               page: 0,
               limit: 1
            }
         }
      });
      return sourceController.load().then((items) => {
         if (items instanceof RecordSet && items.getCount() === 1 && !sourceController.hasMoreData('down')) {
            this._preloadedItems = items;
         }
      });
   }

   loadDependencies(needLoadMenuTemplates: boolean = true, source?: ICrudPlus): Promise<unknown[]> {
      if (this._loadDependsPromise) {
         return this._loadDependsPromise;
      }

      const deps = [];

      if (needLoadMenuTemplates) {
         deps.push(this._loadMenuTemplates(this._options));
      }

      if (!this._items) {
         deps.push(this._getLoadItemsPromise(source)
             .then(() => this._loadItemsTemplates(this._options))
             .catch((error) => {
               return Promise.reject(error);
            })
         );
      } else if (needLoadMenuTemplates) {
         deps.push(this._loadItemsTemplates(this._options));
      }

      return this._loadDependsPromise = Promise.allSettled(deps).then((results) => {
         this._loadDependsPromise = null;

         const errorResult = results.find((result) => result.reason);
         if (errorResult) {
            return Promise.reject(errorResult.reason);
         }
      });
   }

   setMenuPopupTarget(target): void {
      this.target = target;
   }

   openMenu(popupOptions?: object): Promise<any> {
      if (this._options.reloadOnOpen) {
         this._setItemsAndMenuSource(null);
         this._loadDependsPromise = null;
         this._sourceController = null;
      }
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
      this._setItemsAndMenuSource(null);
      this._closeDropdownList();
      this._sticky = null;
   }

   setSelectedKeys(keys: TSelectedKeys): void {
      this._selectedKeys = keys;
   }

   handleSelectedItems(data): void {
      this._updateHistory(data);
      this._closeDropdownList();
   }

   getPreparedItem(item: Model): Model {
      return this._prepareItem(item, this._options.keyProperty, this._source);
   }

   handleSelectorResult(selectedItems: RecordSet): void {
      const newItems = this._getNewItems(this._items, selectedItems, this._options.keyProperty);

      // From selector dialog records may return not yet been loaded, so we save items in the history and then load data.
      if (isHistorySource(this._source)) {
         if (newItems.length) {
            this._sourceController = null;
         }
         this._updateHistory(factory(selectedItems).toArray());
      } else {
         this._items.prepend(newItems);
         this._setItemsAndMenuSource(this._items);
      }
   }

   handleClose(): void {
       if (this._items && !this._items.getCount() && this._options.searchParam) {
           this._setItemsAndMenuSource(null);
       }
       this._isOpened = false;
       this._menuSource = null;
   }

   pinClick(item): void {
      const preparedItem = this._prepareItem(item, this._options.keyProperty, this._source);
      this._source.update(preparedItem.clone(), {
         $_pinned: !preparedItem.get('pinned')
      }).then(() => {
         this._setItemsAndMenuSource(null);
         this._open();
      });
   }

   getItems(): RecordSet<Model> {
      return this._items;
   }

   private _open(popupOptions?: object): Promise<unknown[]> {
      if (this._options.readOnly) {
         return Promise.resolve();
      }

      this._opening = true;
      let source;
      if (popupOptions) {
         this._popupOptions = popupOptions;
         if (popupOptions.templateOptions?.source) {
             source = popupOptions.templateOptions.source;
             delete popupOptions.templateOptions.source;
         }
      }
      const openPopup = () => {
         this._isOpened = true;
         this._opening = false;
         this._sticky.open(this._getPopupOptions(this._popupOptions));
      };
      if (this._preloadedItems) {
         this._source = this._options.source;
         this._resolveLoadedItems(this._options, this._preloadedItems);
      }
      return this.loadDependencies(!this._preloadedItems, source, true).then(
          () => {
             const count = this._items.getCount();
             if (count > 1 || count === 1 && (this._options.emptyText || this._options.footerContentTemplate)) {
                this._createMenuSource(this._items);
                return openPopup();
             } else if (count === 1) {
                return Promise.resolve([this._items.at(0)]);
             }
          },
          (error) => {
             // Если не загрузился модуль меню, то просто выводим сообщение о ошибке загрузки
             if (!requirejs.defined('Controls/menu')) {
                dataSourceError.process({error});
             } else if (this._menuSource) {
                return openPopup();
             }
          }
      );
   }

   private _getLoadItemsPromise(source?: ICrudPlus): Promise<any> {
      if (this._items) {
         // Обновляем данные в источнике, нужно для работы истории
         this._setItemsAndMenuSource(this._items);
         this._loadItemsPromise = Promise.resolve();
      } else if (!this._loadItemsPromise || this._loadItemsPromise.resolved && !this._items) {
         if (this._options.source && !this._items) {
            this._loadItemsPromise = this._loadItems(this._options, source);
         } else {
            this._loadItemsPromise = Promise.resolve();
         }
      }
      return this._loadItemsPromise;
   }

   private _getEmptyText(): string {
      return prepareEmpty(this._options.emptyText);
   }

   private _setItemsAndMenuSource(items: RecordSet|null): void {
      if (items) {
         this._createMenuSource(items);
      } else {
         this._loadItemsPromise = null;
      }
      this._items = items;
   }

   private _createMenuSource(items: RecordSet|Error): void {
      if (this._options.items) {
         this._menuSource = new Memory({
            data: items,
            adapter: 'Types/entity:adapter.RecordSet',
            keyProperty: this._options.keyProperty
         });
      } else {
         this._menuSource = new PrefetchProxy({
            target: this._source,
            data: {
               query: items
            }
         });
      }
   }

   private _createSourceController(options, filter) {
      if (!this._sourceController) {
         this._sourceController = new SourceController({
            source: this._source,
            filter,
            keyProperty: options.keyProperty,
            navigation: options.navigation
         });
      }
      return this._sourceController;
   }

   private _hasHistory(options): boolean {
      return options.historyId || isHistorySource(options.source);
   }

   private _isLocalSource(source): boolean {
      if (source instanceof PrefetchProxy) {
         return cInstance.instanceOfModule(source.getOriginal(), 'Types/source:Local');
      }
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
            filter = getSourceFilter(options.filter, this._source);
         } else {
            filter.historyIds = [options.historyId];
         }
      }

      return filter;
   }

   private _getSourceController(options, source?: ICrudPlus): Promise<SourceController> {
      let sourcePromise;

      if (this._hasHistory(options) && this._isLocalSource(options.source) && !options.historyNew) {
         sourcePromise = getSource(this._source || options.source, options);
      } else {
         sourcePromise = Promise.resolve(source || options.source);
      }
      return sourcePromise.then((source) => {
         this._source = source;
         if (isHistorySource(this._source)) {
            this._source.setDataLoadCallback(options.dataLoadCallback);
         }
         this._filter = this._prepareFilterForQuery(options);
         return this._createSourceController(options, this._filter);
      });
   }

   private _loadItems(options: IDropdownControllerOptions, source?: ICrudPlus): Promise<RecordSet|Error> {
      return this._getSourceController(options, source).then((sourceController) => {
          return sourceController.load().then((items) => {
             return this._resolveLoadedItems(options, items);
          }, (error) => {
             this._loadError(error);
             return Promise.reject(error);
          });
       });
   }

   private _loadSelectedItems(options: IDropdownControllerOptions): Promise<RecordSet> {
      const filter = {...options.filter};
      filter[options.keyProperty] = this._selectedKeys;
      const config = {
         source: options.source,
         keyProperty: options.keyProperty,
         filter,
         emptyText: options.emptyText,
         emptyKey: options.emptyKey,
         selectedKeys: this._selectedKeys,
         selectedItemsChangedCallback: options.selectedItemsChangedCallback
      };
      return this._loadItems(config);
   }

   private _reloadSelectedItems(options: IDropdownControllerOptions): Promise<void> {
      return this._loadSelectedItems(options).then((newItems) => {
         this._selectedItems = newItems;
         this._resolveLoadedItems(options, this._items);
      });
   }

   private _resolveLoadedItems(options: IDropdownControllerOptions, items: RecordSet<Model>): RecordSet<Model> {
      if (options.dataLoadCallback && !isHistorySource(this._source)) {
         options.dataLoadCallback(items);
      }
      if (this._selectedItems) {
         items.prepend(this._getNewItems(items, this._selectedItems, options.keyProperty));
         this._selectedItems = null;
      }
      this._setItemsAndMenuSource(items);
      this._updateSelectedItems(options);
      if (items && this._isOpened) {
         this._open();
      }
      return items;
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

   private _updateSelectedItems({selectedKeys,
                                 keyProperty,
                                 emptyText,
                                 emptyKey,
                                 selectedItemsChangedCallback}: Partial<IDropdownControllerOptions>,
                                items: RecordSet = this._items): void {
      const selectedItems = [];

      const addEmptyTextToSelected = () => {
         selectedItems.push(null);
         this._selectedKeys = [emptyKey];
      };

      const addToSelected = (key: string) => {
         const selectedItem = this._getItemByKey(items, key, keyProperty);

         if (selectedItem) {
            selectedItems.push(selectedItem);
         }
      };

      if (selectedItemsChangedCallback) {
         if (!selectedKeys || !selectedKeys.length || selectedKeys[0] === emptyKey) {
            if (emptyText) {
               addEmptyTextToSelected();
            } else {
               addToSelected(emptyKey);
            }
         } else {
            factory(selectedKeys).each((key: string) => {
               // fill the array of selected items from the array of selected keys
               addToSelected(key);
            });
            if (selectedKeys[0] !== undefined && !selectedItems.length && emptyText) {
               addEmptyTextToSelected();
            }
         }

         selectedItemsChangedCallback(selectedItems);
      }
   }

   private _getUnloadedKeys(items: RecordSet, options: IDropdownControllerOptions): string[] {
      const keys = [];
      this._selectedKeys.forEach((key) => {
         if (key !== options.emptyKey && !this._getItemByKey(items, key, options.keyProperty)) {
            keys.push(key);
         }
      });
      return keys;
   }

   private _getNewItems(items: RecordSet, selectedItems: RecordSet, keyProperty: string): Model[] {
      const newItems = [];

      factory(selectedItems).each((item) => {
         if (!this._getItemByKey(items, item.get(keyProperty), keyProperty)) {
            newItems.push(item);
         }
      });
      return newItems;
   }

   private _prepareItem(item, keyProperty, source): Model {
      if (this._isHistoryMenu()) {
         // В историческом меню в emptyItem ключ пишется в поле copyOriginalId.
         // Поле keyProperty заполняется значением по умолчанию, которое может не совпадать с emptyKey.
         if (isEmptyItem(item, this._options.emptyText, item.getKeyProperty(), this._options.emptyKey)) {
            item.set(keyProperty, item.getKey());
         }
         return source.resetHistoryFields(item, keyProperty);
      } else {
         return item;
      }
   }

   private _updateHistory(items): void {
      if (isHistorySource(this._source)) {
         // FIXME https://online.sbis.ru/opendoc.html?guid=300c6a3f-6870-492e-8308-34a457ad7b85
         if (this._options.emptyText) {
            const item = this._items.getRecordById(this._options.emptyKey);
            if (item) {
               this._items.remove(item);
            }
         }
         this._source.update(items, getMetaHistory()).then(() => {
            if (this._sourceController && this._source.getItems) {
               this._setItemsAndMenuSource(this._source.getItems());
            }
         });
      }
   }

   private _closeDropdownList(): void {
      this._sticky.close();
      this._isOpened = false;
   }

   private _templateOptionsChanged(newOptions, options): boolean {
      const isTemplateChanged = (tplOption) => {
         return typeof newOptions[tplOption] === 'string' && newOptions[tplOption] !== options[tplOption];
      };

      if (isTemplateChanged('headTemplate') ||
          isTemplateChanged('itemTemplate') ||
          isTemplateChanged('footerContentTemplate')) {
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
         let templates = ['headTemplate', 'headerTemplate', 'itemTemplate', 'footerContentTemplate'];
         templates.forEach((template) => {
            if (typeof options[template] === 'string') {
               templatesToLoad.push(options[template]);
            }
         });
         this._loadMenuTempPromise = mStubs.require(templatesToLoad).then((loadedDeps) => {
            return loadedDeps[0].Control.loadCSS(options.theme);
         }).catch((error) => Promise.reject(error));
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

   private _isHistoryMenu(): boolean {
      return isHistorySource(this._source) && this._items && this._items.at(0).has('HistoryId');
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
         selectedKeys: this._selectedKeys,
         dataLoadCallback: null,
         closeButtonVisibility: false,
         emptyText: this._getEmptyText(),
         allowPin: this._options.allowPin && this._hasHistory(this._options),
         keyProperty: this._isHistoryMenu() ? 'copyOriginalId' : baseConfig.keyProperty,
         headerTemplate: this._options.headTemplate || this._options.headerTemplate,
         footerContentTemplate: this._options.footerContentTemplate,
         items: !this._isHistoryMenu() ? this._items : null,
         source: this._menuSource,
         filter: this._filter,
         // FIXME this._container[0] delete after
         // https://online.sbis.ru/opendoc.html?guid=d7b89438-00b0-404f-b3d9-cc7e02e61bb3
         width: this._options.width !== undefined ?
             (this.target[0] || this.target).offsetWidth :
             undefined,
         hasMoreButton: this._sourceController.hasMoreData('down')
      };
      const config = {
         templateOptions: Object.assign(baseConfig, templateOptions),
         className: this._options.popupClassName + ` controls_dropdownPopup_theme-${this._options.theme}
          controls_popupTemplate_theme-${this._options.theme}`,
         template: 'Controls/menu:Popup',
         actionOnScroll: 'close',
         target: this.target,
         targetPoint: this._options.targetPoint,
         opener: this._popupOptions.opener || this._options.openerControl,
         fittingMode: {
            vertical: 'adaptive',
            horizontal: 'overflow'
         },
         autofocus: false,
         closeOnOutsideClick: this._options.closeMenuOnOutsideClick
      };
      const popupConfig = Merge(popupOptions, this._options.menuPopupOptions || {});
      const result = Merge(config, popupConfig || {});
      const root = result.templateOptions.root;
      if (root) {
         this._updateSourceInOptions(root, result);
      }
      return result;
   }

   private _updateSourceInOptions(root: string, result): void {
      const parent = this._items.getRecordById(root).getKey();
      if (this._items.getIndexByValue(this._options.parentProperty, parent) === -1) {
         result.templateOptions.source = this._options.source;
      }
   }
}

_Controller.getDefaultOptions = function getDefaultOptions() {
   return {
      filter: {},
      selectedKeys: [],
      allowPin: true
   };
};

Object.defineProperty(_Controller, 'defaultProps', {
   enumerable: true,
   configurable: true,

   get(): object {
      return _Controller.getDefaultOptions();
   }
});

_Controller.getOptionTypes = function getOptionTypes() {
   return {
      selectedKeys: descriptor(Array)
   };
};
/**
 * @event Происходит при изменении набора выбранных элементов.
 * @name Controls/_dropdown/_Controller#selectedItemsChanged
 * @param {UICommon/Events:SyntheticEvent} eventObject Дескриптор события.
 * @param {Types/collection:RecordSet} items Выбранные элементы.
 */

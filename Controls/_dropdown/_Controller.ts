// @ts-ignore
import * as Control from 'Core/Control';
// @ts-ignore
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
import {PrefetchProxy, ICrudPlus} from 'Types/source';
import * as mStubs from 'Core/moduleStubs';
import * as cInstance from 'Core/core-instance';
import * as Merge from 'Core/core-merge';

/**
 * Контроллер для выпадающих списков.
 *
 * @class Controls/_dropdown/_Controller
 * @extends Core/Control
 * @mixes Controls/_dropdown/interface/IDropdownController
 * @author Красильников А.С.
 *
 * @private
 */

/*
 * Controller for dropdown lists
 *
 * @class Controls/_dropdown/_Controller
 * @extends Core/Control
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
   protected _sourceController: SourceController = null;
   private _filter: object;
   private _selectedItems: RecordSet<Model>;
   private _sticky: StickyOpener;

   constructor(options: IDropdownControllerOptions) {
      this._options = options;
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
      const filter = {...this._options.filter};
      filter[this._options.keyProperty] = this._options.selectedKeys;
      const config = {
         source: this._options.source,
         keyProperty: this._options.keyProperty,
         filter,
         emptyText: this._options.emptyText,
         selectedKeys: this._options.selectedKeys,
         selectedItemsChangedCallback: this._options.selectedItemsChangedCallback
      };
      return this._loadItems(config).then((newItems) => {
         this._selectedItems = newItems;
         this._setItems(null);
         return {
            items: newItems,
            history: null
         };
      });
   }

   updateSelectedItems(items: RecordSet<Model>): void {
      if (items) {
         this._selectedItems = items;
         this._updateSelectedItems(
             this._options.emptyText,
             this._options.selectedKeys,
             this._options.keyProperty,
             this._options.selectedItemsChangedCallback,
             items);
      }
   }

   setItems(items?: RecordSet): Promise<SourceController> {
      return this._getSourceController(this._options).then((sourceController) => {
         this._setItems(items);
         sourceController.calculateState(this._items);

         this._updateSelectedItems(this._options.emptyText, this._options.selectedKeys,
             this._options.keyProperty, this._options.selectedItemsChangedCallback);
         if (this._options.dataLoadCallback) {
            this._options.dataLoadCallback(this._items);
         }

         return sourceController;
      });
   }

   setHistoryItems(history?: RecordSet): void {
      if (history) {
         this._source.setHistory(history);
         this._setItems(this._source.prepareItems(this._items));
      }
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
            return this.reload();
         }
      } else if (newOptions.selectedKeys !== oldOptions.selectedKeys && this._items) {
         this._updateSelectedItems(newOptions.emptyText, newOptions.selectedKeys,
             newOptions.keyProperty, newOptions.selectedItemsChangedCallback);
      }
   }

   reload(): Promise<RecordSet> {
      return this._loadItems(this._options).addCallback((items) => {
         if (items && this._isOpened) {
            this._open();
         }
      });
   }

   loadDependencies(): Promise<unknown[]> {
      const deps = [this._loadMenuTemplates(this._options)];

      if (!this._items) {
         deps.push(this._getloadItemsPromise()
             .then(() => this._loadItemsTemplates(this._options))
             .catch((error) => {
               return Promise.reject(error);
            })
         );
      } else {
         deps.push(this._loadItemsTemplates(this._options));
      }

      return Promise.all(deps);
   }

   setMenuPopupTarget(target): void {
      this.target = target;
   }

   openMenu(popupOptions?: object): Promise<any> {
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
      this._sticky = null;
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
         this._setItems(this._items);
      }
   }

   handleClose(): void {
      this._isOpened = false;
      this._menuSource = null;
   }

   pinClick(item): void {
      const preparedItem = this._prepareItem(item, this._options.keyProperty, this._source);
      this._source.update(preparedItem.clone(), {
         $_pinned: !preparedItem.get('pinned')
      });
      this._setItems(null);
      this._open();
   }

   private _open(popupOptions?: object): Promise<unknown[]> {
      if (this._options.readOnly) {
         return Promise.resolve();
      }
      if (popupOptions) {
         this._popupOptions =  popupOptions;
      }
      const openPopup = () => {
         return this._sticky.open(this._getPopupOptions(this._popupOptions));
      };

      return this.loadDependencies().then(
          () => {
             const count = this._items.getCount();
             if (count > 1 || count === 1 && (this._options.emptyText || this._options.footerContentTemplate)) {
                this._createMenuSource(this._items);
                this._isOpened = true;
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

   private _getloadItemsPromise(): Promise<any> {
      if (this._items) {
         // Обновляем данные в источнике, нужно для работы истории
         this._setItems(this._items);
         this._loadItemsPromise = Promise.resolve();
      } else if (!this._loadItemsPromise || this._loadItemsPromise.resolved && !this._items) {
         if (this._options.source && !this._items) {
            this._loadItemsPromise = this._loadItems(this._options);
         } else {
            this._loadItemsPromise = Promise.resolve();
         }
      }
      return this._loadItemsPromise;
   }

   private _getEmptyText(): string {
      return prepareEmpty(this._options.emptyText);
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
      let menuItems = items;
      if (this._options.needLoadSelectedItems && this._isHistoryMenu()) {
         // FIXME https://online.sbis.ru/opendoc.html?guid=300c6a3f-6870-492e-8308-34a457ad7b85
         menuItems = items.clone();
      }
      this._menuSource = new PrefetchProxy({
         target: this._source,
         data: {
            query: menuItems
         }
      });
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

   private _getSourceController(options): Promise<SourceController> {
      let sourcePromise;

      if (this._hasHistory(options) && this._isLocalSource(options.source) && !options.historyNew) {
         sourcePromise = getSource(this._source ||options.source, options.historyId);
      } else {
         sourcePromise = Promise.resolve(options.source);
      }
      return sourcePromise.then((source) => {
         this._source = source;
         this._filter = this._prepareFilterForQuery(options);
         return this._createSourceController(options, this._filter);
      });
   }

   private _loadItems(options: IDropdownControllerOptions): Promise<RecordSet|Error> {
      return this._getSourceController(options).then((sourceController) => {

             return sourceController.load().then((items) => {
                return this._resolveLoadedItems(options, items);
             }, (error) => {
                this._loadError(error);
                return error;
             });
          });
   }

   private _resolveLoadedItems(options: IDropdownControllerOptions, items: RecordSet<Model>): RecordSet<Model> {
      if (options.dataLoadCallback) {
         options.dataLoadCallback(items);
      }
      if (this._selectedItems) {
         items.prepend(this._getNewItems(items, this._selectedItems, options.keyProperty));
         this._selectedItems = null;
      }
      this._setItems(items);
      this._updateSelectedItems(
          options.emptyText,
          options.selectedKeys,
          options.keyProperty,
          options.selectedItemsChangedCallback);
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

   private _updateSelectedItems(emptyText, selectedKeys, keyProperty, selectedItemsChangedCallback, items?) {
      const selectedItems = [];

      const addToSelected = (key: string) => {
         const selectedItem = this._getItemByKey(items || this._items, key, keyProperty);

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
         factory(selectedKeys).each( (key) => {
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
         if (isEmptyItem(item, this._options.emptyText, item.getKeyProperty())) {
            item.set(keyProperty, item.getKey());
         }
         return source.resetHistoryFields(item, keyProperty);
      } else {
         return item;
      }
   }

   private _updateHistory(items): void {
      if (isHistorySource(this._source)) {
         this._source.update(items, getMetaHistory());

         if (this._sourceController && this._source.getItems) {
            this._setItems(this._source.getItems());
         }
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
         let templates = ['headTemplate', 'itemTemplate', 'footerContentTemplate'];
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
         dataLoadCallback: null,
         closeButtonVisibility: false,
         emptyText: this._getEmptyText(),
         allowPin: this._options.allowPin && this._hasHistory(this._options),
         keyProperty: this._isHistoryMenu() ? 'copyOriginalId' : baseConfig.keyProperty,
         headerTemplate: this._options.headTemplate || this._options.headerTemplate,
         footerContentTemplate: this._options.footerContentTemplate,
         items: this._items,
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
         className: this._options.popupClassName,
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
         closeOnOutsideClick: true
      };
      const popupConfig = Merge(popupOptions, this._options.menuPopupOptions || {});
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
/**
 * @event Происходит при изменении набора выбранных элементов.
 * @name Controls/_dropdown/_Controller#selectedItemsChanged
 * @param {Vdom/Vdom:SyntheticEvent} eventObject Дескриптор события.
 * @param {Types/collection:RecordSet} items Выбранные элементы.
 */

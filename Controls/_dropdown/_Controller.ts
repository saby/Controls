// @ts-ignore
import * as Control from 'Core/Control';
// @ts-ignore
import {StickyOpener} from 'Controls/popup';
import IDropdownController, {IDropdownControllerOptions} from 'Controls/_dropdown/interface/IDropdownController';
import {factory} from 'Types/chain';
import {isHistorySource} from 'Controls/_dropdown/dropdownHistoryUtils';
import {prepareEmpty} from 'Controls/_dropdown/Util';
import {Controller as SourceController} from 'Controls/source';
import {isEqual} from 'Types/object';
import * as mStubs from 'Core/moduleStubs';
import {descriptor, Model} from 'Types/entity';
import {RecordSet} from 'Types/collection';
import {PrefetchProxy} from 'Types/source';
import * as Merge from 'Core/core-merge';
import {DropdownReceivedState} from 'Controls/_dropdown/BaseDropdown';

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

export default class _Controller implements IDropdownController {
   protected _items: RecordSet = null;
   protected _loadItemsTempPromise: Promise<any> = null;
   protected _options: IDropdownControllerOptions = null;

   constructor(options: IDropdownControllerOptions) {
      this._options = options;
      this._sticky = new StickyOpener();
   }

   loadItems(): Promise<DropdownReceivedState> {
      return new Promise((resolve) => {
         this._loadItems(this._options).addCallback((items) => {
            const beforeMountResult = {};

            if (isHistorySource(this._source)) {
               beforeMountResult.history = this._source.getHistory();
               beforeMountResult.items = this._source.getItems(false);
            } else {
               beforeMountResult.items = items;
            }

            resolve(beforeMountResult);
         });
      });
   }

   setItems(items?: RecordSet): Promise<RecordSet> {
      return this._getSourceController(this._options).addCallback((sourceController) => {
         this.updateItems(items);
         sourceController.calculateState(this._items);

         this._updateSelectedItems(this._options.menuOptions.emptyText, this._options.menuOptions.selectedKeys,
             this._options.menuOptions.keyProperty, this._options.menuOptions.selectedItemsChangedCallback);
         if (this._options.menuOptions.dataLoadCallback) {
            this._options.menuOptions.dataLoadCallback(this._items);
         }

         return sourceController;
      });
   }

   update(newOptions: IDropdownControllerOptions): Promise<RecordSet>|void {
      const oldOptions = {...this._options};
      this._options = newOptions;
      if (newOptions.readOnly && newOptions.readOnly !== oldOptions.readOnly) {
         this._closeDropdownList();
      }

      if (this._templateOptionsChanged(newOptions.menuOptions, oldOptions.menuOptions)) {
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
         if (newOptions.menuOptions.lazyItemsLoading && !this._isOpened) {
            /* source changed, items is not actual now */
            this.updateItems(null);
         } else {
            return this.reload();
         }
      } else if (newOptions.menuOptions.selectedKeys !== oldOptions.menuOptions.selectedKeys && this._items) {
         this._updateSelectedItems(newOptions.menuOptions.emptyText, newOptions.menuOptions.selectedKeys,
             newOptions.menuOptions.keyProperty, newOptions.menuOptions.selectedItemsChangedCallback);
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
         deps.push(this._getloadItemsPromise().then(() => this._loadItemsTemplates(this._options)));
      } else {
         deps.push(this._loadItemsTemplates(this._options));
      }

      return Promise.all(deps);
   }

   setMenuPopupTarget(target): void {
      if (!this.target) {
         this.target = target;
      }
   }

   openMenu(popupOptions?: object): Promise<unknown[]> {
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
      this.updateItems(null);
      this._closeDropdownList();
      this._sticky = null;
   }

   updateItems(items: RecordSet|null): void {
      if (items) {
         this._createMenuSource(items);
      } else {
         this._loadItemsPromise = null;
      }
      this._items = items;
   }

   handleClose(): void {
      this._isOpened = false;
      this._menuSource = null;
   }

   setFilter(filter) {
      this._options.filter = filter;
   }

   getSourceController(): Control {
      return this._sourceController;
   }

   resetSourceController(): void {
      this._sourceController = null;
   }

   getItems(): RecordSet {
      return this._items;
   }

   private _open(popupOptions?: object): string|Promise<unknown[]> {
      if (this._options.readOnly) {
         return Promise.resolve();
      }
      if (popupOptions) {
         this._popupOptions =  popupOptions;
      }
      const openPopup = () => {
         return this._sticky.open(this._getPopupOptions(this._popupOptions))
      };

      return this.loadDependencies().then(
          () => {
             const count = this._items.getCount();
             if (count > 1 || count === 1 && (this._options.menuOptions.emptyText || this._options.menuOptions.footerTemplate)) {
                this._createMenuSource(this._items);
                this._isOpened = true;
                return openPopup();
             } else if (count === 1) {
                return Promise.resolve([this._items.at(0)]);
             }
          },
          () => {
             if (this._menuSource) {
                return openPopup();
             }
          }
      );
   }

   private _getloadItemsPromise(): Promise<any> {
      if (this._items) {
         // Обновляем данные в источнике, нужно для работы истории
         this.updateItems(this._items);
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
      return prepareEmpty(this._options.menuOptions.emptyText);
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

   private _loadError(error: Error): void {
      if (this._options.menuOptions.dataLoadErrback) {
         this._options.menuOptions.dataLoadErrback(error);
      }
      this._loadItemsPromise = null;
      this._createMenuSource(error);
   }

   private _getSourceController(options): Promise<SourceController> {
      return new Promise((resolve) => {
         this._source = options.source;
         resolve(this._createSourceController(options));
      });
   }

   private _loadItems(options) {
      return this._getSourceController(options).then(
          (sourceController) => {
             return sourceController.load(options.filter).addCallback((items) => {
                if (options.menuOptions.dataLoadCallback) {
                   options.menuOptions.dataLoadCallback(items);
                }
                this.updateItems(items);
                this._updateSelectedItems(
                    options.menuOptions.emptyText,
                    options.menuOptions.selectedKeys,
                    options.menuOptions.keyProperty,
                    options.menuOptions.selectedItemsChangedCallback);
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
         factory(selectedKeys).each( (key) => {
            // fill the array of selected items from the array of selected keys
            addToSelected(key);
         });
      }
      if (selectedItemsChangedCallback) {
         selectedItemsChangedCallback(selectedItems);
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
          itemTemplateProperty = options.menuOptions.itemTemplateProperty;

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
      let baseConfig = {...this._options, ...this._options.menuOptions};
      let templateOptions = {
         closeButtonVisibility: false,
         emptyText: this._getEmptyText(),
         items: this._items,
         source: this._menuSource,
         // FIXME this._container[0] delete after
         // https://online.sbis.ru/opendoc.html?guid=d7b89438-00b0-404f-b3d9-cc7e02e61bb3
         width: this._options.menuOptions.width !== undefined ?
             (this.target[0] || this.target).offsetWidth :
             undefined,
         hasMoreButton: this._sourceController.hasMoreData('down')
      };
      const config = {
         templateOptions: Object.assign(baseConfig, templateOptions),
         template: 'Controls/menu:Popup',
         className: baseConfig.className,
         targetPoint: baseConfig.targetPoint,
         actionOnScroll: 'close',
         target: this.target,
         opener: this._popupOptions.opener || this._options.openerControl,
         fittingMode: {
            vertical: 'adaptive',
            horizontal: 'overflow'
         },
         autofocus: false,
         closeOnOutsideClick: true
      };
      const popupConfig = Merge(popupOptions, this._options.menuOptions.menuPopupOptions || {});
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

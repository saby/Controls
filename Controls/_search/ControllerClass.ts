import {QueryWhereExpression} from 'Types/source';
import {RecordSet} from 'Types/collection';
import {NewSourceController} from 'Controls/dataSource';
import {Logger} from 'UI/Utils';
import {IHierarchyOptions, ISearchOptions, TKey} from 'Controls/interface';
import {IHierarchySearchOptions} from 'Controls/interface/IHierarchySearch';
import * as getSwitcherStrFromData from 'Controls/_search/Misspell/getSwitcherStrFromData';

type TViewMode = 'search' | 'tile' | 'table' | 'list';

export interface ISearchControllerOptions extends ISearchOptions,
   IHierarchyOptions,
   IHierarchySearchOptions {
   sourceController?: NewSourceController;
   searchValue?: string;
   root?: TKey;
   viewMode?: TViewMode;
   items?: RecordSet;
   searchStartCallback?: Function;
   deepReload?: boolean;
}

const SERVICE_FILTERS = {
   HIERARCHY: {
      Разворот: 'С разворотом',
      usePages: 'full'
   }
};

const SEARCH_STARTED_ROOT_FIELD = 'searchStartedFromRoot';

/**
 * Класс контроллер, реализующий поиск по заданному значению, либо сброс поиска.
 * Имеется возможность поиска в дереве и плоском списке.
 * @remark
 * Если при инициализации экземпляра класса не передавать опцию sourceController,
 * то рекомендуется его передать в опциях в метод {@link /docs/js/Controls/search/ControllerClass/methods/update/ ControllerClass#update}, иначе при попытке поиска или сброса возникнут ошибки.
 * Если в методе update в опциях передать новые sourceController и searchValue, то поиск или сброс будут произведены
 * на новом sourceController.
 * Если же передать только новый sourceController, то будет произведен поиск или сброс по старому searchValue.
 * Поле, переданное через опцию searchParam, при сбросе поиска будет удалено из фильтра.
 *
 * @example
 * При создании экзепмляра класса можно передать опцией {@link Controls/dataSource:NewSourceController sourceController}
 * <pre>
 * const controllerClass = new ControllerClass({
 *   sourceController: new SourceController(...)
 * });
 * </pre>
 * Поиск по значению "test". Результат поиска в then
 * <pre>
 *    controllerClass.search('test').then((result) => {...});
 * </pre>
 * Сброс поиска. Может вернуть фильтр без загрузки, если предеать аргументом true
 * <pre>
 *    controllerClass.reset().then((result) => {...}); // Будут сброшены все фильтры, результат загрузки в result
 *
 *    const filter = controllerClass.reset(true); // Вернет фильтр после сброса. Загрузка произведена не будет
 * </pre>
 * Обновление контроллера с передачей новых опций
 * <pre>
 *    controllerClass.update({
 *       searchValue: 'new test',
 *       root: 'newRoot'
 *    }).then((result) => {...}); // Результат поиска после передачи нового значения посредством опций
 * </pre>
 *
 * @implements Controls/interface:ISearch
 * @implements Controls/interface:IHierarchy
 * @implements Controls/interface/IHierarchySearch
 * @public
 * @demo Controls-demo/Search/FlatList/Index Поиск в плоском списке
 * @author Крюков Н.Ю.
 */

export default class ControllerClass {
   protected _options: ISearchControllerOptions = null;

   private _searchValue: string = '';
   private _misspellValue: string = '';
   private _searchInProgress: boolean = false;
   private _sourceController: NewSourceController = null;
   private _searchPromise: Promise<RecordSet|Error>;

   private _root: TKey = null;
   private _rootBeforeSearch: TKey = null;
   private _path: RecordSet = null;

   private _viewMode: TViewMode;
   private _previousViewMode: TViewMode;

   constructor(options: ISearchControllerOptions) {
      this._options = options;
      this._dataLoadCallback = this._dataLoadCallback.bind(this);

      if (options.sourceController) {
         this._sourceController = options.sourceController;
         this._sourceController.subscribe('dataLoad', this._dataLoadCallback);
         this._path = ControllerClass._getPath(this._sourceController.getItems());
      }

      if (options.searchValue !== undefined) {
         this._searchValue = options.searchValue;
      }

      if (options.root !== undefined) {
         this.setRoot(options.root);
      }

      if (options.items) {
         this._path = options.items.getMetaData().path;
      }

      this._previousViewMode = this._viewMode = options.viewMode;
   }

   /**
    * Сброс поиска.
    * Производит очистку фильтра, затем загрузку в sourceController с обновленными параметрами.
    * Если аргумент dontLoad установлен в true, то функция вернет просто фильтр без загрузки.
    * @param {boolean} [dontLoad] Производить ли загрузку из источника, или вернуть обновленный фильтр
    */
   reset(): Promise<RecordSet | Error>;
   reset(dontLoad: boolean): QueryWhereExpression<unknown>;
   reset(dontLoad?: boolean): Promise<RecordSet | Error> | QueryWhereExpression<unknown> {
      this._checkSourceController();
      this._searchValue = '';
      this._misspellValue = '';
      this._viewMode = this._previousViewMode;
      this._previousViewMode = null;
      if (this._rootBeforeSearch && this._root !== this._rootBeforeSearch) {
         this._root = this._rootBeforeSearch;
      }
      if (!this._isSearchMode() && this._options.parentProperty) {
         this._sourceController.setRoot(this._root);
      }
      this._rootBeforeSearch = null;
      const filter = this._getFilter();

      if (!dontLoad) {
         return this._updateFilterAndLoad(filter, this._getRoot());
      }

      return filter;
   }

   /**
    * Произвести поиск по значению.
    * @param {string} value Значение, по которому будет производиться поиск
    */
   search(value: string): Promise<RecordSet | Error> {
      const newSearchValue = this._trim(value);
      this._checkSourceController();

      if (this._viewMode !== 'search') {
         this._previousViewMode = this._viewMode;
         this._viewMode = 'search';
      }

      if (this._searchValue !== newSearchValue || !this._searchPromise) {
         this._searchValue = newSearchValue;
         if (!this._rootBeforeSearch &&
             this._root !== this._rootBeforeSearch) {
            this._rootBeforeSearch = this._root;
         }
         return this._updateFilterAndLoad(
             this._getFilter(),
             this._getRoot()
         );
      } else if (this._searchPromise) {
         return this._searchPromise;
      }
   }

   /**
    * Обновить опции контроллера.
    * Если в новых опциях будет указано отличное от старого searchValue, то будет произведен поиск, или же сброс,
    * если новое значение - пустая строка.
    * @param {Partial<ISearchControllerOptions>} options Новые опции
    * @example
    * Поиск будет произведен по новому значению searchValue через новый sourceController, которые переданы в опциях.
    * <pre>
    *    searchController.update({
    *       sourceController: new SourceController(...),
    *       searchValue: 'new value'
    *    }).then((result) => {...});
    * </pre>
    * Поиск будет произведен по старому значению searchValue, но посредством нового sourceController
    * <pre>
    *    searchController.update({
    *       sourceController: new SourceController(...)
    *    }).then((result) => {...});
    * </pre>
    */
   update(options: Partial<ISearchControllerOptions>): void | Promise<RecordSet|Error> | QueryWhereExpression<unknown> {
      let updateResult: void | Promise<RecordSet|Error> | QueryWhereExpression<unknown>;
      let needLoad = false;
      const searchValue = options.hasOwnProperty('searchValue') ? options.searchValue : this._options.searchValue;
      let sourceControllerChanged = false;

      if (this._options.root !== options.root) {
         this.setRoot(options.root);
      }

      if (options.sourceController && options.sourceController !== this._sourceController) {
         this._sourceController = options.sourceController;
         sourceControllerChanged = true;
         needLoad = true;
      }

      if (options.hasOwnProperty('searchValue')) {
         if (searchValue !== this._searchValue) {
            needLoad = true;
         }
      }
      if (needLoad) {
         if (searchValue) {
            updateResult = this.search(searchValue);
         } else if (this._searchValue || sourceControllerChanged) {
            updateResult = this.reset();
         }
      }
      // TODO: Должны ли использоваться новые опции в reset или search?
      this._options = {
         ...this._options,
         ...options
      };
      return updateResult;
   }

   /**
    * Установить корень для поиска в иерархическом списке.
    * @param {string|number|null} value Значение корня
    */
   setRoot(value: TKey): void {
      this._root = value;
   }

   /**
    * Получить корень поиска по иерархическому списку.
    */
   getRoot(): TKey {
      return this._root;
   }

   /**
    * Получить значение по которому производился поиск
    */
   getSearchValue(): string {
      return this._searchValue;
   }

   isSearchInProcess(): boolean {
      return this._searchInProgress;
   }

   getFilter(): QueryWhereExpression<unknown> {
      return this._getFilter();
   }

   setPath(path: RecordSet): void {
      this._path = path;
   }

   needChangeSearchValueToSwitchedString(items: RecordSet): boolean {
      const metaData = items && items.getMetaData();
      return metaData ? metaData.returnSwitched : false;
   }

   getExpandedItemsForOpenRoot(root: TKey, items: RecordSet): TKey[] {
      const expandedItems = [];
      let item;
      let nextItemKey = root;
      do {
         item = items.getRecordById(nextItemKey);
         nextItemKey = item.get(this._options.parentProperty);
         expandedItems.unshift(item.getId());
      } while (nextItemKey !== this.getRoot());

      return expandedItems;
   }

   getViewMode(): TViewMode {
      return this._viewMode;
   }

   getMisspellValue(): string {
      return this._misspellValue;
   }

   private _dataLoadCallback(event: unknown, items: RecordSet): void {
      const filter = this._getFilter();
      const sourceController = this._sourceController;
      const isSearchMode = this._isSearchMode();

      if (this.isSearchInProcess() && this._searchValue) {
         this._sourceController.setFilter(filter);
         if (!this._options.deepReload && !sourceController.isExpandAll()) {
            sourceController.setExpandedItems([]);
         }

         if (this._options.startingWith === 'root' && !isSearchMode && this._options.parentProperty) {
            const newRoot = ControllerClass._getRoot(this._path, this._root, this._options.parentProperty);

            if (newRoot !== this._root) {
               this._root = newRoot;
            }
         }

         sourceController.setFilter(this._getFilter());
      } else if (!this._searchValue) {
         this._misspellValue = '';
      }
      if (this._searchValue) {
         this._misspellValue = getSwitcherStrFromData(items);
      }
      this._path = ControllerClass._getPath(items);
   }

   private _getFilter(): QueryWhereExpression<unknown> {
      if (this._searchValue) {
         return this._getFilterWithSearchValue();
      } else {
         return this._getFilterWithoutSearchValue();
      }
   }

   private _getRoot(): TKey {
      let root = this._root;

      if (this._root !== undefined && this._options.parentProperty && this._searchValue) {
         if (this._options.startingWith === 'current') {
            root = this._root;
         } else {
            root = ControllerClass._getRoot(this._path, this._root, this._options.parentProperty);
         }
      }

      return root;
   }

   private _getFilterWithSearchValue(): QueryWhereExpression<unknown> {
      const filter = {...this._sourceController.getFilter()};
      filter[this._options.searchParam] = this._searchValue;

      if (this._options.parentProperty) {
         if (this._root !== undefined) {
            const root = this._getRoot();

            if (root !== undefined) {
               filter[this._options.parentProperty] = root;
            } else {
               delete filter[this._options.parentProperty];
            }
         }
         if (this._options.startingWith === 'root' && this._rootBeforeSearch !== undefined) {
            filter[SEARCH_STARTED_ROOT_FIELD] = this._rootBeforeSearch;
         }
         Object.assign(filter, SERVICE_FILTERS.HIERARCHY);
      }

      return filter;
   }

   private _getFilterWithoutSearchValue(): QueryWhereExpression<unknown> {
      const filter = {...this._sourceController.getFilter()};
      delete filter[this._options.searchParam];

      if (this._options.parentProperty) {
         for (const i in SERVICE_FILTERS.HIERARCHY) {
            if (SERVICE_FILTERS.HIERARCHY.hasOwnProperty(i)) {
               delete filter[i];
            }
         }

         this._deleteRootFromFilter(filter);
         delete filter[SEARCH_STARTED_ROOT_FIELD];
      }

      return filter;
   }

   private _updateFilterAndLoad(filter: QueryWhereExpression<unknown>, root: TKey): Promise<RecordSet|Error> {
      this._searchStarted(filter);
      this._sourceController.setRoot(root);

      // Перезададим параметры навигации т.к. они могли измениться.
      // Сейчас explorer хранит у себя ссылку на объект navigation и меняет в нем значение position
      // Правим по задаче https://online.sbis.ru/opendoc.html?guid=4f23b2e1-89ea-4a1d-bd58-ce7f9d00b58d
      if (!this._sourceController.isLoading()) {
         this._sourceController.setNavigation(null);
         this._sourceController.setNavigation(this._options.navigation);
      }

      return this._searchPromise =
          this._sourceController
              .load(undefined, undefined, filter)
              .catch((error) => {
                 if (!error || !error.isCanceled) {
                    this._sourceController.setFilter(filter);
                 }
                 return Promise.reject(error);
              })
              .finally(() => {
                 this._searchEnded();
                 this._searchPromise = null;
              });
   }

   private _deleteRootFromFilter(filter: QueryWhereExpression<unknown>): void {
      if (this._options.startingWith === 'current') {
         delete filter[this._options.parentProperty];
      }
   }

   private _trim(value: string): string {
      return this._options.searchValueTrim && value ? value.trim() : value;
   }

   private _checkSourceController(): void {
      if (!this._sourceController) {
         Logger.error('_search/ControllerClass: sourceController не обнаружен. ' +
            'Если sourceController не был передан при инициализации, ' +
            'то рекомендуется передать его в метод _search/ControllerClass#update');
      }
   }

   private _searchStarted(filter: QueryWhereExpression<unknown>): void {
      this._searchInProgress = true;
      if (this._options.searchStartCallback) {
         this._options.searchStartCallback(filter);
      }
   }

   private _searchEnded(): void {
      this._searchInProgress = false;
   }

   private _isSearchMode(): boolean {
      return !!this._sourceController.getFilter()[this._options.searchParam];
   }

   private static _getPath(items: RecordSet): RecordSet {
      return items && items.getMetaData().path;
   }

   private static _getRoot(path: RecordSet, currentRoot: TKey, parentProperty: string): TKey {
     let root;

     if (path && path.getCount() > 0) {
         root = path.at(0).get(parentProperty);
     } else {
         root = currentRoot;
     }

     return root;
   }
}

/**
 * @name Controls/_search/ControllerClass#sourceController
 * @cfg {NewSourceController} Экземпляр контроллера источника для выполнения поиска
 */

/**
 * @name Controls/_search/ControllerClass#searchValue
 * @cfg {string} Значение по которому будет осуществляться поиск
 */

/**
 * @name Controls/_search/ControllerClass#root
 * @cfg {string | number | null} Корень для поиска по иерархии
 */

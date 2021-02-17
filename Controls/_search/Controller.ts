import {Control, TemplateFunction, IControlOptions} from 'UI/Base';
import * as template from 'wml!Controls/_search/Controller';
import {EventUtils} from 'UI/Events';
import {ContextOptions as DataOptions} from 'Controls/context';
import {RecordSet} from 'Types/collection';
import {default as SearchController} from 'Controls/_search/ControllerClass';
import {SyntheticEvent} from 'Vdom/Vdom';
import {ISearchOptions} from 'Controls/_interface/ISearch';
import {IHierarchySearchOptions} from 'Controls/interface/IHierarchySearch';
import {ISourceOptions} from 'Controls/_interface/ISource';
import {IHierarchyOptions} from 'Controls/_interface/IHierarchy';
import {
   ISourceControllerOptions,
   NewSourceController as SourceController
} from 'Controls/dataSource';
import {QueryWhereExpression} from 'Types/source';
import * as getSwitcherStrFromData from 'Controls/_search/Misspell/getSwitcherStrFromData';

/**
 * Контрол используют в качестве контроллера для организации поиска в реестрах.
 * Он обеспечивает связь между {@link Controls/search:InputContainer} и {@link Controls/list:Container} — контейнерами
 * для строки поиска и списочного контрола соответветственно.
 * С помощью этого контрола можно настроить: временную задержку между вводом символа и началом поиска, количество символов, с которых начинается поиск, параметры фильтрации и другое.
 * @remark
 * Полезные ссылки:
 * * {@link /doc/platform/developmentapl/interface-development/controls/list/filter-and-search/ руководство разработчика по организации поиска и фильтрации в реестре}
 * * {@link /doc/platform/developmentapl/interface-development/controls/list/filter-and-search/component-kinds/ руководство разработчика по классификации контролов Wasaby и схеме их взаимодействия}
 * * {@link https://github.com/saby/wasaby-controls/blob/rc-20.4000/Controls-default-theme/aliases/_search.less переменные тем оформления}
 *
 *
 * @deprecated
 * @class Controls/_search/Controller
 * @extends UI/Base:Control
 * @mixes Controls/_interface/ISearch
 * @mixes Controls/_interface/ISource
 * @mixes Controls/_interface/IFilterChanged
 * @mixes Controls/_interface/INavigation
 * @mixes Controls/interface/IHierarchySearch
 * @author Герасимов А.М.
 *
 * @public
 */

/*
 * The search controller allows you to search data in a {@link Controls/list:View}
 * using any component with {@link Controls/_input/interface/IValueOptions} interface.
 * Search controller allows you:
 * 1) set delay before searching
 * 2) set number of characters
 * 3) set search parameter
 * 4) change the keyboard layout for an unsuccessful search
 * Note: Component with {@link Controls/_input/interface/IValueOptions} interface must be located in {@link Controls/_search/Input/Container}.
 *
 * More information you can read <a href='/doc/platform/developmentapl/interface-development/controls/filter-search/'>here</a>.
 *
 * <a href="/materials/demo/demo-ws4-explorer-with-search">Here</a>. you a demo with search in Controls/Explorer.
 *
 * @deprecated
 * @class Controls/_search/Controller
 * @extends UI/Base:Control
 * @mixes Controls/_interface/ISearch
 * @mixes Controls/_interface/ISource
 * @mixes Controls/_interface/IFilterChanged
 * @mixes Controls/_interface/INavigation
 * @mixes Controls/interface/IHierarchySearch
 * @author Герасимов А.М.
 *
 * @public
 */

interface IContainerOptions extends IControlOptions, ISearchOptions, IHierarchySearchOptions,
   ISourceOptions, IHierarchyOptions {
   dataLoadCallback?: Function;
   viewMode: string;
   root?: Key;
   searchValue?: string;
   sourceController?: SourceController;
}

type Key = string | number | null;

export default class Container extends Control<IContainerOptions> {
   protected _template: TemplateFunction = template;

   private _tmplNotify: Function = EventUtils.tmplNotify;
   private _previousViewMode: string = null;
   private _viewMode: string = null;
   private _searchValue: string = null;
   private _misspellValue: string = null;
   private _root: Key = null;
   private _rootBeforeSearch: Key = null;
   private _notifiedMarkedKey: Key;
   private _path: RecordSet = null;
   private _deepReload: boolean = undefined;
   private _inputSearchValue: string = '';
   private _loading: boolean = false;

   private _searchController: SearchController = null;

   private _sourceController: SourceController = null;

   protected _beforeMount(options: IContainerOptions, context: typeof DataOptions): void {
      this._itemOpenHandler = this._itemOpenHandler.bind(this);
      this._dataLoadCallback = this._dataLoadCallback.bind(this);

      this._previousViewMode = this._viewMode = options.viewMode;
      this._updateViewMode(options.viewMode);

      this._sourceController = options.sourceController || context.dataOptions.sourceController;
      if (this._sourceController) {
         this._sourceController.updateOptions(this._getSourceControllerOptions());
      }

      this._searchValue = this._getSearchController({
         ...options,
         ...context.dataOptions,
         sourceController: this._sourceController
      }).getSearchValue();

      if (options.searchValue) {
         this._inputSearchValue = options.searchValue;
      }

      if (this._inputSearchValue && this._inputSearchValue.length > options.minSearchLength) {
         this._updateViewMode('search');
      } else {
         this._updateViewMode(options.viewMode);
      }

      if (options.root !== undefined) {
         this._root = options.root;
      }
   }

   protected _beforeUnmount(): void {
      if (this._searchController) {
         if (this._isSearchViewMode()) {
            this._searchController.reset(true);
         }
         this._searchController = null;
      }
   }

   protected _beforeUpdate(newOptions: IContainerOptions, context: typeof DataOptions): void {
      const options = {...newOptions, ...context.dataOptions};
      const searchValueChanged = newOptions.searchValue !== undefined &&
          (this._options.searchValue !== newOptions.searchValue && this._searchValue !== newOptions.searchValue);
      let updateResult;

      if (newOptions.root !== this._options.root) {
         this._root = newOptions.root;
         this._getSearchController(newOptions).setRoot(newOptions.root);
      }

      if (this._options.viewMode !== newOptions.viewMode) {
         if (this._isSearchViewMode()) {
            this._previousViewMode = newOptions.viewMode;
         } else {
            this._updateViewMode(newOptions.viewMode);
         }
      }

      const searchParamChanged = this._options.searchParam !== newOptions.searchParam;
      if (this._searchController && options.sourceController && (searchValueChanged || searchParamChanged)) {
         if (searchValueChanged) {
            this._inputSearchValue = newOptions.searchValue;
         }
         if (this._sourceController !== options.sourceController) {
            this._sourceController = options.sourceController;
         }
         updateResult = this._searchController.update(options);

         if (updateResult && !(updateResult instanceof Promise)) {
            this._sourceController.setFilter(updateResult as QueryWhereExpression<unknown>);
            this._notify('filterChanged', [updateResult]);
            this._setSearchValue(newOptions.searchValue);
         } else if (updateResult instanceof Promise) {
            this._loading = true;
            updateResult.catch((error: Error & {
               isCancelled?: boolean;
            }) => {
               if (!error.isCancelled) {
                  return error;
               }
            });
         }
      }
      if (this._sourceController) {
         this._sourceController.updateOptions(this._getSourceControllerOptions());
      }

      return updateResult;
   }

   private _getSourceControllerOptions(): ISourceControllerOptions {
      return {
         ...this._sourceController.getOptions(),
         dataLoadCallback: this._dataLoadCallback
      };
   }

   private _setSearchValue(value: string): void {
      this._searchValue = value;
      this._notify('searchValueChanged', [value]);
   }

   private _startSearch(value: string, options?: IContainerOptions): Promise<RecordSet | Error> {
      return this._getSearchController(options).search(value);
   }

   private _updateParams(searchValue: string): void {
      if (this._viewMode !== 'search') {
         this._updateViewMode('search');

         if (this._options.parentProperty) {
            this._updateRootAfterSearch();
         }
      }
      this._setSearchValue(searchValue);
   }

   private _updateRootAfterSearch(): void {
      if (this._options.startingWith === 'root') {
         const newRoot = Container._getRoot(this._path, this._root, this._options.parentProperty);

         if (newRoot !== this._root) {
            this._rootBeforeSearch = this._root;
            this._root = newRoot;
            this._searchController.setRoot(newRoot);
            this._notify('rootChanged', [newRoot]);
         }
      }
   }

   protected _search(event: SyntheticEvent, validatedValue: string): void {
      this._inputSearchValue = validatedValue;
      this._loading = true;
      this._startSearch(validatedValue, this._options)
          .catch((error: Error & {
             isCancelled?: boolean;
          }) => {
             if (!error.isCancelled) {
                return error;
             }
          });
   }

   private _isSearchViewMode(): boolean {
      return this._viewMode === 'search';
   }

   private _itemOpenHandler(root: Key, items: RecordSet, dataRoot: Key = null): void {
      if (this._isSearchViewMode() && this._options.searchNavigationMode === 'expand') {
         this._notifiedMarkedKey = root;

         const expandedItems = Container._prepareExpandedItems(
             this._searchController.getRoot(),
             root,
             items,
             this._options.parentProperty);

         this._notify('expandedItemsChanged', [expandedItems]);

         if (!this._deepReload) {
            this._deepReload = true;
         }
      } else if (!this._options.hasOwnProperty('root')) {
         this._searchController?.setRoot(root);
         this._root = root;
      }
      if (root !== dataRoot && this._searchController) {
         this._updateFilter(this._searchController);
         this._inputSearchValue = '';
      }
      this._rootBeforeSearch = null;
   }

   private _searchReset(event: SyntheticEvent): void {
      const searchController = this._getSearchController();

      if (this._rootBeforeSearch && this._root !== this._rootBeforeSearch && this._options.startingWith === 'current') {
         this._root = this._rootBeforeSearch;
         searchController.setRoot(this._root);
         this._notify('rootChanged', [this._root]);
      }
      this._rootBeforeSearch = null;
      this._updateFilter(searchController);
   }

   private _updateFilter(searchController: SearchController): void {
      const filter = searchController.reset(true);
      this._notify('filterChanged', [filter]);
      this._setSearchValue('');
   }

   private _getSearchController(options?: IContainerOptions & typeof DataOptions): SearchController {
      if (!this._searchController) {
         this._searchController = new SearchController(options ?? this._options);
      }
      return this._searchController;
   }

   private _dataLoadCallback(data: RecordSet): void {
      this._handleDataLoad(data);

      if (this._options.dataLoadCallback) {
         this._options.dataLoadCallback(data);
      }
   }

   private _handleDataLoad(data: RecordSet): void {
      if (this._deepReload) {
         this._deepReload = undefined;
      }

      if (this._notifiedMarkedKey !== undefined) {
         this._notify('markedKeyChanged', [this._notifiedMarkedKey]);
         this._notifiedMarkedKey = undefined;
      }

      if (this._searchController && (this._searchController.isSearchInProcess() || this._searchController.getSearchValue() !== this._searchValue)) {
         this._afterSearch(data);
      }

      this._path = data?.getMetaData().path ?? null;
      this._searchController.setPath(this._path);

      if (this._isSearchViewMode() && !this._searchValue) {
         this._updateViewMode(this._previousViewMode);
         this._previousViewMode = null;
         this._misspellValue = '';
      }
   }

   private _afterSearch(items: RecordSet): void {
      const filter = this._searchController.getFilter();
      this._updateParams(this._searchController.getSearchValue());
      this._sourceController.setFilter(filter);
      this._notify('filterChanged', [filter]);
      this._loading = false;

      const switchedStr = getSwitcherStrFromData(items);
      this._misspellValue = switchedStr;
      if (this._searchController.needChangeSearchValueToSwitchedString(items)) {
         this._setSearchValue(switchedStr);
      }
   }

   private _updateViewMode(newViewMode: string): void {
      this._previousViewMode = this._viewMode;
      this._viewMode = newViewMode;
   }

   protected _misspellCaptionClick(): void {
      this._search(null, this._misspellValue);
      this._inputSearchValue = this._misspellValue;
      this._misspellValue = '';
   }

   private static _prepareExpandedItems(
      searchRoot: Key,
      expandedItemKey: Key,
      items: RecordSet,
      parentProperty: string
   ): Key[] {
      const expandedItems = [];
      let item;
      let nextItemKey = expandedItemKey;
      do {
         item = items.getRecordById(nextItemKey);
         nextItemKey = item.get(parentProperty);
         expandedItems.unshift(item.getId());
      } while (nextItemKey !== searchRoot);

      return expandedItems;
   }

   static _getRoot(path: RecordSet, currentRoot: Key, parentProperty: string): Key {
      let root;

      if (path && path.getCount() > 0) {
         root = path.at(0).get(parentProperty);
      } else {
         root = currentRoot;
      }

      return root;
   }

   static contextTypes(): object {
      return {
         dataOptions: DataOptions
      };
   }

   static getDefaultOptions(): Partial<IContainerOptions> {
      return {
         minSearchLength: 3,
         searchDelay: 500,
         startingWith: 'root'
      };
   }
}

Object.defineProperty(Container, 'defaultProps', {
   enumerable: true,
   configurable: true,

   get(): object {
      return Container.getDefaultOptions();
   }
});

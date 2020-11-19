import {Control, TemplateFunction, IControlOptions} from 'UI/Base';
import * as template from 'wml!Controls/_search/Controller';
import {tmplNotify} from 'Controls/eventUtils';
import {ContextOptions as DataOptions} from 'Controls/context';
import {RecordSet} from 'Types/collection';
import {default as SearchController} from 'Controls/_search/ControllerClass';
import {SyntheticEvent} from 'Vdom/Vdom';
import {ISearchOptions} from 'Controls/_interface/ISearch';
import {IHierarchySearchOptions} from 'Controls/interface/IHierarchySearch';
import {ISourceOptions} from 'Controls/_interface/ISource';
import {IHierarchyOptions} from 'Controls/_interface/IHierarchy';
import {
   NewSourceController as SourceController
} from 'Controls/dataSource';

/**
 * Контрол используют в качестве контроллера для организации поиска в реестрах.
 * Он обеспечивает связь между {@link Controls/search:InputContainer} и {@link Controls/list:Container} — контейнерами
 * для строки поиска и списочного контрола соответветственно.
 * С помощью этого контрола можно настроить: временную задержку между вводом символа и началом поиска, количество символов, с которых начинается поиск, параметры фильтрации и другое.
 * @remark
 * Полезные ссылки:
 * * <a href="/doc/platform/developmentapl/interface-development/controls/list-environment/filter-search/">руководство разработчика по организации поиска и фильтрации в реестре</a>
 * * <a href="/doc/platform/developmentapl/interface-development/controls/list-environment/component-kinds/">руководство разработчика по классификации контролов Wasaby и схеме их взаимодействия</a>
 * * <a href="https://github.com/saby/wasaby-controls/blob/rc-20.4000/Controls-default-theme/aliases/_search.less">переменные тем оформления</a>
 *
 *
 * @class Controls/_search/Controller
 * @extends Core/Control
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
 * @class Controls/_search/Controller
 * @extends Core/Control
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
}

type Key = string | number | null;

export default class Container extends Control<IContainerOptions> {
   protected _template: TemplateFunction = template;

   private _tmplNotify: Function = tmplNotify;
   private _dataOptions: typeof DataOptions = null;
   private _previousViewMode: string = null;
   private _viewMode: string = null;
   private _searchValue: string = null;
   private _misspellValue: string = null;
   private _root: Key = null;
   private _notifiedMarkedKey: Key = null;
   private _path: RecordSet = null;
   private _deepReload: boolean = undefined;
   private _inputSearchValue: string = '';

   private _searchController: SearchController = null;

   private _sourceController: SourceController = null;

   protected _beforeMount(options: IContainerOptions, context: typeof DataOptions): void {
      this._itemOpenHandler = this._itemOpenHandler.bind(this);
      this._dataLoadCallback = this._dataLoadCallback.bind(this);
      this._afterSetItemsOnReloadCallback = this._afterSetItemsOnReloadCallback.bind(this);

      this._previousViewMode = this._viewMode = options.viewMode;
      this._updateViewMode(options.viewMode);

      this._sourceController = context.dataOptions.sourceController;

      this._getSearchController({...options, ...context.dataOptions}).then((searchController) => {
         this._searchValue = searchController.getSearchValue();
      });

      if (options.root !== undefined) {
         this._root = options.root;
      }
   }

   protected _beforeUnmount(): void {
      if (this._searchController) {
         this._searchController.reset(true);
         this._searchController = null;
      }
   }

   protected _beforeUpdate(newOptions: IContainerOptions, context: typeof DataOptions): void {
      this._searchController.update({...newOptions, ...context.dataOptions});
   }

   private _setSearchValue(value: string): void {
      this._searchValue = value;
      this._notify('searchValueChanged', [value]);
   }

   private _startSearch(value: string, options?: IContainerOptions): Promise<RecordSet | Error> {
      return this._getSearchController(options).then((searchController) => {
         return searchController.search(value);
      });
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

         this._getSearchController().then((searchController) => {
            this._root = newRoot;
            searchController.setRoot(newRoot);
            this._notify('rootChanged', [newRoot]);
         });
      }
   }

   protected _search(event: SyntheticEvent, validatedValue: string): void {
      this._inputSearchValue = validatedValue;
      this._startSearch(validatedValue, this._options).then((result) => {
         if (result instanceof RecordSet) {
            const sourceController = this._sourceController;
            this._updateParams(validatedValue);
            this._handleDataLoad(result);
            this._notify('filterChanged', [sourceController.getFilter()]);
            if (this._options.dataLoadCallback) {
               this._options.dataLoadCallback(result);
            }
            sourceController.setItems(result);
         }
      });
   }

   private _isSearchViewMode(): boolean {
      return this._viewMode === 'search';
   }

   private _itemOpenHandler(root: Key, items: RecordSet, dataRoot: Key = null): void {
      this._getSearchController().then((searchController) => {
         if (this._isSearchViewMode() && this._options.searchNavigationMode === 'expand') {
            this._notifiedMarkedKey = root;

            const expandedItems = Container._prepareExpandedItems(
               searchController.getRoot(),
               root,
               items,
               this._options.parentProperty);

            this._notify('expandedItemsChanged', [expandedItems]);

            if (!this._deepReload) {
               this._deepReload = true;
            }
         } else {
            searchController.setRoot(root);
            this._root = root;
         }
         if (root !== dataRoot) {
            this._updateFilter(searchController);

            this._inputSearchValue = '';
         }
      });
   }

   private _searchReset(event: SyntheticEvent): void {
      this._getSearchController().then((searchController) => {
         this._updateFilter(searchController);
         this._handleDataLoad(null);
      });
   }

   private _updateFilter(searchController: SearchController): void {
      const filter = searchController.reset(true);
      this._notify('filterChanged', [filter]);
      this._setSearchValue('');
   }

   private _getSearchController(options?: IContainerOptions & typeof DataOptions): Promise<SearchController> {
      if (!this._searchController) {
         return import('Controls/search').then((result) => {
            return this._searchController = new result.ControllerClass(options ?? this._options);
         });
      }
      return Promise.resolve(this._searchController);
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

      this._path = data?.getMetaData().path ?? null;

      if (this._isSearchViewMode() && !this._searchValue) {
         this._updateViewMode(this._previousViewMode);
         this._previousViewMode = null;
         this._misspellValue = '';
      }
   }

   private _updateViewMode(newViewMode: string): void {
      this._previousViewMode = this._viewMode;
      this._viewMode = newViewMode;
   }

   protected _afterSetItemsOnReloadCallback(): void {
      if (this._notifiedMarkedKey !== undefined) {
         this._notify('markedKeyChanged', [this._notifiedMarkedKey]);
         this._notifiedMarkedKey = undefined;
      }
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

   static getDefaultOptions(): IContainerOptions {
      return {
         viewMode: undefined,
         keyProperty: undefined,
         searchNavigationMode: undefined,
         searchParam: undefined,
         searchValueTrim: undefined,
         minSearchLength: 3,
         searchDelay: 500,
         startingWith: 'root'
      };
   }
}

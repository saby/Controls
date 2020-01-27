import Control = require('Core/Control');
import template = require('wml!Controls/_search/Controller');
import clone = require('Core/core-clone');
import getSwitcherStrFromData = require('Controls/_search/Misspell/getSwitcherStrFromData');
import cInstance = require('Core/core-instance');
import tmplNotify = require('Controls/Utils/tmplNotify');
import {ContextOptions as DataOptions} from 'Controls/context';
import _SearchController from './_SearchController';
import {isEqual} from 'Types/object';
import {RecordSet} from 'Types/collection';
import {ICrud} from 'Types/source';
import {Logger} from 'UI/Utils';

const SERVICE_FILTERS = {
   HIERARCHY: {
      'Разворот': 'С разворотом',
      'usePages': 'full'
   }
};

var _private = {
   getSearchController: function (self) {
      var options = self._dataOptions;

      if (!self._searchController) {
         self._searchController = new _SearchController({
            searchParam: self._options.searchParam,
            minSearchLength: self._options.minSearchLength,
            searchDelay: self._options.searchDelay,
            searchValueTrim: self._options.searchValueTrim,
            filter: clone(options.filter) || {},
            source: options.source,
            sorting: options.sorting,
            navigation: options.navigation,
            searchCallback: _private.searchCallback.bind(self, self),
            abortCallback: _private.abortCallback.bind(self, self),
            searchStartCallback: _private.searchStartCallback.bind(self, self),
            searchErrback: _private.searchErrback.bind(self, self)
         });
      }

      return self._searchController;
   },

   getOriginSource: function(source: ICrud): ICrud {
      return cInstance.instanceOfModule(source, 'Types/_source/IDecorator') ? source.getOriginal() : source;
   },

   searchCallback: function (self, result, filter) {
      const switcherStr = getSwitcherStrFromData(result.data);

      self._loading = false;

      if (self._viewMode !== 'search') {
         self._previousViewMode = self._viewMode;
         self._viewMode = 'search';

         if (self._options.startingWith === 'root' && self._options.parentProperty) {
            self._root = _private.getRoot(self._path, self._root, self._options.parentProperty);
         }
      }

      self._searchValue = filter[self._options.searchParam] || '';
      self._notify('filterChanged', [filter]);
      self._notify('itemsChanged', [result.data]);
      self._notify('searchValueChanged', [self._searchValue]);
      self._misspellValue = getSwitcherStrFromData(result.data);
   },

   abortCallback: function (self, filter) {
      self._loading = false;
      if (self._viewMode === 'search') {
         self._searchValue = '';
         self._misspellValue = '';
         self._viewMode = self._previousViewMode;
         self._previousViewMode = null;

         if (self._options.parentProperty) {
            _private.deleteServiceFilters(filter);
         }

         //abortCallback is called on every input change, when input value is less then minSearchLength,
         //but filter could be already changed, because viewMode: 'search' will change only after data loaded.
         if (!isEqual(self._options.filter, filter)) {
            self._notify('filterChanged', [filter]);
         }
         self._notify('searchValueChanged', [self._searchValue]);
      }
   },

   assignServiceFilters: function(filter:object):void {
      Object.assign(filter, SERVICE_FILTERS.HIERARCHY);
   },

   deleteServiceFilters: function(filter:object):void {
      for (var i in SERVICE_FILTERS.HIERARCHY) {
         if (SERVICE_FILTERS.HIERARCHY.hasOwnProperty(i)) {
            delete filter[i];
         }
      }
   },

   searchStartCallback: function (self, filter:object):void {
      if (self._options.parentProperty && self._viewMode !== 'search') {
         _private.assignServiceFilters(filter);
      }
      if (self._root !== undefined && self._options.parentProperty) {
         if (self._options.startingWith === 'current') {
            filter[self._options.parentProperty] = self._root;
         } else {
            delete filter[self._options.parentProperty];
         }
      }
      self._loading = true;
   },

   isNeedRecreateSearchControllerOnOptionsChanged(options, newOptions): boolean {
      return !isEqual(options.navigation, newOptions.navigation) ||
             options.searchDelay !== newOptions.searchDelay ||
             options.minSearchLength !== newOptions.minSearchLength ||
             _private.isNeedAbortSearchOnOptionsChanged(options, newOptions);
   },

   isNeedAbortSearchOnOptionsChanged(options, newOptions): boolean {
      return options.searchParam !== newOptions.searchParam ||
             _private.getOriginSource(options.source) !== _private.getOriginSource(newOptions.source);
   },

   prepareExpandedItems(searchRoot, expandedItemKey, items, parentProperty) {
      let expandedItems = [];
      let item;
      let nextItemKey = expandedItemKey;
      do {
         item = items.getRecordById(nextItemKey);
         nextItemKey = item.get(parentProperty);
         expandedItems.unshift(item.getId());
      } while (nextItemKey !== searchRoot);
      return expandedItems;
   },

   itemOpenHandler: function(root:string|number|null, items:object):void {
      if (this._viewMode === 'search' && this._options.searchNavigationMode === 'expand') {
         this._notify('markedKeyChanged', [root]);
         this._notify('expandedItemsChanged', [_private.prepareExpandedItems(this._root, root, items, this._options.parentProperty)]);
         if (!this._options.deepReload) {
            this._deepReload = true;
         }
      } else {
         this._root = root;
      }
      if (root !== null) {
         _private.getSearchController(this).abort(true);
         _private.setInputSearchValue(this, '');
      }
   },

   dataLoadCallback: function (self, data:RecordSet):void {
      if (self._deepReload) {
         self._deepReload = undefined;
      }

      self._path = data.getMetaData().path;

      if (self._viewMode === 'search' && !self._searchValue) {
         self._viewMode = self._previousViewMode;
         self._previousViewMode = null;
      }
      if (self._options.dataLoadCallback) {
         self._options.dataLoadCallback(data);
      }
   },

   searchErrback: function (self, error: Error):void {
      if (self._options.dataLoadErrback) {
         self._options.dataLoadErrback(error);
      }
      self._loading = false;
   },

   getRoot: function (path, currentRoot, parentProperty) {
      let root;

      if (path && path.getCount() > 0) {
         root = path.at(0).get(parentProperty);
      } else {
         root = currentRoot;
      }

      return root;
   },

   startSearch: function(self, value, force) {
      if (self._options.source) {
         const searchValue = self._options.searchValueTrim ? value.trim() : value;
         const shouldSearch = self._isSearchControllerLoading() ?
             _private.isInputSearchValueChanged(self, searchValue) :
             _private.needStartSearch(self, self._inputSearchValue, searchValue);

         if (shouldSearch) {
            _private.getSearchController(self).search(searchValue, force);
         }
      } else {
         Logger.error('search:Controller source is required for search', self);
      }
   },

   setInputSearchValue: function(self, value: string): void {
      self._inputSearchValue = value;
   },

   isInputSearchValueChanged(self, searchValue: string): boolean {
      return searchValue !== self._inputSearchValue;
   },

   isSearchValueChanged(self, searchValue: string): boolean {
      return self._options.searchValue !== searchValue && _private.isInputSearchValueChanged(self, searchValue);
   },

   isInputSearchValueShort(self, searchValue: string): boolean {
      return !searchValue || searchValue.length < self._options.minSearchLength;
   },

   needStartSearch(self, inputSearchValue: string, searchValue: string): string {
      return (self._options.searchValueTrim ? inputSearchValue.trim() : inputSearchValue) || searchValue;
   },

   needUpdateViewMode(self, newViewMode: string): boolean {
      return self._options.viewMode !== newViewMode && self._viewMode !== newViewMode;
   },

   updateViewMode(self, newViewMode: string): void {
      self._previousViewMode = self._viewMode;
      self._viewMode = newViewMode;
   }
};

/**
 * Контрол используют в качестве контроллера для организации поиска в реестрах.
 * Он обеспечивает связь между {@link Controls/search:InputContainer} и {@link Controls/list:Container} — контейнерами для строки поиска и списочного контрола соответветственно. 
 * С помощью этого контрола можно настроить: временную задержку между вводом символа и началом поиска, количество символов, с которых начинается поиск, параметры фильтрации и другое.
 * @remark
 * Подробнее об организации поиска и фильтрации в реестре читайте {@link https://wi.sbis.ru/doc/platform/developmentapl/interface-development/controls/list-environment/filter-search/ здесь}.
 * Подробнее о классификации контролов Wasaby и схеме их взаимодействия читайте {@link https://wi.sbis.ru/doc/platform/developmentapl/interface-development/controls/list-environment/component-kinds/ здесь}.
 *
 * @class Controls/_search/Controller
 * @extends Core/Control
 * @mixes Controls/interface/ISearch
 * @mixes Controls/_interface/ISource
 * @mixes Controls/_interface/IFilter
 * @mixes Controls/_interface/INavigation
 * @mixes Controls/interface/IHierarchySearch
 * @author Герасимов А.М.
 * @control
 * @public
 */

/*
 * The search controller allows you to search data in a {@link Controls/list:View}
 * using any component with {@link Controls/interface/IInputField} interface.
 * Search controller allows you:
 * 1) set delay before searching
 * 2) set number of characters
 * 3) set search parameter
 * 4) change the keyboard layout for an unsuccessful search
 * Note: Component with {@link Controls/interface/IInputField} interface must be located in {@link Controls/_search/Input/Container}.
 *
 * More information you can read <a href='/doc/platform/developmentapl/interface-development/controls/filter-search/'>here</a>.
 *
 * <a href="/materials/demo/demo-ws4-explorer-with-search">Here</a>. you a demo with search in Controls/Explorer.
 *
 * @class Controls/_search/Controller
 * @extends Core/Control
 * @mixes Controls/interface/ISearch
 * @mixes Controls/_interface/ISource
 * @mixes Controls/_interface/IFilter
 * @mixes Controls/_interface/INavigation
 * @mixes Controls/interface/IHierarchySearch
 * @author Герасимов А.М.
 * @control
 * @public
 */

var Container = Control.extend(/** @lends Controls/_search/Container.prototype */{

   _template: template,
   _tmplNotify: tmplNotify,
   _dataOptions: null,
   _itemOpenHandler: null,
   _previousViewMode: null,
   _viewMode: null,
   _searchValue: null,
   _misspellValue: null,
   _root: null,
   _deepReload: undefined,
   _inputSearchValue: '',

   constructor: function () {
      this._itemOpenHandler = _private.itemOpenHandler.bind(this);
      this._dataLoadCallback = _private.dataLoadCallback.bind(null, this);
      Container.superclass.constructor.apply(this, arguments);
   },

   _beforeMount: function (options, context) {
      this._dataOptions = context.dataOptions;
      this._previousViewMode = this._viewMode = options.viewMode;

      if (options.searchValue) {
         this._inputSearchValue = options.searchValue;

         if (!_private.isInputSearchValueShort(this, options.searchValue)) {
            this._searchValue = options.searchValue;

            if (_private.needUpdateViewMode(this, 'search')) {
               _private.updateViewMode(this, 'search');
            }
         }
      }

      if (options.root !== undefined) {
         this._root = options.root;
      }
   },

   _beforeUpdate: function (newOptions, context) {
      var currentOptions = this._dataOptions;
      var filter;

      this._dataOptions = context.dataOptions;

      if (!isEqual(this._options.filter, newOptions.filter)) {
         filter = newOptions.filter;
      }

      if (this._options.root !== newOptions.root) {
         this._root = newOptions.root;
      }

      if (_private.needUpdateViewMode(this, newOptions.viewMode)) {
         _private.updateViewMode(this, newOptions.viewMode);
      }

      if (this._searchController) {
         if (filter) {
            this._searchController.setFilter(clone(filter));
         }

         if (_private.isNeedAbortSearchOnOptionsChanged(currentOptions, this._dataOptions) ||
             _private.isNeedAbortSearchOnOptionsChanged(this._options, newOptions)) {
            if (this._searchValue) {
               this._searchController.abort(true);
            }
            _private.setInputSearchValue(this, '');
         }

         if (_private.isNeedRecreateSearchControllerOnOptionsChanged(currentOptions, this._dataOptions) ||
             _private.isNeedRecreateSearchControllerOnOptionsChanged(this._options, newOptions)) {
            this._searchController = null;
         }

         if (!isEqual(this._options.sorting, newOptions.sorting)) {
            this._searchController.setSorting(newOptions.sorting);
         }
      }
      if (_private.isSearchValueChanged(this, newOptions.searchValue)) {
         _private.startSearch(this, newOptions.searchValue);
         if (this._searchValue !== newOptions.searchValue) {
            _private.setInputSearchValue(this, newOptions.searchValue);
         }
      }
   },

   _search: function (event, value, force) {
      _private.startSearch(this, value, force);
      _private.setInputSearchValue(this, value);
   },

   _beforeUnmount: function () {
      if (this._searchController) {
         this._searchController.abort(true);
         this._searchController = null;
      }
      this._dataOptions = null;
      this._itemOpenHandler = null;
      this._dataLoadCallback = null;
   },

   _misspellCaptionClick: function () {
      this._search(null, this._misspellValue);
      this._misspellValue = '';
   },

   _isSearchControllerLoading: function () {
      return this._searchController && this._searchController.isLoading();
   }
});

Container.contextTypes = function () {
   return {
      dataOptions: DataOptions
   };
};

Container.getDefaultOptions = function () {
   return {
      minSearchLength: 3,
      searchDelay: 500,
      startingWith: 'root'
   };
};

Container._private = _private;

export = Container;



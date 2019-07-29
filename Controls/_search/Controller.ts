
import Control = require('Core/Control');
import template = require('wml!Controls/_search/Controller');
import {ContextOptions as DataOptions} from 'Controls/context';
import clone = require('Core/core-clone');
import _SearchController from './_SearchController';
import {isEqual} from 'Types/object';
import getSwitcherStrFromData = require('Controls/_search/Misspell/getSwitcherStrFromData');
import {RecordSet} from 'Types/collection';

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
            filter: clone(options.filter),
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

   searchCallback: function (self, result, filter) {
      var switcherStr = getSwitcherStrFromData(result.data);

      self._loading = false;

      if (self._viewMode !== 'search') {
         self._previousViewMode = self._viewMode;
         self._viewMode = 'search';
      }

      self._searchValue = filter[self._options.searchParam] || '';
      self._notify('filterChanged', [filter]);
      self._notify('itemsChanged', [result.data]);

      if (switcherStr) {
         self._misspellValue = switcherStr;
      }
   },

   abortCallback: function (self, filter) {
      self._loading = false;
      if (self._viewMode === 'search') {
         self._searchValue = '';
         self._misspellValue = '';

         if (self._options.parentProperty) {
            _private.deleteServiceFilters(filter);
         }

         //abortCallback is called on every input change, when input value is less then minSearchLength,
         //but filter could be already changed, because viewMode: 'search' will change only after data loaded.
         if (!isEqual(self._options.filter, filter)) {
            self._notify('filterChanged', [filter]);
         }
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
      if (self._root !== undefined && self._options.parentProperty && self._options.startingWith === 'current') {
         filter[self._options.parentProperty] = self._root;
      }
      self._loading = true;
   },

   needUpdateSearchController: function (options, newOptions) {
      return !isEqual(options.navigation, newOptions.navigation) ||
         !isEqual(options.sorting, newOptions.sorting) ||
         options.searchDelay !== newOptions.searchDelay ||
         options.source !== newOptions.source ||
         options.searchParam !== newOptions.searchParam ||
         options.minSearchLength !== newOptions.minSearchLength;
   },
   itemOpenHandler: function(root:string|number|null):void {
      if (root !== null) {
         _private.getSearchController(this).abort(true);
         this._inputSearchValue = '';
      }
      this._root = root;
   },

   dataLoadCallback: function (self, data:RecordSet):void {
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
   }
};

/**
 * Контрол-контроллер поиска позволяет осуществлять поиск данных в {@link Controls/list:View}
 * с помощью любого компонента с интерфейсом {@link Controls/interface/IInputField}.
 * Контроллер поиска позволяет:
 * 1) установить задержку перед поиском;
 * 2) установить количество символов;
 * 3) установить параметры поиска;
 * 4) изменить раскладку клавиатуры для случаев неудачного поиска.
 * Следует запомнить: Контрол с интерфейсом {@link Controls/interface/IInputField} должен быть обернут в {@link Controls/_search/Input/Container}.
 *
 * Подробнее читайте <a href='/doc/platform/developmentapl/interface-development/controls/filter-search/'>здесь</a>.
 *
 * <a href="/materials/demo/demo-ws4-explorer-with-search">Демо-пример</a>. 
 *
 * @class Controls/_search/Controller
 * @extends Core/Control
 * @mixes Controls/interface/ISearch
 * @mixes Controls/_interface/ISource
 * @mixes Controls/interface/IFilter
 * @mixes Controls/interface/INavigation
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
 * @mixes Controls/interface/IFilter
 * @mixes Controls/interface/INavigation
 * @mixes Controls/interface/IHierarchySearch
 * @author Герасимов А.М.
 * @control
 * @public
 */ 

var Container = Control.extend(/** @lends Controls/_search/Container.prototype */{

   _template: template,
   _dataOptions: null,
   _itemOpenHandler: null,
   _previousViewMode: null,
   _viewMode: null,
   _searchValue: null,
   _misspellValue: null,
   _root: undefined,

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
         this._searchValue = options.searchValue;

         if (this._viewMode !== 'search') {
            this._previousViewMode = this._viewMode;
            this._viewMode = 'search';
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

      if (this._searchController) {
         if (_private.needUpdateSearchController(currentOptions, this._dataOptions) || _private.needUpdateSearchController(this._options, newOptions)) {
            this._searchController.abort();
            this._searchController = null;
         } else if (filter) {
            this._searchController.setFilter(clone(filter));
         }
      }

      if (this._options.searchValue !== newOptions.searchValue && newOptions.searchValue !== this._inputSearchValue) {
         this._search(null, newOptions.searchValue);
      }
   },

   _search: function (event, value, force) {
      _private.getSearchController(this).search(value, force);
      this._inputSearchValue = value;
   },

   _beforeUnmount: function () {
      if (this._searchController) {
         this._searchController.abort();
         this._searchController = null;
      }
      this._dataOptions = null;
      this._itemOpenHandler = null;
      this._dataLoadCallback = null;
   },

   _misspellCaptionClick: function () {
      this._search(null, this._misspellValue);
      this._misspellValue = '';
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



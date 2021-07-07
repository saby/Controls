import Control = require('Core/Control');
import template = require('wml!Controls/_deprecatedList/Container');
import merge = require('Core/core-merge');
import Deferred = require('Core/Deferred');
import cInstance = require('Core/core-instance');
import clone = require('Core/core-clone');
import {DataSet, Memory, PrefetchProxy} from 'Types/source';
import {_SearchController} from 'Controls/search';
import {isEqual} from 'Types/object';
import {FilterContextField, SearchContextField} from 'Controls/context';
import {Source} from 'Controls/history';
import {RecordSet} from 'Types/collection';
import {factory} from 'Types/chain';
import { error as dataSourceError } from 'Controls/dataSource';
import * as isEmpty from 'Core/helpers/Object/isEmpty';

var SEARCH_CONTEXT_FIELD = 'searchLayoutField';
var SEARCH_VALUE_FIELD = 'searchValue';
var FILTER_CONTEXT_FIELD = 'filterLayoutField';
var FILTER_VALUE_FIELD = 'filter';

var _private = {
   getSearchController: function(self, options) {
      var options = options || self._options;

      if (!self._searchController) {
         self._searchController = new _SearchController({
            filter: merge({}, options.filter),
            searchParam: options.searchParam,
            minSearchLength: options.minSearchLength,
            source: _private.getCorrectSource(options.source),
            navigation: options.navigation,
            sorting: options.sorting,
            searchDelay: options.searchDelay,
            searchStartCallback: options.searchStartCallback,
            searchCallback: _private.searchCallback.bind(self, self),
            searchErrback: _private.searchErrback.bind(self, self),
            abortCallback: _private.abortCallback.bind(self, self)
         });
      }

      return self._searchController;
   },

   resolveOptions: function(self, options) {
      self._options = options;
      self._filter = options.filter;
      self._source = options.source;
      self._navigation = options.navigation;
   },

   cachedSourceFix: function(self) {
      /* Пока не cached source не используем навигацию и фильтрацию,
       просто отдаём данные в список, иначе memorySource данные не вернёт,
       т.к. фильтрация работает в нём только по полному совпадению */
      self._navigation = null;
      self._filter = {};
   },

   updateSource: function(self, reverseList) {
      const source = _private.getOriginSource(self._options.source);
      let data = self._data;
      let items = data.getRawData();

      if (reverseList) {
         items = _private.reverseData(items, source);
      }

      self._source = new PrefetchProxy({
         data: {
            query: reverseList ?
                new DataSet({
                   rawData: items,
                   adapter: data.getAdapter(),
                   keyProperty: data.getKeyProperty(),
                   model: data.getModel()
                }) :
                data
         },
         target: source
      });
   },

   reverseData: function(data, source) {
      const recordSet = new RecordSet({
         rawData: clone(data), // clone origin data
         adapter: source.getAdapter(),
         keyProperty: source.getKeyProperty()
      });

      const recordSetToReverse = recordSet.clone();
      const reversedData = factory(recordSetToReverse).sort((a, b) => {
          return  recordSetToReverse.getIndex(b) - recordSetToReverse.getIndex(a);
      }).value();

      // need to use initial recordSet to save metaData in origin format
      recordSet.clear();
      reversedData.forEach((item) => {
         recordSet.add(item);
      });

      return recordSet.getRawData();
   },

   updateFilter: function(self, resultFilter) {
      /* Копируем объект, чтобы порвать ссылку и опция у списка изменилась*/
      var filterClone = merge({}, self._options.filter);
      self._filter = merge(filterClone, resultFilter);
      _private.getSearchController(self).setFilter(self._filter);
   },

   abortCallback: function(self, filter) {
      if (self._options.searchEndCallback) {
         self._options.searchEndCallback(null, filter);
      }

      if (!isEqual(filter, _private.getFilterFromContext(self, self._context))) {
         _private.updateFilter(self, filter);
      }
      self._searchMode = false;
      self._source = self._options.source;
      self._navigation = self._options.navigation;
      self._currentSearchValue = '';
      self._forceUpdate();
   },

   getErrorController(self: Control): dataSourceError.Controller {
      if (!self._errorController) {
         self._errorController = new dataSourceError.Controller({});
      }
      return self._errorController;
   },

   searchErrback(self: Control, error: Error): void {
      if (self._options.searchErrback) {
         self._options.searchErrback(error);
      }
      if (!error?.canceled) {
         _private.getErrorController(self).process({
            error,
            theme: self._options.theme,
            mode: dataSourceError.Mode.include
         }).then((errorConfig: dataSourceError.ViewConfig|void): dataSourceError.ViewConfig|void => {
            self._errorConfig = errorConfig;
         });
      }
   },

   searchCallback: function(self, result, filter) {
      if (self._options.searchEndCallback) {
         self._options.searchEndCallback(result, filter);
      }

      if (!isEqual(filter, _private.getFilterFromContext(self, self._context)) || !isEqual(filter, self._filter)) {
         _private.updateFilter(self, filter);
      }

      self._searchDeferred = new Deferred();
      self._data = result.data;
      _private.updateSource(self, self._options.reverseList);
      self._navigation = self._options.navigation;
      self._filter = _private.getCurrentFilter(self);
      self._currentSearchValue = self._searchValue;
      self._searchDeferred.callback();
      self._forceUpdate();
   },

   searchValueChanged: function(self, value, filter) {
      var searchController = _private.getSearchController(self);

      _private.cancelSearchDeferred(self);

      if (filter) {
         searchController.setFilter(filter);
      }
      self._searchMode = true;
      self._searchValue = value;
      searchController.search(value);
   },

   cancelSearchDeferred: function(self) {
      if (self._searchDeferred && self._searchDeferred.isReady()) {
         self._searchDeferred.cancel();
         self._searchDeferred = null;
      }
   },

   getValueFromContext: function(context, contextField, valueField) {
      if (context && context[contextField]) {
         return context[contextField][valueField];
      } else {
         return null;
      }
   },

   isFilterChanged: function(self, context) {
      var oldValue = this.getFilterFromContext(self, self._context),
         newValue = this.getFilterFromContext(self, context),
         changed = false;

      if (newValue) {
         if (self._searchMode) {
            /* if search mode on, filter will be changed after search */
            changed = !isEqual(_private.getSearchController(self).getFilter(), newValue);
         } else {
            changed = !isEqual(oldValue, newValue);
         }
      }
      return changed;
   },

   isSearchValueChanged: function(self, context) {
      var oldValue = self._searchValue || this.getSearchValueFromContext(self, self._context),
         newValue = this.getSearchValueFromContext(self, context);
      return !isEqual(oldValue, newValue);
   },

   getFilterFromContext: function(self, context) {
      return this.getValueFromContext(context, FILTER_CONTEXT_FIELD, FILTER_VALUE_FIELD);
   },

   getSearchValueFromContext: function(self, context) {
      return this.getValueFromContext(context, SEARCH_CONTEXT_FIELD, SEARCH_VALUE_FIELD);
   },

   checkContextValues: function(self, context) {
      var filterChanged = this.isFilterChanged(self, context);
      var searchChanged = this.isSearchValueChanged(self, context);
      var searchValue = this.getSearchValueFromContext(self, context);
      var filterValue = this.getFilterFromContext(self, context);

      if (searchChanged && filterChanged) {
         this.searchValueChanged(self, searchValue, filterValue);
      } else if (searchChanged) {
         this.searchValueChanged(self, searchValue);
      } else if (filterChanged) {
         if (self._searchMode) {
            this.searchValueChanged(self, searchValue, filterValue);
         } else {
            this.updateFilter(self, filterValue);
         }
      }
   },

   destroySearchController: function(self) {
      if (self._searchController) {
         self._searchController.abort(true);
         self._searchController = null;
      }
   },

   getCorrectSource: function(source) {
      //костыль до перевода Suggest'a на Search/Controller,
      //могут в качестве source передать prefetchSource, у которого нет методов getModel, getAdapter.
      //После этого этот модуль можно будет удалить.
      if (cInstance.instanceOfModule(source, 'Types/source:PrefetchProxy')) {
         return source.getOriginal();
      }

      return source;
   },

   getOriginSource: function(source) {
      // In Selector/Suggest as source can be set historySource, in this case history should work differently
      if (source instanceof Source) {
         return source.getOriginSource();
      }

      return _private.getCorrectSource(source);
   },

   getCurrentFilter(self): object {
      return self._searchController ?
          self._searchController.getFilter() :
          _private.getFilterFromContext(self, self._context);
   }
};

var List = Control.extend({

   _template: template,
   _searchDeferred: null,
   _searchMode: false,
   _data: null,
   _errorConfig: null,

   _beforeMount: function(options, context) {
      this._source = options.source;

      _private.resolveOptions(this, options);
      _private.checkContextValues(this, context);

      /***************************
       FIXME
       VDOM не умеет обрабатываеть ситуацию,
       когда в асинхронной фазе построения компонента может измеиться состояние родетельского компонента,
       вместо того, чтобы дождаться постоения дочернего компонента, он начинает создавать новый компонент.
       Ошибка выписна, в плане у Зуева https://online.sbis.ru/opendoc.html?guid=fb08b40e-f2ac-4dd2-9a84-dfbfc404da02 */
      //return this._searchDeferred;

      if (this._searchMode && _private.getSearchController(this, options).isLoading()) {
         _private.cachedSourceFix(this);
         var originSource = _private.getOriginSource(options.source);
         this._source = new Memory({
            model: originSource.getModel(),
            keyProperty: originSource.getKeyProperty()
         });
      }

      /***********************/

   },

   _beforeUpdate: function(newOptions, context) {
      let oldReverseList = this._options.reverseList;

      if (this._options.source !== newOptions.source || !isEqual(this._options.navigation, newOptions.navigation) || this._options.searchDelay !== newOptions.searchDelay) {
         const currentFilter = _private.getCurrentFilter(this);
         this._navigation = newOptions.navigation;

         if (!this._searchMode) {
            _private.resolveOptions(this, newOptions);
         }

         /* create searchController with new options */
         this._searchController = null;
         _private.getSearchController(this, newOptions).setFilter(currentFilter);
      }
      if (oldReverseList !== newOptions.reverseList && this._data) {
         _private.updateSource(this, newOptions.reverseList);
      }
      _private.checkContextValues(this, context);
   },

   _beforeUnmount: function() {
      _private.cancelSearchDeferred(this);
      _private.destroySearchController(this);
   }

});

List.contextTypes = function() {
   return {
      searchLayoutField: SearchContextField,
      filterLayoutField: FilterContextField
   };
};

List.getDefaultOptions = function() {
   return {
      searchDelay: 500,
      minSearchLength: 3,
      filter: {}
   };
};

/* For tests */
List._private = _private;

export default List;

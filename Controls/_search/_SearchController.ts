/**
 * Created by am.gerasimov on 01.02.2018.
 */

import extend = require('Core/core-extend');
import clone = require('Core/core-clone');
import moduleStubs = require('Core/moduleStubs');

var _private = {
   getSearch: function(self) {
      return moduleStubs.require('Controls/search').addCallback(function(requireRes) {
         if (!self._search) {
            self._search = new requireRes[0]._Search({
               source: self._options.source,
               filter: self._options.filter,
               sorting: self._options.sorting,
               navigation: self._options.navigation,
               searchDelay: self._options.searchDelay,
               keyProperty: self._options.keyProperty,
               searchStartCallback: self._options.searchStartCallback
            });
         }
         return self._search;
      });
   },

   search: function(self, value, force) {
      return new Promise((resolve) => {
         _private.getSearch(self).addCallback(function (search) {
            var filter = self._options.filter;

            filter = clone(filter);
            filter[self._options.searchParam] = value;

            search.search(filter, force)
                .addCallback((result) => {
                   if (self._options.searchCallback) {
                      self._options.searchCallback(result, filter);
                   }
                   resolve(result);
                   return result;
                })
                .addErrback((result) => {
                   if (self._options.searchErrback) {
                      self._options.searchErrback(result, filter);
                   }
                   resolve(result);
                   return result;
                });

            return search;
         });
      });
   },

   abort(self, force: boolean, callback): void {
      _private.getSearch(self).addCallback((search) => {
         search.abort(force).addCallback(() => {
            if (callback) {
               callback(self);
            }
         });
         return search;
      });
   },

   resetFilters(self): void {
      const filter = clone(self._options.filter);
      delete filter[self._options.searchParam];
      if (self._options.abortCallback) {
         self._options.abortCallback(filter);
      }
   }
};

/**
 * Отслеживает изменение value.
 * При необходимости загружает Controls/search:_Search и делает запрос за данными.
 * @author Герасимов Александр
 * @class Controls/_search/_SearchController
 * @mixes Controls/_interface/ISearch
 * @mixes Controls/_interface/ISource
 * @private
 */
/**
 * @name searchCallback
 * @cfg {Function} callback, который будет вызван при положительном результате поиска
 */
/**
 * @name abortCallback
 * @cfg {Function} callback, который будет вызван при сбросе поиска, ошибке запроса
 */
var SearchController = extend({

   constructor: function(options) {
      SearchController.superclass.constructor.call(this, options);
      this._options = options;
   },

   search: function(value, force) {
      const valueLength = value.length;
      const searchByValueChanged = this._options.minSearchLength !== null;
      const forceAbort = valueLength ? force : true;
      let result;

      if ((searchByValueChanged && valueLength >= this._options.minSearchLength) || (force && valueLength)) {
         result = _private.search(this, value, force);
      } else if (searchByValueChanged || !valueLength) {
         result = _private.abort(this, forceAbort, _private.resetFilters);
      }

      return result;
   },

   setFilter: function(filter) {
      this._options.filter = filter;
   },

   getFilter: function() {
      return this._options.filter;
   },

   setSorting: function(sorting) {
     this._options.sorting = sorting;

     if (this._search) {
        this._search.setSorting(sorting);
     }
   },

   abort: function(force) {
      _private.abort(this, force, _private.resetFilters);
   },

   cancel: function() {
      _private.abort(this, true);
   },

   isLoading: function() {
      return this._search && this._search.isLoading();
   }
});

SearchController._private = _private;

export default SearchController;

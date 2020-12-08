import extend = require('Core/core-extend');
import Deferred = require('Core/Deferred');
import {Controller} from 'Controls/source';

'use strict';

var _private = {

   checkRequiredOptions: function(options) {
      if (!options.source) {
         throw new Error('source is required for search');
      }
   },

   initSourceController: function(self, options) {
      self._sourceController = new Controller({
         source: options.source,
         keyProperty: options.keyProperty,
         navigation: options.navigation
      });
   },

   resolveOptions: function(self, options) {
      self._searchDelay = options.searchDelay;
      self._sorting = options.sorting;
      self._searchStartCallback = options.searchStartCallback;
   },

   searchCallback: function(self, result) {
      if (!self._searchDeferred.isReady()) {
         self._searchDeferred.callback({
            data: result,
            hasMore: self._sourceController.hasMoreData('down')
         });
      }
   },

   searchErrback: function(self, error) {
      self._searchDeferred.errback(error);
   },

   clearSearchDelay: function(self) {
      if (self._searchDelayTimer) {
         clearTimeout(self._searchDelayTimer);
         self._searchDelayTimer = null;
      }
   },

   callAfterDelay: function(self, callback) {
      _private.clearSearchDelay(self);
      self._searchDelayTimer = setTimeout(function() {
         self._searchDelayTimer = null;
         callback();
      }, self._searchDelay);
   },

   resolveSearchCall: function (self, callback, force) {
      if (force || !self._searchDelay) {
         callback();
      } else {
         _private.callAfterDelay(self, callback);
      }
   }

};

/**
 * @author Герасимов Александр
 * @class Controls/_search/_Search
 * @private
 */

/**
 * @name Controls/_search/_Search#searchDelay
 * @cfg {Number} Задержка в миллисекундах между нажатием клавиши и выполнением поиска.
 * Нулевая задержка имеет смысл для локальных данных.
 */

/*
 * @name Controls/_search/_Search#searchDelay
 * @cfg {Number} The delay in milliseconds between when a keystroke occurs and when a search is performed.
 * A zero-delay makes sense for local data.
 */

/**
 * @name Controls/_search/_Search#source
 * @cfg {Types/source:ISource} source
 */

/**
 * @name Controls/_search/_Search#navigation
 * @cfg {Controls/_interface/INavigation} source
 */

var Search  = extend({

   _searchDeferred: null,
   _searchDelay: null,
   _searchStartCallback: null,

   constructor: function(options) {
      Search.superclass.constructor.apply(this, arguments);

      _private.resolveOptions(this, options);
      _private.checkRequiredOptions(options);
      _private.initSourceController(this, options);
   },

   /**
    * @cfg {Object} Фильтр.
    * @returns {Core/Deferred}
    */
   search: function(filter, force) {
      var self = this;
      var load = function() {
         if (self._searchStartCallback) {
            self._searchStartCallback(filter);
         }
         self._sourceController.load(filter, self._sorting)
            .addCallback(function(result) {
               _private.searchCallback(self, result);
               return result;
            })
            .addErrback(function(err) {
               _private.searchErrback(self, err);
               return err;
            });
      };

      //aborting current query
      this.abort(true);
      this._searchDeferred = new Deferred();

      _private.resolveSearchCall(this, load, force);
      return this._searchDeferred;
   },

   /**
    * Прервать поиск.
    * @public
    */

   /*
    * Aborting search
    * @public
    */
   abort: function(force):Deferred {
      let self = this;
      let abortDef = new Deferred();

      let abort = function() {
         const isLoading = self._sourceController.isLoading();

         if (self._searchDeferred && !self._searchDeferred.isReady() && !isLoading) {
            self._searchDeferred.cancel();
            self._searchDeferred = null;
         }
         if (isLoading) {
            self._sourceController.cancelLoading();
         }
         abortDef.callback();
      };

      _private.clearSearchDelay(this);
      _private.resolveSearchCall(this, abort, force);

      return abortDef;
   },

   isLoading: function() {
      return this._searchDeferred && !this._searchDeferred.isReady();
   },

   setSorting: function(sorting) {
      this._sorting = sorting;
   }

});

Search._private = _private;

export default Search;

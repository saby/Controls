import cExtend = require('Core/core-simpleExtend');
import cInstance = require('Core/core-instance');
import {Query, QueryWhereExpression} from 'Types/source';
import {applied} from 'Types/entity';
import cDeferred = require('Core/Deferred');
import cClone = require('Core/core-clone');
import PageQueryParamsController from 'Controls/_source/QueryParamsController/PageQueryParamsController';
import PositionQueryParamsController from 'Controls/_source/QueryParamsController/PositionQueryParamsController';
import QueryParamsController from 'Controls/_source/QueryParamsController';
import {Logger} from 'UI/Utils';

interface IModifyParamsWithNavigation {
   root?: string|number|null;
   config?: object;
   callback?: Function;
   cleanParams: object;
   direction?: 'up'|'down';
   paramsController: QueryParamsController;
}

interface IQueryParams {
   filter: QueryWhereExpression<unknown>;
   sorting?: object[];
   limit: number;
   offset: number;
   meta: unknown;
}

type QueryParams = IQueryParams[];

var _private = {
   prepareSource: function(sourceOpt) {
      if (!cInstance.instanceOfMixin(sourceOpt, 'Types/_source/ICrud')) {
          Logger.error('SourceController: Source option has incorrect type');
      }
      return sourceOpt;
   },

   getQueryInstance: function(filter, sorting, offset, limit, meta): Query {
      const query = new Query();
      query.where(filter)
         .offset(offset)
         .limit(limit)
         .orderBy(sorting)
         .meta(meta);
      return query;
   },

   callQuery: function(dataSource, keyProperty: string, queryParams: QueryParams) {
      let queryDef;
      let queryIns: Query;
      const queries = [];
      const queriesParams = Array.isArray(queryParams) ? queryParams : [queryParams];

      queriesParams.forEach((params) => {
         queries.push(_private.getQueryInstance(
             params.filter,
             params.sorting,
             params.offset,
             params.limit,
             params.meta)
         );
      });

      if (queries.length > 1) {
         queryIns = queries[0].union.apply(queries[0], queries.slice(1));
      } else {
         queryIns = queries[0];
      }

      queryDef = dataSource.query(queryIns).addCallback(((dataSet) => {
         if (keyProperty && keyProperty !== dataSet.idProperty) {
            dataSet.setKeyProperty(keyProperty);
         }
         return dataSet.getAll ? dataSet.getAll() : dataSet;
      }));

      if (cInstance.instanceOfModule(dataSource, 'Types/source:Memory')) {

         /*Проблема в том что деферред с синхронным кодом статического источника выполняется сихронно.
          в итоге в коолбэк релоада мы приходим в тот момент, когда еще не отработал _beforeMount и заполнение опций, и не можем обратиться к this._options*/
         var queryDefAsync = new cDeferred();

         //deferred.fromTimer is not support canceling
         setTimeout(function() {
            if (!queryDefAsync.isReady()) {
               queryDefAsync.callback();
            }
         }, 0);

         queryDefAsync.addCallback(function() {
            return queryDef;
         });
         return queryDefAsync;
      } else {
         return queryDef;
      }
   },

   createQueryParamsController: function(type, cfg) {
      var cntCtr, cntInstance;

      switch (type) {
         case 'page':
            cntCtr = PageQueryParamsController;
            break;
         case 'offset':
            cntCtr = Offset;
            break;
         case 'position':
            cntCtr = PositionQueryParamsController;
            break;
         default:
             Logger.error('SourceController: Undefined navigation source type "' + type + '"');
      }
      if (cntCtr) {
         cntInstance = new QueryParamsController({
            controllerClass: cntCtr,
            controllerOptions: cfg
         });
      }
      return cntInstance;
   },

   modifyQueryParamsWithNavigation({
       cleanParams,
       direction,
       paramsController,
       callback,
       config,
       root
   }: IModifyParamsWithNavigation): QueryParams {
      let resultParams;
      let navigParams;
      let navFilter;
      const resultParamsArray = [];

      resultParams = cleanParams;
      navigParams = paramsController.prepareQueryParams(direction, callback, config, root);

      if (!Array.isArray(navigParams)) {
         navigParams = [{
            id: null,
            queryParams: navigParams
         }];
      }

      navigParams.forEach((params) => {
         resultParams = {...cleanParams};
         resultParams.limit = params.queryParams.limit;
         resultParams.offset = params.queryParams.offset;
         // we can't modify original filter
         resultParams.filter = cClone(resultParams.filter);

         if (params.queryParams.filter) {
            navFilter = params.queryParams.filter;
            for (const i in navFilter) {
               if (navFilter.hasOwnProperty(i)) {
                  resultParams.filter[i] = navFilter[i];
               }
            }
         }

         // Добавляем в фильтр раздел и помечаем это поле, как первичный ключ
         // Оно используется для формирования множественной навигации,
         // Само поле будет удалено из фильтра перед запросом.
         if (navigParams.length > 1) {
            resultParams.filter.__root = new applied.PrimaryKey(params.id);
         }

         if (params.queryParams.meta) {
            resultParams.meta = params.queryParams.meta;
         }
         resultParamsArray.push(resultParams);
      });

      return resultParamsArray;
   }
};
/**
 * @Deprecated Please use Controls/source/NavigationController instead
 */
var SourceController = cExtend.extend({
   _source: null,
   _queryParamsController: null,
   _loader: null,
   constructor: function(cfg) {
      this._options = cfg;
      SourceController.superclass.constructor.apply(this, arguments);
      this._source = _private.prepareSource(this._options.source);

      if (this._options.navigation && this._options.navigation.source) {
         this._queryParamsController = _private.createQueryParamsController(this._options.navigation.source, this._options.navigation.sourceConfig);
      }
   },

   load: function(filter, sorting?, direction?, config?, root?) {
      var def, queryParams, self;

      queryParams = {
         filter: filter || {},
         sorting: sorting,
         limit: undefined,
         offset: undefined
      };
      this.cancelLoading();

      if (this._queryParamsController) {
         queryParams = _private.modifyQueryParamsWithNavigation({
             cleanParams: queryParams,
             direction,
             paramsController: this._queryParamsController,
             callback: this._options.queryParamsCallback,
             config,
             root
         });
      }

      self = this;
      def = _private.callQuery(this._source, this._options.keyProperty, queryParams)
         .addCallback(function(list) {
            if (self._queryParamsController) {
               self._queryParamsController.updateQueryProperties(list, direction, config, root, self._options.queryParamsCallback);
            }
            return list;
         }).addErrback(function(error) {
            return error;
         });
      this._loader = def;
      return def;
   },

   cancelLoading: function() {
      if (this._loader && !this._loader.isReady()) {
         this._loader.cancel();
      }
      this._loader = null;
   },

   getLoadedDataCount: function() {
      if (this._queryParamsController) {
         return this._queryParamsController.getLoadedDataCount();
      }
   },

   getAllDataCount: function() {
      if (this._queryParamsController) {
         return this._queryParamsController.getAllDataCount();
      }
   },

   getNavigation: function() {
      return this._options.navigation;
   },

   hasMoreData: function(direction: 'up' | 'down', key?: string | number): boolean {
      if (this._queryParamsController) {
         return this._queryParamsController.hasMoreData(direction, key);
      }
   },

   calculateState: function(list, direction?: 'up' | 'down', root?: string|number) {
      if (this._queryParamsController) {
         this._queryParamsController.updateQueryProperties(
             list,
             direction,
             null,
             root
         );
      }
   },

   setState: function(state, root: string|number|null): boolean {
      let stateChanged = false;

      if (this._queryParamsController) {
         stateChanged = this._queryParamsController.setState(state, root);
      }

      return stateChanged;
   },

   isLoading: function() {
      return this._loader && !this._loader.isReady();
   },

   setEdgeState: function(direction) {
      if (this._queryParamsController) {
         this._queryParamsController.setEdgeState(direction);
      }
   },

   create: function(meta) {
      return this._source.create(meta);
   },

   update: function(item) {
      return this._source.update(item);
   },

   read: function(key, meta) {
      return this._source.read(key, meta);
   },

   destroy: function() {
      if (this._queryParamsController) {
         this._queryParamsController.destroy();
      }
      this.cancelLoading();
      this._options = null;
   }
});

//для тестов
SourceController._private = _private;

export = SourceController;

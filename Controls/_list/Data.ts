import Control = require('Core/Control');
import cInstance = require('Core/core-instance');
import template = require('wml!Controls/_list/Data');
import Deferred = require('Core/Deferred');
import clone = require('Core/core-clone');
import getPrefetchSource from './getPrefetchSource';
import {ContextOptions} from 'Controls/context';
import {isEqual} from "Types/object";
import * as isNewEnvironment from 'Core/helpers/isNewEnvironment';
import GroupUtil = require('Controls/_list/resources/utils/GroupUtil');


import {ICrud, PrefetchProxy} from 'Types/source';
import {RecordSet} from 'Types/collection';
import {TArrayGroupId, prepareFilterCollapsedGroups} from 'Controls/_list/Controllers/Grouping';

type GetSourceResult = {
   data?: RecordSet;
   error?: Error;
   source: ICrud;
}

      /**
       * Контрол-контейнер, предоставляющий контекстное поле "dataOptions" с необходимыми данными для дочерних контейнеров.
       * 
       * @remark
       * Полезные ссылки:
       * * <a href="/materials/Controls-demo/app/Controls-demo%2FFilterSearch%2FFilterSearch">демо-пример</a>
       * * <a href="https://github.com/saby/wasaby-controls/blob/rc-20.4000/Controls-default-theme/aliases/_list.less">переменные тем оформления</a>
       *
       * @class Controls/_list/Data
       * @mixes Controls/_interface/IFilter
       * @mixes Controls/_interface/INavigation
       * @mixes Controls/_interface/IHierarchy
       * @mixes Controls/_interface/ISource
       * @extends Core/Control
       * @control
       * @public
       * @author Герасимов А.М.
       */

      /*
       * Container component that provides a context field "dataOptions" with necessary data for child containers.
       *
       * Here you can see a <a href="/materials/Controls-demo/app/Controls-demo%2FFilterSearch%2FFilterSearch">demo</a>.
       *
       * @class Controls/_list/Data
       * @mixes Controls/_interface/IFilter
       * @mixes Controls/_interface/INavigation
       * @mixes Controls/_interface/IHierarchy
       * @mixes Controls/_interface/ISource
       * @extends Core/Control
       * @control
       * @public
       * @author Герасимов А.М.
       */

      /**
       * @name Controls/_list/Data#root
       * @cfg {Number|String} Идентификатор корневого узла.
       */


      /**
       * @event Происходит при изменении корня иерархии.
       * @name Controls/_list/Data#rootChanged
       * @param event {eventObject} Дескриптор события.
       * @param root {String|Number} Идентификатор корневой записи.
       */
      var CONTEXT_OPTIONS = ['filter', 'navigation', 'keyProperty', 'sorting', 'source', 'prefetchSource', 'items'];

      var _private = {
         isEqualItems: function(oldList:RecordSet, newList:RecordSet):boolean {
            return oldList && cInstance.instanceOfModule(oldList, 'Types/collection:RecordSet') &&
               (newList.getModel() === oldList.getModel()) &&
               (newList.getKeyProperty() === oldList.getKeyProperty()) &&
               (Object.getPrototypeOf(newList).constructor == Object.getPrototypeOf(newList).constructor) &&
               (Object.getPrototypeOf(newList.getAdapter()).constructor == Object.getPrototypeOf(oldList.getAdapter()).constructor);
         },

         updateDataOptions: function(self, dataOptions) {
            function reducer(result, optName) {
               if (optName === 'source' && self._source) {
                  // TODO: При построении на сервере в сериализованом состоянии в компонент приходят prefetchSource и
                  // source изначально заданный в опциях. prefetchSource содержит в себе source из опций, но так как
                  // это 2 разных парамтра, при десериализации получаем 2 разных source. Один десериализуется внутри
                  // prefetchSource, второй из опций. prefetchSource передаётся в табличные представления данных, а
                  // source из опций распространяется по контексту. Получется тот кто влияет на source из контекста,
                  // не влияет на source из таблицы. Решение: Не будем брать source из опций, а в контекс положим
                  // source, который лежит внутри prefetchSource.
                  // Выписана задача для удаления данного костыля: https://online.sbis.ru/opendoc.html?guid=fb540e42-278c-436c-928b-92e6f72b3abc
                  result.source = self._prefetchSource ? self._prefetchSource._$target : self._source; //prefetchSource will no created if query returns error
               } else {
                  result[optName] = self['_' + optName];
               }
               return result;
            }

            return CONTEXT_OPTIONS.reduce(reducer, dataOptions);
         },

         createPrefetchSource(
            self,
            data: RecordSet | void,
            dataLoadErrback: Function | void,
            groupHistoryId: string
         ): Promise<GetSourceResult> {

            return new Promise((resolve) => {
               if (typeof groupHistoryId !== 'string') {
                  resolve(self._filter);
               } else {
                  // restoreCollapsedGroups всегда завершается через Promise.resolve()
                  GroupUtil.restoreCollapsedGroups(groupHistoryId).then((collapsedGroups?: TArrayGroupId) => {
                     resolve(prepareFilterCollapsedGroups(collapsedGroups, self._filter || {}));
                  });
               }
            }).then((filter) => {
               return getPrefetchSource({
                  source: self._source,
                  navigation: self._navigation,
                  sorting: self._sorting,
                  filter,
                  keyProperty: self._keyProperty
               }, data).then((result: GetSourceResult) => {
                  if (result.error && dataLoadErrback instanceof Function) {
                     dataLoadErrback(result.error);
                  }
                  return result;
               });
            });
         },

         resolveOptions: function(self, options) {
            const filterChanged = !isEqual(self._options.filter, options.filter);
            const rootChanged = self._options.root !== options.root;

            self._navigation = options.navigation;
            self._source = options.source;
            self._sorting = options.sorting;
            self._keyProperty = options.keyProperty;

            //https://online.sbis.ru/opendoc.html?guid=8dd3b48d-9123-4d6c-ac26-9c908e6e25f8
            if (!self._filter || filterChanged || rootChanged) {
               self._filter = options.filter;

               if (options.parentProperty) {
                  const hasRootInOptions = options.root;
                  const hasRootInFilter = self._filter && self._filter[options.parentProperty];

                  if ((hasRootInFilter || hasRootInOptions) && rootChanged) {
                     const newFilter = clone(options.filter);

                     if (hasRootInOptions) {
                        newFilter[options.parentProperty] = options.root;
                     } else {
                        delete newFilter[options.parentProperty];
                     }

                     self._filter = newFilter;
                  }
               }
            }
         },

         resolvePrefetchSourceResult: function(self, result: GetSourceResult) {
            if (result.data) {
               if (_private.isEqualItems(self._items, result.data)) {
                  self._items.setMetaData(result.data.getMetaData());
                  self._items.assign(result.data);
               } else {
                  self._items = result.data;
               }
            }
            self._prefetchSource = result.source;
         },

         /**
          * @typedef {Object} prefetchSourceResult
          * @property data Data that loaded from original source
          * @property source prefetchSource that contains original source
          */

         /**
          * @param self control instance
          * @param result {prefetchSourceResult}
          */
         createDataContextBySourceResult: function (self, result: { data: RecordSet<Model>; source: PrefetchProxy }) {
            _private.resolvePrefetchSourceResult(self, result);
            self._dataOptionsContext = _private.getDataContext(self);
         },

         getDataContext: function(self) {
            return new ContextOptions(_private.updateDataOptions(self, {}));
         },

         /**
          * Returns groupHistoryId if list control has grouping
          * @param options control options
          * @return groupHistoryId
          */
         getGroupHistoryId(options): string {
            const hasGrouping = !!options.groupProperty || !!options.groupingKeyCallback;
            return hasGrouping ? (options.groupHistoryId || options.historyIdCollapsedGroups) : undefined;
         }
      };

      var Data = Control.extend(/** @lends Controls/_list/Data.prototype */{

         _template: template,
         _loading: false,
         _itemsReadyCallback: null,

         _beforeMount: function(options, context, receivedState:RecordSet|undefined):Deferred<GetSourceResult>|void {
            let self = this;
            let source:ICrud;

            _private.resolveOptions(this, options);
            this._itemsReadyCallback = this._itemsReadyCallbackHandler.bind(this);

            // isNewEnvironment - проверка в 20.11хх, в 20.2ххх удалена
            // Нужна для редкого случая, когда на старой странице на сервере строится wasaby контрол,
            // В этом случае создаётся два окружения wasaby контролов, но с одним хранилищем ключей для VDOM'a,
            // по этой причине в контрол может приходить некорректный receivedState
            // Ошибка https://online.sbis.ru/opendoc.html?guid=73eaea65-e064-4244-96c2-6d5a7fcbd476
            if (receivedState && isNewEnvironment()) {
               source = options.source instanceof PrefetchProxy ? options.source.getOriginal() : options.source;

               // need to create PrefetchProxy with source from options, because event subscriptions is not work on server
               // and source from receivedState will lose all subscriptions
               _private.createDataContextBySourceResult(this, {
                  data: receivedState,
                  source: new PrefetchProxy({
                     target: source,
                     data: {
                        query: receivedState
                     }
                  })
               });
            } else if (self._source) {
               return _private.createPrefetchSource(this, null, options.dataLoadErrback, _private.getGroupHistoryId(options)).addCallback(function(result) {
                  _private.createDataContextBySourceResult(self, result);
                  return result.data;
               });
            } else {
               self._dataOptionsContext = _private.getDataContext(self);
            }
         },

         _beforeUpdate: function(newOptions) {
            _private.resolveOptions(this, newOptions);

            if (this._options.source !== newOptions.source) {
               this._loading = true;
               return _private.createPrefetchSource(this, null, null, _private.getGroupHistoryId(newOptions)).addCallback((result) => {
                  this._items = null;
                  _private.resolvePrefetchSourceResult(this, result);
                  _private.updateDataOptions(this, this._dataOptionsContext);
                  this._dataOptionsContext.updateConsumers();
                  this._loading = false;
                  this._forceUpdate();
                  return result;
               });
            } else if (!isEqual(newOptions.filter, this._options.filter) ||
                       !isEqual(newOptions.navigation, this._options.navigation) ||
                       newOptions.sorting !== this._options.sorting ||
                       newOptions.keyProperty !== this._options.keyProperty ||
                       newOptions.root !== this._options.root) {
               _private.updateDataOptions(this, this._dataOptionsContext);
               this._dataOptionsContext.updateConsumers();
            }
         },

         _itemsReadyCallbackHandler(items): void {
            if (this._items !== items) {
               this._items = items;
               _private.updateDataOptions(this, this._dataOptionsContext);
               this._dataOptionsContext.updateConsumers();
            }

            if (this._options.itemsReadyCallback) {
               this._options.itemsReadyCallback(items);
            }
         },

         _filterChanged: function(event, filter) {
            this._filter = filter;
            _private.updateDataOptions(this, this._dataOptionsContext);

            /* If filter changed, prefetchSource should return data not from cache,
               will be changed by task https://online.sbis.ru/opendoc.html?guid=861459e2-a229-441d-9d5d-14fdcbc6676a */
            this._dataOptionsContext.prefetchSource = this._options.source;
            this._dataOptionsContext.updateConsumers();
         },

         _rootChanged: function(event, root) {
            this._notify('rootChanged', [root]);
         },
         _itemsChanged: function(event:Event, items):void {
            //search:Cotnroller fires two events after search: itemsChanged, filterChanged
            //on filterChanged event filter state will updated
            //on itemChanged event prefetchSource will updated, but createPrefetchSource method work async becouse of promise,
            //then we need to create prefetchSource synchronously
            const source = new PrefetchProxy({
               data: {
                  query: items
               },
               target: this._source
            });

            _private.resolvePrefetchSourceResult(this, {
               source
            });

            _private.updateDataOptions(this, this._dataOptionsContext);
            this._dataOptionsContext.updateConsumers();
            event.stopPropagation();
         },

         _getChildContext: function() {
            return {
               dataOptions: this._dataOptionsContext
            };
         },

         _onDataError: function(event, errbackConfig) {
            this._children.dataErrorRegistrar.start(errbackConfig);
         }
      });

      Data._private = _private;
      export = Data;


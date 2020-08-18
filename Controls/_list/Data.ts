import Control = require('Core/Control');
import template = require('wml!Controls/_list/Data');
import * as isNewEnvironment from 'Core/helpers/isNewEnvironment';
import {RegisterClass} from 'Controls/event';
import {RecordSet} from 'Types/collection';
import {default as DataController, IDataOptions} from 'Controls/_list/Data/ControllerClass';
      /**
       * Контрол-контейнер, предоставляющий контекстное поле "dataOptions" с необходимыми данными для дочерних контейнеров.
       *
       * @remark
       * Полезные ссылки:
       * * <a href="/materials/Controls-demo/app/Controls-demo%2FFilterSearch%2FFilterSearch">демо-пример</a>
       * * <a href="https://github.com/saby/wasaby-controls/blob/rc-20.4000/Controls-default-theme/aliases/_list.less">переменные тем оформления</a>
       *
       * @class Controls/_list/Data
       * @mixes Controls/_interface/IFilterChanged
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
       * @mixes Controls/_interface/IFilterChanged
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
       * Значение опции root добавляется в фильтре в поле {@link Controls/_interface/IHierarchy#parentProperty parentProperty}.
       * @example
       * <pre class="brush: js; highlight: [5]">
       * <Controls.list:DataContainer
       *     keyProperty="id"
       *     filter="{{_filter}}"
       *     source="{{_source}}" 
       *     root="Сотрудники"/>
       * </pre>
       */

      /**
       * @event Происходит при изменении корня иерархии.
       * @name Controls/_list/Data#rootChanged
       * @param event {eventObject} Дескриптор события.
       * @param root {String|Number} Идентификатор корневой записи.
       */
      var Data = Control.extend(/** @lends Controls/_list/Data.prototype */{
         _template: template,
         _loading: false,
         _itemsReadyCallback: null,
         _filter: null,
         _navigation: null,
         _keyProperty: null,
         _sorting: null,
         _errorRegister: null,
         _dataController: null,

         _beforeMount(options: IDataOptions, context, receivedState: RecordSet|undefined): Promise<RecordSet>|void {
            this._filter = options.filter;
            this._itemsReadyCallback = this._itemsReadyCallbackHandler.bind(this);
            this._errorRegister = new RegisterClass({register: 'dataError'});
            this._dataController = new DataController({...options});
            this._dataOptionsContext = this._dataController.createContext();

            if (receivedState && isNewEnvironment()) {
               this._items = receivedState;
               this._dataController.setItems(receivedState);
               this._dataController.updateContext(this._dataOptionsContext);
            } else if (options.source) {
               return this._dataController.loadItems().then((items) => {
                  this._items = items;
                  this._dataController.setItems(items);
                  this._dataController.updateContext(this._dataOptionsContext);
                  return items;
               });
            } else {
               this._dataController.updateContext(this._dataOptionsContext);
            }
         },

         _beforeUpdate(newOptions: IDataOptions): void|Promise<RecordSet> {
            const isChanged = this._dataController.update({...newOptions});
            this._filter = newOptions.filter;

            if (this._options.source !== newOptions.source) {
               this._loading = true;
               return this._dataController.loadItems().then((result) => {
                  if (!this._items) {
                     this._items = this._dataController.setItems(result);
                  } else {
                     this._dataController.updatePrefetchProxy(result);
                  }
                  this._dataController.updateContext(this._dataOptionsContext);
                  this._loading = false;
                  return result;
               });
            } else if (isChanged) {
               this._dataController.setFilter(this._filter);
               this._dataController.updateContext(this._dataOptionsContext);
            }
         },

         _beforeUnmount(): void {
            if (this._errorRegister) {
               this._errorRegister.destroy();
               this._errorRegister = null;
            }
         },

         _registerHandler(event, registerType, component, callback, config): void {
            this._errorRegister.register(event, registerType, component, callback, config);
         },

         _unregisterHandler(event, registerType, component, config): void {
            this._errorRegister.unregister(event, component, config);
         },

         _itemsReadyCallbackHandler(items): void {
            if (this._items !== items) {
               this._items = this._dataController.setItems(items);
               this._dataController.updateContext(this._dataOptionsContext);
            }

            if (this._options.itemsReadyCallback) {
               this._options.itemsReadyCallback(items);
            }
         },

         _filterChanged(event, filter): void {
            this._dataController.setFilter(this._filter = filter);
            this._dataController.updateContext(this._dataOptionsContext);

            /* If filter changed, prefetchSource should return data not from cache,
               will be changed by task https://online.sbis.ru/opendoc.html?guid=861459e2-a229-441d-9d5d-14fdcbc6676a */
            this._dataOptionsContext.prefetchSource = this._options.source;
            this._dataOptionsContext.updateConsumers();
         },

         _rootChanged(event, root): void {
            this._notify('rootChanged', [root]);
         },

         _itemsChanged(event:Event, items): void {
            //search:Cotnroller fires two events after search: itemsChanged, filterChanged
            //on filterChanged event filter state will updated
            //on itemChanged event prefetchSource will updated, but createPrefetchSource method work async becouse of promise,
            //then we need to create prefetchSource synchronously
            this._dataController.updatePrefetchProxy(items);
            this._dataController.updateContext(this._dataOptionsContext);
            event.stopPropagation();
         },

         _getChildContext(): object {
            return {
               dataOptions: this._dataOptionsContext
            };
         },

         _onDataError(event, errbackConfig): void {
            this._errorRegister.start(errbackConfig);
         }
      });

      export = Data;


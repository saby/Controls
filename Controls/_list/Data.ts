import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import template = require('wml!Controls/_list/Data');
import * as isNewEnvironment from 'Core/helpers/isNewEnvironment';
import {RegisterClass} from 'Controls/event';
import {RecordSet} from 'Types/collection';
import {PrefetchProxy} from 'Types/source';
import {NewSourceController as SourceController} from 'Controls/dataSource';

import {default as DataController, IDataContextOptions, IDataOptions} from 'Controls/_list/Data/ControllerClass';
import {ContextOptions} from 'Controls/context';
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

class Data extends Control/** @lends Controls/_list/Data.prototype */{
   protected _template: TemplateFunction = template;
   private _loading: boolean = false;
   private _itemsReadyCallback: Function = null;
   private _errorRegister: RegisterClass = null;
   private _sourceController: SourceController = null;
   private _dataOptionsContext: ContextOptions;

   private _items: RecordSet;
   private _prefetchSource: PrefetchProxy;

   _beforeMount(options: IDataOptions, context, receivedState: RecordSet|undefined): Promise<RecordSet>|void {

      // TODO придумать как отказаться от этого свойства
      this._itemsReadyCallback = this._itemsReadyCallbackHandler.bind(this);

      this._errorRegister = new RegisterClass({register: 'dataError'});

      this._sourceController = new SourceController(options);
      this._dataOptionsContext = this._createContext(options);

      if (receivedState && isNewEnvironment()) {

         // TODO items надо распространять либо только по контексту, либо только по опциям. Щас ждут и так и так
         this._items = receivedState;
         this._sourceController.setItems(receivedState);
         this._prefetchSource = this._sourceController.getPrefetchSource(receivedState);
         this._updateContext(this._dataOptionsContext);
      } else if (options.source) {
         return this._sourceController.load().then((items) => {

            // TODO items надо распространять либо только по контексту, либо только по опциям. Щас ждут и так и так
            this._items = this._sourceController.setItems(items);
            this._prefetchSource = this._sourceController.getPrefetchSource(receivedState);
            this._updateContext(this._dataOptionsContext);
            return items;
         });
      } else {
         this._updateContext(this._dataOptionsContext);
      }
   }

   _beforeUpdate(newOptions: IDataOptions): void|Promise<RecordSet> {
      const isChanged = this._sourceController.update({...newOptions});
      if (isChanged) {
         this._loading = true;
         return this._sourceController.load().then((result) => {
            if (!this._items) {
               this._items = this._sourceController.setItems(result);
            }

            this._prefetchSource = this._sourceController.getPrefetchSource(result);
            this._updateContext(this._dataOptionsContext);
            this._loading = false;
            return result;
         });
      }
   }

   _beforeUnmount(): void {
      if (this._errorRegister) {
         this._errorRegister.destroy();
         this._errorRegister = null;
      }
   }

   _registerHandler(event, registerType, component, callback, config): void {
      this._errorRegister.register(event, registerType, component, callback, config);
   }

   _unregisterHandler(event, registerType, component, config): void {
      this._errorRegister.unregister(event, component, config);
   }

   _itemsReadyCallbackHandler(items): void {
      if (this._items !== items) {
         this._items = this._sourceController.setItems(items);
         this._updateContext(this._dataOptionsContext);
      }

      if (this._options.itemsReadyCallback) {
         this._options.itemsReadyCallback(items);
      }
   }

   _filterChanged(event, filter): void {
      this._sourceController.setFilter(this._filter = filter);
      this._updateContext(this._dataOptionsContext);

      /* If filter changed, prefetchSource should return data not from cache,
         will be changed by task https://online.sbis.ru/opendoc.html?guid=861459e2-a229-441d-9d5d-14fdcbc6676a */
      this._dataOptionsContext.prefetchSource = this._options.source;
      this._dataOptionsContext.updateConsumers();
   }

   _rootChanged(event, root): void {
      this._notify('rootChanged', [root]);
   }

   _itemsChanged(event:Event, items): void {
      //search:Cotnroller fires two events after search: itemsChanged, filterChanged
      //on filterChanged event filter state will updated
      //on itemChanged event prefetchSource will updated, but createPrefetchSource method work async becouse of promise,
      //then we need to create prefetchSource synchronously
      this._prefetchSource = this._sourceController.getPrefetchSource(items);
      this._updateContext(this._dataOptionsContext);
      event.stopPropagation();
   }

   private _createContext(options?: IDataContextOptions): typeof ContextOptions {
      return new ContextOptions(options);
   }

   private _updateContext(context: typeof ContextOptions): void {
      const contextOptions = this._getContextOptions();

      for (const i in contextOptions) {
         if (contextOptions.hasOwnProperty(i)) {
            context[i] = contextOptions[i];
         }
      }
      context.updateConsumers();
   }

   private _getContextOptions(): IDataContextOptions {
      return {
         filter: this._filter,
         navigation: this._options.navigation,
         keyProperty: this._options.keyProperty,
         sorting: this._options.sorting,
         items: this._items,
         prefetchSource: this._prefetchSource,
         source: this._options.source
      };
   }

   _getChildContext(): object {
      return {
         dataOptions: this._dataOptionsContext
      };
   }

   _onDataError(event, errbackConfig): void {
      this._errorRegister.start(errbackConfig);
   }
}

export default Data;

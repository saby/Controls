import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import template = require('wml!Controls/_list/Data');
import * as isNewEnvironment from 'Core/helpers/isNewEnvironment';
import {RegisterClass} from 'Controls/event';
import {RecordSet} from 'Types/collection';
import {PrefetchProxy, QueryWhereExpression} from 'Types/source';
import {NewSourceController as SourceController} from 'Controls/dataSource';
import {IControllerOptions, IControlerState} from 'Controls/_dataSource/Controller';
import {ContextOptions} from 'Controls/context';
import {ISourceOptions, IHierarchyOptions, IFilterOptions, INavigationOptions, ISortingOptions} from 'Controls/interface';

export interface IDataOptions extends IControlOptions,
    ISourceOptions,
    IHierarchyOptions,
    IFilterOptions,
    INavigationOptions<unknown>,
    ISortingOptions {
   dataLoadErrback?: Function;
   root?: string|number|null;
   groupProperty?: string;
   groupingKeyCallback?: Function;
   groupHistoryId?: string;
   historyIdCollapsedGroups?: string;
}

export interface IDataContextOptions extends ISourceOptions,
    INavigationOptions<unknown>,
    IFilterOptions,
    ISortingOptions {
   prefetchSource: PrefetchProxy;
   keyProperty: string;
   items: RecordSet;
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

class Data extends Control<IDataOptions>/** @lends Controls/_list/Data.prototype */{
   protected _template: TemplateFunction = template;
   private _loading: boolean = false;
   private _itemsReadyCallback: Function = null;
   private _errorRegister: RegisterClass = null;
   private _sourceController: SourceController = null;
   private _dataOptionsContext: ContextOptions;

   private _items: RecordSet;
   private _filter: QueryWhereExpression<any>;

   _beforeMount(options: IDataOptions, context, receivedState: RecordSet|undefined): Promise<RecordSet>|void {

      // TODO придумать как отказаться от этого свойства
      this._itemsReadyCallback = this._itemsReadyCallbackHandler.bind(this);

      this._errorRegister = new RegisterClass({register: 'dataError'});

      this._sourceController = new SourceController(options);
      let controllerState = this._sourceController.getState();

      // TODO filter надо распространять либо только по контексту, либо только по опциям. Щас ждут и так и так
      this._filter = controllerState.filter;
      this._dataOptionsContext = this._createContext(controllerState);

      if (receivedState && isNewEnvironment()) {
         this._sourceController.setItems(receivedState);
         controllerState = this._sourceController.getState();

         // TODO items надо распространять либо только по контексту, либо только по опциям. Щас ждут и так и так
         this._items = controllerState.items;
         this._updateContext(controllerState);
      } else if (options.source) {
         return this._sourceController.load().then((items) => {

            // TODO items надо распространять либо только по контексту, либо только по опциям. Щас ждут и так и так
            this._items = this._sourceController.setItems(items);
            controllerState = this._sourceController.getState();
            this._updateContext(controllerState);
            return items;
         });
      } else {
         this._updateContext(controllerState);
      }
   }

   _beforeUpdate(newOptions: IDataOptions): void|Promise<RecordSet> {
      const isChanged = this._sourceController.update(newOptions);
      if (this._options.source !== newOptions.source) {
         this._loading = true;
         return this._sourceController.load().then((items) => {

            // для того чтобы мог посчитаться новый prefetch Source внутри
            const newItems = this._sourceController.setItems(items);
            if (!this._items) {
               this._items = newItems;
            }

            const controllerState = this._sourceController.getState();

            // TODO filter надо распространять либо только по контексту, либо только по опциям. Щас ждут и так и так
            this._filter = controllerState.filter;
            this._updateContext(controllerState);
            this._filter = newOptions.filter;
            this._loading = false;
            return items;
         });
      } else if (isChanged) {
         const controllerState = this._sourceController.getState();

         // TODO 1) filter надо распространять либо только по контексту, либо только по опциям. Щас ждут и так и так
         // TODO 2) getState у SourceController пересоздаёт prefetchProxy,
         // TODO поэтому весь state на контекст перекладывать нельзя, иначе список перезагрузится с теми же данными
         this._filter = controllerState.filter;
         this._dataOptionsContext.filter = controllerState.filter;
         this._dataOptionsContext.updateConsumers();
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
         const controllerState = this._sourceController.getState();
         this._updateContext(controllerState);
      }

      if (this._options.itemsReadyCallback) {
         this._options.itemsReadyCallback(items);
      }
   }

   _filterChanged(event, filter): void {
      this._sourceController.setFilter(filter);
      const controllerState = this._sourceController.getState();

      // TODO filter надо распространять либо только по контексту, либо только по опциям. Щас ждут и так и так
      this._filter = controllerState.filter;
      this._updateContext(controllerState);

      /* If filter changed, prefetchSource should return data not from cache,
         will be changed by task https://online.sbis.ru/opendoc.html?guid=861459e2-a229-441d-9d5d-14fdcbc6676a */
      this._dataOptionsContext.prefetchSource = this._options.source;
      this._dataOptionsContext.updateConsumers();
   }

   _rootChanged(event, root): void {
      this._notify('rootChanged', [root]);
   }

   // TODO сейчас есть подписка на itemsChanged из поиска. По хорошему не должно быть.
   _itemsChanged(event:Event, items): void {
      //search:Cotnroller fires two events after search: itemsChanged, filterChanged
      //on filterChanged event filter state will updated
      //on itemChanged event prefetchSource will updated, but createPrefetchSource method work async becouse of promise,
      //then we need to create prefetchSource synchronously

      // для того чтобы мог посчитаться новый prefetch Source внутри
      const newItems = this._sourceController.setItems(items);
      if (!this._items) {
         this._items = newItems;
      }

      const controllerState = this._sourceController.getState();
      this._updateContext(controllerState);
      event.stopPropagation();
   }

   private _createContext(options?: IControlerState): typeof ContextOptions {
      return new ContextOptions(options);
   }

   private _updateContext(sourceControllerState: IControlerState): void {
      const curContext = this._dataOptionsContext;

      for (const i in sourceControllerState) {
         if (sourceControllerState.hasOwnProperty(i)) {
            curContext[i] = sourceControllerState[i];
         }
      }
      curContext.updateConsumers();
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

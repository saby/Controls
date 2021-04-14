import {Control, TemplateFunction} from 'UI/Base';
import * as template from 'wml!Controls/_operationsPanel/OperationsPanel/OperationsPanel';
import {ItemTemplate as ToolbarItemTemplate} from 'Controls/toolbars';
import {Memory} from 'Types/source';
import * as WidthUtils from 'Controls/_operationsPanel/OperationsPanel/Utils';
import {ActualApi} from 'Controls/buttons';
import {EventUtils} from 'UI/Events';
import {RecordSet} from 'Types/collection';
import {SyntheticEvent} from 'Vdom/Vdom';
import {Record} from 'Types/entity';
import scheduleCallbackAfterRedraw from 'Controls/Utils/scheduleCallbackAfterRedraw';
import {IOperationsPanelItem, IOperationsPanelOptions} from './_interface/IOperationsPanel';
import 'css!Controls/toolbars';
import 'css!Controls/operationsPanel';

/*
 * Контрол, предназначенный для операций над множеством записей списка.
 * Подробное описание и инструкцию по настройке читайте <a href='/doc/platform/developmentapl/interface-development/controls/list/actions/operations/'>здесь</a>.
 * {@link /materials/Controls-demo/app/Controls-demo%2FOperationsPanel%2FDemo демо-пример}.
 *
 * @class Controls/_operationsPanel/OperationsPanel
 * @extends UI/Base:Control
 * @mixes Controls/interface:ISource
 * @mixes Controls/interface/IItemTemplate
 * @mixes Controls/interface:IHierarchy
 *
 * @private
 * @author Авраменко А.С.
 * @demo Controls-demo/OperationsPanel/Panel
 *
 */

/*
 * Control for grouping operations.
 * The detailed description and instructions on how to configure the control you can read <a href='/doc/platform/developmentapl/interface-development/controls/list/actions/operations/'>here</a>.
 * <a href="/materials/Controls-demo/app/Controls-demo%2FOperationsPanel%2FDemo">Demo</a>.
 *
 * @class Controls/_operations/OperationsPanel
 * @extends UI/Base:Control
 * @mixes Controls/interface:ISource
 * @mixes Controls/interface/IItemTemplate
 * @mixes Controls/interface:IHierarchy
 *
 * @private
 * @author Авраменко А.С.
 * @demo Controls-demo/OperationsPanel/Panel
 *
 */

export default class OperationsPanel extends Control<IOperationsPanelOptions> {
   protected _template: TemplateFunction = template;
   protected _oldToolbarWidth: number = 0;
   protected _initialized: boolean = false;
   protected _notifyHandler: typeof EventUtils.tmplNotify = EventUtils.tmplNotify;
   protected _items: RecordSet = null;
   protected _toolbarSource: Memory = null;
   protected _children: {
      toolbarBlock: HTMLElement
   };

   protected _loadData(source: Memory): Promise<RecordSet> | void {
      let result;
      if (source) {
         result = source.query().then((dataSet) => {
            this._resolveItems(dataSet.getAll(), dataSet.getKeyProperty());

            // TODO: https://online.sbis.ru/opendoc.html?guid=05bbeb41-d353-4675-9f73-6bfc654a5f00
            ActualApi.itemsSetOldIconStyle(this._items);
            return this._items;
         });
      }
      return result || Promise.resolve();
   }

   protected _recalculateToolbarItems(items: RecordSet, toolbarWidth: number): void {
      if (items) {
         this._oldToolbarWidth = toolbarWidth;
         this._toolbarSource = new Memory({
            keyProperty: this._options.keyProperty,
            data: WidthUtils.fillItemsType(
                this._options.keyProperty,
                this._options.parentProperty,
                items,
                toolbarWidth,
                this._options.theme,
                this._options.itemTemplate,
                this._options.itemTemplateProperty
            ).getRawData()
         });
      }
   }

   protected _loadDataCallback(data?: RecordSet, options?: IOperationsPanelOptions): RecordSet | void {
      if (!data) {
         this._setInitializedState(options);
      }
      return data;
   }

   protected _setInitializedState(options: IOperationsPanelOptions): void {
      this._initialized = true;

      if (options.operationsPanelOpenedCallback) {
         options.operationsPanelOpenedCallback();
      }
   }

   protected _checkToolbarWidth(): void {
      const newWidth = this._children.toolbarBlock.clientWidth;

      /**
       * Operations panel checks toolbar width on each update because we don't know if the rightTemplate has changed (will be fixed here: https://online.sbis.ru/opendoc.html?guid=b4ed11ba-1e4f-4076-986e-378d2ffce013 ).
       * Because of this the panel gets unnecessary redrawn after the mount. Usually this doesn't cause problems because width of the toolbar doesn't change and update is essentially skipped.
       * But if the panel becomes (or its parent) hidden and then updates, toolbar width is obviously 0 and that causes recalculation of toolbar items.
       * And it's even worse than that - panel can become visible again without updating and the user will get stuck with the wrong UI.
       * For example, this can happen if the user opens the panel and then immediately goes to another tab, making the tab with the panel hidden, and then goes back.
       * The only way to prevent this is to block recalculation of toolbar items if the panel is not visible.
       */
      if ((this._oldToolbarWidth !== newWidth || !this._toolbarSource) && this._container.offsetParent !== null) {
         this._oldToolbarWidth = newWidth;
         this._recalculateToolbarItems(this._items, newWidth);
      }
   }
   protected _resolveItems(items: RecordSet | IOperationsPanelItem[], keyProperty: string): void {
      let resultItems;
      if (items instanceof RecordSet) {
         resultItems = items;
      } else {
         resultItems = new RecordSet({
            rawData: items,
            keyProperty
         });
      }

      this._items = resultItems;
   }

   protected _beforeMount(options: IOperationsPanelOptions): Promise<void> | void {
      let result;

      if (options.source) {
         result = this._loadData(options.source);
         if (result instanceof Promise) {
            result.then((data) => {this._loadDataCallback(data, options); });
         }
      } else if (options.items) {
         this._resolveItems(options.items, options.keyProperty);
         this._loadDataCallback(this._items, options);
      } else {
         this._loadDataCallback(null, options);
      }

      return result;
   }

   protected _afterMount(): void {
      this._checkToolbarWidth();
      this._setInitializedState(this._options);
      scheduleCallbackAfterRedraw(this, () => {
         this._notify('controlResize', [], {bubbling: true});
      });
      this._notify('operationsPanelOpened');
   }

   protected _onResize(): void {
      this._checkToolbarWidth();
   }

   protected _afterUpdate(oldOptions: IOperationsPanelOptions): void {
      if (this._options.source !== oldOptions.source) {
         // We should recalculate the size of the toolbar only when all the children have updated,
         // otherwise available width may be incorrect.
         const loadResult = this._loadData(this._options.source);
         if (loadResult instanceof Promise) {
            loadResult.then(() => {
               this._recalculateToolbarItems(this._items, this._children.toolbarBlock.clientWidth);
            });
         }
      } else if (this._options.items !== oldOptions.items) {
         this._resolveItems(this._options.items, this._options.keyProperty);
         this._recalculateToolbarItems(this._items, this._children.toolbarBlock.clientWidth);
      } else {
         // TODO: размеры пересчитываются после каждого обновления, т.к. иначе нельзя понять что изменился rightTemplate
         // (там каждый раз новая функция)
         // TODO: https://online.sbis.ru/opendoc.html?guid=b4ed11ba-1e4f-4076-986e-378d2ffce013
         this._checkToolbarWidth();
      }
   }

   protected _itemClickHandler(event: SyntheticEvent<null>, item: Record, nativeEvent: MouseEvent): void {
      this._notify('itemClick', [item, nativeEvent, {
         selected: this._options.selectedKeys,
         excluded: this._options.excludedKeys
      }]);
   }

}

Object.defineProperty(OperationsPanel, 'defaultProps', {
   enumerable: true,
   configurable: true,

   get(): Partial<IOperationsPanelOptions> {
      return {
         itemTemplate: ToolbarItemTemplate
      };
   }
});

/**
 * @name Controls/_operationsPanel/OperationsPanel#rightTemplate
 * @cfg {Function} Шаблон, отображаемый в правой части панели массового выбора.
 * @example
 * <pre>
 *    <Controls.operations:Panel rightTemplate="wml!MyModule/OperationsPanelRightTemplate" />
 * </pre>
 */

/*
 * @name Controls/_operationsPanel/OperationsPanel#rightTemplate
 * @cfg {Function} Template displayed on the right side of the panel.
 * @example
 * <pre>
 *    <Controls.operations:Panel rightTemplate="wml!MyModule/OperationsPanelRightTemplate" />
 * </pre>
 */

/**
 * @event Происходит при клике на элемент.
 * @name Controls/_operationsPanel/OperationsPanel#itemClick
 * @param {Vdom/Vdom:SyntheticEvent} eventObject Дескриптор события.
 * @param {Types/entity:Record} item Элемент, по которому произвели клик.
 * @param {Object} originalEvent Дескриптор исходного события.
 * @example
 * TMPL:
 * <pre>
 *    <Controls.operations:Panel on:itemClick="onPanelItemClick()" />
 * </pre>
 * JS:
 * <pre>
 *    onPanelItemClick: function(e, selection) {
 *       var itemId = item.get('id');
 *       switch (itemId) {
 *          case 'remove':
 *             this._removeItems();
 *             break;
 *          case 'move':
 *             this._moveItems();
 *             break;
 *    }
 * </pre>
 */

/*
 * @event Occurs when an item was clicked.
 * @name Controls/_operationsPanel/OperationsPanel#itemClick
 * @param {Vdom/Vdom:SyntheticEvent} eventObject Descriptor of the event.
 * @param {Types/entity:Record} item Clicked item.
 * @param {Event} originalEvent Descriptor of the original event.
 * @example
 * TMPL:
 * <pre>
 *    <Controls.operations:Panel on:itemClick="onPanelItemClick()" />
 * </pre>
 * JS:
 * <pre>
 *    onPanelItemClick: function(e, selection) {
 *       var itemId = item.get('id');
 *       switch (itemId) {
 *          case 'remove':
 *             this._removeItems();
 *             break;
 *          case 'move':
 *             this._moveItems();
 *             break;
 *    }
 * </pre>
 */

/**
 * @name Controls/_operationsPanel/OperationsPanel#selectionViewMode
 * @cfg {String} Задает отображение дополнительных кнопок в меню мультивыбора.
 * @variant null Дополнительные кнопки скрыты
 * @variant all Кнопка "Показать отмеченные"
 * @variant selected Кнопка "Показать все"
 * @variant partial Кнопки с количеством записей для выбора
 * @default null
 * @example
 * <pre>
 *    class MyControl extends Control<IControlOptions> {
 *       _selectionViewMode: 'all'
 *       ...
 *    }
 * </pre>
 * <pre>
 *    <Controls.operations:Panel bind:selectionViewMode="_selectionViewMode"/>
 * </pre>
 */

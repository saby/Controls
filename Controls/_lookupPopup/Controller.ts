import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import * as template from 'wml!Controls/_lookupPopup/Controller';
import {Model} from 'Types/entity';
import {List, RecordSet} from 'Types/collection';
import { SyntheticEvent } from 'UICommon/Events';
import {IFormOperation} from 'Controls/interface';
import * as Deferred from 'Core/Deferred';
import {RegisterClass} from 'Controls/event';
import {IRegisterClassConfig} from 'Controls/_event/RegisterClass';
import Utils = require('Types/util');
import ParallelDeferred = require('Core/ParallelDeferred');
import chain = require('Types/chain');

export interface ILookupPopupControllerOptions extends IControlOptions {
   selectionLoadMode: boolean;
   selectedItems: List<Model> | RecordSet;
   keyProperty: string;
}

/**
 *
 * Контроллер, который позволяет выбирать данные из одного или нескольких списков (например, из {@link Controls/list:View} или {@link Controls/grid:View}).
 * Используется вместе с {@link Controls/lookupPopup:Container}.
 * Можно использовать как плоский, так и иерархический список.
 *
 * Подробное описание и инструкцию по настройке смотрите в <a href='/doc/platform/developmentapl/interface-development/controls/directory/layout-selector-stack/'>статье</a>.
 *
 * <a href="/materials/Controls-demo/app/Engine-demo%2FSelector">Пример</a> использования контрола.
 *
 * @class Controls/_lookupPopup/Controller
 * @extends UI/Base:Control
 *
 * @public
 * @author Герасимов А.М.
 */

/*
 *
 * Controller, which allows you to select data from several or one list (like {@link /docs/js/Controls/grid/View/ Controls/list:View} or {@link /docs/js/Controls/grid/View/ Controls/grid:View}).
 * Used with containers:
 * You can use flat and hierarchical list.
 *
 * More information you can read <a href='/doc/platform/developmentapl/interface-development/controls/layout-selector-stack/'>here</a>.
 *
 * <a href="/materials/Controls-demo/app/Engine-demo%2FSelector">Here</a> you can see a demo.
 *
 * @class Controls/_lookupPopup/Controller
 * @extends UI/Base:Control
 *
 * @public
 * @author Герасимов Александр Максимович
 */
export default class Controller extends Control<ILookupPopupControllerOptions> {
   protected _template: TemplateFunction = template;

   _selectedItems: List<Model> | RecordSet = null;
   _selectionLoadDef: typeof ParallelDeferred = null;
   _formOperationsStorage: IFormOperation[] = null;
   _selectCompleteRegister: RegisterClass = null;

   protected _beforeMount(options: ILookupPopupControllerOptions): void {
      this._selectedItems = Controller._prepareItems(options.selectedItems);
      this._formOperationsStorage = [];
      this._selectCompleteRegister = new RegisterClass({register: 'selectComplete'});
   }

   protected _beforeUpdate(newOptions: ILookupPopupControllerOptions): void {
      if (this._options.selectedItems !== newOptions.selectedItems) {
         this._selectedItems = Controller._prepareItems(newOptions.selectedItems);
      }
   }

   protected _registerHandler(event: Event, registerType: string,
                              component: Control, callback: Function, config: IRegisterClassConfig): void {
      this._selectCompleteRegister.register(event, registerType, component, callback, config);
   }

   protected _unregisterHandler(event: Event, registerType: string,
                                component: Control, config: IRegisterClassConfig): void {
      this._selectCompleteRegister.unregister(event, registerType, component, config);
   }

   protected _beforeUnmount(): void {
      if (this._selectCompleteRegister) {
         this._selectCompleteRegister.destroy();
         this._selectCompleteRegister = null;
      }
   }

   protected _selectComplete(event?: SyntheticEvent<'selectComplete'>, multiSelect?: boolean): void {
      const selectCallback = (selectResult) => {
         this._notify('sendResult', [selectResult], {bubbling: true});
         this._notify('close', [], {bubbling: true});
      };

      this._startFormOperations().then(() => {
         this._selectCompleteRegister.start(event);

         if (this._selectionLoadDef) {
            this._selectionLoadDef.done().getResult().addCallback((result) => {
               // FIXME https://online.sbis.ru/opendoc.html?guid=7ff270b7-c815-4633-aac5-92d14032db6f
               // необходимо уйти от опции selectionLoadMode и вынести загрузку
               // выбранный записей в отдельный слой.
               // Результат контроллера должен быть однозначный (только фильтры)
               if (this._options.selectionLoadMode) {
                  if (multiSelect === false) {
                     // toDO !KONGO Если выбрали элемент из справочника в режиме единичного выбора,
                     // то очистим список выбранных элементов и возьмем только запись из этого справочника
                     this._selectedItems.clear();
                  }
                  Controller._processSelectionResult(result, this._selectedItems,
                     multiSelect, this._options.keyProperty);
                  selectCallback(this._selectedItems);
               } else {
                  selectCallback(result);
               }
               this._selectionLoadDef = null;
               return result;
            }).addErrback(() => {
               this._selectionLoadDef = null;
            });
         } else {
            selectCallback(this._selectedItems);
         }
      });
   }

   protected _registerFormOperationHandler(event: Event, operation: IFormOperation): void {
      this._formOperationsStorage.push(operation);
   }

   private _startFormOperations(): Promise<unknown> {
      const resultPromises = [];

      this._formOperationsStorage.forEach((operation: IFormOperation) => {
         if (!operation.isDestroyed()) {
            const result = operation.save();
            if (result instanceof Promise || result instanceof Deferred) {
               resultPromises.push(result);
            }
         }
      });

      return Promise.all(resultPromises);
   }

   protected _selectionLoad(event: SyntheticEvent, deferred: Deferred): void {
      if (!this._selectionLoadDef) {
         this._selectionLoadDef = new ParallelDeferred();
      }
      this._selectionLoadDef.push(deferred);
   }

   selectComplete(): void {
      this._selectComplete();
   }

   private static _processSelectionResult(result: object, selectedItems: List<Model> | RecordSet,
                                          multiSelect?: boolean, keyProp?: string): void {
      if (result) {
         for (const i in result) {
            if (result.hasOwnProperty(i) && (multiSelect !== false || result[i].selectCompleteInitiator)) {
               const initialSelection = result[i].initialSelection;
               const resultSelection = result[i].resultSelection;
               const keyProperty = keyProp || result[i].keyProperty;

               chain.factory(initialSelection).each((item: Model) => {
                  Controller._removeFromSelected(item, selectedItems, keyProperty);
               });
               chain.factory(resultSelection).each((item: Model) => {
                  Controller._addItemToSelected(item, selectedItems, keyProperty);
               });
            }
         }
      }
   }

   private static _prepareItems(items: List<Model> | RecordSet): List<Model> {
      return items ? Utils.object.clone(items) : new List();
   }

   private static _addItemToSelected(item: Model, selectedItems: List<Model> | RecordSet, keyProperty: string): void {
      const index = selectedItems.getIndexByValue(keyProperty, item.get(keyProperty));

      if (index === -1) {
         selectedItems.add(item);
      } else {
         selectedItems.replace(item, index);
      }
   }

   private static _removeFromSelected(item: Model, selectedItems: List<Model> | RecordSet, keyProperty: string): void {
      const index = selectedItems.getIndexByValue(keyProperty, item.get(keyProperty));

      if (index !== -1) {
         selectedItems.removeAt(index);
      }
   }

   static getDefaultOptions(): Partial<ILookupPopupControllerOptions> {
      return {
         selectionLoadMode: true
      };
   }
}

/**
 * @name Controls/_lookupPopup/Controller#selectedItems
 * @cfg {null|Types/collection:RecordSet} Выбранные элементы.
 * @default null
 * @example
 * В этом примере будет открыта стековая панель с двумя выбранными записями.
 *
 * JS
 * <pre>
 *    import {RecordSet} from "Types/collection";
 *
 *    _openSelector: function() {
 *       var selectedItems = new RecordSet({
 *            rawData: [
 *               {id: 'Yaroslavl', title: 'Ярославль'},
 *               {id: 'Moscow', title: 'Москва'}
 *            ],
 *            keyProperty: 'id'
 *       });
 *       this._children.stackOpener.open({
 *          templateOptions: {
 *                selectedItems: selectedItems
 *            }
 *        });
 *    }
 * </pre>
 *
 * WML
 * <pre>
 *     <Controls.buttons:Button caption="Open selector" on:click='_openSelector'/>
 *     <Controls.popup:Stack name="stackOpener" template="mySelectorTemplate"/>
 * </pre>
 *
 * mySelectorTemplate.wml
 * <pre>
 *    <Controls.lookupPopup:Controller selectedItems="{{_options.selectedItems}}">
 *       ...
 *    </Controls.lookupPopup:Controller>
 * </pre>
 */

/*
 * @name Controls/_lookupPopup/Controller#selectedItems
 * @cfg {null|Types/collection:RecordSet} The items that are selected.
 * @default null
 * @example
 * In this example stack with two selected items will opened.
 *
 * JS
 * <pre>
 *    import {RecordSet} from "Types/collection";
 *
 *    _openSelector: function() {
 *       var selectedItems = new RecordSet({
 *            rawData: [
 *               {id: 'Yaroslavl', title: 'Ярославль'},
 *               {id: 'Moscow', title: 'Москва'}
 *            ],
 *            keyProperty: 'id'
 *       });
 *       this._children.stackOpener.open({
 *          templateOptions: {
 *                selectedItems: selectedItems
 *            }
 *        });
 *    }
 * </pre>
 *
 * WML
 * <pre>
 *     <Controls.buttons:Button caption="Open selector" on:click='_openSelector'/>
 *     <Controls.popup:Stack name="stackOpener" template="mySelectorTemplate"/>
 * </pre>
 *
 * mySelectorTemplate.wml
 * <pre>
 *    <Controls.lookupPopup:Controller selectedItems="{{_options.selectedItems}}">
 *       ...
 *    </Controls.lookupPopup:Controller>
 * </pre>
 */

Object.defineProperty(Controller, 'defaultProps', {
   enumerable: true,
   configurable: true,

   get(): object {
      return Controller.getDefaultOptions();
   }
});

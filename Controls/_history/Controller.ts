import * as Control from 'Core/Control';
import IHistoryController, {IHistoryControllerOptions} from 'Controls/_history/IHistoryController';
import {RecordSet} from 'Types/collection';
import * as cInstance from 'Core/core-instance';
import {Model} from 'Types/entity';
import {default as Source} from 'Controls/_history/Source';
import {default as Service} from 'Controls/_history/Service';
import * as Deferred from 'Core/Deferred';
import Merge = require('Core/core-merge');

/**
 * Контроллер для истории.
 *
 * @class Controls/_history/Controller
 * @extends Core/Control
 * @mixes Controls/_history/IHistoryController
 * @author Мельникова Е.А.
 * @control
 * @private
 */

/*
 * Controller for history of lists
 *
 * @class Controls/_history/Controller
 * @extends Core/Control
 * @mixes Controls/_history/IHistoryController
 * @author Мельникова Е.А.
 * @control
 * @private
 */

export class Controller implements IHistoryController {
   protected _options: IHistoryControllerOptions = null;
   protected _historySource: Source = null;

   constructor(options: IHistoryControllerOptions) {
      this._options = options;
      this._historySource = options.source;
   }

   updateOptions(newOptions: IHistoryControllerOptions): void {
      this._options = newOptions;
      this._historySource = newOptions.source;
   }

   setHistory(history?: RecordSet): void {
      if (history) {
         this._options.source.setHistory(history);
      }
   }

   getPreparedSource(): Source {
      let sourcePromise;

      if (this.hasHistory(this._options) && Controller.isLocalSource(this._options.source) && !this._options.historyNew) {
         sourcePromise = this._getSource();
      } else {
         sourcePromise = Promise.resolve(this._options.source);
      }
      sourcePromise.then((source) => {
         this._historySource = source;
      });
      return this._historySource;
   }

   getPreparedFilter(): object {
      let filter = this._options.filter;

      if (this.hasHistory(this._options)) {
         if (Controller.isLocalSource(this._options.source) || !this._options.historyNew) {
            filter = this._getSourceFilter();
         } else {
            filter.historyIds = [this._options.historyId];
         }
      }

      return filter;
   }

   getPreparedItem(item: Model): Model {
      if (Controller.isHistorySource(this._options.source)) {
         return this._options.source.resetHistoryFields(item, this._options.keyProperty);
      } else {
         return item;
      }
   }

   getPreparedItems(items?: RecordSet, history?: RecordSet): RecordSet {
      return history ? this._options.source.prepareItems(items) : items;
   }

   updateHistory(items: RecordSet): void {
      if (Controller.isHistorySource(this._options.source)) {
         this._options.source.update(items, Controller.getMetaHistory());
      }
   }

   hasHistory(options: IHistoryControllerOptions): boolean|string {
      return options.historyId || Controller.isHistorySource(options.source);
   }

   getItemsWithHistory(): RecordSet {
      if(this._options.source.getItems) {
         return this._options.source.getItems();
      }
   }

   private _createHistorySource(): Source {
      return new Source({
         originSource: this._options.source,
         historySource: new Service({
            historyId: this._options.historyId
         })
      });
   }

   private _getSource(): Promise<Source> {
      const historyLoad = new Deferred();

      if (!this._options.historyId || Controller.isHistorySource(this._options.source)) {
         historyLoad.callback(this._options.source);
      } else {
         historyLoad.callback(this._createHistorySource());
      }
      return historyLoad;
   }

   private _getSourceFilter(): object {
      // TODO: Избавиться от проверки, когда будет готово решение задачи https://online.sbis.ru/opendoc.html?guid=e6a1ab89-4b83-41b1-aa5e-87a92e6ff5e7
      if (Controller.isHistorySource(this._options.source)) {
         return Merge(Controller.getMetaHistory(), this._options.filter || {});
      }
      return this._options.filter;
   }

   static isLocalSource(source: Source): boolean {
      return cInstance.instanceOfModule(source, 'Types/source:Local');
   }

   static getMetaHistory(): object {
      return {
         $_history: true
      };
   }

   static isHistorySource(source: unknown): boolean {
      return cInstance.instanceOfModule(source, 'Controls/history:Source');
   }
}

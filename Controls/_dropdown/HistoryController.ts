import * as Control from 'Core/Control';
import IDropdownHistoryController, {IDropdownHistoryControllerOptions} from 'Controls/_dropdown/interface/IDropdownHistoryController';
import {ICrudPlus} from 'Types/source';
import {RecordSet} from 'Types/collection';
import {getSourceFilter, isHistorySource, getSource, getMetaHistory} from 'Controls/_dropdown/dropdownHistoryUtils';
import * as cInstance from 'Core/core-instance';
import {Model} from 'Types/entity';

/**
 * Контроллер для истории выпадающих списков.
 *
 * @class Controls/_dropdown/HistoryController
 * @extends Core/Control
 * @mixes Controls/_dropdown/interface/IDropdownHistoryController
 * @author Мельникова Е.А.
 * @control
 * @private
 */

/*
 * Controller for history of dropdown lists
 *
 * @class Controls/_dropdown/HistoryController
 * @extends Core/Control
 * @mixes Controls/_dropdown/interface/IDropdownHistoryController
 * @author Мельникова Е.А.
 * @control
 * @private
 */

export default class HistoryController implements IDropdownHistoryController {
   protected _options: IDropdownHistoryControllerOptions = null;
   protected _historySource: ICrudPlus = null;

   constructor(options: IDropdownHistoryControllerOptions) {
      this._options = options;
      this._historySource = options.source;
   }

   update(newOptions: IDropdownHistoryControllerOptions): void {
      this._options = newOptions;
      this._historySource = newOptions.source;
   }

   setHistory(history?: RecordSet): void {
      if (history) {
         this._options.source.setHistory(history);
      }
   }

   getPreparedSource(): ICrudPlus {
      let sourcePromise;

      if (this.hasHistory(this._options) && this._isLocalSource(this._options.source) && !this._options.historyNew) {
         sourcePromise = getSource(this._options.source, this._options.historyId);
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
         if (this._isLocalSource(this._options.source) || !this._options.historyNew) {
            filter = getSourceFilter(this._options.filter, this._options.source);
         } else {
            filter.historyIds = [this._options.historyId];
         }
      }

      return filter;
   }

   getPreparedItem(item: Model): Model {
      if (isHistorySource(this._options.source)) {
         return this._options.source.resetHistoryFields(item, this._options.keyProperty);
      } else {
         return item;
      }
   }

   getPreparedItems(items?: RecordSet, history?: RecordSet): RecordSet {
      return history ? this._options.source.prepareItems(items) : items;
   }

   updateHistory(items: RecordSet): void {
      if (isHistorySource(this._options.source)) {
         this._options.source.update(items, getMetaHistory());
      }
   }

   hasHistory(options: IDropdownHistoryControllerOptions): boolean {
      return options.historyId || isHistorySource(options.source);
   }

   getItemsWithHistory(): RecordSet {
      if(this._options.source.getItems) {
         return this._options.source.getItems();
      }
   }

   private _isLocalSource(source: ICrudPlus): boolean {
      return cInstance.instanceOfModule(source, 'Types/source:Local');
   }
}

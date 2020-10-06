import {QueryWhereExpression} from 'Types/source';
import {RecordSet} from 'Types/collection';
import {ISearchControllerOptions, ISearchController} from './interface';

export default class Controller implements ISearchController {

   protected _options: ISearchControllerOptions = null;

   protected _searchValue: string = '';

   constructor(options: ISearchControllerOptions) {
      this._options = options;
   }

   private _updateFilter(filter: QueryWhereExpression<unknown>): Promise<RecordSet> {
      const sourceController = this._options.sourceController;

      sourceController.setFilter(filter);
      return sourceController.load().then((v) => {
         if (v instanceof RecordSet) {
            return v;
         }
      });
   }

   reset(): Promise<void> {
      const filter = {...this._options.sourceController.getFilter()};
      delete filter[this._options.searchParam];
      this._searchValue = '';
      return this._updateFilter(filter).then();
   }

   search(value: string): Promise<RecordSet> {
      const filter: QueryWhereExpression<unknown> = {...this._options.sourceController.getFilter()};

      filter[this._options.searchParam] = this._searchValue = this._trim(value);

      return this._updateFilter(filter);
   }

   update(options: Partial<ISearchControllerOptions>): void {
      if (options.hasOwnProperty('searchValue')) {
         if (options?.searchValue !== this._searchValue) {
            if (options.searchValue) {
               this.search(options.searchValue).then();
            } else {
               this.reset().then();
            }
         }
      }
      this._options = {
         ...this._options,
         ...options
      };
   }

   private _trim(value: string): string {
      return this._options.searchValueTrim && value ? value.trim() : value;
   }
}

import {ISearchResolver, ISearchResolverOptions} from './interface';

export default class SearchResolver implements ISearchResolver {

   protected _delayTimer: NodeJS.Timeout = null;

   protected _options: ISearchResolverOptions = null;

   protected _searchStarted: boolean = false;

   constructor(options: ISearchResolverOptions) {
      this._options = options;
   }

   updateOptions(options: ISearchResolverOptions): void {
      this._options = options;
   }

   private _resolveCallback(callback: Function, value: string, searchStarted: boolean): void {
      if (this._options.delayTime) {
         this._callAfterDelay(callback, value).then(() => {
            this._searchStarted = searchStarted;
         });
      } else {
         callback(value);
         this._searchStarted = searchStarted;
      }
   }

    clearTimer(): void {
      if (this._delayTimer) {
         clearTimeout(this._delayTimer);
         this._delayTimer = null;
      }
   }

   private _callAfterDelay(callback: Function, value: string): Promise<void> {
      this.clearTimer();

      return new Promise((resolve) => {
         this._delayTimer = setTimeout(() => {
            this._delayTimer = null;
            callback(value);
            resolve();
         }, this._options.delayTime);
      });
   }

   resolve(value: string | null): void {
      const valueLength = value ? value.length : 0;
      const minSearchLength = this._options.minSearchLength !== null;

      if (minSearchLength && valueLength >= this._options.minSearchLength) {
         this._resolveCallback(this._options.searchCallback, value, true);
      } else if (minSearchLength || !valueLength) {
         if (this._options.delayTime) {
            this.clearTimer();
         }
         if (this._searchStarted) {
            if (valueLength) {
               this._resolveCallback(this._options.searchResetCallback, value, false);
            } else {
               this._options.searchResetCallback();
               this._searchStarted = false;
            }
         }
      }
   }

   setSearchStarted(value: boolean): void {
      this._searchStarted = value;
   }
}

import {Control, TemplateFunction} from 'UI/Base';
import * as template from 'wml!Controls/_search/Input/Container';
import {SyntheticEvent} from 'UI/Vdom';
import SearchResolver from 'Controls/_search/SearchResolver';
import {ISearchInputContainerOptions} from '../interface';
import {default as Store} from 'Controls/Store';
import {constants} from 'Env/Env';

export default class Container extends Control<ISearchInputContainerOptions> {
   protected _template: TemplateFunction = template;

   protected _value: string;
   protected _contextCallbackId: string;
   protected _searchResolverController: SearchResolver = null;

   protected _beforeMount(options?: ISearchInputContainerOptions): void {
      if (this._options.inputSearchValue !== options.inputSearchValue) {
         this._value = options.inputSearchValue;
      }
   }

   protected _beforeUnmount(): void {
      if (this._searchResolverController) {
         this._searchResolverController.clearTimer();
      }
      if (this._contextCallbackId) {
         Store.unsubscribe(this._contextCallbackId);
      }
   }

   protected _beforeUpdate(newOptions: ISearchInputContainerOptions): void {
      if (this._options.inputSearchValue !== newOptions.inputSearchValue) {
         this._value = newOptions.inputSearchValue;
      }
   }

   protected _afterMount(): void {
      if (this._options.useStore) {
         this._contextCallbackId = Store.onPropertyChanged(
             '_contextName',
             () => {
                this._value = this._options.inputSearchValue;
             },
             true
         );
      }
   }

   protected _getSearchDelayController(): SearchResolver {
      if (!this._searchResolverController) {
         this._searchResolverController = new SearchResolver({
            delayTime: this._options.searchDelay,
            minSearchLength: this._options.minSearchLength,
            searchCallback: this._notifySearch.bind(this),
            searchResetCallback: this._notifySearchReset.bind(this)
         });
      }

      return this._searchResolverController;
   }

   protected _notifySearch(value: string): void {
      this._resolve(value);
   }

   private _resolve(value: string): void {
      if (this._options.useStore) {
         Store.dispatch('searchValue', value);
      } else {
         this._notify('search', [value || ''], {bubbling: true});
      }
   }

   protected _notifySearchReset(): void {
      this._notify('searchReset', [], {bubbling: true});
   }

   protected _searchClick(event: SyntheticEvent): void {
      if (this._value) {
         this._getSearchDelayController().setSearchStarted(true);
         this._resolve(this._value);
      }
   }

   protected _valueChanged(event: SyntheticEvent, value: string): void {
      if (this._value !== value) {
         this._value = value;
         this._getSearchDelayController().resolve(value);
      }
   }

   protected _keyDown(event: SyntheticEvent<KeyboardEvent>): void {
      if (event.nativeEvent.which === constants.key.enter) {
         event.stopPropagation();
      }
   }

   static getDefaultOptions(): ISearchInputContainerOptions {
      return {
         minSearchLength: 3,
         searchDelay: 500
      };
   }
}

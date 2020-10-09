import {Control, TemplateFunction} from 'UI/Base';
import * as template from 'wml!Controls/_searchNew/InputContainer';
import {SyntheticEvent} from 'UI/Vdom';
import SearchResolver from './SearchResolver';
import {ISearchInputContainerOptions} from './interface';

export default class InputContainer extends Control<ISearchInputContainerOptions> {
   protected _template: TemplateFunction = template;

   protected _value: string;
   protected _searchDelayController: SearchResolver = null;

   protected _beforeMount(options?: ISearchInputContainerOptions): void {
      this._initSearchDelayController();
   }

   protected _initSearchDelayController(): void {
      if (!this._searchDelayController) {
         this._searchDelayController = new SearchResolver({
            delayTime: this._options.delayTime,
            minSearchLength: this._options.minSearchValueLength,
            searchCallback: this._notifySearch,
            searchResetCallback: this._notifySearchReset
         });
      }
   }

   protected _notifySearch(value: string): void {
      this._notify('search', [value || ''], {bubbling: true});
   }

   protected _notifySearchReset(): void {
      this._notify('searchReset', [], {bubbling: true});
   }

   protected _searchClick(event: SyntheticEvent): void {
      if (this._value) {
         this._notify('search', [this._value || ''], {bubbling: true});
      }
   }

   protected _valueChanged(event: SyntheticEvent, value: string): void {
      if (this._value !== value) {
         this._value = value;
         this._searchDelayController.resolve(value);
      }
   }
}

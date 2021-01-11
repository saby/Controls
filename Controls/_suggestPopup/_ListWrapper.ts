import * as template from 'wml!Controls/_suggestPopup/_ListWrapper';
import _SuggestOptionsField = require('Controls/_suggestPopup/_OptionsField');
import 'Controls/Container/Async';
import {IControlOptions, Control, TemplateFunction} from 'UI/Base';
import {SyntheticEvent} from 'UI/Vdom';

/**
 * Proxy container for suggest options.
 *
 * @class Controls/_suggestPopup/_ListWrapper
 * @extends UI/Base:Control
 * 
 * @private
 */

export default class ListWrapper extends Control<IControlOptions> {
   protected _template: TemplateFunction = template;

   private _suggestOptionsContext: typeof _SuggestOptionsField;

   protected _getChildContext(): object {
      return {
         suggestOptionsField: this._suggestOptionsContext
      };
   }

   private _updateContext(options: object): void {
      const curContext = this._suggestOptionsContext;

      curContext.options = {
         ...curContext.options,
         ...options
      };

      curContext.updateConsumers();
   }

   protected _beforeMount(options?: IControlOptions): void {
      this._suggestOptionsContext = new _SuggestOptionsField(options);
   }

   protected _beforeUpdate(options?: IControlOptions, contexts?: any): void {
      this._updateContext(options);
   }

   protected _tabsSelectedKeyChanged(event: SyntheticEvent, key: string | number | null): void {
      this._notify('tabsSelectedKeyChanged', [key]);
   }

   static _theme: string[] = ['Controls/suggest', 'Controls/suggestPopup'];
}

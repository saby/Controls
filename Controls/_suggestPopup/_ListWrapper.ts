import * as template from 'wml!Controls/_suggestPopup/_ListWrapper';
import 'Controls/Container/Async';
import {IControlOptions, Control, TemplateFunction} from 'UI/Base';
import _OptionsField from 'Controls/_suggestPopup/_OptionsField';
import 'css!Controls/suggestPopup';
import 'css!Controls/suggest';

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
   private _suggestOptionsContext: _OptionsField;

   protected _beforeMount(options: object): void {
      this._suggestOptionsContext = new _OptionsField(options);
   }

   protected _beforeUpdate(newOptions: object): void {
      this._suggestOptionsContext.setOptions(newOptions);
   }

   protected _getChildContext(): object {
      return {
         suggestOptionsField: this._suggestOptionsContext
      };
   }
}

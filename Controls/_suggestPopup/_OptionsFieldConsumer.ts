import { Control, TemplateFunction } from 'UI/Base';
import * as template from 'wml!Controls/_suggestPopup/_OptionsFieldConsumer';
import _OptionsField from 'Controls/_suggestPopup/_OptionsField';

interface IOptionsFieldConsumerContext {
   suggestOptionsField: _OptionsField;
}

export default class OptionsFieldConsumer extends Control {
   _template: TemplateFunction = template;
   protected _suggestListOptions: object;

   protected _beforeMount(options: unknown, context: IOptionsFieldConsumerContext): void {
      this._suggestListOptions = context.suggestOptionsField.options;
   }

   protected _beforeUpdate(newOptions: unknown, newContext: IOptionsFieldConsumerContext): void {
      // всегда присваиваю новое значение, чтобы не костылять со сложными проверками
      this._suggestListOptions = newContext.suggestOptionsField.options;
   }

   static contextTypes(): object {
      return {
         suggestOptionsField: _OptionsField
      };
   }
}

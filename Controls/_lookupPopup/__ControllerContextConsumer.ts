import { Control, TemplateFunction } from 'UI/Base';
import * as template from 'wml!Controls/_lookupPopup/__ControllerContextConsumer';
import SelectorContext from 'Controls/_lookupPopup/__ControllerContext';
import { List, RecordSet } from 'Types/collection';
import { Model } from 'Types/entity';

interface IControllerContextConsumerContext {
   selectorControllerContext: SelectorContext;
}

export default class ControllerContextConsumer extends Control {
   _template: TemplateFunction = template;
   protected _selectedItems: List<Model> | RecordSet;

   protected _beforeMount(options: unknown, context: IControllerContextConsumerContext): void {
      this._selectedItems = context.selectorControllerContext.selectedItems;
   }

   protected _beforeUpdate(newOptions: unknown, newContext: IControllerContextConsumerContext): void {
      // всегда присваиваю новое значение, чтобы не костылять со сложными проверками
      this._selectedItems = newContext.selectorControllerContext.selectedItems;
   }

   static contextTypes(): object {
      return {
         selectorControllerContext: SelectorContext
      };
   }
}

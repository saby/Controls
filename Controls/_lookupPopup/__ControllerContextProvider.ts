import { Control, TemplateFunction, IControlOptions } from 'UI/Base';
import * as template from 'wml!Controls/_lookupPopup/__ControllerContextProvider';
import SelectorContext from 'Controls/_lookupPopup/__ControllerContext';
import { List, RecordSet } from 'Types/collection';
import { Model } from 'Types/entity';

interface IOptions extends IControlOptions {
   selectedItems?: List<Model> | RecordSet;
}

export default class ControllerContextProvider extends Control<IOptions> {
   _template: TemplateFunction = template;
   protected _selectorContext: SelectorContext;
   private itemsVersion: number;

   protected _beforeMount(options: IOptions): void {
      this._selectorContext = new SelectorContext(options.selectedItems);
      this.itemsVersion = options.selectedItems.getVersion();
   }

   protected _beforeUpdate(newOptions: IOptions): void {
      if (
         this._options.selectedItems !== newOptions.selectedItems ||
         (newOptions.selectedItems &&
            this.itemsVersion !== newOptions.selectedItems.getVersion())
      ) {
         this.itemsVersion = newOptions.selectedItems.getVersion();
         this._selectorContext.setItems(newOptions.selectedItems);
      }
   }

   _getChildContext(): object {
      return {
         selectorControllerContext: this._selectorContext
      };
   }
}

import { Control, TemplateFunction, IControlOptions } from 'UI/Base';
import * as template from 'wml!Controls/_filterPopup/_FilterPanelOptionsConsumer';
import _FilterPanelOptions from 'Controls/_filterPopup/Panel/Wrapper/_FilterPanelOptions';

import { IFilterItem } from 'Controls/filter';

interface IOptions extends IControlOptions {
   items?: IFilterItem[];
   historyId?: string;
}

interface IFilterPanelOptionsConsumerContext {
   filterPanelOptionsField: _FilterPanelOptions;
}

export default class ControllerContextConsumer extends Control<IOptions> {
   _template: TemplateFunction = template;
   protected _items: IFilterItem[];
   protected _historyId: string;

   protected _beforeMount(
      options: IOptions,
      context: IFilterPanelOptionsConsumerContext
   ): void {
      this._items = options.items ?? context.filterPanelOptionsField.items;
      this._historyId =
         options.historyId ?? context.filterPanelOptionsField.historyId;
   }

   protected _beforeUpdate(
      newOptions: IOptions,
      newContext: IFilterPanelOptionsConsumerContext
   ): void {
      // всегда присваиваю новое значение, чтобы не костылять со сложными проверками
      this._items =
         newOptions.items ?? newContext.filterPanelOptionsField.items;
      this._historyId =
         newOptions.historyId ?? newContext.filterPanelOptionsField.historyId;
   }

   static contextTypes(): object {
      return {
         filterPanelOptionsField: _FilterPanelOptions
      };
   }
}

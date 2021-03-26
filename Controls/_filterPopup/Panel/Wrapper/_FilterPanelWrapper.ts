import { Control, TemplateFunction, IControlOptions } from 'UI/Base';
import template = require('wml!Controls/_filterPopup/Panel/Wrapper/_FilterPanelWrapper');
import _FilterPanelOptions from 'Controls/_filterPopup/Panel/Wrapper/_FilterPanelOptions';
import { IFilterItem } from 'Controls/filter';

interface IOptions extends IControlOptions {
   items: IVersionableArray<IFilterItem>;
   historyId: string;
}

// завязка на реализацию нашей реактивности. Но это лучше, чем бегать по массиву и сравнивать всё
interface IVersionableArray<T> extends Array<T> {
   getArrayVersion?: () => number;
}

/**
 * Proxy container for filter panel options.
 *
 * @class Controls/_filterPopup/Panel/Wrapper/_FilterPanelWrapper
 * @extends UI/Base:Control
 *
 * @private
 */
export default class FilterPanelWrapper extends Control<IOptions> {
   _template: TemplateFunction = template;
   protected _filterOptionsContext: _FilterPanelOptions;
   private itemsVersion: number;

   protected _beforeMount(options: IOptions): void {
      this._filterOptionsContext = new _FilterPanelOptions(
         options.items,
         options.historyId
      );
      this.itemsVersion = options.items?.getArrayVersion();
   }

   protected _beforeUpdate(newOptions: IOptions): void {
      if (this._options.historyId !== newOptions.historyId) {
         this._filterOptionsContext.setHistoryId(newOptions.historyId);
      }
      if (
         this._options.items !== newOptions.items ||
         this.itemsVersion !== newOptions.items?.getArrayVersion()
      ) {
         this.itemsVersion = newOptions.items?.getArrayVersion();
         this._filterOptionsContext.setItems(newOptions.items);
      }
   }

   _getChildContext(): object {
      return {
         filterPanelOptionsField: this._filterOptionsContext
      };
   }
}

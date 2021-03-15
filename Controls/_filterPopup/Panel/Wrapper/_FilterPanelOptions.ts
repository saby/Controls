/**
 * Context field for filter panel options
 */
import DataContext = require('Core/DataContext');
import { IFilterItem } from 'Controls/filter';

export default class FilterPanelOptions extends DataContext {
   _moduleName: string;
   items: IFilterItem[];
   historyId: string;
   constructor(items: FilterPanelOptions['items'], historyId: string) {
      super();
      this.items = items;
      this.historyId = historyId;
   }
   setItems(items: FilterPanelOptions['items']): void {
      this.items = items;
      // Core/DataContext написан на js, в итоге с него не цепляются типы
      // tslint:disable-next-line:ban-ts-ignore
      // @ts-ignore
      this.updateConsumers();
   }
   setHistoryId(historyId: FilterPanelOptions['historyId']): void {
      this.historyId = historyId;
      // Core/DataContext написан на js, в итоге с него не цепляются типы
      // tslint:disable-next-line:ban-ts-ignore
      // @ts-ignore
      this.updateConsumers();
   }
}

FilterPanelOptions.prototype._moduleName =
   'Controls/_filterPopup/Panel/Wrapper/_FilterPanelOptions';

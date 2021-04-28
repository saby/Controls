/**
 * Context field for container options
 * @author Герасимов Александр
 * @deprecated
 * @class Controls/_context/ContextOptions
 * @private
 */

import * as DataContext from 'Core/DataContext';
import { ISourceControllerState, NewSourceController } from 'Controls/dataSource';
import { TFilter, TKey } from 'Controls/interface';
import { RecordSet } from 'Types/collection';

export interface IContextOptionsValue {
   newLayout?: boolean; // до 3100 для OnlinePage/_base/View/Content.ts и Layout/_browsers/Browser/Tabs.ts
   items?: RecordSet;
   source?: unknown;
   keyProperty?: TKey;
   filter?: TFilter;
   sourceController?: NewSourceController;
   listsConfigs?: ISourceControllerState[];
   listsSelectedKeys?: TKey[];
   listsExcludedKeys?: TKey[];
}

const Context = DataContext.extend({
   constructor(options: IContextOptionsValue): void {
      for (const i in options) {
         if (options.hasOwnProperty(i)) {
            // TODO: это для обратной совместимости, пока в остальных репах не перейду на Consumer
            this[i] = options[i];
         }
      }
      this._$value = { ...options };
   },
   updateValue(options: IContextOptionsValue): void {
      this._$value = {
         ...this._$value,
         ...options
      };
      this.updateConsumers();
   },
   _moduleName: 'Controls/_context/ContextOptions'
});

export default Context;

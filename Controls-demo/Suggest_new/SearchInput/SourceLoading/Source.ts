import * as Deferred from 'Core/Deferred';
import * as SearchMemory from 'Controls-demo/Search/SearchMemory';
import ICrud from './ICrud';
import {DataSet} from 'Types/source';

const SEARCH_DELAY = 3000;

export default class DelaySuggestSource {
   private source: ICrud;
   constructor(opts: object) {
      this.source = new SearchMemory(opts);
      this['[Types/_source/ICrud]'] = true;
   }

   getModel(): string {
      return this.source.getModel();
   }

   getKeyProperty(): string {
      return this.source.getKeyProperty();
   }

   query(): Promise<DataSet> {
      const origQuery = this.source.query.apply(this.source, arguments);
      const loadDef = new Deferred();

      setTimeout(() => {
         if (!loadDef.isReady()) {
            loadDef.callback();
         }
      }, SEARCH_DELAY);
      loadDef.addCallback(() => {
         return origQuery;
      });
      return loadDef;
   }
}

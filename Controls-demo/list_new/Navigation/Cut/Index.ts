import {Control, TemplateFunction} from 'UI/Base';
import {Memory} from 'Types/source';
import {INavigationOptionValue, INavigationPageSourceConfig} from 'Controls/interface';
import {getSourceData} from 'Controls-demo/list_new/Navigation/Cut/DataCatalog';
import controlTemplate = require('wml!Controls-demo/list_new/Navigation/Cut/CutNavigation');

class InitialMemory extends Memory {
   query(): Promise<any> {
       return super.query.apply(this, arguments).addCallback((items) => {
           const rawData = items.getRawData();
           rawData.meta.more = false;
           items.setRawData(rawData);
           return items;
       });
   }
}

export default class ListCut extends Control {
   protected _template: TemplateFunction = controlTemplate;
   protected _source: Memory;
   protected _navigation: INavigationOptionValue<INavigationPageSourceConfig>;
   protected _navigation1: INavigationOptionValue<INavigationPageSourceConfig>;

   protected _beforeMount(): void {
      this._source = new InitialMemory({
         keyProperty: 'id',
         data: getSourceData()
      });
      this._navigation = {
         source: 'page',
         view: 'cut',
         sourceConfig: {
            pageSize: 2,
            page: 0
         }
      };
      this._navigation1 = {
         source: 'page',
         view: 'cut',
         sourceConfig: {
            pageSize: 3,
            page: 0
         }
      };
   }

   static _styles: string[] = ['Controls-demo/list_new/Navigation/Cut/CutNavigation'];
}

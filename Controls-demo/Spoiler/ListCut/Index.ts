import {Control, TemplateFunction} from 'UI/Base';
import {Memory} from 'Types/source';
import {INavigationOptionValue, INavigationPageSourceConfig} from 'Controls/interface';
import {getSourceData} from 'Controls-demo/Spoiler/ListCut/DataCatalog';
import controlTemplate = require('wml!Controls-demo/Spoiler/ListCut/ListCut');

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
   protected _expanded: boolean = false;
   protected _expandedNavigation: INavigationOptionValue<INavigationPageSourceConfig>;
   protected _collapsedNavigation: INavigationOptionValue<INavigationPageSourceConfig>;

   protected _beforeMount(): void {
      this._source = new InitialMemory({
         keyProperty: 'id',
         data: getSourceData()
      });
      this._expandedNavigation = {
         source: 'page',
         view: 'maxCount',
         sourceConfig: {
            pageSize: 2,
            page: 0
         },
         viewConfig: {
            maxCountValue: 2
         }
      };
      this._collapsedNavigation = {
         source: 'page',
         view: 'maxCount',
         sourceConfig: {
            pageSize: 6,
            page: 0
         },
         viewConfig: {
            maxCountValue: 6
         }
      };

      this._source2 = new InitialMemory({
         keyProperty: 'id',
         data: getSourceData()
      });
      this._expandedNavigation = {
         source: 'page',
         view: 'maxCount',
         sourceConfig: {
            pageSize: 2,
            page: 0
         },
         viewConfig: {
            maxCountValue: 2
         }
      };
   }

   static _styles: string[] = ['Controls-demo/Spoiler/ListCut/ListCut'];
}

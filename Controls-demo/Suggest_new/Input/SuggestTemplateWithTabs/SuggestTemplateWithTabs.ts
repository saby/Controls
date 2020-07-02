import {Control, TemplateFunction} from 'UI/Base';
import * as MemorySourceFilter from 'Controls-demo/Utils/MemorySourceFilter';
import * as SearchMemory from 'Controls-demo/Search/SearchMemory';
import {Memory} from 'Types/source';
import {_departmentsWithCompanies} from 'Controls-demo/Suggest_new/DemoHelpers/DataCatalog';
import controlTemplate = require('wml!Controls-demo/Suggest_new/Input/SuggestTemplateWithTabs/SuggestTemplateWithTabs');
import suggestTemplate = require('wml!Controls-demo/Suggest_new/Input/SuggestTemplateWithTabs/resources/SuggestTabTemplate');

export default class extends Control {
   protected _template: TemplateFunction = controlTemplate;
   protected _suggestTemplate: TemplateFunction = suggestTemplate;
   protected _source: Memory;
   protected _navigation: object;
   protected _beforeMount(): void {
      this._source = new SearchMemory({
         keyProperty: 'id',
         data: _departmentsWithCompanies,
         searchParam: 'title',
         filter: MemorySourceFilter()
      });
      this._navigation = {
         source: 'page',
         view: 'page',
         sourceConfig: {
            pageSize: 2,
            page: 0,
            hasMore: false
         }
      };
   }

   static _styles: string[] = ['Controls-demo/Controls-demo'];
}

import {Control, TemplateFunction} from "UI/Base";
import {Memory} from 'Types/source';
import * as SearchMemory from 'Controls-demo/Search/SearchMemory';
import * as MemorySourceFilter from 'Controls-demo/Utils/MemorySourceFilter';
import {_departmentsDataLong} from 'Controls-demo/Lookup/DemoHelpers/DataCatalog';
import controlTemplate = require('wml!Controls-demo/Lookup/SuggestTemplate/Lookup');
import suggestTemplate = require('wml!Controls-demo/Lookup/SuggestTemplate/resources/SuggestTemplate');

export default class extends Control{
   protected _template: TemplateFunction = controlTemplate;
   protected _suggestTemplate: TemplateFunction = suggestTemplate;
   protected _source: Memory;
   protected _navigation: object;
   protected _beforeMount() {
      this._source = new SearchMemory({
         keyProperty: 'id',
         data: _departmentsDataLong,
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

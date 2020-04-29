import {Control, TemplateFunction} from "UI/Base";
import * as MemorySourceFilter from 'Controls-demo/Utils/MemorySourceFilter';
import * as SearchMemory from 'Controls-demo/Search/SearchMemory';
import {Memory} from 'Types/source';
import {_departmentsDataLong} from 'Controls-demo/Suggest_new/DemoHelpers/DataCatalog';
import controlTemplate = require('wml!Controls-demo/Suggest_new/Input/Navigation/Navigation');
import suggestTemplate = require('wml!Controls-demo/Suggest_new/Input/Navigation/resources/SuggestTemplate');

export default class extends Control{
   protected _template: TemplateFunction = controlTemplate;
   protected _suggestTemplate: TemplateFunction = suggestTemplate;
   protected _source: Memory;
   protected _navigation: object;
   protected _maxCountNavigation: object;

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
            pageSize: 12,
            page: 0,
            hasMore: false
         }
      };
      this._maxCountNavigation = {
         source: 'page',
         view: 'maxCount',
         sourceConfig: {
            pageSize: 4,
            page: 0,
            hasMore: false
         },
         viewConfig: {
            maxCountValue: 12
         }
      };
   }

   static _styles: string[] = ['Controls-demo/Controls-demo'];
}
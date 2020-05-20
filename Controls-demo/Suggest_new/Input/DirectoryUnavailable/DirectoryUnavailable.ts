import {Control, TemplateFunction} from "UI/Base";
import * as MemorySourceFilter from 'Controls-demo/Utils/MemorySourceFilter';
import * as SearchMemory from 'Controls-demo/Search/SearchMemory';
import Deferred = require('Core/Deferred');
import {Memory} from 'Types/source';
import {_departmentsDataLong} from 'Controls-demo/Suggest_new/DemoHelpers/DataCatalog';
import controlTemplate = require('wml!Controls-demo/Suggest_new/Input/DirectoryUnavailable/DirectoryUnavailable');
import suggestTemplate = require('wml!Controls-demo/Suggest_new/Input/DirectoryUnavailable/resources/SuggestTemplate');

export default class extends Control{
   protected _template: TemplateFunction = controlTemplate;
   protected _suggestTemplate: TemplateFunction = suggestTemplate;
   private _source: Memory;
   protected _navigation: object;
   protected _beforeMount() {
      this._source = new SearchMemory({
         keyProperty: 'id',
         data: _departmentsDataLong,
         searchParam: 'title',
         filter: MemorySourceFilter()
      });
      this._source.query = function() {
         var def = new Deferred();
         def.errback();
         return def;
      };
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
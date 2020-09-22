import {Control, TemplateFunction} from 'UI/Base';
import * as MemorySourceFilter from 'Controls-demo/Utils/MemorySourceFilter';
import * as SearchMemory from 'Controls-demo/Search/SearchMemory';
import {_departmentsDataLong, _treeData} from 'Controls-demo/Suggest_new/DemoHelpers/DataCatalog';
import controlTemplate = require('wml!Controls-demo/Suggest_new/Input/SuggestTemplate/SuggestTemplate');
import suggestTemplate = require('wml!Controls-demo/Suggest_new/Input/SuggestTemplate/resources/SuggestTemplate');
import suggestTemplateGrid = require('wml!Controls-demo/Suggest_new/Input/SuggestTemplate/resources/SuggestTemplateGrid');
import suggestTemplateTreeGrid = require('wml!Controls-demo/Suggest_new/Input/SuggestTemplate/resources/SuggestTemplateTreeGrid');

export default class extends Control {
   protected _template: TemplateFunction = controlTemplate;
   protected _suggestTemplate: TemplateFunction = suggestTemplate;
   protected _suggestTemplateGrid: TemplateFunction = suggestTemplateGrid;
   protected _suggestTemplateTreeGrid: TemplateFunction = suggestTemplateTreeGrid;
   protected _source: SearchMemory;
   protected _treeSource: SearchMemory;
   protected _navigation: object;

   protected _beforeMount(): void {
      this._source = new SearchMemory({
         keyProperty: 'id',
         data: _departmentsDataLong,
         searchParam: 'title',
         filter: MemorySourceFilter()
      });

      this._treeSource = new SearchMemory({
         keyProperty: 'id',
         searchParam: 'title',
         filter: MemorySourceFilter(),
         data: _treeData
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

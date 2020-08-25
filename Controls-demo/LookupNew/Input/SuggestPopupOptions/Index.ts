import {Control, TemplateFunction} from 'UI/Base';
import * as SearchMemory from 'Controls-demo/Search/SearchMemory';
import controlTemplate = require('wml!Controls-demo/LookupNew/Input/SuggestPopupOptions/Index');
import suggestTemplate = require('wml!Controls-demo/LookupNew/Input/SuggestPopupOptions/resources/SuggestTemplate');
import {COMPANIES} from 'Controls-demo/LookupNew/resources/DataStorage';
import * as MemorySourceFilter from 'Controls-demo/Utils/MemorySourceFilter';

export default class extends Control {
   protected _template: TemplateFunction = controlTemplate;
   protected _suggestTemplate: TemplateFunction = suggestTemplate;
   protected _source: SearchMemory = new SearchMemory({
      keyProperty: 'id',
      data: COMPANIES,
      searchParam: 'title',
      filter: MemorySourceFilter()
   });
   protected _suggestPopupOptionsUp: object = {
      direction: {
         vertical: 'top',
         horizontal: 'right'
      },
      targetPoint: {
         vertical: 'top',
         horizontal: 'left'
      }
   };
   protected _suggestPopupOptionsDown: object = {
      direction: {
         vertical: 'bottom',
         horizontal: 'right'
      },
      targetPoint: {
         vertical: 'bottom',
         horizontal: 'left'
      }
   };

   static _styles: string[] = ['Controls-demo/Controls-demo', 'Controls-demo/LookupNew/Lookup'];
}

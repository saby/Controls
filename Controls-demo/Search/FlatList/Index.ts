import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import * as controlTemplate from 'wml!Controls-demo/Search/FlatList/FlatList';
import {Memory} from 'Types/source';
import * as MemorySourceData from 'Controls-demo/Utils/MemorySourceData';
import * as memorySourceFilter from 'Controls-demo/Utils/MemorySourceFilter';

export default class FlatList extends Control<IControlOptions> {
   protected _template: TemplateFunction = controlTemplate;

   protected _source: Memory;
   protected _navigation: object;

   protected _beforeMount(): void {
      this._source = new Memory({
         data: MemorySourceData.departments,
         keyProperty: 'id',
         filter: memorySourceFilter('department')
      });
   }

   static _theme: string[] = ['Controls/Classes'];
   static _styles: string[] = ['Controls-demo/Controls-demo'];
}

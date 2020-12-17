import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import * as controlTemplate from 'wml!Controls-demo/Search/Browser/SearchValue/SearchValue';
import {Memory} from 'Types/source';
import * as MemorySourceData from 'Controls-demo/Utils/MemorySourceData';
import * as memorySourceFilter from 'Controls-demo/Utils/MemorySourceFilter';
import { SyntheticEvent } from 'UI/Vdom';

export default class Index extends Control<IControlOptions> {
   protected _template: TemplateFunction = controlTemplate;

   protected _source: Memory;
   protected _navigation: object;

   protected _searchValue: string;

   protected _beforeMount(): void {
      this._source = new Memory({
         data: MemorySourceData.departments,
         keyProperty: 'id',
         filter: memorySourceFilter('department')
      });
   }

   protected _setSearchValue(event: SyntheticEvent): void {
      this._searchValue = 'Федерал';
   }

   protected _resetSearchValue(event: SyntheticEvent): void {
      this._searchValue = null;
   }

   static _theme: string[] = ['Controls/Classes'];
   static _styles: string[] = ['Controls-demo/Controls-demo'];
}

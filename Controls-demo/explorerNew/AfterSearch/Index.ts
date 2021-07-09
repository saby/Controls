import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/explorerNew/AfterSearch/AfterSearch';
import {Gadgets} from '../DataHelpers/DataCatalog';
import {HierarchicalMemory, Memory} from 'Types/source';
import { IColumn } from 'Controls/grid';

interface IFilter {
   demo: number;
}

export default class extends Control {
   protected _template: TemplateFunction = Template;
   protected _viewSource: Memory;
   protected _columns: IColumn[] = Gadgets.getSearchColumns();
   protected _root: string | null = null;
   protected _searchStartingWith: string = 'root';
   protected _searchStartingWithSource: Memory = null;
   protected _filter: IFilter = { demo: 123 };

   protected _beforeMount(): void {
      this._viewSource = new HierarchicalMemory({
         keyProperty: 'id',
         data: Gadgets.getSearchData()
      });
   }

   static _styles: string[] = ['Controls-demo/Controls-demo'];
}

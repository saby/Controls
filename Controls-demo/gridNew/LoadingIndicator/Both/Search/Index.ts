import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/gridNew/LoadingIndicator/Both/Search/Search';
import * as SearchMemory from 'Controls-demo/Search/SearchMemory';
import * as MemorySourceFilter from 'Controls-demo/Utils/MemorySourceFilter';
import {generateData} from 'Controls-demo/list_new/DemoHelpers/DataCatalog';
import { IColumn } from 'Controls/grid';

export default class Explorer extends Control<IControlOptions> {
   protected _template: TemplateFunction = Template;
   protected _viewSource: SearchMemory;
   protected _filter: object = {};
   protected _columns: IColumn[] = [{ displayProperty: 'title' }];
   private _dataArray: unknown = generateData({count: 60, entityTemplate: {title: 'lorem'}});

   protected _beforeMount(): void {
      this._viewSource = new SearchMemory({
         keyProperty: 'id',
         data: this._dataArray,
         searchParam: 'title',
         filter: MemorySourceFilter()
      });
   }

   static _styles: string[] = ['Controls-demo/Controls-demo'];
}

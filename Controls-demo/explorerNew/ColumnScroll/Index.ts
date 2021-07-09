import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/explorerNew/ColumnScroll/ColumnScroll';
import {Gadgets} from '../DataHelpers/DataCatalog';
import { TRoot } from 'Controls-demo/types';
import { IHeaderCell } from 'Controls/grid';
import {HierarchicalMemory} from 'Types/source';

export default class extends Control {
   protected _template: TemplateFunction = Template;
   protected _viewSource: HierarchicalMemory;
   protected _columns: unknown = Gadgets.getGridColumnsForScroll();
   protected _viewMode: string = 'table';
   protected _root: TRoot = null;
   protected _header: IHeaderCell[] = [...Gadgets.getHeader(),  {title: 'Подрядчик'}];

   protected _beforeMount(): void {
      this._viewSource = new HierarchicalMemory({
         keyProperty: 'id',
         parentProperty: 'parent',
         data: Gadgets.getData()
      });
   }

   static _styles: string[] = ['Controls-demo/Controls-demo'];
}

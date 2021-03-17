import {Control, TemplateFunction} from 'UI/Base';
import {HierarchicalMemory} from 'Types/source';

import { IColumn } from 'Controls/gridNew';
import { TColspanCallbackResult } from 'Controls/display';

import { getData, getColumns } from './DataCatalog';

import * as Template from 'wml!Controls-demo/treeGridNew/VirtualScroll/LastNodeExpanded/LastNodeExpanded';

export default class extends Control {
   protected _template: TemplateFunction = Template;
   protected _viewSource: HierarchicalMemory;
   protected _columns: IColumn[] = getColumns();

   protected _beforeMount(): void {
      this._viewSource = new HierarchicalMemory({
         keyProperty: 'id',
         data: getData()
      });
   }

   protected _colspanCallback(item, column, columnIndex, isEditing): TColspanCallbackResult {
      return 'end';
   }

   static _styles: string[] = ['Controls-demo/Controls-demo'];
}

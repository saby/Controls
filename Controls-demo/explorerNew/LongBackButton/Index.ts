import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/explorerNew/LongBackButton/LongBackButton';
import {DataWithLongFolderName} from '../DataHelpers/DataCatalog';
import { IColumn } from 'Controls/grid';
import { TRoot } from 'Controls-demo/types';
import {HierarchicalMemory} from 'Types/source';

export default class extends Control {
   protected _template: TemplateFunction = Template;
   protected _viewSource: HierarchicalMemory;
   protected _columns: IColumn[] = DataWithLongFolderName.getColumns();
   protected _viewMode: string = 'table';
   protected _root: TRoot = 1;

   protected _beforeMount(): void {
      this._viewSource = new HierarchicalMemory({
         keyProperty: 'id',
         parentProperty: 'parent',
         data: DataWithLongFolderName.getData()
      });
   }

   static _styles: string[] = ['Controls-demo/Controls-demo'];
}

import {Control, TemplateFunction} from 'UI/Base';
import {Memory} from 'Types/source';
import * as Template from 'wml!Controls-demo/gridNew/Header/Multiheader/ColumnScroll/ColumnScroll';
import {getCountriesStats} from '../../../DemoHelpers/DataCatalog';
import { IColumn } from 'Controls/grid';
import { IHeaderCell } from 'Controls/grid';

export default class extends Control {
   protected _template: TemplateFunction = Template;
   protected _viewSource: Memory;
   protected _header: IHeaderCell[] = getCountriesStats().getMultiHeader();
   protected _columns: IColumn[] = getCountriesStats().getColumnsWithWidths();
   protected _stickyColumnsCount: number = 1;

   protected _beforeMount(options?: {}, contexts?: object, receivedState?: void): Promise<void> | void {
      super._beforeMount(options, contexts, receivedState);
      this._viewSource = new Memory({
         keyProperty: 'id',
         data: getCountriesStats().getData()
      });
   }

   static _styles: string[] = ['Controls-demo/Controls-demo'];
}

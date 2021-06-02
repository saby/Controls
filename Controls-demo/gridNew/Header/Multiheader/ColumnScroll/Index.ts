import {Control, TemplateFunction} from 'UI/Base';
import {Memory} from 'Types/source';
import * as Template from 'wml!Controls-demo/gridNew/Header/Multiheader/ColumnScroll/ColumnScroll';
import { IColumn } from 'Controls/grid';
import { IHeaderCell } from 'Controls/grid';
import {MultiHeader} from "Controls-demo/gridNew/DemoHelpers/Data/MultiHeader";
import { Countries } from 'Controls-demo/gridNew/DemoHelpers/Data/Countries';

export default class extends Control {
   protected _template: TemplateFunction = Template;
   protected _viewSource: Memory;
   protected _header: IHeaderCell[] = MultiHeader.getHeader1();
   protected _columns: IColumn[] = Countries.getColumnsWithWidths();
   protected _stickyColumnsCount: number = 1;

   protected _beforeMount(options?: {}, contexts?: object, receivedState?: void): Promise<void> | void {
      super._beforeMount(options, contexts, receivedState);
      this._viewSource = new Memory({
         keyProperty: 'id',
         data: Countries.getData()
      });
   }

   static _styles: string[] = ['Controls-demo/Controls-demo'];
}

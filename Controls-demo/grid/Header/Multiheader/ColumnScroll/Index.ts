import {Control, TemplateFunction} from 'UI/Base';
import {Memory} from 'Types/source';
import * as Template from 'wml!Controls-demo/grid/Header/Multiheader/ColumnScroll/ColumnScroll';
import {getCountriesStats} from '../../../DemoHelpers/DataCatalog';
import { IColumn } from 'Controls/_grid/interface/IColumn';
import { IHeader } from 'Controls-demo/types';

export default class extends Control {
   protected _template: TemplateFunction = Template;
   protected _viewSource: Memory;
   protected _header: IHeader[] = getCountriesStats().getMultiHeader();
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

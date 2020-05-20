import {Control, TemplateFunction} from "UI/Base";
import {Memory} from "Types/source";

import * as Template from "wml!Controls-demo/grid/Header/Multiheader/ColumnScroll/ColumnScroll";

import {getCountriesStats} from "../../../DemoHelpers/DataCatalog";

export default class extends Control {
   protected _template: TemplateFunction = Template;
   private _viewSource: Memory;
   private _header = getCountriesStats().getMultiHeader();
   private _columns = getCountriesStats().getColumnsWithWidths();
   private _stickyColumnsCount: 1;

   protected _beforeMount(options?: {}, contexts?: object, receivedState?: void): Promise<void> | void {
      super._beforeMount(options, contexts, receivedState);
      this._viewSource = new Memory({
         keyProperty: 'id',
         data: getCountriesStats().getData()
      });
   }

   static _styles: string[] = ['Controls-demo/Controls-demo'];
}

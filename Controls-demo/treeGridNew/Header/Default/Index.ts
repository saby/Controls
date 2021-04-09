import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/treeGridNew/Header/Default/Default';
import {Memory} from 'Types/source';
import {Gadgets} from '../../DemoHelpers/DataCatalog';
import { IHeader } from 'Controls-demo/types';
import { IColumn } from 'Controls/grid';

export default class extends Control {
   protected _template: TemplateFunction = Template;
   protected _viewSource: Memory;
   protected _columns: IColumn[] = Gadgets.getGridColumnsForFlat();
   protected _header: IHeader[] = Gadgets.getHeaderForFlat();

   protected _beforeMount(): void {
      this._viewSource = new Memory({
         keyProperty: 'id',
         data: Gadgets.getFlatData()
      });
   }

   static _styles: string[] = ['Controls-demo/Controls-demo'];
}

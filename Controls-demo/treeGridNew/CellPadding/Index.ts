import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/treeGridNew/CellPadding/CellPadding';
import {Memory} from 'Types/source';
import { IHeaderCell } from 'Controls/grid';
import {Flat} from "Controls-demo/treeGridNew/DemoHelpers/Data/Flat";

export default class extends Control {
   protected _template: TemplateFunction = Template;
   protected _viewSource: Memory;
   protected _columns: unknown = [
      {
         displayProperty: 'title',
         cellPadding: {
            right: 'S'
         },
         width: ''
      },
      {
         displayProperty: 'rating',
         cellPadding: {
            left: 'S',
            right: 'null'
         },
         width: ''
      },
      {
         displayProperty: 'country',
         width: ''
      }
   ];
   protected _header: IHeaderCell[] = [
      {
         title: 'cellPadding: right: S'
      },
      {
         title: 'cellPadding:  left: S and right: null'
      },
      {
         title: 'cellPadding left: default'
      }
   ];

   protected _beforeMount(): void {
      this._viewSource = new Memory({
         keyProperty: 'id',
         data: Flat.getData()
      });
   }

   static _styles: string[] = ['Controls-demo/Controls-demo'];
}

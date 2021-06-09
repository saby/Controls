import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/treeGridNew/Header/MultiHeader/MultiHeader';
import {Memory} from 'Types/source';
import { IColumn } from 'Controls/grid';
import { IHeaderCell } from 'Controls/grid';
import {Flat} from "Controls-demo/treeGridNew/DemoHelpers/Data/Flat";

export default class extends Control {
   protected _template: TemplateFunction = Template;
   protected _viewSource: Memory;
   protected _columns: IColumn[] = Flat.getColumns();
   protected _header: IHeaderCell[] = [
      {
         title: 'Название',
         startRow: 1,
         endRow: 3,
         startColumn: 1,
         endColumn: 2
      },
      {
         title: 'Общие',
         startRow: 1,
         endRow: 2,
         startColumn: 2,
         endColumn: 4,
         align: 'center'
      },
      {
         title: 'Цена',
         startRow: 2,
         endRow: 3,
         startColumn: 2,
         endColumn: 3
      },
      {
         title: 'Стоимость',
         startRow: 2,
         endRow: 3,
         startColumn: 3,
         endColumn: 4
      }
   ];

   protected _beforeMount(): void {
      this._viewSource = new Memory({
         keyProperty: 'key',
         data: Flat.getData()
      });
   }

   static _styles: string[] = ['Controls-demo/Controls-demo'];
}

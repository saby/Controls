import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/treeGridNew/Header/LongHeader/LongHeader';
import {Memory} from 'Types/source';
import { IColumn } from 'Controls/grid';
import { IHeaderCell } from 'Controls/grid';
import {Flat} from "Controls-demo/treeGridNew/DemoHelpers/Data/Flat";

export default class extends Control {
   protected _template: TemplateFunction = Template;
   protected _viewSource: Memory;
   protected _columns: IColumn[] = [
      {
         displayProperty: 'title',
         width: '200px'
      },
      {
         displayProperty: 'rating',
         width: '150px'
      },
      {
         displayProperty: 'country',
         width: '150px'
      }
   ];
   protected _header: IHeaderCell[] = [
      {
         title: 'Население страны по данным на 2018г - 2019г.'
      },
      {
         title: 'Площадь км2'
      },
      {
         title: 'Плотность населения чел/км2'
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

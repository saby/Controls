import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/gridNew/VirtualScroll/Default/Default';
import {Memory} from 'Types/source';
import {generateData} from 'Controls-demo/list_new/DemoHelpers/DataCatalog';
import { IColumn } from 'Controls/grid';
import { Countries } from 'Controls-demo/gridNew/DemoHelpers/Data/Countries';

interface IItem {
   capital: string;
   number: number;
   country: string;
}

export default class extends Control {
   protected _template: TemplateFunction = Template;
   protected _viewSource: Memory;
   protected _columns: IColumn[] = [
      {
         displayProperty: 'number',
         width: '40px'
      },
      {
         displayProperty: 'country',
         width: '200px'
      },
      {
         displayProperty: 'capital',
         width: '200px'
      }
   ];
   private count: number = 0;

   private dataArray: IItem[] = generateData({
      keyProperty: 'key',
      count: 50,
      beforeCreateItemCallback: (item: IItem) => {
         item.capital = 'South';
         item.number = this.count + 1;
         item.country = Countries.COUNTRIES[this.count];
         this.count++;
      }
   });

   protected _beforeMount(): void {
      this._viewSource = new Memory({
         keyProperty: 'key',
         data: this.dataArray
      });
   }

   static _styles: string[] = ['Controls-demo/Controls-demo'];
}

import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/grid/VirtualScroll/Default/Default';
import {Memory} from 'Types/source';
import {generateData} from '../../../list_new/DemoHelpers/DataCatalog';
import {getCountriesStats, countries} from '../../DemoHelpers/DataCatalog';
import { IColumn } from 'Controls/_grid/interface/IColumn';

interface IItem {
   capital: string,
   number: number,
   country: string
}

export default class extends Control {
   protected _template: TemplateFunction = Template;
   protected _viewSource: Memory;
   protected _columns: IColumn[] = getCountriesStats().getColumnsForVirtual();
   private count: number = 0;

   private dataArray = generateData({
      keyProperty: 'id',
      count: 50,
      beforeCreateItemCallback: (item: IItem) => {
         item.capital = 'South';
         item.number = this.count + 1;
         item.country = countries[this.count];
         this.count++;
      }
   });

   protected _beforeMount(): void {
      this._viewSource = new Memory({
         keyProperty: 'id',
         data: this.dataArray
      });
   }

   static _styles: string[] = ['Controls-demo/Controls-demo'];
}


import {Control, TemplateFunction, IControlOptions} from 'UI/Base';
import * as Template from 'wml!Controls-demo/treeGridNew/ItemTemplate/WithPhoto/TwoLevelsWithPhoto/TwoLevelsWithPhoto';
import {Memory} from 'Types/source';
import {Gadgets} from '../../../DemoHelpers/DataCatalog';
import { IColumn } from 'Controls/grid';
import { TExpandOrColapsItems } from 'Controls-demo/types';

export default class extends Control<IControlOptions> {
   protected _template: TemplateFunction = Template;
   protected _viewSourceTwo: Memory;
   protected _columns: IColumn[] = Gadgets.getGridColumnsWithPhoto();
   protected _twoLvlColumns: IColumn[] = Gadgets.getGridTwoLevelColumnsWithPhoto();
   // tslint:disable-next-line
   protected _expandedItems: TExpandOrColapsItems = [1, 2, 4];

   protected _beforeMount(options: IControlOptions): void {
      if (options.hasOwnProperty('collapseNodes')) {
         this._expandedItems = [];
      }
      this._viewSourceTwo = new Memory({
         keyProperty: 'id',
         data: Gadgets.getDataTwoLvl()
      });

   }

   static _styles: string[] = ['Controls-demo/treeGridNew/ItemTemplate/WithPhoto/styles', 'Controls-demo/Controls-demo'];
}

import {Control, TemplateFunction, IControlOptions} from 'UI/Base';
import * as Template from 'wml!Controls-demo/treeGrid/ItemTemplate/WithPhoto/TwoLevelsWithPhoto/TwoLevelsWithPhoto';
import {Memory} from 'Types/source';
import {Gadgets} from '../../../DemoHelpers/DataCatalog';
import { TExpandOrColapsItems } from 'Controls-demo/types';

export default class extends Control<IControlOptions> {
   protected _template: TemplateFunction = Template;
   protected _viewSourceTwo: Memory;
   protected _columns = Gadgets.getGridColumnsWithPhoto();
   protected _twoLvlColumns = Gadgets.getGridTwoLevelColumnsWithPhoto();
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

   static _styles: string[] = ['Controls-demo/treeGrid/ItemTemplate/WithPhoto/styles', 'Controls-demo/Controls-demo'];
}

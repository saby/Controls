import {Control, TemplateFunction, IControlOptions} from 'UI/Base';
import * as Template from 'wml!Controls-demo/treeGridNew/ItemTemplate/WithPhoto/TwoLevelsWithPhoto/TwoLevelsWithPhoto';
import {CrudEntityKey, HierarchicalMemory} from 'Types/source';
import { IColumn } from 'Controls/grid';
import {WithPhoto} from "Controls-demo/treeGridNew/DemoHelpers/Data/WithPhoto";

export default class extends Control<IControlOptions> {
   protected _template: TemplateFunction = Template;
   protected _viewSourceTwo: HierarchicalMemory;
   protected _columns: IColumn[] = WithPhoto.getGridColumnsWithPhoto();
   protected _twoLvlColumns: IColumn[] = WithPhoto.getGridTwoLevelColumnsWithPhoto();
   // tslint:disable-next-line
   protected _expandedItems: CrudEntityKey[] = [1, 2, 4];

   protected _beforeMount(options: IControlOptions): void {
      if (options.hasOwnProperty('collapseNodes')) {
         this._expandedItems = [];
      }
      this._viewSourceTwo = new HierarchicalMemory({
         keyProperty: 'key',
         data: WithPhoto.getDataTwoLvl(),
         parentProperty: 'parent'
      });

   }

   static _styles: string[] = ['Controls-demo/treeGridNew/ItemTemplate/WithPhoto/styles', 'Controls-demo/Controls-demo'];
}

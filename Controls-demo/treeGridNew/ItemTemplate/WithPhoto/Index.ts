import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/treeGridNew/ItemTemplate/WithPhoto/WithPhoto';
import {HierarchicalMemory} from 'Types/source';
import { IColumn } from 'Controls/grid';
import {WithPhoto} from "Controls-demo/treeGridNew/DemoHelpers/Data/WithPhoto";
import {Flat} from "Controls-demo/treeGridNew/DemoHelpers/Data/Flat";

export default class extends Control {
   protected _template: TemplateFunction = Template;
   protected _viewSource: HierarchicalMemory;
   protected _viewSourceTwo: HierarchicalMemory;
   protected _columns: IColumn[] = WithPhoto.getGridColumnsWithPhoto();
   protected _twoLvlColumns: IColumn[] = WithPhoto.getGridTwoLevelColumnsWithPhoto();
   protected _twoLvlColumnsNoPhoto: IColumn[] = WithPhoto.getGridTwoLevelColumnsWithPhoto().map((cur) => ({
      ...cur, template: undefined
   }));

   protected _beforeMount(): void {
      this._viewSource = new HierarchicalMemory({
         keyProperty: 'key',
         data: Flat.getData(),
         parentProperty: 'parent'
      });

      this._viewSourceTwo = new HierarchicalMemory({
         keyProperty: 'key',
         data: WithPhoto.getDataTwoLvl(),
         parentProperty: 'parent'
      });

   }

   static _styles: string[] = ['Controls-demo/treeGridNew/ItemTemplate/WithPhoto/styles', 'Controls-demo/Controls-demo'];
}

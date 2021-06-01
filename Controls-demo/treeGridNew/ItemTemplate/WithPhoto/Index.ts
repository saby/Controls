import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/treeGridNew/ItemTemplate/WithPhoto/WithPhoto';
import {Memory} from 'Types/source';
import { IColumn } from 'Controls/grid';
import {WithPhoto} from "Controls-demo/treeGridNew/DemoHelpers/Data/WithPhoto";
import {Flat} from "Controls-demo/treeGridNew/DemoHelpers/Data/Flat";

export default class extends Control {
   protected _template: TemplateFunction = Template;
   protected _viewSource: Memory;
   protected _viewSourceTwo: Memory;
   protected _columns: IColumn[] = WithPhoto.getGridColumnsWithPhoto();
   protected _twoLvlColumns: IColumn[] = WithPhoto.getGridTwoLevelColumnsWithPhoto();
   protected _twoLvlColumnsNoPhoto: IColumn[] = WithPhoto.getGridTwoLevelColumnsWithPhoto().map((cur) => ({
      ...cur, template: undefined
   }));

   protected _beforeMount(): void {
      this._viewSource = new Memory({
         keyProperty: 'id',
         data: Flat.getData()
      });

      this._viewSourceTwo = new Memory({
         keyProperty: 'id',
         data: WithPhoto.getDataTwoLvl()
      });

   }

   static _styles: string[] = ['Controls-demo/treeGridNew/ItemTemplate/WithPhoto/styles', 'Controls-demo/Controls-demo'];
}

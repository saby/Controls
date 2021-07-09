import {Control, TemplateFunction, IControlOptions} from 'UI/Base';
import * as Template from 'wml!Controls-demo/treeGridNew/ItemTemplate/WithPhoto/Photo16px/Photo16px';
import {CrudEntityKey, HierarchicalMemory} from 'Types/source';
import { IColumn } from 'Controls/grid';
import {WithPhoto} from "Controls-demo/treeGridNew/DemoHelpers/Data/WithPhoto";
import {Flat} from "Controls-demo/treeGridNew/DemoHelpers/Data/Flat";

export default class extends Control<IControlOptions> {
   protected _template: TemplateFunction = Template;
   protected _viewSource: HierarchicalMemory;
   protected _columns: IColumn[] = WithPhoto.getGridColumnsWithPhoto();
   // tslint:disable-next-line
   protected _expandedItems: CrudEntityKey[] = [ 1, 15, 153 ];

   protected _beforeMount(options: IControlOptions): void {
      if (options.hasOwnProperty('collapseNodes')) {
         this._expandedItems = [];
      }
      this._viewSource = new HierarchicalMemory({
         keyProperty: 'key',
         data: Flat.getData(),
         parentProperty: 'parent'
      });
   }

   static _styles: string[] = ['Controls-demo/treeGridNew/ItemTemplate/WithPhoto/styles', 'Controls-demo/Controls-demo'];
}

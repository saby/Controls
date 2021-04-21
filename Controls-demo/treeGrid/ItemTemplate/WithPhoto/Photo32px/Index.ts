import {Control, TemplateFunction, IControlOptions} from 'UI/Base';
import * as Template from 'wml!Controls-demo/treeGrid/ItemTemplate/WithPhoto/Photo32px/Photo32px';
import {CrudEntityKey, Memory} from 'Types/source';
import {Gadgets} from '../../../DemoHelpers/DataCatalog';
import { IColumn } from 'Controls/gridOld';

export default class extends Control<IControlOptions> {
   protected _template: TemplateFunction = Template;
   protected _viewSource: Memory;
   protected _columns: IColumn[] = Gadgets.getGridColumnsWithPhoto();
   // tslint:disable-next-line
   protected _expandedItems: CrudEntityKey[] = [ 1, 15, 153 ];

   protected _beforeMount(options: IControlOptions): void {
      if (options.hasOwnProperty('collapseNodes')) {
         this._expandedItems = [];
      }
      this._viewSource = new Memory({
         keyProperty: 'id',
         data: Gadgets.getFlatData()
      });
   }

   static _styles: string[] = ['Controls-demo/treeGrid/ItemTemplate/WithPhoto/styles', 'Controls-demo/Controls-demo'];
}

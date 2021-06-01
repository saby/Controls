import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/treeGridNew/Expander/ExpanderVisibility/HasChildrenOrHover/HasChildrenOrHover';
import {CrudEntityKey, Memory} from 'Types/source';
import {Gadgets} from "Controls-demo/treeGridNew/DemoHelpers/Data/Gadgets";

export default class extends Control {
   protected _template: TemplateFunction = Template;
   protected _viewSource: Memory;
   protected _expandedItems: CrudEntityKey[] = [null];

   protected _beforeMount(): void {
      this._viewSource = new Memory({
         keyProperty: 'id',
         data: Gadgets.getData(),
         filter: () => true
      });
   }

   static _styles: string[] = ['Controls-demo/Controls-demo'];
}

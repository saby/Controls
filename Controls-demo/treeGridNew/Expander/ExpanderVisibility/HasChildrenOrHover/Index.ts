import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/treeGridNew/Expander/ExpanderVisibility/HasChildrenOrHover/HasChildrenOrHover';
import {CrudEntityKey, HierarchicalMemory} from 'Types/source';
import {Gadgets} from "Controls-demo/treeGridNew/DemoHelpers/Data/Gadgets";

export default class extends Control {
   protected _template: TemplateFunction = Template;
   protected _viewSource: HierarchicalMemory;
   protected _expandedItems: CrudEntityKey[] = [null];

   protected _beforeMount(): void {
      this._viewSource = new HierarchicalMemory({
         keyProperty: 'key',
         data: Gadgets.getData(),
         filter: () => true,
         parentProperty: 'parent'
      });
   }

   static _styles: string[] = ['Controls-demo/Controls-demo'];
}

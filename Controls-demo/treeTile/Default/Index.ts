import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/treeTile/Default/Default';
import {HierarchicalMemory} from 'Types/source';
import { Gadgets } from 'Controls-demo/Explorer_new/DataHelpers/DataCatalog';

export default class extends Control {
   protected _template: TemplateFunction = Template;
   protected _viewSource: HierarchicalMemory;

   protected _beforeMount(): void {
      this._viewSource = new HierarchicalMemory({
         keyProperty: 'id',
         parentProperty: 'parent',
         data: Gadgets.getData()
      });
   }

   static _styles: string[] = ['Controls-demo/Controls-demo'];
}

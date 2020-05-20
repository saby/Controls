import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/Tile/MultiSelect/MultiSelect';
import {Gadgets} from '../DataHelpers/DataCatalog';
import {HierarchicalMemory} from "Types/source"



export default class extends Control {
   protected _template: TemplateFunction = Template;
   protected _viewSource;
   protected _selectedKeys: [];
   protected _excludedKeys: [];

   protected _beforeMount() {
      this._viewSource = new HierarchicalMemory({
         keyProperty: 'id',
         parentProperty: 'parent',
         data: Gadgets.getData()
      });
   }

   static _styles: string[] = ['Controls-demo/Controls-demo'];
}

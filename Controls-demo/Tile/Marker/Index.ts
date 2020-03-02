import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/Tile/Marker/Marker';
import {Gadgets} from '../DataHelpers/DataCatalog';
import {HierarchicalMemory} from "Types/source"


import 'css!Controls-demo/Controls-demo';

export default class extends Control {
   protected _template: TemplateFunction = Template;
   protected _viewSource;

   protected _beforeMount() {
      this._viewSource = new HierarchicalMemory({
         keyProperty: 'id',
         parentProperty: 'parent',
         data: Gadgets.getData()
      });
   }
}

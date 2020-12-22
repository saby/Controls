import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/treeGridNew/Expander/ExpanderVisibility/HasChildrenOrHover/HasChildrenOrHover';
import {Memory} from 'Types/source';
import {Gadgets} from '../../../DemoHelpers/DataCatalog';
import {TExpandOrColapsItems} from 'Controls-demo/types';

export default class extends Control {
   protected _template: TemplateFunction = Template;
   protected _viewSource: Memory;
   protected _expandedItems: TExpandOrColapsItems = [null];

   protected _beforeMount(): void {
      this._viewSource = new Memory({
         keyProperty: 'id',
         data: Gadgets.getDataSet(),
         filter: () => true
      });
   }

   static _styles: string[] = ['Controls-demo/Controls-demo'];
}

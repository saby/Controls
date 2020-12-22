import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import * as template from 'wml!Controls-demo/dropdown_new/Input/MultiSelect/NavigationAndSelectorTemplate/Stack/StackTemplate';
import {Memory} from 'Types/source';
import {Controller} from 'Controls/lookupPopup';

export default class extends Control<IControlOptions> {
   protected _template: TemplateFunction = template;
   _selectionChanged: false;
   _source: Memory;
   _filter: object;
   _children: {
      SelectorController: typeof Controller
   };

   _beforeMount(options): void {
      this._source = new Memory({
         keyProperty: 'key',
         data: options.items,
         filter: (item, queryFilter) => {
            if (queryFilter.selection) {
               const itemId = String(item.get('key'));
               const marked = queryFilter.selection.get('marked');
               let isSelected = false;
               marked.forEach((selectedId) => {
                  if (String(selectedId) === itemId) {
                     isSelected = true;
                  }
               });
               return isSelected;
            }
            return true;
         }
      });

      this._filter = {};
   }

   _selectedKeysChanged(): void {
      this._selectionChanged = true;
   }

   _selectComplete(): void {
      this._children.SelectorController._selectComplete();
   }

   static _styles: string[] = ['Controls-demo/Input/Lookup/FlatListSelector/FlatListSelector'];
}

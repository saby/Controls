import {Control, TemplateFunction} from 'UI/Base';
import * as template from 'wml!Controls-demo/FilterView/stackTemplate/TreeStackTemplate';
import {Memory} from 'Types/source';
import {IColumn} from 'Controls/grid';

export default class extends Control {
   protected _template: TemplateFunction = template;
   protected _source: Memory;
   protected _itemsMore: object[];
   protected _sourceMore: Memory;
   protected _gridColumns: IColumn[];
   protected _filter: object;
   protected _selectionChanged: boolean;

   protected _beforeMount(options): void {
      this._source = new Memory({
         keyProperty: 'id',
         data: options.items,
         filter: (item, queryFilter) => {
            if (queryFilter.selection) {
               const itemId = String(item.get('id'));
               const marked = queryFilter.selection.get('marked');
               let isSelected = false;
               marked.forEach(function (selectedId) {
                  if (String(selectedId) === itemId) {
                     isSelected = true;
                  }
               });
               return isSelected;
            }
            return true;
         }
      });

      this._gridColumns = [
         {
            displayProperty: 'title',
            width: '1fr'
         }
      ];

      this._filter = {};
   }

   protected _selectedKeysChanged(): void {
      this._selectionChanged = true;
   }

   protected _selectComplete(): void {
      this._children.SelectorController._selectComplete();
   }

   static _theme: string[] = ['Controls/Classes'];

   static _styles: string[] = ['Controls-demo/Input/Lookup/FlatListSelector/FlatListSelector'];
}

import {Control, TemplateFunction} from 'UI/Base';
import * as template from 'wml!Controls-demo/Input/Dropdown/stackTemplate/StackTemplate';
import {Memory} from 'Types/source';

export default class extends Control {
    protected _template: TemplateFunction = template;
    protected _source: Memory;
    protected _itemsMore: object[];
    protected _sourceMore: Memory;
    private _selectionChanged: boolean = false;
    private _filter: object;

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
        this._selectionChanged = options.selectedItems.getCount() > 0;
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

import {Control, TemplateFunction} from 'UI/Base';
import * as template from 'wml!Controls-demo/filterPanel/resources/MultiSelectStackTemplate/StackTemplate';
import {Memory} from 'Types/source';

export default class extends Control {
    protected _template: TemplateFunction = template;
    protected _source: Memory;
    protected _selectionChanged: boolean = false;
    private _filter: object = {};

    protected _beforeMount(options): void {
        this._source = new Memory({
            idProperty: 'id',
            data: options.items,
            filter: (item, queryFilter) => {
                if (queryFilter.selection) {
                    var itemId = String(item.get('id'));
                    var marked = queryFilter.selection.get('marked');
                    var isSelected = false;
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
        this._selectionChanged = false;
        this._filter = {};
    }

    _selectedKeysChanged() {
        this._selectionChanged = true;
    }

    _selectComplete() {
        this._children.SelectorController._selectComplete();
    }

    static _theme: string[] = ['Controls/Classes'];
}

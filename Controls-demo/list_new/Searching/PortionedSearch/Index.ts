import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/list_new/Searching/PortionedSearch/PortionedSearch';
import PortionedSearchMemory from './PortionedSearchMemory';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: PortionedSearchMemory = null;
    protected _filter: Object = null;
    private _searchValue: string = '';
    protected _position: number = 0;

    protected _beforeMount(): void {
        this._viewSource = new PortionedSearchMemory({keyProperty: 'key'});
        this._filter = {};
    }

    protected _startSearch(): void {
        this._searchValue = 'consectetur';
        // быстро закончится поиск при blandit
    }

    protected _afterUpdate(): void {
        if (this._searchValue && !this._filter.title) {
            this._filter = {
                title: this._searchValue
            };
        }
    }

    protected _resetSearch(): void {
        this._searchValue = '';
        this._filter = {};
    }
    static _styles: string[] = ['Controls-demo/Controls-demo'];
}

import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/list_new/Searching/PortionedSearch/PortionedSearch';
import PortionedSearchSource from 'Controls-demo/list_new/Searching/PortionedSearch/Source';
import {Memory} from 'Types/source';
import {generateData} from 'Controls-demo/list_new/DemoHelpers/DataCatalog';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: PortionedSearchSource = null;
    protected _filter: Object = null;
    private _dataArray: object[] = generateData({count: 100, entityTemplate: {title: 'lorem'}});
    private _searchValue: string = '';

    protected _beforeMount(): void {
        this._viewSource = new PortionedSearchSource({
            source: new Memory({
                keyProperty: 'id',
                data: this._dataArray,
                filter: (item: any, query: any) => {
                    let res = true;

                    if (query.title) {
                        res = item.get('title').toLowerCase().includes(query.title);
                    }

                    return res;
                }
            })
        });
        this._filter = {};
    }

    protected _startSearch(): void {
        this._searchValue = 'lorem';
        this._filter = {
           title: this._searchValue
        };
    }

    protected _resetSearch(): void {
        this._searchValue = '';
        this._filter = {};
    }

    static _theme: string[] = ['Controls/Classes'];
    static _styles: string[] = ['Controls-demo/Controls-demo'];
}

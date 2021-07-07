import {Control, TemplateFunction, IControlOptions} from 'UI/Base';
import * as MemorySourceFilter from 'Controls-demo/Utils/MemorySourceFilter';
import * as SearchMemory from 'Controls-demo/Search/SearchMemory';
import {Memory} from 'Types/source';
import {_departmentsDataLong} from 'Controls-demo/Suggest_new/DemoHelpers/DataCatalog';
// @ts-ignore
import controlTemplate = require('wml!Controls-demo/Suggest_new/Input/SuggestPopupOptions/SuggestPopupOptions');
// @ts-ignore
import suggestTemplate = require('wml!Controls-demo/Suggest_new/Input/SuggestPopupOptions/resources/SuggestTemplate');

export default class extends Control<IControlOptions> {
    protected _template: TemplateFunction = controlTemplate;
    protected _suggestTemplate: TemplateFunction = suggestTemplate;
    protected _source: Memory;
    protected _navigation: object;

    protected _beforeMount(): void {
        this._source = new SearchMemory({
            keyProperty: 'id',
            data: _departmentsDataLong,
            searchParam: 'title',
            filter: MemorySourceFilter()
        });

        this._navigation = {
            source: 'page',
            view: 'page',
            sourceConfig: {
                pageSize: 2,
                page: 0,
                hasMore: false
            }
        };
    }

    static _styles: string[] = [
        'Controls-demo/Controls-demo',
        'Controls-demo/Suggest_new/Input/SuggestPopupOptions/SuggestPopupOptions'
    ];
}

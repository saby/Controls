import {Control, TemplateFunction} from 'UI/Base';
import * as MemorySourceFilter from 'Controls-demo/Utils/MemorySourceFilter';
import * as SearchMemory from 'Controls-demo/Search/SearchMemory';
import {Memory} from 'Types/source';
import {_departmentsDataLong} from 'Controls-demo/Suggest_new/DemoHelpers/DataCatalog';
import controlTemplate = require('wml!Controls-demo/Suggest_new/Input/FieldTemplates/Template');

export default class extends Control {
    protected _template: TemplateFunction = controlTemplate;
    protected _source: Memory;
    protected _beforeMount(): void {
        this._source = new SearchMemory({
            keyProperty: 'id',
            data: _departmentsDataLong,
            searchParam: 'title',
            filter: MemorySourceFilter()
        });
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}

import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/searchGrid/Base/Base';
import {Memory} from 'Types/source';
import { Gadgets } from 'Controls-demo/Explorer_new/DataHelpers/DataCatalog';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: Memory;
    protected _columns: unknown[];
    protected _searchStartingWithSource: Memory;
    protected _header = [
        {
            title: 'Наименование'
        },
        {
            title: 'Код'
        },
        {
            title: 'Цена'
        }
    ];

    protected _beforeMount(): void {
        this._viewSource = new Memory({
            keyProperty: 'id',
            data: Gadgets.getSearchData()
        });

        this._columns = Gadgets.getSearchColumns();
        this._searchStartingWithSource = new Memory({
            keyProperty: 'id',
            data: [
                {
                    id: 'root', title: 'root'
                },
                {
                    id: 'current', title: 'current'
                }
            ]
        });
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}

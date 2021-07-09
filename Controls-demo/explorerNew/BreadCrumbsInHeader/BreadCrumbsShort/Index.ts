import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/explorerNew/BreadCrumbsInHeader/BreadCrumbsShort/BreadCrumbsShort';
import {Gadgets} from '../../DataHelpers/DataCatalog';
import { IColumn } from 'Controls/grid';
import {TRoot} from 'Controls-demo/types';
import { IHeaderCell } from 'Controls/grid';
import {HierarchicalMemory} from 'Types/source';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: HierarchicalMemory;
    protected _columns: IColumn[] = Gadgets.getSearchColumns();
    protected _root: TRoot = 112;
    protected _header: IHeaderCell[] = [
        {
            title: ''
        },
        {
            title: 'Код'
        },
        {
            title: 'Цена'
        }
    ];

    protected _beforeMount(): void {
        this._viewSource = new HierarchicalMemory({
            keyProperty: 'id',
            parentProperty: 'parent',
            data: Gadgets.getSearchData()
        });
    }
    static _styles: string[] = [
        'Controls-demo/Controls-demo'
    ];
}

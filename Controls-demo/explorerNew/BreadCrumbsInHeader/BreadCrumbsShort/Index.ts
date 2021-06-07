import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/explorerNew/BreadCrumbsInHeader/BreadCrumbsShort/BreadCrumbsShort';
import {Gadgets} from '../../DataHelpers/DataCatalog';
import * as MemorySource from 'Controls-demo/explorerNew/ExplorerMemory';
import { IColumn } from 'Controls/grid';
import {TRoot, IHeader} from 'Controls-demo/types';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: MemorySource;
    protected _columns: IColumn[] = Gadgets.getSearchColumns();
    protected _root: TRoot = 112;
    protected _header: IHeader[] = [
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
        this._viewSource = new MemorySource({
            keyProperty: 'id',
            data: Gadgets.getSearchData()
        });
    }

    static _theme: string[] = ['Controls/Classes'];
    static _styles: string[] = [
        'Controls-demo/Controls-demo'
    ];
}

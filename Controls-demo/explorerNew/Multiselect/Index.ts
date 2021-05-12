import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/explorerNew/Multiselect/Multiselect';
import {Gadgets} from '../DataHelpers/DataCatalog';
import * as MemorySource from 'Controls-demo/explorerNew/ExplorerMemory';
import {IColumn} from 'Controls/grid';
import {TRoot} from 'Controls-demo/types';
import { IHeaderCell } from 'Controls/grid';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: MemorySource;
    protected _radioSource: MemorySource;
    protected _columns: IColumn[] = Gadgets.getGridColumns();
    protected _viewMode: string = 'table';
    protected _root: TRoot = null;
    protected _header: IHeaderCell[] = Gadgets.getHeader();
    protected _selectedKey: string = 'visible';

    protected _beforeMount(): void {
        this._viewSource = new MemorySource({
            keyProperty: 'id',
            data: Gadgets.getData()
        });
        this._radioSource = new MemorySource({
            keyProperty: 'id',
            data: [
                {
                    id: 'visible',
                    title: 'multiSelectVisibility = visible',
                },
                {
                    id: 'hidden',
                    title: 'multiSelectVisibility = hidden',
                },
                {
                    id: 'onhover',
                    title: 'multiSelectVisibility = onhover',
                }
            ]
        });
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}

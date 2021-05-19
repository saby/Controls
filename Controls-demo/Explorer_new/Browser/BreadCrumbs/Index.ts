import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/Explorer_new/Browser/BreadCrumbs/Index';
import {Gadgets} from '../../DataHelpers/DataCatalog';
import * as MemorySource from 'Controls-demo/Explorer/ExplorerMemory';
import { IColumn } from 'Controls/gridOld';
import {TRoot} from "Controls-demo/types";

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: MemorySource;
    protected _columns: IColumn[] = Gadgets.getSearchColumns();
    protected _root: TRoot = null;

    protected _beforeMount(): void {
        this._viewSource = new MemorySource({
            keyProperty: 'id',
            data: Gadgets.getSearchData()
        });
    }
    static _styles: string[] = [
        'Controls-demo/Controls-demo'
    ];
}

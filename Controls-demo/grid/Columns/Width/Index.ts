import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/grid/Columns/Width/Width';
import {Memory} from 'Types/source';
import {forShowWidths} from '../../DemoHelpers/DataCatalog';
import { IHeader } from 'Controls-demo/types';
import { IColumn } from 'Controls/_grid/interface/IColumn';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: Memory;
    protected _header: IHeader[] = forShowWidths().getHeader();
    protected _columns: IColumn[] = forShowWidths().getColumns1();

    protected _beforeMount(): void {
        this._viewSource = new Memory({
            keyProperty: 'id',
            data: forShowWidths().getData()
        });
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}

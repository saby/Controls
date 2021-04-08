import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/gridNew/CellPadding/CellPadding';
import {Memory} from 'Types/source';
import {cellPadding} from '../DemoHelpers/DataCatalog';
import { IHeader } from 'Controls-demo/types';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: Memory;
    protected _columns: unknown = cellPadding().getCollumns();
    protected _header: IHeader[] = cellPadding().getCellPaddingHeader();

    protected _beforeMount(): void {
        this._viewSource = new Memory({
            keyProperty: 'id',
            // tslint:disable-next-line
            data: cellPadding().getData().slice(0, 5)
        });
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}

// tslint:disable-next-line:ban-ts-ignore
// @ts-ignore
import * as Template from 'wml!Controls-demo/gridNew/Footer/Footer/Footer';
import {Control, TemplateFunction} from 'UI/Base';
import { IColumn } from 'Controls/grid';
import { Countries } from 'Controls-demo/gridNew/DemoHelpers/Data/Countries';
import {Memory} from 'Types/source';

const COLUMNS_COUNT = 4;
const DATA_ITEMS_COUNT = 7;

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: Memory;
    protected _columns: IColumn[] = Countries.getColumnsWithFixedWidths(COLUMNS_COUNT);
    protected _footerCfg: unknown[] = [];

    protected _beforeMount(): void {
        this._viewSource = new Memory({
            keyProperty: 'key',
            data: Countries.getData(DATA_ITEMS_COUNT)
        });
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}

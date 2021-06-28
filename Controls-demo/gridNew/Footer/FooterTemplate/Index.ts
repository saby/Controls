import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/gridNew/Footer/FooterTemplate/FooterTemplate';
import {Memory} from 'Types/source';
import { IColumn } from 'Controls/grid';
import { Countries } from 'Controls-demo/gridNew/DemoHelpers/Data/Countries';

const COLUMNS_COUNT = 4;
const DATA_ITEMS_COUNT = 7;

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: Memory;
    protected _columns: IColumn[] = Countries.getColumns(COLUMNS_COUNT);

    protected _beforeMount(): void {
        this._columns[0].width = '30px';
        this._viewSource = new Memory({
            keyProperty: 'key',
            data: Countries.getData(DATA_ITEMS_COUNT)
        });
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}

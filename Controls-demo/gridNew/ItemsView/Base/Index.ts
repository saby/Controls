// tslint:disable-next-line:ban-ts-ignore
// @ts-ignore
import * as Template from 'wml!Controls-demo/gridNew/ItemsView/Base/Index';
import {IColumn} from 'Controls/grid';
import {RecordSet} from 'Types/collection';
import {Control, TemplateFunction} from 'UI/Base';
import { Countries } from 'Controls-demo/gridNew/DemoHelpers/Data/Countries';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _items: RecordSet;
    protected _columns: IColumn[] = Countries.getColumns();

    protected _beforeMount(): void {
        this._items = new RecordSet({
            keyProperty: 'id',
            rawData: Countries.getData()
        });
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}

// tslint:disable-next-line:ban-ts-ignore
// @ts-ignore
import * as Template from 'wml!Controls-demo/treeGridNew/ItemsView/Base/Index';
import {Gadgets} from '../../DemoHelpers/DataCatalog';
import {Control, TemplateFunction} from 'UI/Base';
import {RecordSet} from 'Types/collection';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _items: RecordSet;
    protected _columns: unknown[] = Gadgets.getGridColumnsForFlat();

    protected _beforeMount(): void {
        this._items = new RecordSet({
            keyProperty: 'id',
            rawData: Gadgets.getFlatData()
        });
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}

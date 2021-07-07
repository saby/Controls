import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/list_new/Navigation/Paging/Compact/ContentTemplate/Compact';
import {Memory} from 'Types/source';
import {generateData} from '../../../../DemoHelpers/DataCatalog';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: Memory;
    private _dataArray: unknown = generateData({count: 100, entityTemplate: {title: 'lorem'}});
    protected _count: number;

    protected _beforeMount(): void {
        this._count = 99;
        this._viewSource = new Memory({
            keyProperty: 'id',
            data: this._dataArray
        });
    }

    protected _updateCount(e, key) {
        this._count = 99 - key;
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}

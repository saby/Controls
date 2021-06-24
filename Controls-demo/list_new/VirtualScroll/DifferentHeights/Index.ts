import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/list_new/VirtualScroll/DifferentHeights/DifferentHeights';
import {Memory} from 'Types/source';
import {generateData} from '../../DemoHelpers/DataCatalog';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: Memory;
    // tslint:disable-next-line
    private _dataArray: Array<{count: number, entityTemplate: {title: string}}> =
        generateData({count: 1000, entityTemplate: {title: 'lorem'}});

    protected _beforeMount(): void {
        this._viewSource = new Memory({
            keyProperty: 'id',
            data: this._dataArray
        });
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}

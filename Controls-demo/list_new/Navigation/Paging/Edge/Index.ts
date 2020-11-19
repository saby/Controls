import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/list_new/Navigation/Paging/Edge/Edge';
import {Memory} from 'Types/source';
import {generateData} from '../../../DemoHelpers/DataCatalog';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: Memory;
    private _dataArray: unknown = generateData({count: 60, entityTemplate: {title: 'lorem'}});

    protected _beforeMount(): void {
        this._viewSource = new Memory({
            keyProperty: 'id',
            data: this._dataArray
        });
    }

    protected _afterMount(): void {
        setTimeout(() => {
            this._children.list.scrollToItem(59, true, true);
        }, 20);
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}

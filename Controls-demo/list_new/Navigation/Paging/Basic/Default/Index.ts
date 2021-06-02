/* eslint-disable */
import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/list_new/Navigation/Paging/Basic/Default/Basic';
import {Memory} from 'Types/source';
import {generateData} from '../../../../DemoHelpers/DataCatalog';

/**
 * Стандартное отображение пэйджинга с 3 кнопками
 */
export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: Memory;
    private _dataArray: unknown = generateData({count: 100, entityTemplate: {title: 'lorem'}});

    protected _beforeMount(): void {
        this._viewSource = new Memory({
            keyProperty: 'key',
            data: this._dataArray
        });
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}

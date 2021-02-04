import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/list_new/Navigation/Paging/Numbers/Numbers';
import {Memory} from 'Types/source';
import {generateData} from '../../../DemoHelpers/DataCatalog';

/**
 * Отображение пейджинга с подсчетом записей и страниц
 */
export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: Memory;
    private _dataArray: unknown = generateData({count: 150, entityTemplate: {title: 'lorem'}});

    protected _beforeMount(): void {
        this._viewSource = new Memory({
            keyProperty: 'id',
            data: this._dataArray
        });
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}

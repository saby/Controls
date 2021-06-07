import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/list_new/Navigation/DemandToInfinity/DemandToInfinity';
import {Memory} from 'Types/source';
import {generateData} from '../../DemoHelpers/DataCatalog';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: Memory;
    protected _dataArray: unknown = generateData({count: 30, entityTemplate: {title: 'lorem'}});
    protected _view: 'demand' | 'infinity' = 'demand';
    protected _beforeMount(): void {
        this._viewSource = new Memory({
            keyProperty: 'id',
            data: this._dataArray
        });
    }
    protected _switchNavigation(): void {
        this._view = this._view === 'demand' ? 'infinity' : 'demand';
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}

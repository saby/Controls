import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/grid/EditInPlace/Base/Base';
import {Memory} from 'Types/source';
import {getPorts} from '../../DemoHelpers/DataCatalog';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: Memory;
    protected _columns = getPorts().getColumns();

    protected _beforeMount(): void {
        this._viewSource = new Memory({
            keyProperty: 'id',
            data: getPorts().getData()
        });
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}

import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/grid/EditInPlace/Decorators/Decorators';
import {Memory} from 'Types/source';
import {getEditing} from '../../DemoHelpers/DataCatalog';
import 'css!Controls-demo/Controls-demo'

export default class extends Control {
    protected _template: TemplateFunction = Template;
    private _viewSource: Memory;
    private _header = getEditing().getDecoratedEditingHeader();
    private _columns = getEditing().getDecoratedEditingColumns();

    protected _beforeMount() {
        this._viewSource = new Memory({
            keyProperty: 'id',
            data: getEditing().getDecoratedEditingData()
        });
    }
}

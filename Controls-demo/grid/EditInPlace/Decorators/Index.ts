import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/grid/EditInPlace/Decorators/Decorators';
import {Memory} from 'Types/source';
import {getEditing} from '../../DemoHelpers/DataCatalog';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: Memory;
    protected _header = getEditing().getDecoratedEditingHeader();
    protected _columns = getEditing().getDecoratedEditingColumns();

    protected _beforeMount() {
        this._viewSource = new Memory({
            keyProperty: 'id',
            data: getEditing().getDecoratedEditingData()
        });
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}

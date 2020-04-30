import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/grid/EditInPlace/EditingOnMounting/EditingOnMounting';
import {Memory} from 'Types/source';
import {getCountriesStats} from '../../DemoHelpers/DataCatalog';
import 'css!Controls-demo/Controls-demo';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: Memory;
    protected _columns = getCountriesStats().getColumnsWithoutWidths();
    private _editingConfig = null;

    protected _beforeMount() {
        this._viewSource = new Memory({
            keyProperty: 'id',
            data: []
        });

        return this._viewSource.create().then((res) => {
            this._editingConfig = {
                toolbarVisibility: true,
                item: res,
                editOnClick: true
            };
        });
    }
}

import {Control, TemplateFunction} from "UI/Base"
import * as Template from "wml!Controls-demo/grid/Multiselect/Multiselect"
import {Memory} from "Types/source"
import {getCountriesStats} from "../DemoHelpers/DataCatalog"

import 'css!Controls-demo/Controls-demo'

export default class extends Control {
    protected _template: TemplateFunction = Template;
    private _viewSource: Memory;
    private _columns = getCountriesStats().getColumnsWithoutWidths();
    private _multiselect: 'visible'|'hidden'|'onhover' = 'visible';

    protected _beforeMount() {
        this._viewSource = new Memory({
            keyProperty: 'id',
            data: getCountriesStats().getData()
        });
    }
    private _onToggle() {
        switch (this._multiselect) {
            case 'visible':
               this._multiselect = 'hidden';
               break;
            case 'hidden':
                this._multiselect = 'onhover';
                break;
            case 'onhover':
                this._multiselect = 'visible';
                break;
        }
        this._forceUpdate();
    }
}

import {Control, TemplateFunction} from 'UI/Base';
import {Memory} from 'Types/source';

import {Gadgets} from '../DemoHelpers/DataCatalog';

import * as Template from 'wml!Controls-demo/treeGrid/ItemPadding/ItemPadding';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: Memory;
    protected _columns = Gadgets.getColumnsForFlat();

    protected _beforeMount() {
        this._viewSource = new Memory({
            keyProperty: 'id',
            data: Gadgets.getFlatData()
        });
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
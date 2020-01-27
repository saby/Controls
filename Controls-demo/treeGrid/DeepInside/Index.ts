import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/treeGrid/DeepInside/DeepInside';
import {HierarchicalMemory} from 'Types/source';
import {DeepInside} from '../DemoHelpers/DataCatalog';

import 'css!Controls-demo/Controls-demo';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    private _viewSource: HierarchicalMemory;
    private _columns = DeepInside.getColumns();
    private _expandedItems = [null];
    private _collapsedItems = [6];

    protected _beforeMount() {
        this._viewSource = new HierarchicalMemory({
            keyProperty: 'id',
            data: DeepInside.getData(),
            filter: function () {
                return true;
            }
        });
    }
}

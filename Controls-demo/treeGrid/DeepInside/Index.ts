import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/treeGrid/DeepInside/DeepInside';
import {HierarchicalMemory} from 'Types/source';
import {DeepInside} from '../DemoHelpers/DataCatalog';

import 'css!Controls-demo/Controls-demo';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: HierarchicalMemory;
    protected _columns = DeepInside.getColumns();
    protected _expandedItems = [null];
    protected _collapsedItems = [6];

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

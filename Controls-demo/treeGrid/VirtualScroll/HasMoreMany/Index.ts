import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/treeGrid/VirtualScroll/HasMoreMany/HasMoreMany';
import {Memory} from 'Types/source';
import {VirtualScrollHasMore} from '../../DemoHelpers/DataCatalog';
import 'css!Controls-demo/Controls-demo';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: Memory;
    protected _columns = VirtualScrollHasMore.getColumns();

    protected _beforeMount() {
        this._viewSource = new Memory({
            keyProperty: 'id',
            data: VirtualScrollHasMore.getData()
        });
    }
}

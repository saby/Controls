import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/treeGrid/Grouping/Grouping';
import {HierarchicalMemory} from 'Types/source';
import {createGroupingSource} from 'Controls-demo/treeGrid/Grouping/Source';
import 'css!Controls-demo/Controls-demo';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    private _viewSource: HierarchicalMemory;
    private _columns: object[];
    private _navigation: object;

    protected _beforeMount(): any {
        this._columns = [{
            displayProperty: 'title'
        }, {
            displayProperty: 'count'
        }];
        this._navigation = {
            source: 'position',
            view: 'infinity',
            sourceConfig: {
                limit: 20,
                field: 'key',
                position: 'key_0',
                direction: 'after'
            },
            viewConfig: {
                pagingMode: 'direct'
            }
        };
        this._viewSource = createGroupingSource({
            count: 1000
        });
    }
}

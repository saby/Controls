import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/treeGrid/Grouping/Grouping';
import {HierarchicalMemory} from 'Types/source';
import {createGroupingSource} from 'Controls-demo/treeGrid/Grouping/Source';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: HierarchicalMemory;
    protected _columns: object[];
    protected _navigation: object;

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
                direction: 'forward'
            },
            viewConfig: {
                pagingMode: 'direct'
            }
        };
        this._viewSource = createGroupingSource({
            count: 1000
        });
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}

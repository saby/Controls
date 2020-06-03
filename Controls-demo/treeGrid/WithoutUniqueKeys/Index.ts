import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/treeGrid/WithoutUniqueKeys/WithoutUniqueKeys';
import { data, columns } from 'Controls-demo/treeGrid/WithoutUniqueKeys/data';
import {HierarchicalMemory} from 'Types/source';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: HierarchicalMemory;
    protected _columns: [] = columns as [];

    protected _beforeMount(): void {
        this._viewSource = new HierarchicalMemory({
            keyProperty: 'key',
            parentProperty: 'parent',
            data
        });
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}

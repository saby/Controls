import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/treeGridNew/BackgroundHoverStyle/BackgroundHoverStyle';
import {HierarchicalMemory} from 'Types/source';
import {Flat} from "Controls-demo/treeGridNew/DemoHelpers/Data/Flat";

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: HierarchicalMemory;
    protected _columns: unknown[] = [
        {
            displayProperty: 'title'
        }
    ];

    protected _beforeMount(): void {
        this._viewSource = new HierarchicalMemory({
            keyProperty: 'key',
            data: Flat.getData(),
            parentProperty: 'parent'
        });
    }

    static _styles: string[] = [
        'Controls-demo/Controls-demo',
        'Controls-demo/treeGridNew/BackgroundHoverStyle/BackgroundHoverStyle'
    ];
}

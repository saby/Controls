import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/treeGridNew/NodeFooter/NodeFooterTemplate/NodeFooterTemplate';
import {HierarchicalMemory} from 'Types/source';
import {Gadgets} from '../../DemoHelpers/DataCatalog';
import { IColumn } from 'Controls/grid';
import { TExpandOrColapsItems } from 'Controls-demo/types';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: HierarchicalMemory;
    protected _columns: IColumn[] = Gadgets.getColumnsForFlat();
    protected _expandedItems: TExpandOrColapsItems = [null];

    protected _beforeMount(): void {
        this._viewSource = new HierarchicalMemory({
            keyProperty: 'id',
            data: Gadgets.getFlatData(),
            filter: (): boolean => true
        });
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}

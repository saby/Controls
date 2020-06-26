import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/treeGrid/DeepInside/DeepInside';
import {HierarchicalMemory} from 'Types/source';
import {DeepInside} from '../DemoHelpers/DataCatalog';
import { IColumn } from 'Controls/_grid/interface/IColumn';
import { TExpandOrColapsItems } from 'Controls-demo/types';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: HierarchicalMemory;
    protected _columns: IColumn[] = DeepInside.getColumns();
    protected _expandedItems: TExpandOrColapsItems = [null];
    protected _collapsedItems: TExpandOrColapsItems = [6];

    protected _beforeMount(): void {
        this._viewSource = new HierarchicalMemory({
            keyProperty: 'id',
            data: DeepInside.getData(),
            filter: function () {
                return true;
            }
        });
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}

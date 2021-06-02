import { Control, TemplateFunction } from 'UI/Base';
import * as Template from 'wml!Controls-demo/tree/HorizontalLeaves/HorizontalLeaves';
import * as ItemTemplate from 'wml!Controls-demo/tree/HorizontalLeaves/ItemTemplate';
import { HierarchicalMemory } from 'Types/source';
import data from 'Controls-demo/tree/data/Halls';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _itemTemplate: TemplateFunction = ItemTemplate;
    protected _viewSource: HierarchicalMemory;
    protected _expandedItems = [ 1, 2 ];
    protected _itemActions = [{
        id: 1,
        icon: 'icon-Erase',
        iconStyle: 'danger',
        title: 'delete'
    }];

    protected _beforeMount(): void {
        this._viewSource = new HierarchicalMemory({
            keyProperty: 'key',
            data
        });
    }

    static _styles: string[] = ['Controls-demo/tree/HorizontalLeaves/styles', 'Controls-demo/Controls-demo'];
}

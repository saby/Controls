import * as Item from 'wml!Controls/_treeGridNew/render/grid/Item';

import { GridView } from 'Controls/gridNew';
import { TemplateFunction } from 'UI/Base';
import { TreeItem } from 'Controls/display';
import { SyntheticEvent } from 'UI/Vdom';
import { Model } from 'Types/entity';

export default class TreeGridView extends GridView {
    _beforeUpdate(newOptions: any): void {
        super._beforeUpdate(newOptions);
        if (this._options.expanderSize !== newOptions.expanderSize) {
            this._listModel.setExpanderSize(newOptions.expanderSize);
        }
    }

    protected _resolveBaseItemTemplate(options: any): TemplateFunction {
        return Item;
    }

    protected _onItemClick(e: SyntheticEvent, dispItem: TreeItem<Model>): void {
        if (dispItem['[Controls/treeGrid:TreeGridNodeFooterRow]']) {
            e.stopImmediatePropagation();
            return;
        }

        super._onItemClick(e, dispItem);
    }

    protected _onItemMouseUp(e: SyntheticEvent, dispItem: TreeItem<Model>): void {
        if (dispItem['[Controls/treeGrid:TreeGridNodeFooterRow]']) {
            e.stopImmediatePropagation();
            return;
        }

        super._onItemMouseUp(e, dispItem);
    }

    protected _onItemMouseDown(e: SyntheticEvent, dispItem: TreeItem<Model>): void {
        if (dispItem['[Controls/treeGrid:TreeGridNodeFooterRow]']) {
            e.stopImmediatePropagation();
            return;
        }

        super._onItemMouseDown(e, dispItem);
    }

    private _onExpanderClick(e: SyntheticEvent, item: TreeItem<Model>): void {
        this._notify('expanderClick', [item], {bubbling: true});
        e.stopImmediatePropagation();
    }

    private _onLoadMoreClick(e: SyntheticEvent, item: TreeItem<Model>): void {
        this._notify('loadMoreClick', [item]);
    }

    static _theme: string[] =  ['Controls/grid', 'Controls/treeGrid'];
}

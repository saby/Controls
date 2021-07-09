import * as ItemTemplate from 'wml!Controls/_tree/render/Item';

import { ListView } from 'Controls/baseList';
import { TemplateFunction } from 'UI/Base';
import { TreeItem } from 'Controls/display';
import { SyntheticEvent } from 'UI/Vdom';
import { Model } from 'Types/entity';
import 'css!Controls/treeGrid';

/**
 * Контрол «Дерево без колонок» позволяет отображать данные из различных источников в виде дерева с одной колонкой. 
 * Контрол поддерживает широкий набор возможностей, позволяющих разработчику максимально гибко настраивать отображение данных.
 * @remark
 * Полезные ссылки:
 * * {@link /doc/platform/developmentapl/interface-development/controls/list/tree/ руководство разработчика}
 * @class Controls/_tree/TreeView
 * @extends Controls/list:View
 * @implements Controls/tree:TreeControl
 * @mixes Controls/marker:IMarkerList
 * @mixes Controls/list:IClickableView
 * @author Аверкиев П.А.
 * @public
 */

export default class TreeView extends ListView {
    _defaultItemTemplate: TemplateFunction = ItemTemplate;

    _beforeUpdate(newOptions: any): void {
        super._beforeUpdate(newOptions);

        if (this._options.expanderSize !== newOptions.expanderSize) {
            this._listModel.setExpanderSize(newOptions.expanderSize);
        }
    }

    protected _onItemClick(e: SyntheticEvent, dispItem: TreeItem<Model>): void {
        if (dispItem['[Controls/tree:TreeNodeFooterItem]']) {
            e.stopImmediatePropagation();
            if (e.target.closest('.js-controls-TreeGrid__nodeFooter__LoadMoreButton')) {
                this._notify('loadMore', [dispItem.getNode()]);
            }
            return;
        }

        super._onItemClick(e, dispItem);
    }

    protected _onItemMouseUp(e: SyntheticEvent, dispItem: TreeItem<Model>): void {
        if (dispItem['[Controls/tree:TreeNodeFooterItem]']) {
            e.stopImmediatePropagation();
            return;
        }

        super._onItemMouseUp(e, dispItem);
    }

    protected _onItemMouseDown(e: SyntheticEvent, dispItem: TreeItem<Model>): void {
        if (dispItem['[Controls/tree:TreeNodeFooterItem]']) {
            e.stopImmediatePropagation();
            return;
        }

        super._onItemMouseDown(e, dispItem);
    }

}

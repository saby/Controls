import {Control, TemplateFunction} from 'UI/Base';
import {IRenderOptions} from 'Controls/listRender';
import {IMenuBaseOptions} from 'Controls/_menu/interface/IMenuBase';
import {TreeItem, GroupItem} from 'Controls/display';
import * as itemTemplate from 'wml!Controls/_menu/Render/itemTemplate';
import * as multiSelectTpl from 'wml!Controls/_menu/Render/multiSelectTpl';
import ViewTemplate = require('wml!Controls/_menu/Render/Render');
import {TKey} from 'Controls/_menu/interface/IMenuControl';
import {Model} from 'Types/entity';
import {SyntheticEvent} from 'Vdom/Vdom';
import {ItemsUtil} from 'Controls/list';

interface IMenuRenderOptions extends IMenuBaseOptions, IRenderOptions {
}

/**
 * Контрол меню рендер.
 * @class Controls/menu:Render
 * @extends UI/_base/Control
 * @private
 *
 * @author Герасимов А.М.
 */

class MenuRender extends Control<IMenuRenderOptions> {
    protected _template: TemplateFunction = ViewTemplate;
    protected _iconPadding: string;

    protected _beforeMount(options: IMenuRenderOptions): void {
        this._iconPadding = this.getIconPadding(options);
    }

    protected _beforeUnmount(): void {
        this.removeEmptyItemFromCollection();
    }

    private removeEmptyItemFromCollection(): void {
        const options = this._options;
        const listModel = options.listModel;
        const emptyItem = options.emptyText && listModel.getItemBySourceKey(options.emptyKey);

        if (emptyItem) {
            listModel.getCollection().remove(emptyItem.getContents());
        }
    }

    protected _isEmptyItem(treeItem: TreeItem<Model>): boolean {
        return this._options.emptyText && treeItem.getContents().getId() === this._options.emptyKey;
    }

    // FIXME
    protected _getItemData(treeItem: TreeItem<Model>): object {
        return {
            item: treeItem.getContents(),
            treeItem,
            iconPadding: this._iconPadding,
            iconSize: treeItem.getContents() ? this._getIconSize(treeItem.getContents()) : null,
            multiSelect: this._options.multiSelect,
            parentProperty: this._options.parentProperty,
            nodeProperty: this._options.nodeProperty,
            multiSelectTpl,
            itemClassList: this._getClassList(treeItem),
            getPropValue: ItemsUtil.getPropertyValue,
            isEmptyItem: this._isEmptyItem(treeItem),
            isFixedItem: this._isFixedItem(treeItem),
            isSelected: treeItem.isSelected.bind(treeItem)
        };
    }

    protected _proxyEvent(e: SyntheticEvent<MouseEvent>, eventName: string): void {
        e.stopPropagation();
        const slicePos = 2;
        const args = Array.prototype.slice.call(arguments, slicePos);
        this._notify(eventName, args);
    }

    protected _separatorMouseEnter(event: SyntheticEvent<MouseEvent>): void {
        this._notify('separatorMouseEnter', [event]);
    }

    protected _itemClick(e: SyntheticEvent<MouseEvent>, item: Model, sourceEvent: SyntheticEvent<MouseEvent>): void {
        e.stopPropagation();
        if (item instanceof Model) {
            this._notify('itemClick', [item, sourceEvent]);
        }
    }

    protected _getClassList(treeItem: TreeItem<Model>): string {
        const item = treeItem.getContents();
        let classes = treeItem.getContentClasses(this._options.theme);
        if (item && item.get) {
            classes += ' controls-Menu__row_state_' +
                (item.get('readOnly') ? 'readOnly' : 'default') +
                '_theme-' + this._options.theme;
            if (this._isEmptyItem(treeItem) && !this._options.multiSelect) {
                classes += ' controls-Menu__emptyItem_theme-' + this._options.theme;
            } else {
                classes += ' controls-Menu__defaultItem_theme-' + this._options.theme;
            }
            if (!this._isFixedItem(treeItem) && item.get('pinned') === true &&
                !this.hasParent(item, this._options.historyRoot)) {
                classes += ' controls-Menu__row_pinned controls-DropdownList__row_pinned';
            }
            if (this._options.listModel.getLast() !== treeItem && !this._isGroupNext(treeItem) &&
                !(this._options.allowPin && this._isHistorySeparatorVisible(treeItem))) {
                classes += ' controls-Menu__row-separator_theme-' + this._options.theme;
            }
        } else if (item && !treeItem['[Controls/_display/SearchSeparator]']) {
            classes += ' controls-Menu__row-breadcrumbs_theme-' + this._options.theme;
        }
        return classes;
    }

    protected _isHistorySeparatorVisible(treeItem: TreeItem<Model>): boolean {
        const item = treeItem.getContents();
        const nextItem = this._getNextItem(treeItem);
        const isGroupNext = this._isGroupNext(treeItem);
        return !isGroupNext &&
            nextItem?.getContents() &&
            this._isHistoryItem(item) &&
            !this.hasParent(treeItem.getContents(), this._options.historyRoot) &&
            !this._isHistoryItem(nextItem.getContents());
    }

    protected _isGroupVisible(groupItem: GroupItem): boolean {
        const collection = groupItem.getOwner();
        const itemsGroupCount = collection.getGroupItems(groupItem.getContents()).length;
        return !groupItem.isHiddenGroup() && itemsGroupCount > 0 && itemsGroupCount !== collection.getCount(true);
    }

    private hasParent(item: Model, root?: TKey = null): boolean {
        return item.get(this._options.parentProperty) !== undefined && item.get(this._options.parentProperty) !== root;
    }

    private _isHistoryItem(item: Model): boolean {
        return item.get('pinned') || item.get('recent') || item.get('frequent');
    }

    private _isFixedItem(treeItem: TreeItem<Model>): boolean {
        let isFixed = false;
        const item = treeItem.getContents();
        if (item instanceof Model) {
            isFixed = !item.has('HistoryId') && !!item.get('pinned');
        }
        return isFixed;
    }

    private _isGroupNext(treeItem: TreeItem<Model>): boolean {
        const nextItem = this._getNextItem(treeItem);
        return nextItem && nextItem['[Controls/_display/GroupItem]'];
    }

    private _getNextItem(treeItem: TreeItem<Model>): TreeItem<Model> {
        const index = treeItem.getOwner().getIndex(treeItem);
        return treeItem.getOwner().at(index + 1);
    }

    private _getIconSize(item: Model): string {
        let iconSize = '';
        if (item.get && item.get('icon')) {
            iconSize = item.get('iconSize') || this._options.iconSize;
        } else if (!this._iconPadding) {
            iconSize = this._options.iconSize;
        }
        return iconSize;
    }

    private getIconPadding(options: IMenuRenderOptions): string {
        let iconPadding = '';
        let icon;
        let itemContents;

        options.listModel.each((item) => {
            itemContents = item.getContents();
            icon = itemContents.get && itemContents.get('icon');
            if (icon) {
                iconPadding = itemContents.get('iconSize') || this.getIconSize(icon) || options.iconSize;
            }
        });
        return iconPadding;
    }

    private getIconSize(icon: string): string {
        const iconSizes = [['icon-small', 's'], ['icon-medium', 'm'], ['icon-large', 'l'], ['icon-size', 'default']];
        let result = '';
        iconSizes.forEach((size) => {
            if (icon.indexOf(size[0]) !== -1) {
                result = size[1];
            }
        });
        return result;
    }

    static _theme: string[] = ['Controls/menu', 'Controls/Classes'];

    static getDefaultOptions(): object {
        return {
            itemTemplate
        };
    }
}

export default MenuRender;

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
import Utils = require('Types/util');
import {IItemAction} from 'Controls/itemActions';
import 'css!Controls/menu';
import 'css!Controls/CommonClasses';

interface IMenuRenderOptions extends IMenuBaseOptions, IRenderOptions {
}

const ICON_SIZES = [['icon-small', 's'], ['icon-medium', 'm'], ['icon-large', 'l'], ['icon-size', 'default']];

/**
 * Контрол меню рендер.
 * @class Controls/menu:Render
 * @extends UICore/Base:Control
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
            contents: treeItem.getContents(),
            treeItem,
            iconPadding: this._iconPadding,
            iconSize: treeItem.getContents() ? this._getIconSize(treeItem.getContents()) : null,
            multiSelect: this._options.multiSelect,
            parentProperty: this._options.parentProperty,
            nodeProperty: this._options.nodeProperty,
            multiSelectTpl,
            itemClassList: this._getClassList(treeItem),
            getPropValue: (itemContents, field) => {
                if (!(itemContents instanceof Object)) {
                    return itemContents;
                } else {
                    return Utils.object.getPropertyValue(itemContents, field);
                }
            },
            isEmptyItem: this._isEmptyItem(treeItem),
            isFixedItem: this._isFixedItem(treeItem),
            isSelected: treeItem.isSelected.bind(treeItem)
        };
    }

    protected _itemMouseEnter(e: SyntheticEvent<MouseEvent>,
                              item: TreeItem<Model>,
                              sourceEvent: SyntheticEvent<MouseEvent>): void {
        e.stopPropagation();
        this._notify('itemMouseEnter', [item, sourceEvent]);
    }

    protected _itemSwipe(e: SyntheticEvent<MouseEvent>,
                         item: TreeItem<Model>,
                         swipeEvent: SyntheticEvent<TouchEvent>,
                         swipeContainerWidth: number,
                         swipeContainerHeight: number): void {
        e.stopPropagation();
        this._notify('itemSwipe', [item, swipeEvent, swipeContainerWidth, swipeContainerHeight]);
    }

    protected _itemActionMouseDown(e: SyntheticEvent<MouseEvent>,
                                   item: TreeItem<Model>,
                                   action: IItemAction,
                                   sourceEvent: SyntheticEvent<MouseEvent>): void {
        e.stopPropagation();
        this._notify('itemActionMouseDown', [item, action, sourceEvent]);
    }

    protected _checkBoxClick(): void {
        this._notify('checkBoxClick');
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
            const readOnly = item.get('readOnly');

            classes += ` controls-Menu__row_state_${readOnly ? 'readOnly' : 'default'}` +
                `${!readOnly ? ` controls-Menu__row_hoverBackgroundStyle-${this._options.hoverBackgroundStyle}` : ''}`;

            if (this._isEmptyItem(treeItem) && !this._options.multiSelect) {
                classes += ' controls-Menu__emptyItem';
            } else {
                classes += ' controls-Menu__defaultItem';
            }

            if (!this._isFixedItem(treeItem) && item.get('pinned') === true &&
                !this._hasParent(item, this._options.historyRoot)) {
                classes += ' controls-Menu__row_pinned controls-DropdownList__row_pinned';
            }

            if (this._options.listModel.getLast() !== treeItem && !this._isGroupNext(treeItem) &&
                !(this._options.allowPin && this._isHistorySeparatorVisible(treeItem))) {
                classes += ' controls-Menu__row-separator';
            }
        } else if (item && !treeItem['[Controls/_display/SearchSeparator]']) {
            classes += ' controls-Menu__row-breadcrumbs';
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
            !this._hasParent(treeItem.getContents(), this._options.historyRoot) &&
            !this._isHistoryItem(nextItem.getContents());
    }

    protected _isGroupVisible(groupItem: GroupItem): boolean {
        const collection = groupItem.getOwner();
        const itemsGroupCount = collection.getGroupItems(groupItem.getContents()).length;
        return !groupItem.isHiddenGroup() && itemsGroupCount > 0 && itemsGroupCount !== collection.getCount(true);
    }

    private _hasParent(item: Model, root?: TKey = null): boolean {
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
        let result = '';
        ICON_SIZES.forEach((size) => {
            if (icon.indexOf(size[0]) !== -1) {
                result = size[1];
            }
        });
        return result;
    }

    static getDefaultOptions(): object {
        return {
            itemTemplate
        };
    }
}

Object.defineProperty(MenuRender, 'defaultProps', {
   enumerable: true,
   configurable: true,

   get(): object {
      return MenuRender.getDefaultOptions();
   }
});

export default MenuRender;

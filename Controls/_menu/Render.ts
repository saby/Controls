import {Control, TemplateFunction} from 'UI/Base';
import {IRenderOptions} from 'Controls/listRender';
import {IMenuBaseOptions} from 'Controls/_menu/interface/IMenuBase';
import {Tree, TreeItem, GroupItem, Collection} from 'Controls/display';
import * as itemTemplate from 'wml!Controls/_menu/Render/itemTemplate';
import * as multiSelectTpl from 'wml!Controls/_menu/Render/multiSelectTpl';
import ViewTemplate = require('wml!Controls/_menu/Render/Render');
import {TKey} from 'Controls/_menu/interface/IMenuControl';
import {Model} from 'Types/entity';
import {RecordSet} from 'Types/collection';
import { SyntheticEvent } from 'UICommon/Events';
import {factory} from 'Types/chain';
import {ItemsUtil} from 'Controls/list';
import {Visibility as MarkerVisibility} from 'Controls/marker';
import {IItemAction} from 'Controls/itemActions';
import {create as DiCreate} from 'Types/di';
import 'css!Controls/menu';
import 'css!Controls/CommonClasses';

interface IMenuRenderOptions extends IMenuBaseOptions, IRenderOptions {
}

const ICON_SIZES = [['icon-small', 's'], ['icon-medium', 'm'], ['icon-large', 'l'], ['icon-size', 'default']];

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
        this.setListModelOptions(options);
        this._iconPadding = this.getIconPadding(options);
    }

    protected _beforeUpdate(newOptions: IMenuRenderOptions): void {
        if (newOptions.listModel !== this._options.listModel) {
            this.setListModelOptions(newOptions);
        }
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
            getPropValue: ItemsUtil.getPropertyValue,
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
            classes += ' controls-Menu__row_state_' +
                (item.get('readOnly') ? 'readOnly' : 'default');
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

    private setListModelOptions(options: IMenuRenderOptions): void {
        options.listModel.setItemPadding({
            top: 'null',
            bottom: 'menu-default',
            left: this.getLeftPadding(options),
            right: this.getRightPadding(options)
        });
        if (!options.searchValue && options.emptyText && !options.listModel.getItemBySourceKey(options.emptyKey)) {
            this.addEmptyItem(options.listModel, options);
        }
    }

    private addEmptyItem(listModel: Tree, options: IMenuRenderOptions): void {
        const collection = listModel.getCollection();
        const emptyItem = this._getItemModel(collection, options.keyProperty);

        const data = {};
        data[options.keyProperty] = options.emptyKey;
        data[options.displayProperty] = options.emptyText;

        if (options.parentProperty) {
            data[options.parentProperty] = options.root;
        }
        if (options.nodeProperty) {
            data[options.nodeProperty] = false;
        }
        emptyItem.set(data);
        collection.prepend([emptyItem]);

        if (options.markerVisibility !== MarkerVisibility.Hidden &&
            (!options.selectedKeys.length || options.selectedKeys.includes(options.emptyKey))) {
            this._selectItem(listModel, options.emptyKey, true);
        }
    }

    private _getItemModel(collection: RecordSet, keyProperty: string): Model {
        const model = collection.getModel();
        const modelConfig = {
            keyProperty,
            format: collection.getFormat(),
            adapter: collection.getAdapter()
        };
        if (typeof model === 'string') {
            return this._createModel(model, modelConfig);
        } else {
            return new model(modelConfig);
        }
    }

    private _createModel(model: string, config: object): Model {
        return DiCreate(model, config);
    }

    private getLeftPadding(options: IMenuRenderOptions): string {
        let leftSpacing = 'm';
        if (options.itemPadding.left) {
            leftSpacing = options.itemPadding.left;
        }
        return leftSpacing;
    }

    private getRightPadding(options: IMenuRenderOptions): string {
        let rightSpacing = 'm';
        if (!options.itemPadding.right) {
            if (options.multiSelect) {
                rightSpacing = 'menu-multiSelect';
            } else {
                factory(options.listModel).each((item) => {
                    if (item.getContents().get && item.getContents().get(options.nodeProperty)) {
                        rightSpacing = 'menu-expander';
                    }
                });
            }
        } else {
            rightSpacing = options.itemPadding.right;
            if (options.multiSelect) {
                rightSpacing += '-multiSelect';
            }
        }
        return rightSpacing;
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

    private _selectItem(collection: Collection<unknown>, key: number|string, state: boolean): void {
        const item = collection.getItemBySourceKey(key);
        if (item) {
            item.setMarked(state, true);
            collection.nextVersion();
        }
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

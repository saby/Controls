import {Control, TemplateFunction} from 'UI/Base';
import {IRenderOptions} from 'Controls/listRender';
import {IMenuOptions} from 'Controls/_menu/interface/IMenuControl';
import {Tree, TreeItem, GroupItem, SelectionController} from 'Controls/display';
import * as itemTemplate from 'wml!Controls/_menu/Render/itemTemplate';
import * as multiSelectTpl from 'wml!Controls/_menu/Render/multiSelectTpl';
import ViewTemplate = require('wml!Controls/_menu/Render/Render');
import {Model} from 'Types/entity';
import {SyntheticEvent} from 'Vdom/Vdom';
import {factory} from 'Types/chain';
import {ItemsUtil} from 'Controls/list';

interface IMenuRenderOptions extends IMenuOptions, IRenderOptions {
}

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

    protected _isEmptyItem(itemData): boolean {
        return this._options.emptyText && itemData.getContents().getId() === this._options.emptyKey;
    }

    // FIXME
    protected _getItemData(item): object {
        return {
            item: item.getContents(),
            treeItem: item,
            iconPadding: this._iconPadding,
            iconSize: this._options.iconSize,
            multiSelect: this._options.multiSelect,
            parentProperty: this._options.parentProperty,
            nodeProperty: this._options.nodeProperty,
            multiSelectTpl,
            getPropValue: ItemsUtil.getPropertyValue,
            isEmptyItem: this._isEmptyItem(item),
            isSelected: item.isSelected.bind(item)
        };
    }

    protected _proxyEvent(e: SyntheticEvent<MouseEvent>, eventName: string, item: TreeItem<Model>, sourceEvent: SyntheticEvent<MouseEvent>): void {
        e.stopPropagation();
        this._notify(eventName, [item, sourceEvent]);
    }

    protected _itemClick(e: SyntheticEvent<MouseEvent>, item: Model, sourceEvent: SyntheticEvent<MouseEvent>): void {
        e.stopPropagation();
        if (item instanceof Model) {
            this._notify('itemClick', [item, sourceEvent]);
        }
    }

    protected _getClassList(treeItem): string {
        const item = treeItem.getContents();
        let classes = treeItem.getContentClasses();
        if (item.get) {
            classes += ' controls-Menu__row_state_' + (item.get('readOnly') ? 'readOnly' : 'default') + '_theme-' + this._options.theme;
            if (treeItem.isHovered() && !item.get('readOnly')) {
                classes += ' controls-Menu__row_hovered_theme-' + this._options.theme;
            }
            if (this._isEmptyItem(treeItem) && !this._options.multiSelect) {
                classes += ' controls-Menu__emptyItem_theme-' + this._options.theme;
            } else {
                classes += ' controls-Menu__defaultItem_theme-' + this._options.theme;
            }
            if (item.get('pinned') === true && !this.hasParent(item)) {
                classes += ' controls-Menu__row_pinned controls-DropdownList__row_pinned';
            }
            if (this._options.listModel.getLast() !== treeItem &&
                !(this._getNextItem(treeItem) instanceof GroupItem) && !this._isVisibleSeparator(treeItem)) {
                classes += ' controls-Menu__row-separator_theme-' + this._options.theme;
            }
        } else {
            classes += ' controls-Menu__row-breadcrumbs_theme-' + this._options.theme;
        }
        return classes;
    }

    protected _isVisibleSeparator(treeItem): boolean {
        const item = treeItem.getContents();
        const nextItem = this._getNextItem(treeItem);
        const isGroupNext = nextItem instanceof GroupItem;
        return !isGroupNext && nextItem?.getContents() && this._isHistoryItem(item) && !this.hasParent(treeItem.getContents()) && !this._isHistoryItem(nextItem.getContents());
    }

    protected _isGroupVisible(groupItem: GroupItem): boolean {
        let collection = groupItem.getOwner();
        let itemsGroupCount = collection.getGroupItems(groupItem.getContents()).length;
        return !groupItem.isHiddenGroup() && itemsGroupCount > 0 && itemsGroupCount !== collection.getCount(true);
    }

    private hasParent(item: Model): boolean {
        return item.get(this._options.parentProperty) !== undefined && item.get(this._options.parentProperty) !== null;
    }

    private _isHistoryItem(item: Model): boolean {
        return item.get('pinned') || item.get('recent') || item.get('frequent');
    }

    private _getNextItem(treeItem): TreeItem {
        const index = treeItem.getOwner().getIndex(treeItem);
        return treeItem.getOwner().at(index + 1);
    }

    private setListModelOptions(options: IMenuRenderOptions) {
        options.listModel.setItemsSpacings({
            top: 'null',
            left: this.getLeftSpacing(options),
            right: this.getRightSpacing(options)
        });
        if (!options.searchValue && options.emptyText && !options.listModel.getItemBySourceKey(options.emptyKey)) {
            this.addEmptyItem(options.listModel, options);
        }
    }

    private addEmptyItem(listModel: Tree, options: IMenuRenderOptions): void {
        const collection = listModel.getCollection();
        const emptyItem = new Model({
            keyProperty: options.keyProperty,
            format: collection.getFormat(),
            adapter: collection.getAdapter()
        });
        const data = {};

        data[options.keyProperty] = options.emptyKey;
        data[options.displayProperty] = options.emptyText;

        emptyItem.set(data);
        collection.prepend([emptyItem]);

        if (options.selectedKeys.includes(options.emptyKey)) {
            SelectionController.selectItem(listModel, options.emptyKey, true);
        }
    }

    private getLeftSpacing(options: IMenuRenderOptions): string {
        let leftSpacing = 'l';
        if (options.itemPadding.left) {
            leftSpacing = options.itemPadding.left;
        } else if (options.multiSelect) {
            leftSpacing = 'null';
        }
        return leftSpacing;
    }

    private getRightSpacing(options: IMenuRenderOptions): string {
        let rightSpacing = 'l';
        if (!options.itemPadding.right) {
            factory(options.listModel).each((item) => {
                if (item.getContents().get && item.getContents().get(options.nodeProperty)) {
                    rightSpacing = 'menu-expander';
                }
            });
        } else {
            rightSpacing = options.itemPadding.right;
        }
        return rightSpacing;
    }

    private getIconPadding(options: IMenuRenderOptions): string {
        const items = options.listModel.getCollection();
        const parentProperty = options.parentProperty;
        let iconPadding = '', icon;
        let headingIcon = options.headConfig?.icon || options.headingIcon;

        if (options.root === null && headingIcon && (!options.headConfig || options.headConfig.menuStyle !== 'titleHead')) {
            iconPadding = this.getIconSize(options.iconSize, headingIcon);
        } else {
            factory(items).each((item) => {
                icon = item.get('icon');
                if (icon && (!parentProperty || item.get(parentProperty) === options.root)) {
                    iconPadding = this.getIconSize(options.iconSize, icon);
                }
            });
        }
        return iconPadding;
    }

    private getIconSize(iconSize: string, icon: string): string {
        const iconSizes = [['icon-small', 's'], ['icon-medium', 'm'], ['icon-large', 'l']];
        if (iconSize) {
            return iconSize;
        } else {
            let result = '';
            iconSizes.forEach((size) => {
                if (icon.indexOf(size[0]) !== -1) {
                    result = size[1];
                }
            });
            return result;
        }
    }

    static _theme: string[] = ['Controls/menu', 'Controls/Classes'];

    static getDefaultOptions(): object {
        return {
            itemTemplate,
            itemPadding: {}
        };
    }
}

export default MenuRender;

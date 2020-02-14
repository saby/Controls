import {Control, TemplateFunction} from 'UI/Base';
import {IRenderOptions} from 'Controls/listRender';
import {IMenuOptions} from 'Controls/_menu/interface/IMenuControl';
import {Tree, GroupItem, SelectionController} from 'Controls/display';
import * as itemTemplate from 'wml!Controls/_menu/Render/itemTemplate';
import * as multiSelectTpl from 'wml!Controls/_menu/Render/multiSelectTpl';
import ViewTemplate = require('wml!Controls/_menu/Render/Render');
import {Model} from 'Types/entity';
import {SyntheticEvent} from 'Vdom/Vdom';
import {factory} from 'Types/chain';
import {ActualApi} from 'Controls/buttons';
import {ItemsUtil} from 'Controls/list';

interface IMenuRenderOptions extends IMenuOptions, IRenderOptions {
}

class MenuRender extends Control<IMenuRenderOptions> {
    protected _template: TemplateFunction = ViewTemplate;
    protected _multiSelectTpl: TemplateFunction = multiSelectTpl;
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
            multiSelectTpl,
            getPropValue: ItemsUtil.getPropertyValue,
            isEmptyItem: this._isEmptyItem(item),
            isSelected: item.isSelected.bind(item)
        };
    }

    protected _proxyEvent(e: SyntheticEvent<MouseEvent>, eventName: string, item: Model, sourceEvent: SyntheticEvent<MouseEvent>): void {
        e.stopPropagation();
        if (!(item instanceof GroupItem)) {
            this._notify(eventName, [item, sourceEvent]);
        }
    }

    protected _getClassList(treeItem): string {
        const item = treeItem.getContents();
        let classes = treeItem.getContentClasses();
        classes += ' controls-Menu__row_state_' + (item.get('readOnly')  ? 'readOnly' : 'default') + '_theme-' + this._options.theme;
        if (treeItem.isHovered() && !item.get('readOnly')) {
            classes += ' controls-Menu__row_hovered_theme-' + this._options.theme;
        }
        if (this._isEmptyItem(treeItem) && !this._options.multiSelect) {
            classes += ' controls-Menu__emptyItem_theme-' + this._options.theme;
        } else {
            classes += ' controls-Menu__defaultItem_theme-' + this._options.theme;
        }
        if (item.get('pinned') === true && treeItem.getParent().getContents() === null) {
            classes += ' controls-Menu__row_pinned controls-DropdownList__row_pinned';
        }
        if (this._options.listModel.getLast() !== treeItem) {
            classes += ' controls-Menu__row-separator_theme-' + this._options.theme;
        }
        return classes;
    }

    protected _isVisibleSeparator(treeItem): boolean {
        const item = treeItem.getContents();
        const nextItem = treeItem.getOwner().getNext(treeItem)?.getContents();
        return nextItem && this._isHistoryItem(item) && !treeItem.getParent().getContents() && !this._isHistoryItem(nextItem);
    }

    protected _isGroupVisible(groupItem): boolean {
        let collection = groupItem.getOwner();
        let itemsGroupCount = collection.getGroupItems(groupItem.getContents()).length;
        return itemsGroupCount > 0 && itemsGroupCount !== collection.getCount(true);
    }

    private _isHistoryItem(item: Model): boolean {
        return item.get('pinned') || item.get('recent') || item.get('frequent');
    }

    private setListModelOptions(options: IMenuRenderOptions) {
        options.listModel.setItemsSpacings({
            top: 'null',
            left: this.getLeftSpacing(options),
            right: this.getRightSpacing(options)
        });
        if (options.emptyText && !options.listModel.getItemBySourceKey(options.emptyKey)) {
            this.addEmptyItem(options.listModel, options);
        }
    }

    private addEmptyItem(listModel: Tree, options: IMenuRenderOptions): void {
        let data = {};
        data[options.keyProperty] = options.emptyKey;
        data[options.displayProperty] = options.emptyText;
        listModel.getCollection().prepend([new Model({
            keyProperty: options.keyProperty,
            rawData: data
        })]);
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
                if (item.isNode && item.isNode()) {
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
            iconPadding = ActualApi.iconSize(options.iconSize, headingIcon) || 'm';
        } else {
            factory(items).each((item) => {
                icon = item.get('icon');
                if (icon && (!parentProperty || item.get(parentProperty) === options.root)) {
                    iconPadding = ActualApi.iconSize(options.iconSize, icon) || 'm';
                }
            });
        }
        return iconPadding;
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

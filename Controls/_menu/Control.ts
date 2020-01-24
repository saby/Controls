import rk = require('i18n!Controls');
import {Control, TemplateFunction} from 'UI/Base';
import {IMenuOptions, TKeys} from 'Controls/interface';
import {Controller as SourceController} from 'Controls/source';
import {RecordSet, List} from 'Types/collection';
import {ICrud} from 'Types/source';
import * as Clone from 'Core/core-clone';
import * as Merge from 'Core/core-merge';
import {Tree, TreeItem} from 'Controls/display';
import Deferred = require('Core/Deferred');
import ViewTemplate = require('wml!Controls/_menu/Control/Control');
import {SyntheticEvent} from 'Vdom/Vdom';
import {Model} from 'Types/entity';
import {factory} from 'Types/chain';
import scheduleCallbackAfterRedraw from 'Controls/Utils/scheduleCallbackAfterRedraw';

class MenuControl extends Control<IMenuOptions> {
    protected _template: TemplateFunction = ViewTemplate;
    protected _listModel: Tree;
    protected _loadItemsPromise: Promise;
    protected _moreButtonVisible: boolean = false;
    protected _expandButtonVisible: boolean = false;
    protected _applyButtonVisible: boolean = false;
    private _sourceController: SourceController = null;
    private _subDropdownItem: TreeItem<Model>|null;
    private _selectionChanged: boolean = false;
    private _expandedItems: RecordSet;
    private _itemsCount: number;

    protected _beforeMount(options: IMenuOptions, context: object, receivedState: RecordSet): Deferred<RecordSet> {
        if (options.source) {
            return this.loadItems(options);
        }
    }

    protected _beforeUpdate(newOptions: IMenuOptions): void {
        if (newOptions.root !== this._options.root) {
            this._closeSubMenu();
            this._loadItemsPromise = this.loadItems(newOptions);
        }
    }

    protected _beforeUnmount(): void {
        if (this._sourceController) {
            this._sourceController.cancelLoading();
            this._sourceController = null;
        }
        this._listModel.destroy();
        this._listModel = null;
    }

    protected _mouseOutHandler(event: SyntheticEvent<MouseEvent>) {
        this._listModel.setHoveredItem(null);
        clearTimeout(this._closeSubMenuTimeout);
        this._lastOpenSubMenuCoord = null;
    }

    protected _mouseMove(event: SyntheticEvent<MouseEvent>) {
        if (this._mouseInTriangleArea && this._subDropdownItem) {
            this.defferedResetSubMenu(this._currentTarget, this._currentItem);
        }
    }

    protected _itemMouseEnter(event: SyntheticEvent<MouseEvent>, item: TreeItem<Model>, target, nativeEvent) {
        const needOpenDropDown = item.isNode() && !item.getContents().get('readOnly');
        const needCloseDropDown = this._subDropdownItem && this._subDropdownItem !== item;

        this._currentItem = item;
        if (!this._subDropdownItem) {
            this._openSubMenuCoord = this.getOpenSubMenuCoordinates(nativeEvent);
        }
        if (needCloseDropDown) {
            if (needOpenDropDown) {
                this._currentTarget = target;
                this._lastOpenSubMenuCoord = this.getOpenSubMenuCoordinates(nativeEvent);
            }
            if (!this._subMenuParams) {
                this._subMenuParams = this.getSubMenuParams();
            }
        }
        const curMouseCoordinates = this.getRelativeMouseCoordinates(nativeEvent);
        this._mouseInTriangleArea = needCloseDropDown ? this.isMouseInTriangleArea(curMouseCoordinates) : false;
        if (!this._mouseInTriangleArea) {
            this._listModel.setHoveredItem(item);
        }
        // Close the already opened sub menu. Installation of new data sets new size of the container.
        // If you change the size of the update, you will see the container twitch.
        if (needCloseDropDown && !needOpenDropDown) {
            if (this._mouseInTriangleArea) {
                this.defferedResetSubMenu(target, item);
            } else {
                this.resetSubMenu(target, item);
            }
        } else {
            clearTimeout(this._closeSubMenuTimeout);
        }
        if (needOpenDropDown && !this._mouseInTriangleArea) {
            this.openSubMenu(target, item);
        }
    }

    protected _itemClick(event: SyntheticEvent<MouseEvent>, item: Model): void {
        const treeItem = this._listModel.getItemBySourceId(item.getKey());
        if (this._options.multiSelect && this._selectionChanged && !this._isEmptyItem(treeItem)) {
            this._listModel.setSelectedItem(treeItem, !treeItem.isSelected());
            this.updateApplyButton();

            this._notify('selectedKeysChanged', [this.getSelectedKeys()]);
        } else {
            this._notify('itemClick', [item]);
        }
    }

    protected _checkBoxClick(event: SyntheticEvent<MouseEvent>): void {
        this._selectionChanged = true;
    }

    protected _subMenuResult(event: SyntheticEvent<MouseEvent>, items) {
        this._notify('sendResult', [items], {bubbling: true});
        this._closeSubMenu();
    }

    protected _closeSubMenu(): void {
        if (this._children.Sticky) {
            this._children.Sticky.close();
        }
    }

    protected _toggleExpanded(event: SyntheticEvent<MouseEvent>, value: boolean): void {
        if (value) {
            if (this._expandedItems) {
                this._listModel.setFilter();
            } else {
                this._itemsCount = this._listModel.getCount();
                this.loadExpandedItems(this._options);
            }
        } else {
            this._listModel.setFilter(this.expandedItemsFilter.bind(this));
        }
    }

    protected _isEmptyItem(itemData) {
        return this._options.emptyText && itemData.getContents().getId() === this._options.emptyKey;
    }

    protected _openSelectorDialog(): void {
        const selectorOpener = this._options.selectorOpener;
        selectorOpener.open(this.getSelectorDialogOptions(this._options));
    }

    private openSubMenu(target, item): void {
        if (this._lastOpenSubMenuCoord && this._subDropdownItem !== item) {
            this._openSubMenuCoord = this._lastOpenSubMenuCoord;
        }
        this._subDropdownItem = item;
        this.openSubDropdown(target, item);
    }

    private resetSubMenu(): void {
        this._listModel.setHoveredItem(this._currentItem);
        this._children.Sticky.close();
        this._subDropdownItem = null;
        this._subMenuParams = null;
        this._mouseInTriangleArea = false;
    }

    private defferedResetSubMenu(target, item): void {
        clearTimeout(this._closeSubMenuTimeout);
        this._closeSubMenuTimeout = setTimeout(() => {
            this.resetSubMenu();
            if (this._currentItem.isNode()) {
                this.openSubMenu(target, item);
            }
        }, 100);
    }

    private isMouseInTriangleArea(curCoord): boolean {
        const totalArea = this.calculateArea(this._subMenuParams.top.x, this._openSubMenuCoord.offsetX, this._subMenuParams.bottom.x,
            this._subMenuParams.top.y, this._openSubMenuCoord.offsetY, this._subMenuParams.bottom.y);
        const firstArea = this.calculateArea(this._subMenuParams.top.x, this._subMenuParams.bottom.x, curCoord.x,
            this._subMenuParams.top.y, this._subMenuParams.bottom.y, curCoord.y);
        const secondArea = this.calculateArea(this._subMenuParams.top.x, curCoord.x, this._openSubMenuCoord.offsetX,
            this._subMenuParams.top.y, curCoord.y, this._openSubMenuCoord.offsetY);
        const thirdArea = this.calculateArea(curCoord.x, this._subMenuParams.top.x, this._openSubMenuCoord.offsetX,
            curCoord.y, this._subMenuParams.bottom.y, this._openSubMenuCoord.offsetY);
        return totalArea === (firstArea + secondArea + thirdArea);
    }

    private calculateArea(x1, x2, x3, y1, y2, y3) {
        return Math.abs((x2 - x1) * (y3 - y1) - (x3 - x1) * (y2 - y1));
    }

    private getOpenSubMenuCoordinates(event): object {
        return {
            offsetX: event.offsetX,
            offsetY: event.offsetY,
            clientX: event.clientX,
            clientY: event.clientY
        }
    }

    private getSubMenuParams(): object {
        const openedSubMenus = document.getElementsByClassName(this._children.Sticky._options.className);
        const lastOpenedSubMenu = openedSubMenus[openedSubMenus.length > 1 ? openedSubMenus.length - 2 : 0].getBoundingClientRect();
        return {
            top: {
                x: lastOpenedSubMenu.x - (this._openSubMenuCoord.clientX - this._openSubMenuCoord.offsetX),
                y: this._openSubMenuCoord.clientY - lastOpenedSubMenu.y - this._openSubMenuCoord.offsetY
            },
            bottom: {
                x: lastOpenedSubMenu.x - (this._openSubMenuCoord.clientX - this._openSubMenuCoord.offsetX),
                y: this._openSubMenuCoord.clientY - lastOpenedSubMenu.y - this._openSubMenuCoord.offsetY + lastOpenedSubMenu.height
            }
        }
    }

    private getRelativeMouseCoordinates(event): object {
        return {
            x: this._openSubMenuCoord.offsetX + event.clientX - this._openSubMenuCoord.clientX,
            y: this._openSubMenuCoord.offsetY + event.clientY - this._openSubMenuCoord.clientY
        };
    }

    private getSelectorDialogOptions(options: IMenuOptions): object {
        let self = this;
        const selectorTemplate = options.selectorTemplate;
        const selectorDialogResult = options.selectorDialogResult;
        const selectorOpener = options.selectorOpener;

        let templateConfig = {
            selectedItems: new List({ items: this._listModel.getSelectedItems() }),
            handlers: {
                onSelectComplete: (event, result) => {
                    selectorDialogResult(event, result);
                    selectorOpener.close();
                }
            }
        };
        Merge(templateConfig, selectorTemplate.templateOptions);

        return Merge({
            templateOptions: templateConfig,
            template: selectorTemplate.templateName,
            isCompoundTemplate: options.isCompoundTemplate,
            handlers: {
                // Для совместимости.
                // Старая система фокусов не знает про существование VDOM окна и не может восстановить на нем фокус после закрытия старой панели.
                onAfterClose: () => {
                    self.activate();
                }
            }
        }, selectorTemplate.popupOptions || {});
    }

    private getSelectedKeys(): TKeys {
        let selectedKeys = [];
        factory(this._listModel.getSelectedItems()).each((treeItem) => {
            selectedKeys.push(treeItem.getContents().get(this._options.keyProperty));
        });
        return selectedKeys;
    }

    private expandedItemsFilter(item: TreeItem<Model>, index: number) {
        return index <= this._itemsCount;
    }

    private needShowApplyButton(newKeys: TKeys, oldKeys: TKeys): boolean {
        const diffKeys = factory(newKeys).filter((key) => !oldKeys.includes(key)).value();
        return newKeys.length !== oldKeys.length || !!diffKeys.length;
    }

    private updateApplyButton() {
        let self = this;
        const isApplyButtonVisible = this._applyButtonVisible;
        const newSelectedKeys = factory(this._listModel.getSelectedItems()).map(item => {
            return item.getContents().get(self._options.keyProperty);
        }).value();
        this._applyButtonVisible = this.needShowApplyButton(newSelectedKeys, this._options.selectedKeys);

        if (this._applyButtonVisible !== isApplyButtonVisible) {
            scheduleCallbackAfterRedraw(this, () => {
                self._notify('controlResize', [], {bubbling: true});
            });
        }
    }

    private createViewModel(items: RecordSet, options: IMenuOptions) {
        this._listModel = this.getCollection(items, options);
        this._listModel.setSelectedItems(this.getSelectedItems(this._listModel, options.selectedKeys), true);
    }

    private getCollection(items: RecordSet, options: IMenuOptions): Tree {
        return new Tree({
            collection: items,
            keyProperty: options.keyProperty,
            nodeProperty: options.nodeProperty,
            parentProperty: options.parentProperty,
            root: options.root
        });
    }

    private getSourceController({source, navigation, keyProperty}: {source: ICrud, navigation: object, keyProperty: string}): SourceController {
        if (!this._sourceController) {
            this._sourceController = new SourceController({
                source,
                navigation,
                keyProperty
            });
        }
        return this._sourceController;
    }

    private getSelectedItems(listModel: Tree, selectedKeys: TKeys) {
        let items = [];
        factory(selectedKeys).each((key) => {
            if (listModel.getItemBySourceId(key)) {
                items.push(listModel.getItemBySourceId(key).getContents());
            }
        });
        return items;
    }

    private loadExpandedItems(options: IMenuOptions): void {
        let self = this;
        let loadConfig = Clone(options);
        delete loadConfig.navigation;
        self._sourceController = null;
        this.loadItems(loadConfig).addCallback((items) => {
            self._expandedItems = items;
            self.createViewModel(items, options);
        });
    }

    private loadItems(options: IMenuOptions): Deferred<RecordSet> {
        let self = this;
        let filter = Clone(options.filter) || {};
        filter[options.parentProperty] = options.root;
        return this.getSourceController(options).load(filter).addCallback((items) => {
            self.createViewModel(items, options);
            self._moreButtonVisible = options.selectorTemplate && self.getSourceController(options).hasMoreData('down');
            self._expandButtonVisible = self._expandButtonVisible || self.getSourceController(options).hasMoreData('down');
            return items;
        });
    }

    private openSubDropdown(target: HTMLDivElement, item: TreeItem<Model>): void {
        // _openSubDropdown is called by debounce and a function call can occur when the control is destroyed,
        // just check _children to make sure, that the control isnt destroyed
        if (item && this._children.Sticky && this._subDropdownItem) {
            this._children.Sticky.open(this.getPopupOptions(target, item), this);
        }
    }

    private getPopupOptions(target: HTMLDivElement, item: TreeItem<Model>): object {
        return {
            templateOptions: this.getTemplateOptions(item),
                target,
                autofocus: false,
            direction: {
                horizontal: 'right'
            },
            targetPoint: {
                horizontal: 'right'
            }
        };
    }

    private getTemplateOptions(item: TreeItem<Model>): object {
        let templateOptions = Clone(this._options);
        templateOptions.root = item.getContents().get(this._options.keyProperty);
        templateOptions.bodyContentTemplate = 'Controls/_menu/Control';
        templateOptions.footerTemplate = this._options.nodeFooterTemplate;
        templateOptions.closeButtonVisibility = false;
        return templateOptions;
    }

    static _theme: string[] = ['Controls/menu'];

    static getDefaultOptions(): object {
        return {
            selectedKeys: [],
            root: null,
            emptyKey: null,
            moreButtonCaption: rk('Еще') + '...'
        };
    }
}

export default MenuControl;

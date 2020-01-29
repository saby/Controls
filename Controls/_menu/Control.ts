import rk = require('i18n!Controls');
import {Control, TemplateFunction} from 'UI/Base';
import {default as IMenuControl, IMenuOptions, TKeys} from 'Controls/_menu/interface/IMenuControl';
import {Controller as SourceController} from 'Controls/source';
import {RecordSet, List} from 'Types/collection';
import {ICrud} from 'Types/source';
import * as Clone from 'Core/core-clone';
import * as Merge from 'Core/core-merge';
import {Tree, TreeItem, SelectionController} from 'Controls/display';
import Deferred = require('Core/Deferred');
import ViewTemplate = require('wml!Controls/_menu/Control/Control');
import {SyntheticEvent} from 'Vdom/Vdom';
import {Model} from 'Types/entity';
import {factory} from 'Types/chain';
import scheduleCallbackAfterRedraw from 'Controls/Utils/scheduleCallbackAfterRedraw';

class MenuControl extends Control<IMenuOptions> implements IMenuControl {
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

    protected _afterMount(newOptions: IMenuOptions): void {
        // удалится по https://online.sbis.ru/opendoc.html?guid=48f59429-2ba5-431f-a895-3d11913c3d01
        this._notify('sendResult', [this._container, 'menuOpened'], {bubbling: true});
    }

    protected _beforeUpdate(newOptions: IMenuOptions): void {
        if (newOptions.root !== this._options.root) {
            this.loadItems(newOptions);
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

    protected _itemMouseEnter(event: SyntheticEvent<MouseEvent>, item: TreeItem<Model>, target, nativeEvent) {
        this.handleCurrentItem(item, target, nativeEvent);
    }

    protected _itemClick(event: SyntheticEvent<MouseEvent>, item: Model): void {
        const key = item.getKey();
        const treeItem = this._listModel.getItemBySourceKey(key);
        if (this._options.multiSelect && this._selectionChanged && !this._isEmptyItem(treeItem)) {
            SelectionController.selectItem(this._listModel, key, !treeItem.isSelected());
            this.updateApplyButton();

            this._notify('selectedKeysChanged', [this.getSelectedKeys()]);
        } else {
            this._notify('itemClick', [item]);
        }
    }

    protected _checkBoxClick(event: SyntheticEvent<MouseEvent>): void {
        this._selectionChanged = true;
    }

    protected _subMenuResult(event: SyntheticEvent<MouseEvent>, eventResult, eventType) {
        switch eventType {
            case 'menuOpened':
                this.subMenu = eventResult;
                break;
            default:
                this._notify('sendResult', [eventResult], {bubbling: true});
                this._closeSubMenu();
                break;
        }
    }

    protected _closeSubMenu(): void {
        if (this._children.Sticky) {
            this._children.Sticky.close();
            this._subDropdownItem = null;
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

    protected _mouseOutHandler(event: SyntheticEvent<MouseEvent>) {
        this._listModel.setHoveredItem(null);
        clearTimeout(this._handleCurrentItemTimeout);
    }

    protected _mouseMove(event: SyntheticEvent<MouseEvent>) {
        if (this._isMouseInOpenedItemArea && this._subDropdownItem) {
            this.startHandleItemTimeout();
        }
    }

    private setSubMenuPosition(): object {
        this._subMenuPosition = this.subMenu.getBoundingClientRect();
        if (this._subMenuPosition.x < this._openSubMenuEvent.clientX) {
            this._subMenuPosition.x += this._subMenuPosition.width;
        }
    }

    private setItemParamsonHandle(item, target, nativeEvent): void {
        this._hoveredItem = item;
        this._hoveredTarget = target;
        this._enterEvent = nativeEvent;
    }

    private handleCurrentItem(item: TreeItem<Model>, target, nativeEvent): void {
        const needOpenDropDown = item.isNode() && !item.getContents().get('readOnly');
        const needCloseDropDown = this._subDropdownItem && this._subDropdownItem !== item;
        this.setItemParamsonHandle(item, target, nativeEvent);

        if (needCloseDropDown) {
            this.setSubMenuPosition();
        }
        this._isMouseInOpenedItemArea = needCloseDropDown ? this.isMouseInOpenedItemArea(nativeEvent) : false;

        if (!this._isMouseInOpenedItemArea) {
            this._listModel.setHoveredItem(item);
        }

        // Close the already opened sub menu. Installation of new data sets new size of the container.
        // If you change the size of the update, you will see the container twitch.
        if (needCloseDropDown && !needOpenDropDown && !this._isMouseInOpenedItemArea) {
            this._closeSubMenu();
        }

        if (needOpenDropDown && !this._isMouseInOpenedItemArea) {
            this._openSubMenuEvent = nativeEvent;
            this._subDropdownItem = item;
            this.openSubDropdown(target, item);
        }
    }

    private handleItemTimeoutCallback():void {
        this._isMouseInOpenedItemArea = false;
        if (this._hoveredItem !== this._subDropdownItem) {
            this._closeSubMenu();
        }
        this.handleCurrentItem(this._hoveredItem, this._hoveredTarget, this._enterEvent);
    }

    private startHandleItemTimeout(): void {
        clearTimeout(this._handleCurrentItemTimeout);
        this._handleCurrentItemTimeout = setTimeout(() => {
            this.handleItemTimeoutCallback();
        }, 100);
    }

    private isMouseInOpenedItemArea(curMouseEvent): boolean {
        const firstSegment = this.calculatePointRelativePosition(this._openSubMenuEvent.clientX, this._subMenuPosition.x,
            this._openSubMenuEvent.clientY, this._subMenuPosition.y, curMouseEvent.clientX, curMouseEvent.clientY);

        const secondSegment = this.calculatePointRelativePosition(this._subMenuPosition.x,
            this._subMenuPosition.x, this._subMenuPosition.y, this._subMenuPosition.y +
            this._subMenuPosition.height, curMouseEvent.clientX, curMouseEvent.clientY);

        const thirdSegment = this.calculatePointRelativePosition(this._subMenuPosition.x,
            this._openSubMenuEvent.clientX,this._subMenuPosition.y +
            this._subMenuPosition.height, this._openSubMenuEvent.clientY, curMouseEvent.clientX, curMouseEvent.clientY);

        return Math.sign(firstSegment) === Math.sign(secondSegment) && Math.sign(firstSegment) === Math.sign(thirdSegment);
    }

    private calculatePointRelativePosition(firstSegmentPointX, secondSegmentPointX, firstSegmentPointY, secondSegmentPointY, curPointX, curPointY): number {
        return (firstSegmentPointX - curPointX) * (secondSegmentPointY - firstSegmentPointY) -
            (secondSegmentPointX - firstSegmentPointX) * (firstSegmentPointY - curPointY);
    }

    protected _isEmptyItem(itemData) {
        return this._options.emptyText && itemData.getContents().getId() === this._options.emptyKey;
    }

    protected _openSelectorDialog(): void {
        const selectorOpener = this._options.selectorOpener;
        selectorOpener.open(this.getSelectorDialogOptions(this._options));
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
            if (listModel.getItemBySourceKey(key)) {
                items.push(listModel.getItemBySourceKey(key).getContents());
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

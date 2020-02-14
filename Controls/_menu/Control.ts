import rk = require('i18n!Controls');
import {Control, TemplateFunction} from 'UI/Base';
import {default as IMenuControl, IMenuOptions, TKeys} from 'Controls/_menu/interface/IMenuControl';
import {Controller as SourceController} from 'Controls/source';
import {RecordSet, List} from 'Types/collection';
import {ICrud, PrefetchProxy} from 'Types/source';
import * as Clone from 'Core/core-clone';
import * as Merge from 'Core/core-merge';
import {Collection, Tree, TreeItem, GroupItem, SelectionController} from 'Controls/display';
import Deferred = require('Core/Deferred');
import ViewTemplate = require('wml!Controls/_menu/Control/Control');
import {SyntheticEvent} from 'Vdom/Vdom';
import {Model} from 'Types/entity';
import {factory} from 'Types/chain';
import scheduleCallbackAfterRedraw from 'Controls/Utils/scheduleCallbackAfterRedraw';

/**
 * Контрол меню.
 * @control
 * @public
 * @mixes Controls/_interface/IHierarchy
 * @mixes Controls/_interface/IIconSize
 * @mixes Controls/_dropdown/interface/IDropdownSource
 * @mixes Controls/_interface/INavigation
 * @mixes Controls/_interface/IFilter
 * @mixes Controls/_dropdown/interface/IFooterTemplate
 * @category Popup
 */

class MenuControl extends Control<IMenuOptions> implements IMenuControl {
    protected _template: TemplateFunction = ViewTemplate;
    protected _listModel: Tree;
    protected _moreButtonVisible: boolean = false;
    protected _expandButtonVisible: boolean = false;
    protected _applyButtonVisible: boolean = false;
    private _sourceController: SourceController = null;
    private _subDropdownItem: TreeItem<Model>|null;
    private _selectionChanged: boolean = false;
    private _expandedItems: RecordSet;
    private _itemsCount: number;
    private _handleCurrentItemTimeout: number = null;
    private _isMouseInOpenedItemArea: boolean = false;
    private _expandedItemsFilter: Function;
    private _additionalFilter: Function;
    private _hoveredItemIndex: number|null = null;

    // @ts-ignore
    protected _beforeMount(options: IMenuOptions, context: object, receivedState: RecordSet): Deferred<RecordSet> {
        this._expandedItemsFilter = this.expandedItemsFilter.bind(this);
        this._additionalFilter = this.additionalFilter.bind(this, options);

        if (options.source) {
            return this.loadItems(options);
        }
    }

    protected _beforeUpdate(newOptions: IMenuOptions): void {
        const rootChanged = newOptions.root !== this._options.root;
        const sourceChanged = newOptions.source !== this._options.source;

        if (sourceChanged) {
            this._sourceController = null;
        }

        if (rootChanged || sourceChanged) {
            this.loadItems(newOptions);
        }
        if (this.isSelectedKeysChanged(newOptions.selectedKeys, this._options.selectedKeys)) {
            this.setSelectedItems(this._listModel, newOptions.selectedKeys);
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

    private _mouseOutHandler(event: SyntheticEvent<MouseEvent>): void {
        this._hoveredItemIndex = null;
        this._listModel.setHoveredItem(null);
        clearTimeout(this._handleCurrentItemTimeout);
    }

    private _mouseMove(event: SyntheticEvent<MouseEvent>): void {
        if (this._isMouseInOpenedItemArea && this._subDropdownItem) {
            this.startHandleItemTimeout();
        }
    }

    private _itemMouseEnter(event: SyntheticEvent<MouseEvent>, item: TreeItem<Model>, sourceEvent: SyntheticEvent<MouseEvent>): void {
        this.handleCurrentItem(item, sourceEvent.target, sourceEvent.nativeEvent);
    }

    protected _itemClick(event: SyntheticEvent<MouseEvent>, item: Model, nativeEvent: MouseEvent): void {
        if (item.get('readOnly')) {
            return;
        }
        const key = item.getKey();
        const treeItem = this._listModel.getItemBySourceKey(key);

        if (this._isPinIcon(nativeEvent.target)) {
            this._pinClick(event, item);
        } else {
            if (this._options.multiSelect && this._selectionChanged && !this._isEmptyItem(treeItem)) {
                SelectionController.selectItem(this._listModel, key, !treeItem.isSelected());
                this.updateApplyButton();

                this._notify('selectedKeysChanged', [this.getSelectedKeys()]);
            } else {
                this._notify('itemClick', [item]);
            }
        }
    }

    private _isPinIcon(target: EventTarget): boolean {
        return target?.closest('.controls-Menu__iconPin');
    }

    private _pinClick(event: SyntheticEvent<MouseEvent>, item: Model): void {
        this._notify('pinClick', [item]);
    }

    protected _checkBoxClick(event: SyntheticEvent<MouseEvent>): void {
        this._selectionChanged = true;
    }

    protected _applySelection(): void {
        this._notify('applyClick', [this.getSelectedItems()]);
    }

    protected _toggleExpanded(event: SyntheticEvent<MouseEvent>, value: boolean): void {
        if (value) {
            this._listModel.removeFilter(this._additionalFilter);
        } else {
            this._listModel.addFilter(this._additionalFilter);
        }
        // TODO after deleting additionalProperty option
        // if (value) {
        //     if (this._expandedItems) {
        //         this._listModel.removeFilter(this._expandedItemsFilter);
        //     } else {
        //         this._itemsCount = this._listModel.getCount();
        //         this.loadExpandedItems(this._options);
        //     }
        // } else {
        //     this._listModel.addFilter(this._expandedItemsFilter);
        // }
    }

    protected _isEmptyItem(itemData) {
        return this._options.emptyText && itemData.getContents().getId() === this._options.emptyKey;
    }

    protected _openSelectorDialog(): void {
        const selectedItems = new List({
            items: this.getSelectedItems()
        });

        this._options.selectorOpener.open(this.getSelectorDialogOptions(this._options, selectedItems));
        this._notify('moreButtonClick', [selectedItems]);
    }

    protected _subMenuResult(event: SyntheticEvent<MouseEvent>, eventName: string, eventResult: Model|Node) {
        if (eventName === 'menuOpened') {
            this.subMenu = eventResult;
        } else {
            this._notify(eventName, [eventResult]);
            this._closeSubMenu();
        }
    }

    protected _closeSubMenu(): void {
        if (this._children.Sticky) {
            this._children.Sticky.close();
            this._subDropdownItem = null;
        }
    }

    private setItemParamsOnHandle(item, target, nativeEvent): void {
        this._hoveredItem = item;
        this._hoveredTarget = target;
        this._enterEvent = nativeEvent;
    }

    private setSubMenuPosition(): void {
        this._subMenuPosition = this.subMenu.getBoundingClientRect();
        if (this._subMenuPosition.x < this._openSubMenuEvent.clientX) {
            this._subMenuPosition.x += this._subMenuPosition.width;
        }
    }

    private handleCurrentItem(item: TreeItem<Model>, target, nativeEvent): void {
        this._hoveredItemIndex = this._listModel.getIndex(item);
        const needOpenDropDown = item.isNode() && !item.getContents().get('readOnly');
        const needCloseDropDown = this.subMenu && this._subDropdownItem && this._subDropdownItem !== item;
        this.setItemParamsOnHandle(item, target, nativeEvent);

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

    private handleItemTimeoutCallback(): void {
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
        }, 200);
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

    private getSelectorDialogOptions(options: IMenuOptions, selectedItems: object[]): object {
        const self = this;
        const selectorTemplate = options.selectorTemplate;
        const selectorDialogResult = options.selectorDialogResult;
        const selectorOpener = options.selectorOpener;

        let templateConfig = {
            selectedItems,
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

    private getSelectedItems(): object[] {
        return factory(this._listModel.getSelectedItems()).map((item) => item.getContents()).reverse().value();
    }

    private getSelectedItemsByKeys(listModel: Tree, selectedKeys: TKeys): Model[] {
        let items = [];
        factory(selectedKeys).each((key) => {
            if (listModel.getItemBySourceKey(key)) {
                items.push(listModel.getItemBySourceKey(key).getContents());
            }
        });
        return items;
    }

    private expandedItemsFilter(item: TreeItem<Model>, index: number): boolean {
        return index <= this._itemsCount;
    }

    private isSelectedKeysChanged(newKeys: TKeys, oldKeys: TKeys): boolean {
        const diffKeys = factory(newKeys).filter((key) => !oldKeys.includes(key)).value();
        return newKeys.length !== oldKeys.length || !!diffKeys.length;
    }

    private updateApplyButton(): void {
        let self = this;
        const isApplyButtonVisible = this._applyButtonVisible;
        const newSelectedKeys = factory(this._listModel.getSelectedItems()).map(item => {
            return item.getContents().get(self._options.keyProperty);
        }).value();
        this._applyButtonVisible = this.isSelectedKeysChanged(newSelectedKeys, this._options.selectedKeys);

        if (this._applyButtonVisible !== isApplyButtonVisible) {
            scheduleCallbackAfterRedraw(this, () => {
                self._notify('controlResize', [], {bubbling: true});
            });
        }
    }

    private createViewModel(items: RecordSet, options: IMenuOptions): void {
        this._listModel = this.getCollection(items, options);
        this.setSelectedItems(this._listModel, options.selectedKeys);
    }

    private getCollection(items: RecordSet, options: IMenuOptions): Tree {
        let listModel = new Tree({
            collection: items,
            keyProperty: options.keyProperty,
            nodeProperty: options.nodeProperty,
            parentProperty: options.parentProperty,
            root: options.root,
            filter: this.displayFilter.bind(this, options)
        });
        if (this._hoveredItemIndex !== null) {
            listModel.setHoveredItem(listModel.at(this._hoveredItemIndex));
        }
        if (options.groupProperty) {
            listModel.setGroup(this.groupMethod.bind(this));
        } else if (options.groupingKeyCallback) {
            listModel.setGroup(options.groupingKeyCallback);
        }
        if (options.additionalProperty) {
            listModel.addFilter(this._additionalFilter);
        }
        return listModel;
    }

    private isHistoryItem(item: Model): boolean {
        return !!(item.get('pinned') || item.get('recent') || item.get('frequent'));
    }

    private additionalFilter(options: IMenuOptions, item: Model, index: number, treeItem: TreeItem<Model>): boolean {
        return (!item.get || !item.get(options.additionalProperty) || this.isHistoryItem(item));
    }

    private displayFilter(options: IMenuOptions, item: Model, index: number, treeItem: TreeItem<Model>): boolean {
        let isVisible = true;
        if (item.get && options.parentProperty) {
            isVisible = item.get(options.parentProperty) === options.root;
        }
        return isVisible;
    }

    private groupMethod(item: Model): string {
        return item.get(this._options.groupProperty);
    }

    private setSelectedItems(listModel: Tree, keys: TKeys): void {
        listModel.setSelectedItems(this.getSelectedItemsByKeys(listModel, keys), true);
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
        let filter = Clone(options.filter) || {};
        filter[options.parentProperty] = options.root;
        return this.getSourceController(options).load(filter).addCallback((items) => {
            this.createViewModel(items, options);
            this._moreButtonVisible = options.selectorTemplate && this.getSourceController(options).hasMoreData('down');
            this._expandButtonVisible = this.isExpandButtonVisible(items, options.additionalProperty, options.root);
            return items;
        });
    }

    private isExpandButtonVisible(items: RecordSet, additionalProperty: string, root: string): boolean {
        let self = this;
        let hasAdditional = false;

        if (additionalProperty && root === null) {
            items.each((item) => {
                if (!hasAdditional) {
                    hasAdditional = item.get(additionalProperty) && !self.isHistoryItem(item);
                }
            });
        }
        return hasAdditional;
    }

    private openSubDropdown(target: EventTarget, item: TreeItem<Model>): void {
        // _openSubDropdown is called by debounce and a function call can occur when the control is destroyed,
        // just check _children to make sure, that the control isnt destroyed
        if (item && this._children.Sticky && this._subDropdownItem) {
            let popupOptions = this.getPopupOptions(target, item);
            this._notify('beforeSubMenuOpen', [popupOptions]);
            this._children.Sticky.open(popupOptions, this);
        }
    }

    private getPopupOptions(target: EventTarget, item: TreeItem<Model>): object {
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
        templateOptions.showHeader = false;
        templateOptions.headerTemplate = null;
        templateOptions.additionalProperty = null;

        templateOptions.source = this.getSourceSubMenu(templateOptions.root);
        return templateOptions;
    }

    private getSourceSubMenu(root) {
        let source = this._options.source;
        const collection = this._listModel.getCollection();
        if (collection.getIndexByValue(this._options.parentProperty, root) !== -1) {
            source = new PrefetchProxy({
                target: this._options.source,
                data: {
                    query: collection
                }
            });
        }
        return source;
    }

    static _theme: string[] = ['Controls/menu', 'Controls/dropdownPopup'];

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

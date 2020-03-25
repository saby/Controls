import rk = require('i18n!Controls');
import {Control, TemplateFunction} from 'UI/Base';
import {default as IMenuControl, IMenuControlOptions, TKeys} from 'Controls/_menu/interface/IMenuControl';
import {Controller as SourceController} from 'Controls/source';
import {RecordSet, List} from 'Types/collection';
import {ICrud, PrefetchProxy} from 'Types/source';
import * as Clone from 'Core/core-clone';
import * as Merge from 'Core/core-merge';
import {Collection, Tree, Search, TreeItem, SelectionController, ItemActionsController} from 'Controls/display';
import {debounce} from 'Types/function';
import Deferred = require('Core/Deferred');
import ViewTemplate = require('wml!Controls/_menu/Control/Control');
import * as groupTemplate from 'wml!Controls/_menu/Render/groupTemplate';
import {SyntheticEvent} from 'Vdom/Vdom';
import {Model} from 'Types/entity';
import {factory} from 'Types/chain';
import {isEqual} from 'Types/object';
import scheduleCallbackAfterRedraw from 'Controls/Utils/scheduleCallbackAfterRedraw';
import * as ControlsConstants from 'Controls/Constants';
import {_scrollContext as ScrollData} from 'Controls/scroll';

/**
 * Контрол меню.
 * @class Controls/menu:Control
 * @public
 * @mixes Controls/_interface/IHierarchy
 * @mixes Controls/_interface/IIconSize
 * @mixes Controls/_dropdown/interface/IDropdownSource
 * @mixes Controls/_interface/INavigation
 * @mixes Controls/_interface/IFilter
 * @implements Controls/_menu/IMenuControl
 * @demo Controls-demo/Menu/Control/Source/Index
 * @control
 * @category Popup
 * @author Герасимов А.М.
 */

const SUB_DROPDOWN_OPEN_DELAY = 100;

class MenuControl extends Control<IMenuControlOptions> implements IMenuControl {
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

    protected _beforeMount(options: IMenuControlOptions, context: object, receivedState: RecordSet): Deferred<RecordSet> {
        this._expandedItemsFilter = this.expandedItemsFilter.bind(this);
        this._additionalFilter = this.additionalFilter.bind(this, options);
        this._openSubDropdown = debounce(this.openSubDropdown.bind(this), SUB_DROPDOWN_OPEN_DELAY);

        if (options.source) {
            return this.loadItems(options);
        }
    }

    protected _beforeUpdate(newOptions: IMenuControlOptions): void {
        const rootChanged = newOptions.root !== this._options.root;
        const sourceChanged = newOptions.source !== this._options.source;
        const filterChanged = !isEqual(newOptions.filter, this._options.filter);

        if (sourceChanged) {
            this._sourceController = null;
        }

        if (rootChanged || sourceChanged || filterChanged) {
            this.loadItems(newOptions);
        }
        if (this.isSelectedKeysChanged(newOptions.selectedKeys, this._options.selectedKeys)) {
            this.setSelectedItems(this._listModel, newOptions.selectedKeys);
        }
    }

    protected _afterRender(oldOptions: IMenuControlOptions): void {
        const rootChanged = oldOptions.root !== this._options.root;
        const sourceChanged = oldOptions.source !== this._options.source;
        const filterChanged = !isEqual(oldOptions.filter, this._options.filter);

        if (rootChanged || sourceChanged || filterChanged) {
            this._notify('controlResize', [], {bubbling: true});
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

    protected _mouseEnterHandler(): void {
        this._assignItemActions(this._options);
    }

    protected _touchStartHandler(): void {
        this._assignItemActions(this._options);
    }

    private _mouseOutHandler(event: SyntheticEvent<MouseEvent>): void {
        clearTimeout(this._handleCurrentItemTimeout);
    }

    protected _mouseMove(event: SyntheticEvent<MouseEvent>): void {
        if (this._isMouseInOpenedItemArea && this._subDropdownItem) {
            this.startHandleItemTimeout();
        }
    }

    protected _itemMouseEnter(event: SyntheticEvent<MouseEvent>, item: TreeItem<Model>, sourceEvent: SyntheticEvent<MouseEvent>): void {
        this.handleCurrentItem(item, sourceEvent.target, sourceEvent.nativeEvent);
    }

    protected _itemSwipe(e: SyntheticEvent<null>, item: TreeItem<Model>, swipeEvent: SyntheticEvent<TouchEvent>, swipeContainerHeight: number): void {
        if (swipeEvent.nativeEvent.direction === 'left') {
            ItemActionsController.activateSwipe(
                this._listModel,
                item.getContents().getKey(),
                swipeContainerHeight
            );
        } else {
            ItemActionsController.deactivateSwipe(this._listModel);
        }
    }

    protected _itemActionClick(event: SyntheticEvent<MouseEvent>, item: TreeItem<Model>, action: object, clickEvent): void {
        ItemActionsController.processActionClick(
            this._listModel,
            item.getContents().getKey(),
            action,
            clickEvent,
            false
        );
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
                this._changeSelection(key, treeItem);
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

    protected _changeIndicatorOverlay(event: SyntheticEvent<MouseEvent>, config: object): void {
        config.overlay = 'none';
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
            if (eventName === 'pinClick') {
                this._closeSubMenu();
            }
        }
    }

    protected _footerMouseEnter(): void {
        this._closeSubMenu();
    }

    private _closeSubMenu(needOpenDropDown = false): void {
        if (this._children.Sticky) {
            this._children.Sticky.close();
        }
        if (!needOpenDropDown) {
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
        const needOpenDropDown = item.getContents().get(this._options.nodeProperty) && !item.getContents().get('readOnly');
        const needCloseDropDown = this.subMenu && this._subDropdownItem && this._subDropdownItem !== item;
        this.setItemParamsOnHandle(item, target, nativeEvent);

        if (needCloseDropDown) {
            this.setSubMenuPosition();
            this._isMouseInOpenedItemArea = this.isMouseInOpenedItemArea(nativeEvent);
        } else {
            this._isMouseInOpenedItemArea = false;
        }

        // Close the already opened sub menu. Installation of new data sets new size of the container.
        // If you change the size of the update, you will see the container twitch.
        if (needCloseDropDown && !this._isMouseInOpenedItemArea) {
            this._closeSubMenu(needOpenDropDown);
        }
        if (needOpenDropDown && !this._isMouseInOpenedItemArea) {
            this._openSubMenuEvent = nativeEvent;
            this._subDropdownItem = item;
            this._openSubDropdown(target, item);
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

        return this._getSign(firstSegment) === this._getSign(secondSegment) && this._getSign(firstSegment) === this._getSign(thirdSegment);
    }

    // FIXME https://online.sbis.ru/opendoc.html?guid=923f813d-7ed2-4e7d-94d8-65b0b733a4bd
    private _getSign(x: number) {
        x = +x;
        if (x === 0 || isNaN(x)) {
            return x;
        }
        return x > 0 ? 1 : -1;
    }

    private calculatePointRelativePosition(firstSegmentPointX, secondSegmentPointX, firstSegmentPointY, secondSegmentPointY, curPointX, curPointY): number {
        return (firstSegmentPointX - curPointX) * (secondSegmentPointY - firstSegmentPointY) -
            (secondSegmentPointX - firstSegmentPointX) * (firstSegmentPointY - curPointY);
    }

    private getSelectorDialogOptions(options: IMenuControlOptions, selectedItems: object[]): object {
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
            isCompoundTemplate: options.isCompoundTemplate
        }, selectorTemplate.popupOptions || {});
    }

    private _changeSelection(key: string|number|null, treeItem): void {
        SelectionController.selectItem(this._listModel, key, !treeItem.isSelected());

        const isEmptySelected = this._options.emptyText && !this._listModel.getSelectedItems().length;
        SelectionController.selectItem(this._listModel, this._options.emptyKey, !!isEmptySelected );
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

    private createViewModel(items: RecordSet, options: IMenuControlOptions): void {
        this._listModel = this.getCollection(items, options);
        this.setSelectedItems(this._listModel, options.selectedKeys);
    }

    private getCollection(items: RecordSet, options: IMenuControlOptions): Collection {
        const collectionConfig = {
            collection: items,
            keyProperty: options.keyProperty,
            unique: true
        };
        let listModel;
        if (options.searchParam && options.searchValue) {
            listModel = new Search({...collectionConfig,
                nodeProperty: options.nodeProperty,
                parentProperty: options.parentProperty,
                root: options.root
            });
        } else {
            // В дереве не работает группировка, ждем решения по ошибке https://online.sbis.ru/opendoc.html?guid=f4a3be79-5ec5-45d2-b742-2d585c5c069d
            listModel = new Collection({...collectionConfig,
                filter: this.displayFilter.bind(this, options)
            });
        }

        if (options.itemActions) {
            this._calculateActionsConfig(listModel, options);
        }

        if (options.groupProperty) {
            listModel.setGroup(this.groupMethod.bind(this, options));
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

    private additionalFilter(options: IMenuControlOptions, item: Model): boolean {
        return (!item.get || !item.get(options.additionalProperty) || this.isHistoryItem(item));
    }

    private displayFilter(options: IMenuControlOptions, item: Model): boolean {
        let isVisible = true;
        if (item.get && options.parentProperty && options.nodeProperty) {
            let parent = item.get(options.parentProperty);
            if (parent === undefined) {
                parent = null;
            }
            isVisible = parent === options.root;
        }
        return isVisible;
    }

    private groupMethod(options: IMenuControlOptions, item: Model): string {
        return item.get(options.groupProperty) || ControlsConstants.view.hiddenGroup;
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

    private loadExpandedItems(options: IMenuControlOptions): void {
        let self = this;
        let loadConfig = Clone(options);
        delete loadConfig.navigation;
        self._sourceController = null;
        this.loadItems(loadConfig).addCallback((items) => {
            self._expandedItems = items;
            self.createViewModel(items, options);
        });
    }

    private loadItems(options: IMenuControlOptions): Deferred<RecordSet> {
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
        // openSubDropdown is called by debounce and a function call can occur when the control is destroyed,
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
        templateOptions.footerContentTemplate = this._options.nodeFooterTemplate;
        templateOptions.footerItemData = {
            key: templateOptions.root,
            item
        };
        templateOptions.closeButtonVisibility = false;
        templateOptions.showHeader = false;
        templateOptions.headerTemplate = null;
        templateOptions.headerContentTemplate = null;
        templateOptions.additionalProperty = null;
        templateOptions.searchParam = null;
        templateOptions.itemPadding = null;

        templateOptions.source = this.getSourceSubMenu(templateOptions.root);

        templateOptions.iWantBeWS3 = false; // FIXME https://online.sbis.ru/opendoc.html?guid=9bd2e071-8306-4808-93a7-0e59829a317a
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

    private _calculateActionsConfig(listModel: Tree<Model>, options: IMenuControlOptions): void {
        ItemActionsController.calculateActionsTemplateConfig(
            listModel,
            {
                itemActionsPosition: 'inside',
                actionCaptionPosition: 'none',
                actionAlignment: 'horizontal',
                style: 'default',
                itemActionsClass: 'controls-Menu__itemActions_position_rightCenter_theme-' + options.theme
            }
        );
    }

    private _assignItemActions(options): void {
        const itemActions = options.itemActions;

        if (!itemActions) {
            return;
        }
        const actionsGetter = () => itemActions;

        ItemActionsController.assignActions(
            this._listModel,
            actionsGetter
        );
    }

    private _getChildContext(): object {
        return {
            ScrollData: new ScrollData({pagingVisible: false})
        };
    }

    static _theme: string[] = ['Controls/menu', 'Controls/dropdownPopup'];

    static getDefaultOptions(): object {
        return {
            selectedKeys: [],
            root: null,
            emptyKey: null,
            moreButtonCaption: rk('Еще') + '...',
            groupTemplate
        };
    }
}

export default MenuControl;

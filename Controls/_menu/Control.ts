import rk = require('i18n!Controls');
import {Control, TemplateFunction} from 'UI/Base';
import {TSelectedKeys, IOptions} from 'Controls/interface';
import {default as IMenuControl, IMenuControlOptions} from 'Controls/_menu/interface/IMenuControl';
import {RecordSet, List} from 'Types/collection';
import {ICrudPlus, PrefetchProxy, QueryWhere} from 'Types/source';
import {Collection, CollectionItem, Search} from 'Controls/display';
import ViewTemplate = require('wml!Controls/_menu/Control/Control');
import * as groupTemplate from 'wml!Controls/_menu/Render/groupTemplate';
import {SyntheticEvent} from 'Vdom/Vdom';
import {Model} from 'Types/entity';
import {factory} from 'Types/chain';
import {isEqual, merge} from 'Types/object';
import * as cInstance from 'Core/core-instance';
import * as ModulesLoader from 'WasabyLoader/ModulesLoader';
import {groupConstants as constView} from 'Controls/list';
import { TouchDetect } from 'Env/Touch';
import {IItemAction, Controller as ItemActionsController} from 'Controls/itemActions';
import {error as dataSourceError, NewSourceController as SourceController} from 'Controls/dataSource';
import {ISelectorTemplate} from 'Controls/_interface/ISelectorDialog';
import {StickyOpener, StackOpener} from 'Controls/popup';
import {TKey} from 'Controls/_menu/interface/IMenuControl';
import { MarkerController, Visibility as MarkerVisibility } from 'Controls/marker';
import {FlatSelectionStrategy, SelectionController, IFlatSelectionStrategyOptions} from 'Controls/multiselection';
import {create as DiCreate} from 'Types/di';
import 'css!Controls/menu';

interface IMenuPosition {
    left: number;
    top: number;
    height: number;
}

interface ISourcePropertyConfig {
    moduleName: string;
    options: object;
}

const SUB_DROPDOWN_DELAY = 400;

const MAX_HISTORY_VISIBLE_ITEMS_COUNT = 10;
/**
 * Контрол меню.
 * @public
 * @mixes Controls/interface:IIconSize
 * @mixes Controls/interface:IIconStyle
 * @mixes Controls/interface:ISource
 * @mixes Controls/interface:INavigation
 * @mixes Controls/interface:IFilterChanged
 * @mixes Controls/menu:IMenuControl
 * @mixes Controls/menu:IMenuBase
 * @mixes Controls/dropdown:IGrouped
 * @mixes Controls/interface/IPromisedSelectable
 * @mixes Controls/interface:ISelectorDialog
 * @mixes Controls/interface:IBackgroundStyle
 *
 * @demo Controls-demo/Menu/Control/Source/Index
 *
 * @author Герасимов А.М.
 */
export default class MenuControl extends Control<IMenuControlOptions> implements IMenuControl {
    readonly '[Controls/_menu/interface/IMenuControl]': boolean = true;
    protected _template: TemplateFunction = ViewTemplate;

    protected _children: {
        Sticky: StickyOpener
    };

    protected _listModel: Collection<Model>;
    protected _moreButtonVisible: boolean = false;
    protected _expandButtonVisible: boolean = false;
    protected _expander: boolean;
    private _sourceController: SourceController = null;
    private _subDropdownItem: CollectionItem<Model>|null;
    private _selectionChanged: boolean = false;
    private _expandedItems: RecordSet;
    private _itemsCount: number;
    private _visibleIds: TKey[] = [];
    private _openingTimer: number = null;
    private _closingTimer: number = null;
    private _isMouseInOpenedItemArea: boolean = false;
    private _expandedItemsFilter: Function;
    private _additionalFilter: Function;
    private _limitHistoryFilter: Function;
    private _notifyResizeAfterRender: Boolean = false;
    private _itemActionsController: ItemActionsController;

    private _subMenu: HTMLElement;
    private _hoveredItem: CollectionItem<Model>;
    private _hoveredTarget: EventTarget;
    private _enterEvent: MouseEvent;
    private _subMenuPosition: IMenuPosition;
    private _openSubMenuEvent: MouseEvent;
    private _errorController: dataSourceError.Controller;
    private _errorConfig: dataSourceError.ViewConfig|void;
    private _stack: StackOpener;
    private _markerController: MarkerController;
    private _selectionController: SelectionController = null;

    protected _beforeMount(options: IMenuControlOptions,
                           context?: object,
                           receivedState?: void): Promise<RecordSet> {
        this._expandedItemsFilter = this._expandedItemsFilterCheck.bind(this);
        this._additionalFilter = MenuControl._additionalFilterCheck.bind(this, options);
        this._limitHistoryFilter = this._limitHistoryCheck.bind(this);

        this._stack = new StackOpener();

        if (options.sourceController) {
            const error = options.sourceController.getLoadError();
            if (error) {
                this._processError(error);
            } else {
                return this._setItems(options.sourceController.getItems(), options);
            }
        } else if (options.source) {
            return this._loadItems(options).then((items) => {
                this._setItems(items, options);
            }, (error) => {
                return error;
            });
        }
    }

    protected _beforeUpdate(newOptions: IMenuControlOptions): void {
        const rootChanged = newOptions.root !== this._options.root;
        const sourceChanged = newOptions.source !== this._options.source;
        const filterChanged = !isEqual(newOptions.filter, this._options.filter);
        const searchValueChanged = newOptions.searchValue !== this._options.searchValue;
        const selectedKeysChanged = this._isSelectedKeysChanged(newOptions.selectedKeys, this._options.selectedKeys);
        let result;

        if (newOptions.sourceController && newOptions.searchParam &&
            newOptions.searchValue && searchValueChanged) {
            this._notifyResizeAfterRender = true;
            this._closeSubMenu();
            this._updateItems(newOptions.sourceController.getItems(), newOptions);
        } else if (rootChanged || sourceChanged || filterChanged) {
            if (sourceChanged) {
                this._sourceController = null;
            }
            this._closeSubMenu();
            result = this._loadItems(newOptions).then((res) => {
                this._updateItems(res, newOptions);
                this._notifyResizeAfterRender = true;
                return res;
            });
        } else if (selectedKeysChanged) {
            if (this._selectionController) {
                this._updateSelectionController(newOptions);
                this._notify('selectedItemsChanged', [this._getSelectedItems()]);
            }

            if (this._markerController) {
                this._updateMakerController(newOptions);
            }
        }

        return result;
    }

    protected _afterRender(oldOptions: IMenuControlOptions): void {
        if (this._notifyResizeAfterRender) {
            this._notify('controlResize', [], {bubbling: true});
        }
    }

    protected _beforeUnmount(): void {
        if (this._options.searchValue) {
            // items dropdown/_Controller'a обновляются по ссылке.
            // если был поиск, то зануляем items, чтобы при след. открытии меню отображались все записи.
            this._listModel.getCollection().clear();
        }
        if (this._sourceController) {
            this._sourceController.cancelLoading();
            this._sourceController = null;
        }

        if (this._listModel) {
            this._listModel.destroy();
            this._listModel = null;
        }
        if (this._errorController) {
            this._errorController.destroy();
            this._errorController = null;
        }
    }

    public closeSubMenu(): void {
        this._closeSubMenu();
    }

    protected _mouseEnterHandler(): void {
        this._updateItemActions(this._listModel, this._options);
    }

    protected _touchStartHandler(): void {
        this._updateItemActions(this._listModel, this._options);
    }

    protected _mouseLeaveHandler(event: SyntheticEvent<MouseEvent>): void {
        this._clearOpeningTimout();
        this._startClosingTimout();
    }

    protected _mouseMove(event: SyntheticEvent<MouseEvent>): void {
        if (this._isMouseInOpenedItemArea && this._subDropdownItem) {
            this._startOpeningTimeout();
        }
    }

    protected _itemMouseEnter(event: SyntheticEvent<MouseEvent>,
                              item: CollectionItem<Model>,
                              sourceEvent: SyntheticEvent<MouseEvent>): void {
        if (item.getContents() instanceof Model && !this._isTouch()) {
            this._clearClosingTimout();
            this._setItemParamsOnHandle(item, sourceEvent.target, sourceEvent.nativeEvent);

            this._checkOpenedMenu(sourceEvent.nativeEvent, item);
            this._startOpeningTimeout();
        }
    }

    protected _itemSwipe(e: SyntheticEvent<null>,
                         item: CollectionItem<Model>,
                         swipeEvent: SyntheticEvent<TouchEvent>,
                         swipeContainerWidth: number,
                         swipeContainerHeight: number): void {
        const isSwipeLeft = swipeEvent.nativeEvent.direction === 'left';
        const itemKey = item.getContents().getKey();
        if (this._options.itemActions) {
            if (isSwipeLeft) {
                this._itemActionsController.activateSwipe(itemKey, swipeContainerWidth, swipeContainerHeight);
            } else {
                this._itemActionsController.deactivateSwipe();
            }
        } else {
            this._updateSwipeItem(item, isSwipeLeft);
        }
    }

    /**
     * Проверяет, обработать клик или открыть подменю. Подменю может быть многоуровневым
     * @param event
     * @param item
     * @param action
     * @param clickEvent
     * @private
     */
    protected _itemActionMouseDown(event: SyntheticEvent<MouseEvent>,
                                   item: CollectionItem<Model>,
                                   action: IItemAction,
                                   clickEvent: SyntheticEvent<MouseEvent>): void {
        const contents: Model = item.getContents();
        if (action && !action['parent@'] && action.handler) {
            action.handler(contents);
        } else {
            this._openItemActionMenu(item, action, clickEvent);
        }
    }

    protected _itemClick(event: SyntheticEvent<MouseEvent>,
                         item: Model,
                         sourceEvent: SyntheticEvent<MouseEvent>): void {
        if (item.get('readOnly')) {
            return;
        }
        const key: string | number = item.getKey();
        const treeItem: CollectionItem<Model> = this._listModel.getItemBySourceKey(key);

        if (MenuControl._isPinIcon(sourceEvent.target)) {
            this._pinClick(event, item);
        } else if (MenuControl._isRightTemplateClick(sourceEvent.target)) {
            this._rightTemplateClick(event, item);
        } else {
            if (this._options.multiSelect && this._selectionChanged &&
                !this._isEmptyItem(treeItem.getContents()) && !MenuControl._isFixedItem(item)) {
                this._changeSelection(key);

                this._notify('selectedKeysChanged', [this._getSelectedKeys()]);
                this._notify('selectedItemsChanged', [this._getSelectedItems()]);
            } else {
                if (this._isTouch() && item.get(this._options.nodeProperty) && this._subDropdownItem !== treeItem) {
                    this._handleCurrentItem(treeItem, sourceEvent.currentTarget, sourceEvent.nativeEvent);
                } else {
                    this._notify('itemClick', [item, sourceEvent]);
                }
            }
        }
    }

    private _getSelectionController(): SelectionController {
        if (!this._selectionController) {
            this._selectionController = this._createSelectionController(this._options);
        }
        return this._selectionController;
    }

    private _createSelectionController(options: IMenuControlOptions): SelectionController {
        return new SelectionController({
            model: this._listModel,
            selectedKeys: this._getKeysForSelectionController(options),
            excludedKeys: [],
            searchValue: options.searchValue,
            strategy: new FlatSelectionStrategy(this._getSelectionStrategyOptions())
        });
    }

    private _updateSelectionController(newOptions: IMenuControlOptions): void {
        this._getSelectionController().updateOptions({
            model: this._listModel,
            selectedKeys: this._getKeysForSelectionController(newOptions),
            excludedKeys: [],
            searchValue: newOptions.searchValue,
            strategyOptions: this._getSelectionStrategyOptions()
        });
    }

    private _updateMakerController(newOptions: IMenuControlOptions): void {
        this._getMarkerController(newOptions).updateOptions(this._getMarkerControllerConfig(newOptions));
        const markedKey = this._getMarkedKey(this._getSelectedKeys(), newOptions.emptyKey,
            newOptions.multiSelect);
        this._markerController.setMarkedKey(markedKey);
    }

    private _getSelectionStrategyOptions(): IFlatSelectionStrategyOptions {
        return {
            model: this._listModel
        };
    }

    private _getKeysForSelectionController(options: IMenuControlOptions): TSelectedKeys {
        const selectedKeys = [];
        options.selectedKeys.forEach((key) => {
            const item = this._listModel.getItemBySourceKey(key)?.getContents();
            if (key !== options.emptyKey && item && !MenuControl._isFixedItem(item)) {
                selectedKeys.push(MenuControl._isHistoryItem(item) ? String(key) : key);
            }
        });
        return selectedKeys;
    }

    private _openItemActionMenu(item: CollectionItem<Model>,
                                action: IItemAction,
                                clickEvent: SyntheticEvent<MouseEvent>): void {
        const menuConfig = this._itemActionsController.prepareActionsMenuConfig(item, clickEvent,
            action, this, false);
        if (menuConfig) {
            if (!this._itemActionSticky) {
                this._itemActionSticky = new StickyOpener();
            }
            menuConfig.eventHandlers = {
                onResult: this._onItemActionsMenuResult.bind(this)
            };
            this._itemActionSticky.open(menuConfig);
            this._itemActionsController.setActiveItem(item);
        }
    }

    private _onItemActionsMenuResult(eventName: string, actionModel: Model,
                                     clickEvent: SyntheticEvent<MouseEvent>): void {
        if (eventName === 'itemClick') {
            const action = actionModel && actionModel.getRawData();
            if (action && !action['parent@']) {
                const item = this._itemActionsController.getActiveItem();
                this._itemActionMouseDown(null, item, action, clickEvent);
                this._itemActionSticky.close();
            }
        }
    }

    private _pinClick(event: SyntheticEvent<MouseEvent>, item: Model): void {
        this._notify('pinClick', [item]);
    }

    private _rightTemplateClick(event: SyntheticEvent<MouseEvent>, item: Model): void {
        this._notify('rightTemplateClick', [item]);
    }

    private _isTouch(): boolean {
        return TouchDetect.getInstance().isTouch();
    }

    protected _checkBoxClick(event: SyntheticEvent<MouseEvent>): void {
        this._selectionChanged = true;
    }

    protected _toggleExpanded(): void {
        this._closeSubMenu();
        this._expander = !this._expander;
        let toggleFilter = this._additionalFilter;
        if (!this._options.additionalProperty) {
            toggleFilter = this._limitHistoryFilter;
        }
        if (this._expander) {
            this._listModel.removeFilter(toggleFilter);
        } else {
            this._listModel.addFilter(toggleFilter);
        }
        // TODO after deleting additionalProperty option
        // if (value) {
        //     if (this._expandedItems) {
        //         this._listModel.removeFilter(this._expandedItemsFilter);
        //     } else {
        //         this._itemsCount = this._listModel.getCount();
        //         this._loadExpandedItems(this._options);
        //     }
        // } else {
        //     this._listModel.addFilter(this._expandedItemsFilter);
        // }
    }

    protected _changeIndicatorOverlay(event: SyntheticEvent<MouseEvent>, config: { overlay: string }): void {
        config.overlay = 'none';
    }

    protected _isEmptyItem(item: Model): boolean {
        return this._options.emptyText && item.getKey() === this._options.emptyKey;
    }

    protected _openSelectorDialog(): void {
        let selectedItems: List<Model>;
        // TODO: убрать по задаче: https://online.sbis.ru/opendoc.html?guid=637922a8-7d23-4d18-a7f2-b58c7cfb3cb0
        if (this._options.selectorOpenCallback) {
            selectedItems = this._options.selectorOpenCallback();
        } else {
            selectedItems = new List<Model>({
                items: this._getSelectedItems().filter((item: Model): boolean => {
                    return !this._isEmptyItem(item);
                }) as Model[]
            });
        }
        this._stack.open(this._getSelectorDialogOptions(this._stack, this._options, selectedItems));
        this._notify('moreButtonClick', [selectedItems]);
    }

    protected _subMenuResult(event: SyntheticEvent<MouseEvent>,
                             eventName: string,
                             eventResult: Model|HTMLElement,
                             nativeEvent: SyntheticEvent<MouseEvent>): void {
        if (eventName === 'menuOpened') {
            this._subMenu = eventResult as HTMLElement;
        } else if (eventName === 'subMenuMouseenter') {
            this._clearClosingTimout();
        } else {
            const notifyResult = this._notify(eventName, [eventResult, nativeEvent]);
            if (eventName === 'pinClick' || eventName === 'itemClick' && notifyResult !== false) {
                this._closeSubMenu();
            }
        }
    }

    protected _footerMouseEnter(event: SyntheticEvent<MouseEvent>): void {
        this._checkOpenedMenu(event.nativeEvent);
    }

    protected _separatorMouseEnter(event: SyntheticEvent<MouseEvent>, sourceEvent: SyntheticEvent<MouseEvent>): void {
        this._checkOpenedMenu(sourceEvent.nativeEvent);
    }

    private _checkOpenedMenu(nativeEvent: MouseEvent, newItem?: CollectionItem<Model>): void {
        const needCloseSubMenu: boolean = this._subMenu && this._subDropdownItem &&
            (!newItem || newItem !== this._subDropdownItem);
        if (!this._isNeedKeepMenuOpen(needCloseSubMenu, nativeEvent) && needCloseSubMenu) {
            this._closeSubMenu();
        }
    }

    private _isNeedKeepMenuOpen(
        needCloseDropDown: boolean,
        nativeEvent: MouseEvent): boolean {
        if (needCloseDropDown) {
            this._setSubMenuPosition();
            this._isMouseInOpenedItemArea = this._isMouseInOpenedItemAreaCheck(nativeEvent);
        } else {
            this._isMouseInOpenedItemArea = false;
        }
        return this._isMouseInOpenedItemArea;
    }

    private _closeSubMenu(needOpenDropDown: boolean = false): void {
        if (this._children.Sticky) {
            this._children.Sticky.close();
        }
        if (!needOpenDropDown) {
            this._subDropdownItem = null;
        }
    }

    private _setItemParamsOnHandle(
        item: CollectionItem<Model>,
        target: EventTarget,
        nativeEvent: MouseEvent): void {
        this._hoveredItem = item;
        this._hoveredTarget = target;
        this._enterEvent = nativeEvent;
    }

    private _setSubMenuPosition(): void {
        const clientRect: DOMRect = this._subMenu.getBoundingClientRect();
        this._subMenuPosition = {
            left: clientRect.left,
            top: clientRect.top,
            height: clientRect.height
        };

        if (this._subMenuPosition.left < this._openSubMenuEvent.clientX) {
            this._subMenuPosition.left += clientRect.width;
        }
    }

    private _handleCurrentItem(
        item: CollectionItem<Model>,
        target: EventTarget,
        nativeEvent: MouseEvent): void {
        const needOpenDropDown: boolean = item.getContents().get(this._options.nodeProperty) &&
            !item.getContents().get('readOnly');
        const needCloseDropDown: boolean = this._subMenu && this._subDropdownItem && this._subDropdownItem !== item;

        const needKeepMenuOpen: boolean = this._isNeedKeepMenuOpen(needCloseDropDown, nativeEvent);

        // Close the already opened sub menu. Installation of new data sets new size of the container.
        // If you change the size of the update, you will see the container twitch.
        this._checkOpenedMenu(nativeEvent, item);

        if (needOpenDropDown && !needKeepMenuOpen) {
            this._openSubMenuEvent = nativeEvent;
            this._subDropdownItem = item;
            this._openSubDropdown(target, item);
        }
    }

    private _clearClosingTimout(): void {
        clearTimeout(this._closingTimer);
    }

    private _startClosingTimout(): void {
        // window для соотвествия типов
        this._closingTimer = setTimeout(this._closeSubMenu.bind(this), SUB_DROPDOWN_DELAY);
    }

    private _clearOpeningTimout(): void {
        clearTimeout(this._openingTimer);
    }

    private _handleItemTimeoutCallback(): void {
        this._isMouseInOpenedItemArea = false;
        if (this._hoveredItem !== this._subDropdownItem) {
            this._closeSubMenu();
        }
        this._handleCurrentItem(this._hoveredItem, this._hoveredTarget, this._enterEvent);
    }

    private _startOpeningTimeout(): void {
        this._clearOpeningTimout();
        this._openingTimer = setTimeout((): void => {
            this._handleItemTimeoutCallback();
        }, SUB_DROPDOWN_DELAY);
    }

    private _isMouseInOpenedItemAreaCheck(curMouseEvent: MouseEvent): boolean {
        const firstSegment: number = MenuControl._calculatePointRelativePosition(this._openSubMenuEvent.clientX,
            this._subMenuPosition.left, this._openSubMenuEvent.clientY,
            this._subMenuPosition.top, curMouseEvent.clientX, curMouseEvent.clientY);

        const secondSegment: number = MenuControl._calculatePointRelativePosition(this._subMenuPosition.left,
            this._subMenuPosition.left, this._subMenuPosition.top, this._subMenuPosition.top +
            this._subMenuPosition.height, curMouseEvent.clientX, curMouseEvent.clientY);

        const thirdSegment: number = MenuControl._calculatePointRelativePosition(this._subMenuPosition.left,
            this._openSubMenuEvent.clientX, this._subMenuPosition.top +
            this._subMenuPosition.height, this._openSubMenuEvent.clientY, curMouseEvent.clientX, curMouseEvent.clientY);

        return Math.sign(firstSegment) === Math.sign(secondSegment) &&
            Math.sign(firstSegment) === Math.sign(thirdSegment);
    }

    private _getSelectorDialogOptions(opener: StackOpener,
                                      options: IMenuControlOptions,
                                      selectedItems: List<Model>): object {
        const selectorTemplate: ISelectorTemplate = options.selectorTemplate;
        const selectorDialogResult: Function = options.selectorDialogResult;

        const templateConfig: object = {
            selectedItems,
            handlers: {
                onSelectComplete: (event, result) => {
                    selectorDialogResult(event, result);
                    opener.close();
                }
            },
            ...selectorTemplate.templateOptions
        };

        return {
            // Т.к само меню закроется после открытия стекового окна,
            // в опенер нужно положить контрол, который останется на странице.
            opener: this._options.selectorOpener,
            closeOnOutsideClick: true,
            templateOptions: templateConfig,
            template: selectorTemplate.templateName,
            isCompoundTemplate: options.isCompoundTemplate,
            eventHandlers: {
                onResult: (result, event) => {
                    selectorDialogResult(event, result);
                    opener.close();
                }
            },
            ...selectorTemplate.popupOptions
        };
    }

    private _changeSelection(key: string|number|null): void {
        const selectionController = this._getSelectionController();
        const markerController = this._getMarkerController(this._options);
        const markedKey = markerController.getMarkedKey();
        const selectedItem = this._listModel.getItemBySourceKey(markedKey);
        if (selectedItem &&
            (MenuControl._isFixedItem(selectedItem.getContents()) || this._isEmptyItem(selectedItem.getContents()))) {
            markerController.setMarkedKey(undefined);
        }
        const selection = selectionController.toggleItem(key);
        selectionController.setSelection(selection);
        this._listModel.nextVersion();

        const isEmptySelected = this._options.emptyText && !selection.selected.length;
        if (isEmptySelected) {
            this._getMarkerController(this._options).setMarkedKey(this._options.emptyKey);
        }
    }

    private _getMarkerControllerConfig(options: IMenuControlOptions, markedKey?: string|number): IOptions {
        return {
            markerVisibility: options.markerVisibility,
            markedKey,
            model: this._listModel
        };
    }

    private _setItems(items: RecordSet, options: IMenuControlOptions): void {
        this._setStateByItems(items, options);
        this._createControllers(options);
    }

    private _updateItems(items: RecordSet, options: IMenuControlOptions): void {
        this._setStateByItems(items, options);
        if (this._selectionController) {
            this._updateSelectionController(options);
        }
        if (this._markerController) {
            this._updateMakerController(options);
        }
    }

    private _setStateByItems(items: RecordSet, options: IMenuControlOptions): void {
        this._setButtonVisibleState(items, options);
        this._createViewModel(items, options);
    }

    private _createControllers(options: IMenuControlOptions): void {
        if (options.markerVisibility !== MarkerVisibility.Hidden) {
            this._markerController = this._getMarkerController(options);
            const markedKey = this._markerController.calculateMarkedKeyForVisible();
            this._markerController.setMarkedKey(markedKey);
        }
        if (options.selectedKeys && options.selectedKeys.length && options.multiSelect) {
            this._selectionController = this._createSelectionController(options);
            this._selectionController.setSelection(this._selectionController.getSelection());
        }
    }

    private _setButtonVisibleState(items: RecordSet, options: IMenuControlOptions): void {
        this._moreButtonVisible = options.selectorTemplate &&
            this._getSourceController(options).hasMoreData('down');
        this._expandButtonVisible = this._isExpandButtonVisible(items, options);
    }

    private _getMarkerController(options: IMenuControlOptions): MarkerController {
        if (!this._markerController) {
            const markedKey = this._getMarkedKey(options.selectedKeys, options.emptyKey, options.multiSelect);
            this._markerController = new MarkerController(this._getMarkerControllerConfig(options, markedKey));
        }
        return this._markerController;
    }

    private _getMarkedKey(selectedKeys: TSelectedKeys,
                          emptyKey?: string|number,
                          multiSelect?: boolean): string|number|undefined {
        let markedKey;
        if (multiSelect) {
            if (!selectedKeys.length || selectedKeys.includes(emptyKey)) {
                markedKey = emptyKey;
            } else {
                const item = this._listModel.getItemBySourceKey(selectedKeys[0]);
                if (item && MenuControl._isFixedItem(item.getContents())) {
                    markedKey = selectedKeys[0];
                }
            }
        } else {
            const selectedKey = selectedKeys[0];
            markedKey = selectedKey === undefined && emptyKey !== undefined ? emptyKey : selectedKey;
        }
        return markedKey;
    }

    private _getSelectedKeys(): TSelectedKeys {
        let selectedKeys = [];

        if (this._options.multiSelect) {
            selectedKeys = this._getSelectionController().getSelection().selected;
        } else {
            selectedKeys = this._options.selectedKeys;
        }

        return selectedKeys;
    }

    private _getSelectedItems(): object[] {
        const selectedItems = this._getSelectionController().getSelectedItems().map((item) => {
            return item.getContents();
        }).reverse();
        if (!selectedItems.length && this._options.emptyText) {
            selectedItems.push(this._listModel.getItemBySourceKey(this._options.emptyKey).getContents());
        }
        return selectedItems;
    }

    private _expandedItemsFilterCheck(item: CollectionItem<Model>, index: number): boolean {
        return index <= this._itemsCount;
    }

    private _limitHistoryCheck(item: Model): boolean {
        let isVisible: boolean = true;
        if (item && item.getKey) {
            isVisible = this._visibleIds.includes(item.getKey());
        }
        return isVisible;
    }

    private _isSelectedKeysChanged(newKeys: TSelectedKeys, oldKeys: TSelectedKeys): boolean {
        const diffKeys: TSelectedKeys = factory(newKeys).filter((key) => !oldKeys.includes(key)).value();
        return newKeys.length !== oldKeys.length || !!diffKeys.length;
    }

    private _updateSwipeItem(newSwipedItem: CollectionItem<Model>, isSwipeLeft: boolean): void {
        const oldSwipedItem: CollectionItem<Model> = this._listModel.find(
            (item: CollectionItem<Model>): boolean => item.isSwiped() || item.isAnimatedForSelection());
        if (isSwipeLeft && oldSwipedItem) {
            oldSwipedItem.setSwiped(false);
        }

        newSwipedItem.setSwiped(isSwipeLeft);
        this._listModel.nextVersion();
    }

    private _createViewModel(items: RecordSet, options: IMenuControlOptions): void {
        this._listModel = this._getCollection(items, options);
    }

    private _getCollection(items: RecordSet<Model>, options: IMenuControlOptions): Collection<Model> {
        if (!options.searchValue && options.emptyText && !items.getRecordById(options.emptyKey)) {
            this._addEmptyItem(items, options);
        }
        const collectionConfig: object = {
            collection: items,
            keyProperty: options.keyProperty,
            unique: true,
            topPadding: 'null',
            bottomPadding: 'menu-default',
            leftPadding: this._getLeftPadding(options),
            rightPadding: this._getRightPadding(options, items)
        };
        let listModel: Search<Model> | Collection<Model>;

        if (options.searchParam && options.searchValue) {
            listModel = new Search({...collectionConfig,
                nodeProperty: options.nodeProperty,
                parentProperty: options.parentProperty,
                root: options.root
            });
        } else {
            // В дереве не работает группировка,
            // ждем решения по ошибке https://online.sbis.ru/opendoc.html?guid=f4a3be79-5ec5-45d2-b742-2d585c5c069d
            listModel = new Collection({...collectionConfig,
                filter: MenuControl._displayFilter.bind(this, options)
            });

            if (options.groupProperty) {
                listModel.setGroup(this._groupMethod.bind(this, options));
            } else if (options.groupingKeyCallback) {
                listModel.setGroup(options.groupingKeyCallback);
            }
        }

        if (options.itemActions) {
            this._updateItemActions(listModel, options);
        }

        if (options.additionalProperty) {
            listModel.addFilter(this._additionalFilter);
        } else if (options.allowPin && !options.subMenuLevel && !this._expander) {
            listModel.addFilter(this._limitHistoryFilter);
        }
        return listModel;
    }

    private _addEmptyItem(items: RecordSet, options: IMenuControlOptions): void {
        const emptyItem = this._getItemModel(items, options.keyProperty);

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
        items.prepend([emptyItem]);
    }

    private _getItemModel(items: RecordSet, keyProperty: string): Model {
        const model = items.getModel();
        const modelConfig = {
            keyProperty,
            format: items.getFormat(),
            adapter: items.getAdapter()
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

    private _getLeftPadding(options: IMenuControlOptions): string {
        let leftSpacing = 'm';
        if (options.itemPadding.left) {
            leftSpacing = options.itemPadding.left;
        }
        return leftSpacing;
    }

    private _getRightPadding(options: IMenuControlOptions, items: RecordSet): string {
        let rightSpacing = 'm';
        if (!options.itemPadding.right) {
            if (options.multiSelect) {
                rightSpacing = 'menu-multiSelect';
            } else {
                factory(items).each((item) => {
                    if (MenuControl._isItemCurrentRoot(item, options) && item.get(options.nodeProperty)) {
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

    private _groupMethod(options: IMenuControlOptions, item: Model): string {
        const groupId: string = item.get(options.groupProperty);
        const isHistoryItem: boolean = MenuControl._isHistoryItem(item) && !this._options.subMenuLevel;
        return groupId !== undefined && groupId !== null && !isHistoryItem ? groupId : constView.hiddenGroup;
    }

    private _getSourceController(
        {source, navigation, keyProperty, filter,
            sourceController, root, parentProperty}: IMenuControlOptions): SourceController {
        if (!this._sourceController) {
            this._sourceController = sourceController || new SourceController({
                source,
                filter,
                navigation,
                keyProperty,
                root,
                parentProperty
            });
        }
        return this._sourceController;
    }

    private _loadExpandedItems(options: IMenuControlOptions): void {
        const loadConfig: IMenuControlOptions = merge({}, options);

        delete loadConfig.navigation;
        this._sourceController = null;

        this._loadItems(loadConfig).addCallback((items: RecordSet): void => {
            this._expandedItems = items;
            this._createViewModel(items, options);
        });
    }

    private _loadItems(options: IMenuControlOptions): Promise<RecordSet> {
        const sourceController = this._getSourceController(options);

        return sourceController.load().then(
            (items: RecordSet): RecordSet => {
                if (options.dataLoadCallback) {
                    options.dataLoadCallback(items);
                }

                return items;
            },
            (error: Error): Promise<void | dataSourceError.ViewConfig> => {
                return Promise.reject(this._processError(error));
            }
        );
    }

    private _isExpandButtonVisible(items: RecordSet,
                                   options: IMenuControlOptions): boolean {
        let hasAdditional: boolean = false;

        if (options.additionalProperty && options.root === null) {
            items.each((item: Model): void => {
                if (!hasAdditional) {
                    hasAdditional = item.get(options.additionalProperty) && !MenuControl._isHistoryItem(item);
                }
            });
        } else if (options.allowPin && !options.subMenuLevel) {
            this._visibleIds = [];
            const fixedIds = [];
            factory(items).each((item) => {
                if (MenuControl._isItemCurrentRoot(item, options))  {
                    this._visibleIds.push(item.getKey());
                    if (item.get('doNotSaveToHistory')) {
                        fixedIds.push(item.getKey());
                    }
                }
            });
            hasAdditional = this._visibleIds.length > MAX_HISTORY_VISIBLE_ITEMS_COUNT + 1;
            if (hasAdditional) {
                this._visibleIds.splice(MAX_HISTORY_VISIBLE_ITEMS_COUNT);
            }

            fixedIds.forEach((fixedId) => {
                if (!this._visibleIds.includes(fixedId)) {
                    this._visibleIds.push(fixedId);
                }
            });
        }
        return hasAdditional;
    }

    private _openSubDropdown(target: EventTarget, item: CollectionItem<Model>): void {
        // openSubDropdown is called by debounce and a function call can occur when the control is destroyed,
        // just check _children to make sure, that the control isn't destroyed
        if (item && this._children.Sticky && this._subDropdownItem) {
            this._getPopupOptions(target, item).then((popupOptions) => {
                this._notify('beforeSubMenuOpen', [popupOptions, this._options.subMenuDirection]);
                this._children.Sticky.open(popupOptions);
            });
        }
    }

    private _getMenuPopupOffsetClass(item: CollectionItem<Model>, options: object): string {
        let classes = '';

        if (options.subMenuDirection === 'bottom') {
            const paddingSize = this._listModel.getLeftPadding().toLowerCase();
            const hasIcon = item.contents.get('icon');
            const iconSize = item.contents.get('iconSize') || options.iconSize || 'm';

            classes = ` controls_dropdownPopup_theme-${options.theme}`;

            if (!!hasIcon) {
                classes += ` controls-Menu__alignSubMenuDown_iconSize_${iconSize}_offset_${paddingSize}`;
            } else {
                classes += ` controls-Menu__alignSubMenuDown_offset_${paddingSize}`
            }
        }

        return classes;
    }

    private _getPopupOptions(target: EventTarget, item: CollectionItem<Model>): Promise<object> {
        const subMenuDirection = this._options.subMenuDirection;
        const direction = {
            vertical: 'bottom',
            horizontal: 'right'
        };
        const targetPoint = {
            vertical: subMenuDirection === 'bottom' ? 'bottom' : 'top',
            horizontal: subMenuDirection === 'bottom' ? 'left' : 'right'
        };
        const className = 'controls-Menu__subMenu controls-Menu__subMenu_margin' +
            ` controls_popupTemplate_theme-${this._options.theme}` +
            this._getMenuPopupOffsetClass(item, this._options);

        return this._getTemplateOptions(item).then((templateOptions) => {
            return {
                templateOptions,
                target,
                autofocus: false,
                direction,
                targetPoint,
                calmTimer: this._options.calmTimer,
                backgroundStyle: this._options.backgroundStyle,
                trigger: this._options.trigger,
                className
            };
        });
    }

    private _getTemplateOptions(item: CollectionItem<Model>): Promise<object> {
        const root: TKey = item.getContents().get(this._options.keyProperty);
        const isLoadedChildItems = this._isLoadedChildItems(root);
        const sourcePropertyConfig = item.getContents().get(this._options.sourceProperty);
        const dataLoadCallback = !isLoadedChildItems &&
        !sourcePropertyConfig ? this._subMenuDataLoadCallback.bind(this) : null;
        return this._getSourceSubMenu(isLoadedChildItems, sourcePropertyConfig).then((source) => {
            const subMenuOptions: object = {
                root: sourcePropertyConfig ? null : root,
                bodyContentTemplate: 'Controls/_menu/Control',
                dataLoadCallback,
                footerContentTemplate: this._options.nodeFooterTemplate,
                footerItemData: {
                    key: root,
                    item: item.getContents()
                },
                closeButtonVisibility: false,
                emptyText: null,
                showClose: false,
                showHeader: false,
                headerTemplate: null,
                headerContentTemplate: null,
                additionalProperty: null,
                searchParam: null,
                itemPadding: null,
                source,
                items: isLoadedChildItems ? this._options.items : null,
                subMenuLevel: this._options.subMenuLevel ? this._options.subMenuLevel + 1 : 1,
                iWantBeWS3: false // FIXME https://online.sbis.ru/opendoc.html?guid=9bd2e071-8306-4808-93a7-0e59829a317a
            };

            return {...this._options, ...subMenuOptions};
        });
    }

    private _getSourceSubMenu(isLoadedChildItems: boolean,
                              sourcePropertyConfig: ISourcePropertyConfig | ICrudPlus): Promise<ICrudPlus> {
        let result = Promise.resolve(this._options.source);

        if (isLoadedChildItems) {
            result = Promise.resolve(new PrefetchProxy({
                target: this._options.source,
                data: {
                    query: this._listModel.getCollection()
                }
            }));
        } else if (sourcePropertyConfig) {
            result = this._createMenuSource(sourcePropertyConfig);
        }
        return result;
    }

    private _createMenuSource(source: ISourcePropertyConfig | ICrudPlus): Promise<ICrudPlus> {
        if (cInstance.instanceOfModule(source, 'Types/_source/ICrud') ||
            cInstance.instanceOfMixin(source, 'Types/_source/ICrud')) {
            return Promise.resolve(source as ICrudPlus);
        } else {
            const sourceConfig = source as ISourcePropertyConfig;
            return ModulesLoader.loadAsync(sourceConfig.moduleName).then((module) => {
                return new module(sourceConfig.options);
            });
        }
    }

    private _isLoadedChildItems(root: TKey): boolean {
        let isLoaded = false;
        const collection =  this._listModel.getCollection() as unknown as RecordSet<Model>;

        if (collection.getIndexByValue(this._options.parentProperty, root) !== -1) {
            isLoaded = true;
        }
        return isLoaded;
    }

    private _subMenuDataLoadCallback(items: RecordSet): void {
        const origCollectionFormat = this._listModel.getCollection().getFormat();
        items.getFormat().forEach((field) => {
            const name = field.getName();
            if (origCollectionFormat.getFieldIndex(name) === -1) {
                this._listModel.getCollection().addField({
                    name,
                    type: 'string'
                });
            }
        });
        this._listModel.getCollection().append(items);
    }

    private _updateItemActions(listModel: Collection<Model>, options: IMenuControlOptions): void {
        const itemActions: IItemAction[] = options.itemActions;

        if (!itemActions) {
            return;
        }

        if (!this._itemActionsController) {
            this._itemActionsController = new ItemActionsController();
        }
        const editingConfig = listModel.getEditingConfig();
        this._itemActionsController.update({
            collection: listModel,
            itemActions,
            itemActionsPosition: 'inside',
            visibilityCallback: options.itemActionVisibilityCallback,
            style: 'default',
            theme: options.theme,
            actionAlignment: 'horizontal',
            actionCaptionPosition: 'none',
            itemActionsClass: `controls-Menu__itemActions_position_rightCenter`,
            iconSize: editingConfig ? 's' : 'm'
        });
    }

    private _processError(error: Error): Promise<dataSourceError.ViewConfig|void> {
        if (this._options.dataLoadErrback) {
            this._options.dataLoadErrback(error);
        }
        return this._getErrorController().process({
            error,
            theme: this._options.theme,
            mode: dataSourceError.Mode.include
        }).then((errorConfig: dataSourceError.ViewConfig|void): dataSourceError.ViewConfig|void => {
            if (errorConfig) {
                errorConfig.options.size = 'medium';
            }
            this._showError(errorConfig);
            return errorConfig;
        });
    }

    private _showError(error: dataSourceError.ViewConfig|void): void {
        this._errorConfig = error;
    }

    private _getErrorController(): dataSourceError.Controller {
        if (!this._errorController) {
            this._errorController = new dataSourceError.Controller({});
        }
        return this._errorController;
    }

    private static _isPinIcon(target: EventTarget): boolean {
        return !!((target as HTMLElement)?.closest('.controls-Menu__iconPin'));
    }

    private static _isRightTemplateClick(target: EventTarget): boolean {
        return !!((target as HTMLElement)?.closest('.controls-Menu__row__rightTemplate_wrapper'));
    }

    private static _calculatePointRelativePosition(firstSegmentPointX: number,
                                                   secondSegmentPointX: number,
                                                   firstSegmentPointY: number,
                                                   secondSegmentPointY: number,
                                                   curPointX: number,
                                                   curPointY: number): number {
        return (firstSegmentPointX - curPointX) * (secondSegmentPointY - firstSegmentPointY) -
            (secondSegmentPointX - firstSegmentPointX) * (firstSegmentPointY - curPointY);
    }

    private static _isHistoryItem(item: Model): boolean {
        return !!(item.get('pinned') || item.get('recent') || item.get('frequent'));
    }

    private static _isFixedItem(item: Model): boolean {
        return !item.has('HistoryId') && item.get('pinned');
    }

    private static _additionalFilterCheck(options: IMenuControlOptions, item: Model): boolean {
        return (!item.get || !item.get(options.additionalProperty) || MenuControl._isHistoryItem(item));
    }

    private static _displayFilter(options: IMenuControlOptions, item: Model): boolean {
        let isVisible: boolean = true;
        const isStringType = typeof options.root === 'string';
        if (item && item.get && options.parentProperty && options.nodeProperty) {
            let parent: TKey = item.get(options.parentProperty);
            if (parent === undefined) {
                parent = null;
            }
            // Для исторических меню keyProperty всегда заменяется на строковый.
            // Если изначально был указан целочисленный ключ,
            // то в поле родителя будет лежать также целочисленное значение, а в root будет лежать строка.
            if (isStringType) {
                parent = String(parent);
            }
            isVisible = parent === options.root;
        }
        return isVisible;
    }

    private static _isItemCurrentRoot(item: Model, options: IMenuControlOptions): boolean {
        const parent = item.get(options.parentProperty);
        return parent === options.root || !parent && options.root === null;
    }

    static defaultProps: object = {
        selectedKeys: [],
        root: null,
        historyRoot: null,
        emptyKey: null,
        moreButtonCaption: rk('Еще') + '...',
        groupTemplate,
        itemPadding: {},
        markerVisibility: 'onactivated',
        hoverBackgroundStyle: 'default',
        subMenuDirection: 'right'
    };
}
/**
 * @name Controls/_menu/MenuControl#multiSelect
 * @cfg {Boolean} Видимость чекбоксов в меню.
 * @default false
 * @demo Controls-demo/Menu/Control/MultiSelect/Index
 * @example
 * Множественный выбор установлен.
 * <pre class="brush: html; highlight: [7]">
 * <!-- WML -->
 * <Controls.menu:Control
 *    selectedKeys="{{_selectedKeys}}"
 *    keyProperty="id"
 *    displayProperty="title"
 *    source="{{_source}}"
 *    multiSelect="{{true}}" />
 * </pre>
 * <pre class="brush: js;">
 * // JavaScript
 * this._source = new Memory({
 *    keyProperty: 'id',
 *    data: [
 *       {id: 1, title: 'Yaroslavl'},
 *       {id: 2, title: 'Moscow'},
 *       {id: 3, title: 'St-Petersburg'}
 *    ]
 * });
 * this._selectedKeys = [1, 3];
 * </pre>
 */

/**
 * @name Controls/_menu/MenuControl#root
 * @cfg {Number|String|null} Идентификатор корневого узла.
 * @demo Controls-demo/Menu/Control/Root/Index
 */

/**
 * @event Происходит при выборе элемента.
 * @name Controls/_menu/MenuControl#itemClick
 * @param {UICommon/Events:SyntheticEvent} eventObject Дескриптор события.
 * @param {Types/entity:Model} item Выбранный элемент.
 * @remark Из обработчика события можно возвращать результат обработки. Если результат будет равен false, подменю не закроется.
 * По умолчанию, когда выбран пункт с иерархией, подменю закрывается.
 * @example
 * В следующем примере показано, как незакрывать подменю, если кликнули на пункт с иерархией.
 * <pre class="brush: html; highlight: [6]">
 * <!-- WML -->
 * <Controls.menu:Control
 *    displayProperty="title"
 *    keyProperty="key"
 *    source="{{_source}}"
 *    on:itemClick="_itemClickHandler()" />
 * </pre>
 * <pre  class="brush: js;">
 * // TypeScript
 * protected _itemClickHandler(e, item): boolean {
 *     if (item.get(nodeProperty)) {
 *         return false;
 *     }
 * }
 * </pre>
 */

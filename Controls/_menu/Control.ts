import rk = require('i18n!Controls');
import {Control, TemplateFunction} from 'UI/Base';
import {TSelectedKeys, IOptions} from 'Controls/interface';
import {default as IMenuControl, IMenuControlOptions} from 'Controls/_menu/interface/IMenuControl';
import {Controller as SourceController} from 'Controls/source';
import {RecordSet, List} from 'Types/collection';
import {ICrudPlus, PrefetchProxy, QueryWhere} from 'Types/source';
import * as Clone from 'Core/core-clone';
import * as Merge from 'Core/core-merge';
import {Collection, Search, CollectionItem} from 'Controls/display';
import Deferred = require('Core/Deferred');
import ViewTemplate = require('wml!Controls/_menu/Control/Control');
import * as groupTemplate from 'wml!Controls/_menu/Render/groupTemplate';
import {SyntheticEvent} from 'Vdom/Vdom';
import {Model} from 'Types/entity';
import {factory} from 'Types/chain';
import {isEqual} from 'Types/object';
import {groupConstants as constView} from 'Controls/list';
import {_scrollContext as ScrollData} from 'Controls/scroll';
import {TouchContextField} from 'Controls/context';
import {IItemAction, Controller as ItemActionsController} from 'Controls/itemActions';
import {error as dataSourceError} from 'Controls/dataSource';
import {ISelectorTemplate} from 'Controls/_interface/ISelectorDialog';
import {StickyOpener, StackOpener} from 'Controls/popup';
import {TKey} from 'Controls/_menu/interface/IMenuControl';
import { MarkerController, Visibility as MarkerVisibility } from 'Controls/marker';
import {FlatSelectionStrategy, SelectionController, IFlatSelectionStrategyOptions} from 'Controls/multiselection';

interface IMenuPosition {
    left: number;
    top: number;
    height: number;
}

const SUB_DROPDOWN_DELAY = 400;

const MAX_HISTORY_VISIBLE_ITEMS_COUNT = 10;
/**
 * Контрол меню.
 * @class Controls/menu:Control
 * @public
 * @mixes Controls/_interface/IIconSize
 * @mixes Controls/_dropdown/interface/IDropdownSource
 * @mixes Controls/_interface/INavigation
 * @mixes Controls/_interface/IFilterChanged
 * @mixes Controls/_menu/interface/IMenuControl
 * @mixes Controls/_menu/interface/IMenuBase
 * @mixes Controls/_dropdown/interface/IGrouped
 * @demo Controls-demo/Menu/Control/Source/Index
 *
 * @author Герасимов А.М.
 */
export default class MenuControl extends Control<IMenuControlOptions> implements IMenuControl {
    readonly '[Controls/_menu/interface/IMenuControl]': boolean = true;
    protected _template: TemplateFunction = ViewTemplate;

    _children: {
        Sticky: StickyOpener
    };

    protected _listModel: Collection<Model>;
    protected _moreButtonVisible: boolean = false;
    protected _expandButtonVisible: boolean = false;
    protected _expander: boolean;
    private _sourceController: typeof SourceController = null;
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
                           receivedState?: void): Deferred<RecordSet> {
        this._expandedItemsFilter = this._expandedItemsFilterCheck.bind(this);
        this._additionalFilter = MenuControl._additionalFilterCheck.bind(this, options);
        this._limitHistoryFilter = this._limitHistoryCheck.bind(this);

        this._stack = new StackOpener();

        if (options.sourceController) {
            return this._createViewModel(options.sourceController.getItems(), options);
        } else if (options.source) {
            return this._loadItems(options).then(() => {
                if (options.markerVisibility !== MarkerVisibility.Hidden) {
                    this._markerController = this._getMarkerController(options);
                    const markedKey = this._markerController.calculateMarkedKeyForVisible();
                    this._markerController.setMarkedKey(markedKey);
                }
                if (options.selectedKeys && options.selectedKeys.length && options.multiSelect) {
                    this._selectionController = this._createSelectionController(options);
                    this._selectionController.setSelection(this._selectionController.getSelection());
                }
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
        let result;

        if (newOptions.sourceController && newOptions.searchParam &&
            newOptions.searchValue && searchValueChanged) {
            this._notifyResizeAfterRender = true;
            this._closeSubMenu();
            this._createViewModel(newOptions.sourceController.getItems(), newOptions);
        } else if (rootChanged || sourceChanged || filterChanged) {
            if (sourceChanged) {
                this._sourceController = null;
            }
            this._closeSubMenu();
            result = this._loadItems(newOptions).then((res) => {
                this._notifyResizeAfterRender = true;
                return res;
            });
        }

        if (this._isSelectedKeysChanged(newOptions.selectedKeys, this._options.selectedKeys)) {
            this._updateSelectionController(newOptions);
            this._notify('selectedItemsChanged', [this._getSelectedItems()]);
        }

        if (this._markerController) {
            this._markerController.updateOptions(this._getMarkerControllerConfig(newOptions));
            const markedKey = this._getMarkedKey(this._getSelectedKeys(), newOptions.emptyKey, newOptions.multiSelect);
            this._markerController.setMarkedKey(markedKey);
        }

        return result;
    }

    protected _afterRender(oldOptions: IMenuControlOptions): void {
        if (this._notifyResizeAfterRender) {
            this._notify('controlResize', [], {bubbling: true});
        }
    }

    protected _beforeUnmount(): void {
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

    protected _mouseEnterHandler(): void {
        if (this._container.closest('.controls-Menu__subMenu')) {
            this._notify('subMenuMouseenter');
        }
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
                    this._getMarkerController(this._options).setMarkedKey(key);
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

    private _getSelectionStrategyOptions(): IFlatSelectionStrategyOptions {
        return {
            model: this._listModel
        };
    }

    private _getKeysForSelectionController(options: IMenuControlOptions): TSelectedKeys {
        return options.selectedKeys.map((key) => {
            const item = this._listModel.getItemBySourceKey(key)?.getContents();
            if (item) {
                return MenuControl._isHistoryItem(item) ? String(key) : key;
            }
        });
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
                this._itemActionClick(null, item, action, clickEvent);
                this._itemActionSticky.close();
            }
        }
    }

    private _pinClick(event: SyntheticEvent<MouseEvent>, item: Model): void {
        this._notify('pinClick', [item]);
    }

    private _isTouch(): boolean {
        return this._context?.isTouch?.isTouch;
    }

    protected _checkBoxClick(event: SyntheticEvent<MouseEvent>): void {
        this._selectionChanged = true;
    }

    protected _toggleExpanded(): void {
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
        this._closingTimer = window.setTimeout(this._closeSubMenu.bind(this), SUB_DROPDOWN_DELAY);
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
        this._openingTimer = window.setTimeout((): void => {
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
            }
        };
        Merge(templateConfig, selectorTemplate.templateOptions);

        return Merge({
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
            }
        }, selectorTemplate.popupOptions || {});
    }

    private _changeSelection(key: string|number|null): void {
        const selectionController = this._getSelectionController();
        const selectedItems = this._listModel.getSelectedItems();
        if (selectedItems.length === 1 && MenuControl._isFixedItem(selectedItems[0].getContents())) {
            selectionController.setSelection(selectionController.toggleItem(selectedItems[0].getContents().getKey()));
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

    private _getMarkerController(options: IMenuControlOptions): MarkerController {
        if (!this._markerController) {
            const markedKey = this._getMarkedKey(options.selectedKeys, options.emptyKey, options.multiSelect);
            this._markerController = new MarkerController(this._getMarkerControllerConfig(options, markedKey));
        }
        return this._markerController;
    }

    private _getMarkedKey(selectedKeys: TSelectedKeys, emptyKey?: string|number, multiSelect?: boolean): string|number|undefined {
        if (multiSelect && (!selectedKeys.length || selectedKeys.includes(emptyKey))) {
            return emptyKey;
        }
        if (!multiSelect) {
            const selectedKey = selectedKeys[0];
            return selectedKey === undefined && emptyKey !== undefined ? emptyKey : selectedKey;
        }
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
        return factory(this._listModel.getSelectedItems()).map(
            (item: CollectionItem<Model>): Model => item.getContents()
        ).reverse().value();
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
        const collectionConfig: object = {
            collection: items,
            keyProperty: options.keyProperty,
            unique: true
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
        } else if (options.allowPin && options.root === null && !this._expander) {
            listModel.addFilter(this._limitHistoryFilter);
        }
        return listModel;
    }

    private _groupMethod(options: IMenuControlOptions, item: Model): string {
        const groupId: string = item.get(options.groupProperty);
        const isHistoryItem: boolean = MenuControl._isHistoryItem(item) && this._options.root === null;
        return groupId !== undefined && !isHistoryItem ? groupId : constView.hiddenGroup;
    }

    private _getSourceController(
        {source, navigation, keyProperty}: IMenuControlOptions): typeof SourceController {
        if (!this._sourceController) {
            this._sourceController = new SourceController({
                source,
                navigation,
                keyProperty
            });
        }
        return this._sourceController;
    }

    private _loadExpandedItems(options: IMenuControlOptions): void {
        const loadConfig: IMenuControlOptions = Clone(options);

        delete loadConfig.navigation;
        this._sourceController = null;

        this._loadItems(loadConfig).addCallback((items: RecordSet): void => {
            this._expandedItems = items;
            this._createViewModel(items, options);
        });
    }

    private _loadItems(options: IMenuControlOptions): Deferred<RecordSet> {
        const filter: QueryWhere = Clone(options.filter) || {};
        filter[options.parentProperty] = options.root;

        return this._getSourceController(options).load(filter).then(
            (items: RecordSet): RecordSet => {
                if (options.dataLoadCallback) {
                    options.dataLoadCallback(items);
                }
                this._moreButtonVisible = options.selectorTemplate &&
                    this._getSourceController(options).hasMoreData('down');
                this._expandButtonVisible = this._isExpandButtonVisible(
                    items,
                    options);
                this._createViewModel(items, options);

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
        } else if (options.allowPin && options.root === null) {
            this._visibleIds = [];
            factory(items).each((item) => {
                const hasParent = item.get(options.parentProperty);
                if (!hasParent)  {
                    this._visibleIds.push(item.getKey());
                }
            });
            hasAdditional = this._visibleIds.length > MAX_HISTORY_VISIBLE_ITEMS_COUNT + 1;
            if (hasAdditional) {
                this._visibleIds.splice(MAX_HISTORY_VISIBLE_ITEMS_COUNT);
            }
        }
        return hasAdditional;
    }

    private _openSubDropdown(target: EventTarget, item: CollectionItem<Model>): void {
        // openSubDropdown is called by debounce and a function call can occur when the control is destroyed,
        // just check _children to make sure, that the control isn't destroyed
        if (item && this._children.Sticky && this._subDropdownItem) {
            const popupOptions: object = this._getPopupOptions(target, item);
            this._notify('beforeSubMenuOpen', [popupOptions]);
            this._children.Sticky.open(popupOptions).then();
        }
    }

    private _getPopupOptions(target: EventTarget, item: CollectionItem<Model>): object {
        return {
            templateOptions: this._getTemplateOptions(item),
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

    private _getTemplateOptions(item: CollectionItem<Model>): object {
        const root: TKey = item.getContents().get(this._options.keyProperty);
        const isLoadedChildItems = this._isLoadedChildItems(root);
        const subMenuOptions: object = {
            root,
            bodyContentTemplate: 'Controls/_menu/Control',
            dataLoadCallback: !isLoadedChildItems ? this._subMenuDataLoadCallback.bind(this) : null,
            footerContentTemplate: this._options.nodeFooterTemplate,
            footerItemData: {
                key: root,
                item
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
            source: this._getSourceSubMenu(isLoadedChildItems),
            iWantBeWS3: false // FIXME https://online.sbis.ru/opendoc.html?guid=9bd2e071-8306-4808-93a7-0e59829a317a
        };

        return {...this._options, ...subMenuOptions};
    }

    private _getSourceSubMenu(isLoadedChildItems: boolean): ICrudPlus {
        let source: ICrudPlus = this._options.source;

        if (isLoadedChildItems) {
            source = new PrefetchProxy({
                target: this._options.source,
                data: {
                    query: this._listModel.getCollection()
                }
            });
        }
        return source;
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
        if (this._listModel.getCollection().getFormat().getIndexByValue('name', this._options.parentProperty) === -1) {
            this._listModel.getCollection().addField({
                name: this._options.parentProperty,
                type: 'string'
            });
        }
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
            itemActionsClass: `controls-Menu__itemActions_position_rightCenter_theme-${options.theme}`,
            iconSize: editingConfig ? 's' : 'm'
        });
    }

    private _getChildContext(): object {
        return {
            ScrollData: new ScrollData({pagingVisible: false})
        };
    }

    private _processError(error: Error): Promise<dataSourceError.ViewConfig|void> {
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

    static _theme: string[] = ['Controls/menu'];

    private static _isPinIcon(target: EventTarget): boolean {
        return !!((target as HTMLElement)?.closest('.controls-Menu__iconPin'));
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

    static getDefaultOptions(): object {
        return {
            selectedKeys: [],
            root: null,
            emptyKey: null,
            moreButtonCaption: rk('Еще') + '...',
            groupTemplate,
            itemPadding: {},
            markerVisibility: 'onactivated'
        };
    }

    static contextTypes(): object {
        return {
            isTouch: TouchContextField
        };
    }
}
/**
 * @name Controls/_menu/Control#multiSelect
 * @cfg {Boolean} Определяет, установлен ли множественный выбор.
 * @default false
 * @demo Controls-demo/Menu/Control/MultiSelect/Index
 * @example
 * Множественный выбор установлен.
 * WML:
 * <pre>
 * <Controls.menu:Control
 *       selectedKeys="{{_selectedKeys}}"
 *       keyProperty="id"
 *       displayProperty="title"
 *       source="{{_source}}"
 *       multiSelect="{{true}}">
 * </Controls.menu:Control>
 * </pre>
 * JS:
 * <pre>
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
 * @name Controls/_menu/Control#selectedKeys
 * @cfg {Array.<Number|String>} Массив ключей выбранных элементов.
 * @demo Controls-demo/Menu/Control/SelectedKeys/Index
 */

/**
 * @name Controls/_menu/Control#root
 * @cfg {Number|String|null} Идентификатор корневого узла.
 * @demo Controls-demo/Menu/Control/Root/Index
 */

/**
 * @event Происходит при выборе элемента.
 * @name Controls/_menu/Control#itemClick
 * @param {Vdom/Vdom:SyntheticEvent} eventObject Дескриптор события.
 * @param {Types/entity:Model} item Выбранный элемент.
 * @remark Из обработчика события можно возвращать результат обработки. Если результат будет равен false, подменю не закроется.
 * По умолчанию, когда выбран пункт с иерархией, подменю закрывается.
 * @example
 * В следующем примере показано, как незакрывать подменю, если кликнули на пункт с иерархией.
 * <pre>
 *    <Controls.menu:Control
 *          displayProperty="title"
 *          keyProperty="key"
 *          source="{{_source}}"
 *          on:itemClick="_itemClickHandler()" />
 * </pre>
 * TS:
 * <pre>
 *    protected _itemClickHandler(e, item): boolean {
 *       if (item.get(nodeProperty)) {
 *          return false;
 *       }
 *    }
 * </pre>
 */
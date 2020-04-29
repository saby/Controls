import { IBaseCollection, TItemKey } from '../interface';
import { IItemActionsTemplateConfig, ISwipeConfig, IEditingConfig } from '../Collection';
import { SyntheticEvent } from 'Vdom/Vdom';
import { Model } from 'Types/entity';
import {Memory} from 'Types/source';
import rk = require('i18n!Controls');

// FIXME: https://online.sbis.ru/opendoc.html?guid=380045b2-1cd8-4868-8c3f-545cc5c1732f
const showType = {
    MENU: 0,
    MENU_TOOLBAR: 1,
    TOOLBAR: 2
};

// TODO Написать реальный тип для action'ов
type TItemAction = any;

type TActionsGetterFunction = (item) => TItemAction[];

export type TItemActionVisibilityCallback = (
    action: TItemAction,
    item: unknown
) => boolean;

export interface IItemActionsContainer {
    all: TItemAction[];
    showed: TItemAction[];
}

export interface IItemActionsTemplateOptions {
    style?: string;
    itemActionsPosition: string;
    actionAlignment?: string;
    actionCaptionPosition: 'right'|'bottom'|'none';
    itemActionsClass?: string;
    actionClickCallback?: Function;
}

export interface IItemActionsItem {
    getActions(): IItemActionsContainer;
    getContents(): Model;
    setActions(actions: IItemActionsContainer): void;
    setActive(active: boolean): void;
    isActive(): boolean;
    setSwiped(swiped: boolean): void;
    isSwiped(): boolean;
}

export interface IItemActionsCollection extends IBaseCollection<IItemActionsItem> {
    destroyed: boolean;
    setEventRaising?(raising: boolean, analyze?: boolean): void;
    areActionsAssigned(): boolean;
    setActionsAssigned(assigned: boolean): void;
    setActionsMenuConfig(config: any): void;
    getActionsMenuConfig(): any;
    getContextMenuConfig(): any;
    setActionsTemplateConfig(config: IItemActionsTemplateConfig): void;
    getActionsTemplateConfig(): IItemActionsTemplateConfig;
    setSwipeConfig(config: ISwipeConfig): void;
    getSwipeConfig(): ISwipeConfig;
    getEditingConfig(): IEditingConfig;
}

const ITEM_ACTION_ICON_CLASS = 'controls-itemActionsV__action_icon icon-size';

export function assignActions(
    collection: IItemActionsCollection,
    actionsGetter: TActionsGetterFunction,
    visibilityCallback: TItemActionVisibilityCallback = () => true
): void {
    if (collection.areActionsAssigned()) {
        return;
    }

    const supportsEventRaising = typeof collection.setEventRaising === 'function';
    let hasChanges = false;

    if (supportsEventRaising) {
        collection.setEventRaising(false, true);
    }

    collection.each((item) => {
        if (!item.isActive()) {
            const fixedActions = actionsGetter(item).map(_fixActionIcon);
            const actionsForItem = fixedActions.filter((action) =>
                visibilityCallback(action, item.getContents())
            );
            const itemChanged = _setItemActions(item, _wrapActionsInContainer(actionsForItem));
            hasChanges = hasChanges || itemChanged;
        }
    });

    if (supportsEventRaising) {
        collection.setEventRaising(true, true);
    }

    collection.setActionsAssigned(true);

    if (hasChanges) {
        collection.nextVersion();
    }
}

export function resetActionsAssignment(collection: IItemActionsCollection): void {
    collection.setActionsAssigned(false);
}

export function setActionsToItem(
    collection: IItemActionsCollection,
    key: TItemKey,
    actions: IItemActionsContainer
): void {
    const item = collection.getItemBySourceKey(key);
    if (item) {
        _setItemActions(item, actions);
    }
    collection.nextVersion();
}

export function calculateActionsTemplateConfig(
    collection: IItemActionsCollection,
    options: IItemActionsTemplateOptions
): void {
    const editingConfig = collection.getEditingConfig();
    collection.setActionsTemplateConfig({
        toolbarVisibility: editingConfig?.toolbarVisibility,
        style: options.style,
        size: editingConfig ? 's' : 'm',
        itemActionsPosition: options.itemActionsPosition,
        actionAlignment: options.actionAlignment,
        actionCaptionPosition: options.actionCaptionPosition,
        itemActionsClass: options.itemActionsClass
    });
}

export function setActiveItem(
    collection: IItemActionsCollection,
    key: TItemKey
): void {
    const oldActiveItem = getActiveItem(collection);
    const newActiveItem = collection.getItemBySourceKey(key);

    if (oldActiveItem) {
        oldActiveItem.setActive(false);
    }
    if (newActiveItem) {
        newActiveItem.setActive(true);
    }

    collection.nextVersion();
}

export function getActiveItem(
    collection: IItemActionsCollection
): IItemActionsItem {
    return collection.find((item) => item.isActive());
}

export function getMenuActions(item: IItemActionsItem): TItemAction[] {
    const actions = item.getActions();
    return (
        actions &&
        actions.all &&
        actions.all.filter((action) => action.showType !== showType.TOOLBAR)
    );
}

export function getChildActions(
    item: IItemActionsItem,
    parentActionKey: TItemAction
): TItemAction[] {
    const actions = item.getActions();
    const allActions = actions && actions.all;
    if (allActions) {
        return allActions.filter((action) => action.parent === parentActionKey);
    }
    return [];
}

export function processActionClick(
    collection: IItemActionsCollection,
    itemKey: TItemKey,
    action: TItemAction,
    clickEvent: SyntheticEvent<MouseEvent>,
    fromDropdown: boolean,
    actionClickCallback: Function
): void {
    clickEvent.stopPropagation();
    if (action._isMenu) {
        prepareActionsMenuConfig(collection, itemKey, clickEvent, null, false, actionClickCallback);
    } else if (action['parent@']) {
        if (!fromDropdown) {
            prepareActionsMenuConfig(collection, itemKey, clickEvent, action, false, actionClickCallback);
        }
    } else {
        const item = collection.getItemBySourceKey(itemKey);
        if (item) {
            const contents = item.getContents();

            // How to calculate itemContainer?
            // this._notify('actionClick', [action, contents, itemContainer]);
            if (actionClickCallback) {
                actionClickCallback(clickEvent, action, contents);
            }

            if (action.handler) {
                action.handler(contents);
            }
        }
    }
    // TODO update some item actions
    // TODO move the marker
}

export function prepareActionsMenuConfig(
    collection: IItemActionsCollection,
    itemKey: TItemKey,
    clickEvent: SyntheticEvent<MouseEvent>,
    parentAction: TItemAction,
    isContext: boolean,
    actionClickCallback: Function
): void {
    const item = collection.getItemBySourceKey(itemKey);
    if (!item) {
        return;
    }

    const hasParentAction = parentAction !== null && parentAction !== undefined;
    const menuActions = hasParentAction
        ? getChildActions(item, parentAction.id)
        : getMenuActions(item);

    if (menuActions && menuActions.length > 0) {
        clickEvent.preventDefault();

        // there was a fake target before, check if it is needed
        const menuTarget = isContext ? null : getFakeMenuTarget(clickEvent.target as HTMLElement);
        const closeHandler = _processActionsMenuClose.bind(null, collection, actionClickCallback);
        const menuSource = new Memory({
            data: menuActions,
            keyProperty: 'id'
        });
        const headConfig = hasParentAction ? {
            caption: parentAction.title,
            icon: parentAction.icon
        } : null;
        const contextMenuConfig = collection.getContextMenuConfig();
        const menuConfig = {
            source: menuSource,
            keyProperty: 'id',
            parentProperty: 'parent',
            nodeProperty: 'parent@',
            dropdownClassName: 'controls-itemActionsV__popup',
            closeButtonVisibility: true,
            ...contextMenuConfig,
            root: parentAction && parentAction.id,
            showHeader: hasParentAction,
            headConfig
        };
        const dropdownConfig = {
            // opener: this,
            target: menuTarget,
            templateOptions: menuConfig,
            eventHandlers: {
                onResult: closeHandler,
                onClose: closeHandler
            },
            closeOnOutsideClick: true,
            targetPoint: {
                vertical: 'top',
                horizontal: 'right'
            },
            direction: {
                horizontal: isContext ? 'right' : 'left'
            },
            className: 'controls-DropdownList__margin-head controls-ItemActions__popup__list',
            nativeEvent: isContext ? clickEvent.nativeEvent : null,
            autofocus: false
        };

        setActiveItem(collection, itemKey);
        collection.setActionsMenuConfig(dropdownConfig);

        collection.nextVersion();
    }
}
function getFakeMenuTarget(realTarget: HTMLElement): {
    getBoundingClientRect(): ClientRect;
} {
    const rect = realTarget.getBoundingClientRect();
    return {
        getBoundingClientRect(): ClientRect {
            return rect;
        }
    };
}
export function activateSwipe(
    collection: IItemActionsCollection,
    itemKey: TItemKey,
    actionsContainerHeight: number
): void {
    setSwipeItem(collection, itemKey);
    setActiveItem(collection, itemKey);

    if (collection.getActionsTemplateConfig().itemActionsPosition !== 'outside') {
        _updateSwipeConfig(collection, actionsContainerHeight);
    }

    collection.nextVersion();
}

export function deactivateSwipe(collection: IItemActionsCollection): void {
    setSwipeItem(collection, null);
    setActiveItem(collection, null);
    collection.setSwipeConfig(null);
    collection.nextVersion();
}

export function setSwipeItem(
    collection: IItemActionsCollection,
    key: TItemKey
): void {
    const oldSwipeItem = getSwipeItem(collection);
    const newSwipeItem = collection.getItemBySourceKey(key);

    if (oldSwipeItem) {
        oldSwipeItem.setSwiped(false);
    }
    if (newSwipeItem) {
        newSwipeItem.setSwiped(true);
    }

    collection.nextVersion();
}

export function getSwipeItem(collection: IItemActionsCollection): IItemActionsItem {
    return collection.find((item) => item.isSwiped());
}

function _updateSwipeConfig(
    collection: IItemActionsCollection,
    actionsContainerHeight: number
): void {
    const item = getSwipeItem(collection);
    if (!item) {
        return;
    }

    const actions = item.getActions().all;
    const actionsTemplateConfig = collection.getActionsTemplateConfig();

    let swipeConfig = _calculateSwipeConfig(
        actions,
        actionsTemplateConfig.actionAlignment,
        actionsContainerHeight,
        actionsTemplateConfig.actionCaptionPosition
    );

    if (
        actionsTemplateConfig.actionAlignment !== 'horizontal' &&
        _needsHorizontalMeasurement(swipeConfig)
    ) {
        swipeConfig = _calculateSwipeConfig(
            actions,
            'horizontal',
            actionsContainerHeight,
            actionsTemplateConfig.actionCaptionPosition
        );
    }

    _setItemActions(item, swipeConfig.itemActions);

    if (swipeConfig.twoColumns) {
        const visibleActions = swipeConfig.itemActions.showed;
        swipeConfig.twoColumnsActions = [
            [visibleActions[0], visibleActions[1]],
            [visibleActions[2], visibleActions[3]]
        ];
    }

    collection.setSwipeConfig(swipeConfig);
}

function _calculateSwipeConfig(
    actions: TItemAction[],
    actionAlignment: string,
    actionsContainerHeight: number,
    actionCaptionPosition: 'right'|'bottom'|'none'
): ISwipeConfig {
    // FIXME: https://online.sbis.ru/opendoc.html?guid=380045b2-1cd8-4868-8c3f-545cc5c1732f
    // TODO Move these measurers to listRender, maybe rewrite them
    const {SwipeVerticalMeasurer, SwipeHorizontalMeasurer} = require('Controls/list');

    const measurer =
        actionAlignment === 'vertical'
        ? SwipeVerticalMeasurer.default
        : SwipeHorizontalMeasurer.default;
    const config: ISwipeConfig = measurer.getSwipeConfig(
        actions,
        actionsContainerHeight,
        actionCaptionPosition
    );
    config.needTitle = measurer.needTitle;
    config.needIcon = measurer.needIcon;
    return config;
}

function _needsHorizontalMeasurement(config: ISwipeConfig): boolean {
    const actions = config.itemActions;
    return (
        actions &&
        actions.showed?.length === 1 &&
        actions.all?.length > 1
    );
}

function _processActionsMenuClose(
    collection: IItemActionsCollection,
    actionClickCallback: Function,
    action: string, data: any[], event: SyntheticEvent<MouseEvent>
): void {
    // Actions dropdown can start closing after the view itself was unmounted already, in which case
    // the model would be destroyed and there would be no need to process the action itself
    if (collection && !collection.destroyed) {
        // If menu needs to close because one of the actions was clicked, process
        // the action handler first
        if (action === 'itemClick') {
            const action = data && data.getRawData();
            processActionClick(
                collection,
                getActiveItem(collection)?.getContents()?.getKey(),
                action,
                event,
                true,
                actionClickCallback
            );

            // If this action has children, don't close the menu if it was clicked
            if (action['parent@']) {
                return;
            }
        }

        if (action !== 'menuOpened') {
            setActiveItem(collection, null);
            collection.setActionsMenuConfig(null);
            deactivateSwipe(collection);
            collection.nextVersion();
        }
    }
}

function _setItemActions(
    item: IItemActionsItem,
    actions: IItemActionsContainer
): boolean {
    const oldActions = item.getActions();
    if (!oldActions || (actions && !_isMatchingActions(oldActions, actions))) {
        item.setActions(actions);
        return true;
    }
    return false;
}

function _fixActionIcon(action: TItemAction): TItemAction {
    if (!action.icon || action.icon.includes(ITEM_ACTION_ICON_CLASS)) {
        return action;
    }
    return {
        ...action,
        icon: `${action.icon} ${ITEM_ACTION_ICON_CLASS}`
    };
}

function _wrapActionsInContainer(
    actions: TItemAction[]
): IItemActionsContainer {
    let showed = actions;
    if (showed.length > 1) {
        showed = showed.filter(
            (action) =>
                action.showType === showType.TOOLBAR ||
                action.showType === showType.MENU_TOOLBAR
        );
        if (_isMenuButtonRequired(actions)) {
            showed.push({
                icon: `icon-ExpandDown ${ITEM_ACTION_ICON_CLASS}`,
                style: 'secondary',
                iconStyle: 'secondary',
                title: rk('Ещё'),
                _isMenu: true
            });
        }
    }
    return {
        all: actions,
        showed
    };
}

function _isMenuButtonRequired(actions: TItemAction[]): boolean {
    return actions.some(
        (action) =>
            !action.parent &&
            (!action.showType ||
                action.showType === showType.MENU ||
                action.showType === showType.MENU_TOOLBAR)
    );
}

function _isMatchingActions(
    oldContainer: IItemActionsContainer,
    newContainer: IItemActionsContainer
): boolean {
    return (
        _isMatchingActionLists(oldContainer.all, newContainer.all) &&
        _isMatchingActionLists(oldContainer.showed, newContainer.showed)
    );
}

function _isMatchingActionLists(
    aActions: TItemAction[],
    bActions: TItemAction[]
): boolean {
    if (!aActions || !bActions) {
        return false;
    }
    const length = aActions.length;
    if (length !== bActions.length) {
        return false;
    }
    for (let i = 0; i < length; i++) {
        if (
            aActions[i].id !== bActions[i].id ||
            aActions[i].icon !== bActions[i].icon
        ) {
            return false;
        }
    }
    return true;
}

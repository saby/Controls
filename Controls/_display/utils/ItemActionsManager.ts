import BaseManager from './BaseManager';

import { showType } from 'Controls/Utils/Toolbar';

export type TItemActionVisibilityCallback = (action, item: unknown) => boolean;

// TODO Написать реальный тип для action'ов
type TItemAction = any;

interface IItemActionsContainer {
    all: TItemAction[];
    showed: TItemAction[];
}

export interface IVirtualScrollManageableCollection {
    each(callback: (item: IItemActionsManageableItem) => void): void;
}

export interface IItemActionsManageableItem {
    getActions(): IItemActionsContainer;
    getContents(): unknown;
    setActions(actions: IItemActionsContainer): void;
    setActive(active: boolean): void;
}

const ITEM_ACTION_ICON_CLASS = 'controls-itemActionsV__action_icon icon-size';

export default class ItemActionsManager extends BaseManager<IVirtualScrollManageableCollection> {
    protected _activeItem: IItemActionsManageableItem;

    assignItemActions(actionList: TItemAction[], visibilityCallback: TItemActionVisibilityCallback = () => true): void {
        // TODO Support itemActionsProperty
        // NB Deprecated style names are intentionally no longer supported
        const actions = actionList.map(this._fixActionIcon);
        this._collection.each((item) => {
            const assignedActions = actions.filter((action) => visibilityCallback(action, item.getContents()));
            this.setItemActions(item, this._wrapActionsInContainer(assignedActions));
        });
    }

    setItemActions(item: IItemActionsManageableItem, actions: IItemActionsContainer): void {
        const oldActions = item.getActions();
        if (!oldActions || (actions && !this._isMatchingActions(oldActions, actions))) {
            item.setActions(actions);
        }
    }

    setActiveItem(item: IItemActionsManageableItem): void {
        if (this._activeItem === item) {
            return;
        }
        if (this._activeItem) {
            this._activeItem.setActive(false);
        }
        if (item) {
            item.setActive(true);
        }
        this._activeItem = item;
    }

    getActiveItem(): IItemActionsManageableItem {
        return this._activeItem;
    }

    protected _isMatchingActions(oldContainer: IItemActionsContainer, newContainer: IItemActionsContainer): boolean {
        return (
            this._isMatchingActionIds(oldContainer.all, newContainer.all) &&
            this._isMatchingActionIds(oldContainer.showed, newContainer.showed)
        );
    }

    protected _isMatchingActionIds(aActions: TItemAction[], bActions: TItemAction[]): boolean {
        if (!aActions || !bActions) {
            return false;
        }
        const length = aActions.length;
        if (length !== bActions.length) {
            return false;
        }
        for (let i = 0; i < length; i++) {
            if (aActions[i].id !== bActions[i].id) {
                return false;
            }
        }
        return true;
    }

    protected _fixActionIcon(action: TItemAction): TItemAction {
        if (!action.icon || action.icon.includes(ITEM_ACTION_ICON_CLASS)) {
            return action;
        }
        return {
            ...action,
            icon: `${action.icon} ${ITEM_ACTION_ICON_CLASS}`
        };
    }

    protected _wrapActionsInContainer(actions: TItemAction[]): IItemActionsContainer {
        let showed = actions;
        if (showed.length > 1) {
            showed = showed.filter(
                (action) => action.showType === showType.TOOLBAR || action.showType === showType.MENU_TOOLBAR
            );
            if (this._isMenuButtonRequired(actions)) {
                showed.push({
                    icon: `icon-ExpandDown ${ITEM_ACTION_ICON_CLASS}`,
                    style: 'secondary',
                    iconStyle: 'secondary',
                    _isMenu: true
                });
            }
        }
        return {
            all: actions,
            showed
        };
    }

    protected _isMenuButtonRequired(actions: TItemAction[]): boolean {
        return actions.some((action) => {
            return (
                !action.parent &&
                (
                    !action.showType ||
                    action.showType === showType.MENU ||
                    action.showType === showType.MENU_TOOLBAR
                )
            );
        });
    }
}

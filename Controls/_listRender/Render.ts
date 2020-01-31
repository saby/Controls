import { Control, TemplateFunction, IControlOptions } from 'UI/Base';
import template = require('wml!Controls/_listRender/Render/Render');

import defaultItemTemplate = require('wml!Controls/_listRender/Render/resources/ItemTemplateWrapper');

import { SyntheticEvent } from 'Vdom/Vdom';
import { CollectionItem, Collection, EditInPlaceController, GroupItem } from 'Controls/display';
import { constants } from 'Env/Env';
import { Opener as DropdownOpener } from 'Controls/dropdown';

import 'wml!Controls/_listRender/Render/resources/ItemActionsTemplate';
import 'wml!Controls/_listRender/Render/resources/SwipeTemplate';

export interface IRenderOptions extends IControlOptions {
    listModel: Collection<unknown>;
    contextMenuEnabled?: boolean;
    contextMenuVisibility?: boolean;
    multiselectVisibility?: string;
    itemTemplate?: TemplateFunction;
}

export interface IRenderChildren {
    itemsContainer?: HTMLDivElement;
    menuOpener?: DropdownOpener;
}

export default class Render extends Control<IRenderOptions> {
    protected _template: TemplateFunction = template;
    protected _children: IRenderChildren;

    protected _templateKeyPrefix: string;
    protected _itemTemplate: TemplateFunction;

    protected _pendingResize: boolean = false;
    protected _currentMenuConfig: unknown = null;

    protected _onCollectionChange(_e: unknown, action: string): void {
        if (action !== 'ch') {
            // Notify resize when items are added, removed or replaced, or
            // when the recordset is reset
            this._pendingResize = true;
        }
    }

    protected _beforeMount(options: IRenderOptions): void {
        this._templateKeyPrefix = `list-render-${this.getInstanceId()}`;
        this._itemTemplate = options.itemTemplate || defaultItemTemplate;
        this._onCollectionChange = this._onCollectionChange.bind(this);

        this._subscribeToModelChanges(options.listModel);
    }

    protected _beforeUpdate(newOptions: IRenderOptions): void {
        if (newOptions.listModel !== this._options.listModel) {
            this._subscribeToModelChanges(newOptions.listModel);
        }

        const menuConfig = newOptions.listModel.getActionsMenuConfig();
        if (menuConfig !== this._currentMenuConfig) {
            if (menuConfig) {
                this._children.menuOpener.open(menuConfig, this);
            } else {
                this._children.menuOpener.close();
            }
            this._currentMenuConfig = menuConfig;
        }
    }

    protected _afterRender(): void {
        if (this._pendingResize) {
            this._notify('controlResize', [], { bubbling: true });
            this._pendingResize = false;
        }
    }

    protected _beforeUnmount(): void {
        this._unsubscribeFromModelChanges(this._options.listModel);
        this._currentMenuConfig = null;
    }

    protected _afterMount(): void {
        this._notify('itemsContainerReady', [this.getItemsContainer()]);
    }

    getItemsContainer(): HTMLDivElement {
        return this._children.itemsContainer;
    }

    protected _onItemClick(
        e: SyntheticEvent<MouseEvent> & { preventItemEvent?: boolean },
        item: CollectionItem<unknown>
    ): void {
        if (item instanceof GroupItem) {
            if (e.target?.closest('.controls-ListView__groupExpander')) {
                item.toggleExpanded();
            }
        } else {
            if (!e.preventItemEvent && !item.isEditing()) {
                this._notify('itemClick', [item.getContents(), e], { bubbling: true });
            }
        }
    }

    protected _onItemContextMenu(e: SyntheticEvent<MouseEvent>, item: CollectionItem<unknown>): void {
        if (item instanceof GroupItem) {
            return;
        }
        if (
            this._options.contextMenuEnabled !== false &&
            this._options.contextMenuVisibility !== false &&
            !EditInPlaceController.isEditing(this._options.listModel)
        ) {
            this._notify('itemContextMenu', [item, e, false]);
        }
    }

    protected _onItemSwipe(e: SyntheticEvent<null>, item: CollectionItem<unknown>): void {
        if (item instanceof GroupItem) {
            return;
        }

        e.stopPropagation();

        const itemContainer =
            (e.target as HTMLElement)
            .closest('.controls-ListView__itemV');

        const swipeContainer =
            itemContainer.classList.contains('js-controls-SwipeControl__actionsContainer')
            ? itemContainer
            : itemContainer.querySelector('.js-controls-SwipeControl__actionsContainer');

        this._notify('itemSwipe', [item, e, swipeContainer?.clientHeight]);
    }

    protected _onAnimationEnd(e: SyntheticEvent<null>): void {
        // TODO Swipe animation has finished. If this was a close animation,
        // clear swipe state
    }

    protected _onItemActionsClick(e: SyntheticEvent<MouseEvent>, action: unknown, item: CollectionItem<unknown>): void {
        e.stopPropagation();
        this._notify('itemActionClick', [item, action, e]);
    }

    protected _onItemMouseEnter(e: SyntheticEvent<MouseEvent>, item: CollectionItem<unknown>): void {
        this._notify('itemMouseEnter', [item, e]);
    }

    protected _onItemMouseMove(e: SyntheticEvent<MouseEvent>, item: CollectionItem<unknown>): void {
        if (item instanceof GroupItem) {
            return;
        }
        this._notify('itemMouseMove', [item, e]);
    }

    protected _onItemMouseLeave(e: SyntheticEvent<MouseEvent>, item: CollectionItem<unknown>): void {
        this._notify('itemMouseLeave', [item, e]);
    }
    protected _onItemMouseDown(e: SyntheticEvent<MouseEvent>, item: CollectionItem<unknown>): void {
        this._notify('itemMouseDown', [item, e]);
    }

    protected _onItemWheel(e: SyntheticEvent<WheelEvent>, item: CollectionItem<unknown>): void {
        // Empty handler
    }

    protected _onItemKeyDown(e: SyntheticEvent<KeyboardEvent>, item: CollectionItem<unknown>): void {
        if (item instanceof GroupItem) {
            return;
        }
        if (item.isEditing()) {
            // TODO Will probably be moved to EditInPlace container
            // keydown event should not bubble if processed here, but if we stop propagation
            // the rich text editor and tab focus movement would break because they listen
            // to the keydown event on the bubbling phase
            // https://online.sbis.ru/opendoc.html?guid=cefa8cd9-6a81-47cf-b642-068f9b3898b7
            //
            // Escape should not bubble above the edit in place row, because it is only
            // used to cancel the edit mode. If the keydown event bubbles, some parent
            // control might handle the event when it is not needed (e.g. if edit in
            // place is inside of a popup, the popup will be closed).
            if (
                e.nativeEvent.keyCode === constants.key.esc ||
                (
                    !e.target.closest('.richEditor_TinyMCE') &&
                    e.nativeEvent.keyCode !== constants.key.tab
                )
            ) {
                e.stopPropagation();
            }
            // Compatibility with BaseControl and EditInPlace control
            this._notify('editingRowKeyDown', [e.nativeEvent], {bubbling: true});
        } else {
            this._notify('itemKeyDown', [item, e]);
        }
    }

    protected _canHaveMultiselect(options: IRenderOptions): boolean {
        const visibility = options.multiselectVisibility;
        return visibility === 'onhover' || visibility === 'visible';
    }

    protected _subscribeToModelChanges(model: Collection<unknown>): void {
        this._unsubscribeFromModelChanges(this._options.listModel);
        if (model && !model.destroyed) {
            model.subscribe('onCollectionChange', this._onCollectionChange);
        }
    }

    protected _unsubscribeFromModelChanges(model: Collection<unknown>): void {
        if (model && !model.destroyed) {
            this._options.listModel.unsubscribe('onCollectionChange', this._onCollectionChange);
        }
    }

    static _theme: string[] = ['Controls/list_multi'];
}

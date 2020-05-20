import { Control, TemplateFunction, IControlOptions } from 'UI/Base';

import template = require('wml!Controls/_listRender/View/View');

import { RecordSet } from 'Types/collection';
import { Model } from 'Types/entity';
import { create as diCreate } from 'Types/di';
import { Sticky } from 'Controls/popup';

import {
    Collection,
    CollectionItem,
    MarkerCommands,
    ICollectionCommand,
    ANIMATION_STATE
} from 'Controls/display';
import {
    Controller as ItemActionsController,
    TItemActionVisibilityCallback,
    IItemAction} from 'Controls/itemActions';
import tmplNotify = require('Controls/Utils/tmplNotify');

import { load as libraryLoad } from 'Core/library';
import { SyntheticEvent } from 'Vdom/Vdom';

import { constants } from 'Env/Env';

import {ISwipeEvent} from './Render';

export interface IViewOptions extends IControlOptions {
    items: RecordSet;

    collection: string;
    render: string;

    itemActions?: any[];
    itemActionVisibilityCallback?: TItemActionVisibilityCallback;
    itemActionsPosition?: string;
    itemActionsProperty?: string;
    style?: string;
    itemActionsClass?: string;

    actionAlignment?: string;
    actionCaptionPosition?: 'right'|'bottom'|'none';

    editingConfig?: any;
}

export default class View extends Control<IViewOptions> {
    protected _template: TemplateFunction = template;
    protected _tmplNotify: Function = tmplNotify;

    protected _collection: Collection<Model>;

    private _itemActionsController: ItemActionsController;

    // Идентификатор текущего открытого popup
    private _itemActionsMenuId: string = null;

    protected async _beforeMount(options: IViewOptions): Promise<void> {
        this._collection = this._createCollection(options.collection, options.items, options);
        return libraryLoad(options.render).then(() => null);
    }

    protected _beforeUpdate(options: IViewOptions): void {
        let collectionRecreated = false;

        if (options.items !== this._options.items) {
            if (this._collection) {
                this._collection.destroy();
            }
            this._collection = this._createCollection(options.collection, options.items, options);
            collectionRecreated = true;
        }

        if (options.editingConfig !== this._options.editingConfig || options.editingConfig && collectionRecreated) {
            this._collection.setEditingConfig(options.editingConfig);
        }

        // UC: Record might be editing on page load, then we should initialize Item Actions.
        if (
            options.itemActions !== this._options.itemActions ||
            options.itemActionVisibilityCallback !== this._options.itemActionVisibilityCallback ||
            (options.itemActions || options.itemActionsProperty) && collectionRecreated ||
            options.itemActionsProperty ||
            (options.editingConfig && options.editingConfig.item)
        ) {
            this._updateItemActions();
        }
    }

    protected _beforeUnmount(): void {
        if (this._collection) {
            this._collection.destroy();
            this._collection = null;
        }
    }

    /**
     * При наведении на запись в списке мы должны показать операции
     * @param e
     * @private
     */
    protected _onRenderMouseEnter(e: SyntheticEvent<MouseEvent>): void {
        this._updateItemActions();
    }

    /**
     * По событию youch мы должны показать операции
     * @param e
     * @private
     */
    protected _onRenderTouchStart(e: SyntheticEvent<TouchEvent>): void {
        this._updateItemActions();
    }

    /**
     * По клику на запись в списке нужно переместить маркер
     * @param e
     * @param item
     * @param clickEvent
     * @private
     */
    protected _onItemClick(
        e: SyntheticEvent<null>,
        item: Model,
        clickEvent: SyntheticEvent<MouseEvent>
    ): void {
        const moveMarker = new MarkerCommands.Mark(item.getKey());
        this._executeCommands([moveMarker]);
        // TODO fire 'markedKeyChanged' event
    }

    /**
     * Обработчик свайпа по записи. Показывает операции по свайпу
     * @param e
     * @param item
     * @param swipeEvent
     * @param swipeContainerHeight
     * @private
     */
    protected _onItemSwipe(
        e: SyntheticEvent<null>,
        item: CollectionItem<Model>,
        swipeEvent: SyntheticEvent<ISwipeEvent>,
        swipeContainerHeight: number
    ): void {
        switch (swipeEvent.nativeEvent.direction) {
        case 'left':
            this._itemActionsController.activateSwipe(item.getContents().getKey(), swipeContainerHeight);
            break;
        default:
            this._collection.setSwipeAnimation(ANIMATION_STATE.CLOSE);
            this._collection.nextVersion();
            break;
        }
    }

    /**
     * Обработчик события окончания анимации свайпа по записи
     * @param e
     * @private
     */
    _onCloseSwipe(e: SyntheticEvent<null>): void {
        this._itemActionsController.deactivateSwipe();
    }

    /**
     * Обрабатывает событие клика по записи и бросает событие actionClick
     * @param e
     * @param item
     * @param action
     * @param clickEvent
     * @private
     */
    protected _onItemActionClick(
        e: SyntheticEvent<MouseEvent>,
        item: CollectionItem<Model>,
        action: IItemAction,
        clickEvent: SyntheticEvent<MouseEvent>
    ): void {
        const moveMarker = new MarkerCommands.Mark(item.getContents().getKey());
        this._executeCommands([moveMarker]);
        // TODO fire 'markedKeyChanged' event

        if (action && !action._isMenu && !action['parent@']) {
            this._handleItemActionClick(action, clickEvent, item);
        } else {
            this._openItemActionsMenu(action, clickEvent, item, false);
        }
    }

    /**
     * Обработка события возникновения контекстного меню
     * @param e
     * @param item
     * @param clickEvent
     * @private
     */
    protected _onItemContextMenu(
        e: SyntheticEvent<null>,
        item: CollectionItem<Model>,
        clickEvent: SyntheticEvent<MouseEvent>
    ): void {
        this._openItemActionsMenu(null, clickEvent, item, true);
    }

    /**
     * Обработка события клика по элементу списка
     * @param e
     * @param item
     * @param keyDownEvent
     * @private
     */
    protected _onItemKeyDown(
        e: SyntheticEvent<null>,
        item: CollectionItem<Model>,
        keyDownEvent: SyntheticEvent<KeyboardEvent>
    ): void {
        const commands: Array<ICollectionCommand<unknown>> = [];
        switch (keyDownEvent.nativeEvent.keyCode) {
        case constants.key.down:
            commands.push(new MarkerCommands.MarkNext());
            break;
        case constants.key.up:
            commands.push(new MarkerCommands.MarkPrevious());
            break;
        }
        this._executeCommands(commands);
        // TODO fire 'markedKeyChanged' event if needed
    }

    protected _executeCommands(commands: Array<ICollectionCommand<unknown>>): void {
        commands.forEach((command) => command.execute(this._collection));
    }

    /**
     * Обрабатывает клик по конкретной операции
     * @param action
     * @param clickEvent
     * @param item
     * @private
     */
    private _handleItemActionClick(action: IItemAction, clickEvent: SyntheticEvent<MouseEvent>, item: CollectionItem<Model>): void {
        let contents = item.getContents();
        if (item['[Controls/_display/BreadcrumbsItem]']) {
            contents = contents[contents.length - 1];
        }
        // TODO Проверить. В старом коде был поиск controls-ListView__itemV по текущему индексу записи
        // TODO Корректно ли тут обращаться по CSS классу для поиска контейнера?
        const itemContainer = (clickEvent.target as HTMLElement).closest('.controls-ListView__itemV');
        this._notify('actionClick', [action, contents, itemContainer]);
        if (action.handler) {
            action.handler(contents);
        }
        this._closeActionsMenu();
    }

    /**
     * Обработчик событий, брошенных через onResult в выпадающем/контекстном меню
     * @param eventName название события, брошенного из Controls/menu:Popup.
     * Варианты значений itemClick, applyClick, selectorDialogOpened, pinClick, menuOpened
     * @param actionModel
     * @param clickEvent
     * @private
     */
    private _itemActionsMenuResultHandler(
        eventName: string,
        actionModel: Model,
        clickEvent: SyntheticEvent<MouseEvent>): void {
        if (eventName === 'itemClick') {
            const action = actionModel && actionModel.getRawData();
            if (action && !action['parent@']) {
                const item = this._collection.getActiveItem();
                this._handleItemActionClick(action, clickEvent, item);
            }
        }
    }

    /**
     * Обработчик закрытия выпадающего/контекстного меню
     * @param e
     * @param clickEvent
     * @private
     */
    private _itemActionsMenuCloseHandler(e: SyntheticEvent<MouseEvent>, clickEvent: SyntheticEvent<MouseEvent>): void {
        // Actions dropdown can start closing after the view itself was unmounted already, in which case
        // the model would be destroyed and there would be no need to process the action itself
        if (this._collection && !this._collection.destroyed) {
            this._collection.setActiveItem(null);
            this._itemActionsController.deactivateSwipe();
            this._itemActionsMenuId = null;
        }
    }

    /**
     * Открывает меню операций
     * @param action
     * @param clickEvent
     * @param item
     * @param isContextMenu
     */
    private _openItemActionsMenu(
        action: IItemAction,
        clickEvent: SyntheticEvent<MouseEvent>,
        item: CollectionItem<Model>,
        isContextMenu: boolean): void {
        const opener = this._children.renderer;
        let contents = item?.getContents();
        if (item['[Controls/_display/BreadcrumbsItem]']) {
            contents = contents[contents.length - 1];
        }
        const itemKey = contents?.getKey();
        const menuConfig = this._itemActionsController.prepareActionsMenuConfig(itemKey, clickEvent, action, opener, isContextMenu);
        if (menuConfig) {
            const onResult = this._itemActionsMenuResultHandler.bind(this);
            const onClose = this._itemActionsMenuCloseHandler.bind(this);
            menuConfig.eventHandlers = {onResult, onClose};
            this._collection.setActiveItem(item);
            Sticky.openPopup(menuConfig).then((popupId) => {
                this._itemActionsMenuId = popupId;
            });
        }
    }

    /**
     * Метод, который закрывает меню
     * @private
     */
    private _closeActionsMenu(): void {
        this._collection.setActiveItem(null);
        this._itemActionsController.deactivateSwipe();
        Sticky.closePopup(this._itemActionsMenuId);
        this._itemActionsMenuId = null;
    }

    /**
     * Создаёт коллекцию из пришедших данных
     * @param module
     * @param items
     * @param collectionOptions
     * @private
     */
    private _createCollection(
        module: string,
        items: RecordSet,
        collectionOptions: IViewOptions
    ): Collection<Model> {
        return diCreate(module, { ...collectionOptions, collection: items });
    }

    /**
     * Инициализирует контрорллере и обновляет в нём данные
     * @private
     */
    protected _updateItemActions(): void {
        if (!this._itemActionsController) {
            this._itemActionsController = new ItemActionsController();
        }
        const editingConfig = this._collection.getEditingConfig();
        this._itemActionsController.update({
            collection: this._collection,
            itemActions: this._options.itemActions,
            itemActionsProperty: this._options.itemActionsProperty,
            visibilityCallback: this._options.itemActionVisibilityCallback,
            itemActionsPosition: this._options.itemActionsPosition,
            style: this._options.style,
            theme: this._options.theme,
            actionAlignment: this._options.actionAlignment,
            actionCaptionPosition: this._options.actionCaptionPosition,
            itemActionsClass: this._options.itemActionsClass,
            iconSize: editingConfig ? 's' : 'm',
            editingToolbarVisible: editingConfig?.toolbarVisibility
        });
    }

    static getDefaultOptions(): Partial<IViewOptions> {
        return {
            itemActionsPosition: 'inside',
            actionAlignment: 'horizontal',
            actionCaptionPosition: 'none',
            style: 'default'
        };
    }
}

import rk = require('i18n!Controls');

import { Control, TemplateFunction, IControlOptions } from 'UI/Base';
import { RecordSet } from 'Types/collection';
import { Model } from 'Types/entity';
import { create as diCreate } from 'Types/di';
import { Sticky } from 'Controls/popup';

import {
    Collection,
    CollectionItem,
    ANIMATION_STATE
} from 'Controls/display';
import {
    Controller as ItemActionsController,
    TItemActionVisibilityCallback,
    TEditArrowVisibilityCallback,
    IItemAction,
    TItemActionShowType,
    TItemActionsPosition,
    IItemActionsItem,
    IContextMenuConfig
} from 'Controls/itemActions';
import tmplNotify = require('Controls/Utils/tmplNotify');

import { load as libraryLoad } from 'Core/library';
import { SyntheticEvent } from 'Vdom/Vdom';

import {constants, detection} from 'Env/Env';
import {RegisterUtil, UnregisterUtil} from 'Controls/event';
import { MarkerController, TVisibility, Visibility } from 'Controls/marker';
import { ISwipeEvent } from './Render';

import template = require('wml!Controls/_listRender/View/View');

export interface IViewOptions extends IControlOptions {
    items: RecordSet;

    collection: string;
    render: string;

    itemActions?: any[];
    itemActionsVisibility?: 'onhover'|'delayed'|'visible';
    itemActionVisibilityCallback?: TItemActionVisibilityCallback;
    itemActionsPosition?: TItemActionsPosition;
    itemActionsProperty?: string;
    style?: string;
    itemActionsClass?: string;

    actionAlignment?: 'horizontal'|'vertical';
    actionCaptionPosition?: 'right'|'bottom'|'none';

    editingConfig?: any;

    markerVisibility?: TVisibility;
    markedKey?: number|string;
    showEditArrow?: boolean;
    editArrowVisibilityCallback?: TEditArrowVisibilityCallback;
    /**
     * Конфигурация для контекстного меню опции записи.
     */
    contextMenuConfig?: IContextMenuConfig
}

export default class View extends Control<IViewOptions> {
    protected _template: TemplateFunction = template;
    protected _tmplNotify: Function = tmplNotify;

    protected _collection: Collection<Model>;

    private _itemActionsController: ItemActionsController;

    // Идентификатор текущего открытого popup
    private _itemActionsMenuId: string = null;

    private _markerController: MarkerController = null;

    // Элемент, на котором было вызвано контекстное меню
    private _targetItem: HTMLElement = null;

    protected async _beforeMount(options: IViewOptions): Promise<void> {
        this._collection = this._createCollection(options.collection, options.items, options);

        if (options.itemActionsVisibility === 'visible') {
            this._updateItemActions(options);
        }

        if (options.markerVisibility !== Visibility.Hidden) {
            this._markerController = new MarkerController({
                model: this._collection,
                markerVisibility: options.markerVisibility,
                markedKey: options.markedKey
            });
        }
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

        if (options.markedKey !== this._options.markedKey
           || options.markerVisibility !== this._options.markerVisibility
           || collectionRecreated) {
            if (this._markerController) {
                this._markerController.update({
                    model: this._collection,
                    markerVisibility: options.markerVisibility,
                    markedKey: options.markedKey
                });
            }
        }

        // UC: Record might be editing on page load, then we should initialize Item Actions.
        if (
            options.itemActions !== this._options.itemActions ||
            options.itemActionVisibilityCallback !== this._options.itemActionVisibilityCallback ||
            (options.itemActions || options.itemActionsProperty) && collectionRecreated ||
            options.itemActionsProperty ||
            (options.editingConfig && options.editingConfig.item) ||
            options.readOnly !== this._options.readOnly ||
            options.itemActionsPosition !== this._options.itemActionsPosition
        ) {
            this._updateItemActions(options);
        }
    }

    protected _beforeUnmount(): void {
        if (this._collection) {
            this._collection.destroy();
            this._collection = null;
        }
    }

    /**
     * По событию touch мы должны показать операции
     * @param e
     * @private
     */
    protected _onRenderTouchStart(e: SyntheticEvent<TouchEvent>): void {
        this._updateItemActions(this._options);
    }

    /**
     * При наведении на запись в списке мы должны показать операции
     * @param e
     * @private
     */
    protected _onRenderMouseEnter(e: SyntheticEvent<TouchEvent>): void {
        if (this._options.itemActionsVisibility !== 'visible') {
            if (!this._collection.isActionsAssigned()) {
                this._updateItemActions(this._options);
            }
        }
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
        if (this._markerController) {
            this._markerController.setMarkedKey(item.getKey());
        }
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
        if (swipeEvent.nativeEvent.direction === 'left') {
            this._itemActionsController.activateSwipe(item.getContents().getKey(), swipeContainerHeight);
        }
        if (swipeEvent.nativeEvent.direction === 'right' && item.isSwiped()) {
            this._itemActionsController.setSwipeAnimation(ANIMATION_STATE.CLOSE);
            this._collection.nextVersion();
        }
    }

    /**
     * Обработчик события окончания анимации свайпа по записи
     * @param e
     * @private
     */
    protected _onCloseSwipe(e: SyntheticEvent<null>): void {
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
        if (this._markerController) {
            this._markerController.setMarkedKey(item.getContents().getKey());
        }
        // TODO fire 'markedKeyChanged' event

        if (action && !action._isMenu && !action['parent@']) {
            this._handleItemActionClick(action, clickEvent, item, false);
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
        switch (keyDownEvent.nativeEvent.keyCode) {
        case constants.key.down:
            if (this._markerController) {
                this._markerController.moveMarkerToNext();
            }
            break;
        case constants.key.up:
            if (this._markerController) {
                this._markerController.moveMarkerToPrev();
            }
            break;
        }
        // TODO fire 'markedKeyChanged' event if needed
    }

    /**
     * Возвращает видимость опций записи.
     * @private
     */
    _isVisibleItemActions(itemActionsMenuId: number): boolean {
        return !itemActionsMenuId || this._options.itemActionsVisibility === 'visible';
    }

    /**
     * Обрабатывает клик по конкретной операции
     * @param action
     * @param clickEvent
     * @param item
     * @param isMenuClick
     * @private
     */
    private _handleItemActionClick(action: IItemAction, clickEvent: SyntheticEvent<MouseEvent>, item: IItemActionsItem, isMenuClick: boolean): void {
        // TODO нужно заменить на item.getContents() при переписывании моделей. item.getContents() должен возвращать Record
        let contents = View._getItemContents(item);
        const itemContainer = this._resolveItemContainer(item, isMenuClick);
        this._notify('actionClick', [action, contents, itemContainer]);
        if (action.handler) {
            action.handler(contents);
        }
        this._closeActionsMenu();
    }

    /**
     * Получает контейнер для
     * @param item
     * @param isMenuClick
     */
    private _resolveItemContainer(item, isMenuClick: boolean): HTMLElement {
        // TODO: self._container может быть не HTMLElement, а jQuery-элементом,
        //  убрать после https://online.sbis.ru/opendoc.html?guid=d7b89438-00b0-404f-b3d9-cc7e02e61bb3
        const container = this._container.get ? this._container.get(0) : this._container;

        // Т.к., например, breadcrumbs отсутствует в source, но иногда нам нужно получать его target
        // логичнее использовать именно getIndex(), а не getSourceIndexByItem()
        // кроме того, в старой модели в itemData.index записывается именно результат getIndex()
        const itemIndex = this._collection.getIndex(item);
        const startIndex = this._collection.getStartIndex();
        return isMenuClick ? this._targetItem : Array.prototype.filter.call(
            container.querySelector('.controls-ListView__itemV').parentNode.children,
            (item: HTMLElement) => item.className.includes('controls-ListView__itemV')
        )[itemIndex - startIndex];
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
                const item = this._itemActionsController.getActiveItem();
                this._handleItemActionClick(action, clickEvent, item, true);
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
        isContextMenu: boolean): Promise<void> {
        const menuConfig = this._itemActionsController.prepareActionsMenuConfig(item, clickEvent, action, this, isContextMenu);
        if (!menuConfig) {
            return Promise.resolve();
        }
        /**
         * Не во всех раскладках можно получить DOM-элемент, зная только индекс в коллекции, поэтому запоминаем тот,
         * у которого открываем меню. Потом передадим его для события actionClick.
         */
        this._targetItem = clickEvent.target.closest('.controls-ListView__itemV');
        clickEvent.nativeEvent.preventDefault();
        clickEvent.stopImmediatePropagation();
        const onResult = this._itemActionsMenuResultHandler.bind(this);
        const onClose = this._itemActionsMenuCloseHandler.bind(this);
        menuConfig.eventHandlers = {onResult, onClose};
        return Sticky.openPopup(menuConfig).then((popupId) => {
            this._itemActionsMenuId = popupId;
            this._itemActionsController.setActiveItem(item);
            RegisterUtil(this, 'scroll', this._scrollHandler.bind(this));
        });
    }

    /**
     * Метод, который закрывает меню
     * @private
     */
    private _closeActionsMenu(): void {
        this._itemActionsController.setActiveItem(null);
        this._itemActionsController.deactivateSwipe();
        this._closePopup();
    }

    /**
     * Закрывает popup и снимает регистрацию его подписки на событие скролла
     * @private
     */
    private _closePopup() {
        if (this._itemActionsMenuId) {
        Sticky.closePopup(this._itemActionsMenuId);
            UnregisterUtil(this, 'scroll');
        }
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
     * Обработчик скролла, вызываемый при помощи регистратора событий по событию в ScrollContainer
     * @param event
     * @param scrollEvent
     * @param initiator
     * @private
     */
    private _scrollHandler(event: Event, scrollEvent: Event, initiator: string): void {
        // Код ниже взят из Controls\_popup\Opener\Sticky.ts
        // Из-за флага listenAll на listener'e, подписка доходит до application'a всегда.
        // На ios при показе клавиатуры стреляет событие скролла, что приводит к вызову текущего обработчика
        // и закрытию окна. Для ios отключаю реакцию на скролл, событие скролла стрельнуло на body.
        if (detection.isMobileIOS && (scrollEvent.target === document.body || scrollEvent.target === document)) {
            return;
        }
        this._closePopup();
    }

    /**
     * Инициализирует контрорллере и обновляет в нём данные
     * @private
     */
    protected _updateItemActions(options: IViewOptions): void {
        if (!this._itemActionsController) {
            this._itemActionsController = new ItemActionsController();
        }
        const editingConfig = this._collection.getEditingConfig();
        let editArrowAction: IItemAction;
        if (options.showEditArrow) {
            editArrowAction = {
                id: 'view',
                icon: 'icon-Forward',
                title: rk('Просмотреть'),
                showType: TItemActionShowType.TOOLBAR,
                handler: (item) => {
                    this._notify('editArrowClick', [item]);
                }
            };
        }
        this._itemActionsController.update({
            collection: this._collection,
            itemActions: options.itemActions,
            itemActionsProperty: options.itemActionsProperty,
            visibilityCallback: options.itemActionVisibilityCallback,
            itemActionsPosition: options.itemActionsPosition,
            style: options.itemActionsVisibility === 'visible' ? 'transparent' : options.style,
            theme: options.theme,
            actionAlignment: options.actionAlignment,
            actionCaptionPosition: options.actionCaptionPosition,
            itemActionsClass: options.itemActionsClass,
            iconSize: editingConfig ? 's' : 'm',
            editingToolbarVisible: editingConfig?.toolbarVisibility,
            editArrowAction,
            editArrowVisibilityCallback: options.editArrowVisibilityCallback,
            contextMenuConfig: options.contextMenuConfig
        });
    }

    /**
     * Возвращает contents записи.
     * Если запись - breadcrumbs, то берётся последняя Model из списка contents
     * TODO нужно выпилить этот метод при переписывании моделей. item.getContents() должен возвращать Record
     *  https://online.sbis.ru/opendoc.html?guid=acd18e5d-3250-4e5d-87ba-96b937d8df13
     * @param item
     */
    private static _getItemContents(item: IItemActionsItem): Model {
        let contents = item?.getContents();
        if (item['[Controls/_display/BreadcrumbsItem]']) {
            contents = contents[(contents as any).length - 1];
        }
        return contents;
    };

    static getDefaultOptions(): Partial<IViewOptions> {
        return {
            itemActionsPosition: 'inside',
            actionAlignment: 'horizontal',
            actionCaptionPosition: 'none',
            style: 'default',
            itemActionsVisibility: 'onhover'
        };
    }
}

import * as clone from 'Core/core-clone';
import { Control } from 'UI/Base';
import { Memory } from 'Types/source';
import { isEqual } from 'Types/object';
import { SyntheticEvent } from 'Vdom/Vdom';
import { Model } from 'Types/entity';
import {TItemKey, ISwipeConfig, ANIMATION_STATE, CollectionItem} from 'Controls/display';
import {
    IItemActionsCollection,
    TItemActionVisibilityCallback,
    IItemActionsItem,
    IItemActionsContainer,
    IMenuTemplateOptions,
    TItemActionShowType,
    TItemActionsSize,
    IItemAction,
    TItemActionsPosition,
    TActionCaptionPosition,
    TEditArrowVisibilityCallback,
    TActionDisplayMode
} from './interface/IItemActions';
import { IStickyPopupOptions } from 'Controls/popup';
import { verticalMeasurer } from './measurers/VerticalMeasurer';
import { horizontalMeasurer } from './measurers/HorizontalMeasurer';
import { Utils } from './Utils';
import {IContextMenuConfig} from './interface/IContextMenuConfig';

const DEFAULT_ACTION_ALIGNMENT = 'horizontal';

const DEFAULT_ACTION_CAPTION_POSITION = 'none';

const DEFAULT_ACTION_POSITION = 'inside';

const DEFAULT_ACTION_SIZE = 'm';

export interface IItemActionsControllerOptions {
    /**
     * Коллекция элементов, содержащих операции с записью
     */
    collection: IItemActionsCollection;
    /**
     * Операции с записью
     */
    itemActions: IItemAction[];
    /**
     * @param theme Название текущей темы оформления
     */
    theme: string;
    /**
     * Размер иконок операций с записью
     * варианты 's'|'m'
     */
    iconSize?: TItemActionsSize;
    /**
     * Имя свойства, которое содержит конфигурацию для панели с опциями записи.
     */
    itemActionsProperty?: string;
    /**
     * Функция обратного вызова для определения видимости опций записи.
     */
    visibilityCallback?: TItemActionVisibilityCallback;
    /**
     * Должна ли быть видна панель с кнопками для редактирования
     */
    editingToolbarVisible?: boolean;
    /**
     * Позиция по отношению к записи.
     * Варианты: 'inside' | 'outside' | 'custom'
     */
    itemActionsPosition?: TItemActionsPosition;
    /**
     * Стиль отображения контейнера controls-itemActionsV.
     * Варианты: 'master' | 'default' | 'transparent'
     */
    style?: 'master'|'default'|'transparent';
    /**
     * Класс для установки контейнеру controls-itemActionsV.
     * По умолчанию 'controls-itemActionsV_position_bottomRight'
     */
    itemActionsClass?: string;
    /**
     * Выравнивание опций записи, когда они отображаются в режиме swipe
     * Варианты: 'horizontal' | 'vertical'
     */
    actionAlignment?: 'horizontal'|'vertical';
    /**
     * Позиция заголовка для опций записи, когда они отображаются в режиме swipe.
     */
    actionCaptionPosition?: TActionCaptionPosition;
    /**
     * Опция записи, которую необходимо тображать в свайпе, если есть editArrow
     */
    editArrowAction: IItemAction;
    /**
     * Видимость Опция записи, которую необходимо тображать в свайпе, если есть editArrow
     */
    editArrowVisibilityCallback: TEditArrowVisibilityCallback
    /**
     * Конфигурация для контекстного меню опции записи.
     */
    contextMenuConfig: IContextMenuConfig
}

/**
 * Контроллер, управляющий состоянием ItemActions в коллекции
 * @class Controls/_itemActions/Controller
 * @author Аверкиев П.А
 */
export class Controller {
    private _collection: IItemActionsCollection;
    private _commonItemActions: IItemAction[];
    private _itemActionsProperty: string;
    private _itemActionVisibilityCallback: TItemActionVisibilityCallback;
    private _editArrowVisibilityCallback: TEditArrowVisibilityCallback;
    private _editArrowAction: IItemAction;
    private _contextMenuConfig: IContextMenuConfig;
    private _iconSize: TItemActionsSize;

    private _theme: string;

    /**
     * Метод инициализации и обновления параметров.
     * Для старой модели listViewModel возвращает массив id изменённых значений
     * TODO Когда мы перестанем использовать старую listViewModel,
     *  необходимо будет вычистить return методов update() и _assignActions(). Эти методы будут void
     * @param options
     */
    update(options: IItemActionsControllerOptions): Array<number | string> {
        let result: Array<number | string> = [];
        this._theme = options.theme;
        this._editArrowVisibilityCallback = options.editArrowVisibilityCallback || ((item: Model) => true);
        this._editArrowAction = options.editArrowAction;
        this._contextMenuConfig = options.contextMenuConfig;
        this._iconSize = options.iconSize || DEFAULT_ACTION_SIZE;
        if (!options.itemActions ||
            !isEqual(this._commonItemActions, options.itemActions) ||
            this._itemActionsProperty !== options.itemActionsProperty ||
            this._itemActionVisibilityCallback !== options.visibilityCallback ||
            this._collection !== options.collection
        ) {
            this._collection = options.collection;
            this._commonItemActions = options.itemActions;
            this._itemActionsProperty = options.itemActionsProperty;
            this._itemActionVisibilityCallback = options.visibilityCallback || ((action: IItemAction, item: Model) => true);
        }
        if (this._commonItemActions || this._itemActionsProperty) {
            result = this._assignActions();
        }
        this._calculateActionsTemplateConfig(options);
        return result;
    }

    /**
     * Активирует Swipe для меню операций с записью
     * @param itemKey Ключ элемента коллекции, для которого выполняется действие
     * @param actionsContainerHeight высота контейнера для отображения операций с записью
     */
    activateSwipe(itemKey: TItemKey, actionsContainerHeight: number): void {
        this._setSwipeItem(itemKey);
        this.setSwipeAnimation(ANIMATION_STATE.OPEN);
        const item = this._collection.getItemBySourceKey(itemKey);
        this._collection.setActiveItem(item);

        if (this._collection.getActionsTemplateConfig().itemActionsPosition !== 'outside') {
            this._updateSwipeConfig(actionsContainerHeight);
        }
    }

    /**
     * Деактивирует Swipe для меню операций с записью
     */
    deactivateSwipe(): void {
        this._setSwipeItem(null);
        this._collection.setActiveItem(null);
        this._collection.setSwipeConfig(null);
        this._collection.setSwipeAnimation(null);
    }

    /**
     * Получает последний swiped элемент
     */
    getSwipeItem(): IItemActionsItem {
        return this._collection.find((item) => item.isSwiped());
    }

    /**
     * Устанавливает состояние элемента rightSwiped
     * @param itemKey
     */
    activateRightSwipe(itemKey: TItemKey) {
        this._setSwipeItem(itemKey);
        this.setSwipeAnimation(ANIMATION_STATE.RIGHT_SWIPE);
    }

    /**
     * Собирает конфиг выпадающего меню операций
     * @param item элемент коллекции, для которого выполняется действие
     * @param clickEvent событие клика
     * @param parentAction Родительская операция с записью
     * @param opener: контрол или элемент - опенер для работы системы автофокусов
     * @param isContextMenu Флаг, указывающий на то, что расчёты производятся для контекстного меню
     */
    prepareActionsMenuConfig(
        item: IItemActionsItem,
        clickEvent: SyntheticEvent<MouseEvent>,
        parentAction: IItemAction,
        opener: Element | Control<object, unknown>,
        isContextMenu: boolean
    ): IStickyPopupOptions {
        if (!item) {
            return;
        }
        const menuActions = this._getMenuActions(item, parentAction);

        if (!menuActions || menuActions.length === 0) {
            return;
        }

        // there was a fake target before, check if it is needed
        const target = isContextMenu ? null : this._getFakeMenuTarget(clickEvent.target as HTMLElement);
        const source = new Memory({
            data: menuActions,
            keyProperty: 'id'
        });
        const iconSize = (this._contextMenuConfig && this._contextMenuConfig.iconSize) || this._iconSize;
        const showHeader = parentAction !== null && parentAction !== undefined && !parentAction._isMenu;
        const headConfig = showHeader ? {
            caption: parentAction.title,
            icon: parentAction.icon,
            iconSize
        } : null;
        const templateOptions: IMenuTemplateOptions = {
            source,
            keyProperty: 'id',
            parentProperty: 'parent',
            nodeProperty: 'parent@',
            dropdownClassName: 'controls-itemActionsV__popup',
            closeButtonVisibility: true,
            ...this._contextMenuConfig,
            root: parentAction && parentAction.id,
            showHeader,
            headConfig,
            iconSize
        };
        return {
            opener,
            template: 'Controls/menu:Popup',
            actionOnScroll: 'close',
            target,
            templateOptions,
            closeOnOutsideClick: true,
            targetPoint: {
                vertical: 'top',
                horizontal: 'right'
            },
            direction: {
                horizontal: isContextMenu ? 'right' : 'left'
            },
            className: showHeader ? 'controls-MenuButton_link_iconSize-medium_popup' : '' + `controls-ItemActions__popup__list_theme-${this._theme}`,
            nativeEvent: isContextMenu ? clickEvent.nativeEvent : null,
            autofocus: false
        };
    }

    /**
     * Устанавливает активный Item в коллекции
     * @param item
     */
    setActiveItem(item: IItemActionsItem) {
        this._collection.setActiveItem(item);
    }

    /**
     * Возвращает текущий активный Item
     */
    getActiveItem(): IItemActionsItem {
        return this._collection.getActiveItem();
    }

    /**
     * Устанавливает текущее сосяние анимации в модель
     * @param animation
     */
    setSwipeAnimation(animation: ANIMATION_STATE): void {
        this._collection.setSwipeAnimation(animation);
    }

    /**
     * Возвраащет текущее состояние анимации из модели
     */
    getSwipeAnimation(): ANIMATION_STATE {
        return this._collection.getSwipeAnimation();
    }

    /**
     * Вычисляет операции над записью для каждого элемента коллекции
     * Для старой модели listViewModel возвращает массив id изменённых значений
     * TODO Когда мы перестанем использовать старую listViewModel,
     *  необходимо будет вычистить return методов update() и _assignActions(). Эти методы будут void
     * @private
     */
    private _assignActions(): Array<number | string> {
        let hasChanges = false;
        const changedItemsIds: Array<number | string> = [];
        this._collection.setEventRaising(false, true);
        this._collection.each((item) => {
            if (!item.isActive() && !item['[Controls/_display/GroupItem]']) {
                const contents = Controller._getItemContents(item);
				const actionsContainer = this._fixActionsDisplayOptions(this._getActionsContainer(item));
                const itemChanged = Controller._setItemActions(item, actionsContainer);
                hasChanges = hasChanges || itemChanged;
                if (itemChanged) {
                    changedItemsIds.push(contents.getKey());
                }
            }
        });
        this._collection.setEventRaising(true, true);
        this._collection.setActionsAssigned(true);

        if (hasChanges) {
            this._collection.nextVersion();
        }

        return changedItemsIds;
    }

    /**
     * Получает список операций с записью для указанного элемента коллекции,
     * отфильтрованных по признаку "Должны отображаться в подменю".
     * Если указан parentAction, то операции дополнительно фильтруются по признаку
     * "дочерние по отношению к указанной операции".
     * Если у parentAction отсутствует id (напр, кнопка "Показать меню" ("Шеврон")),
     * будут показаны все элементы не-первого уровня, вне зависимости от того, какой у них родитель.
     * @param item
     * @param parentAction
     */
    private _getMenuActions(item: IItemActionsItem, parentAction: IItemAction): IItemAction[] {
        const actions = item.getActions();
        const allActions = actions && actions.all;
        if (allActions) {
            return allActions.filter((action) => (
                action.showType !== TItemActionShowType.TOOLBAR &&
                (parentAction && !!parentAction.id ? action.parent === parentAction.id : true)
            ));
        }
        return [];
    }

    /**
     * Устанавливает текущий swiped элемент
     * @param key Ключ элемента коллекции, на котором был выполнен swipe
     */
    private _setSwipeItem(key: TItemKey): void {
        const oldSwipeItem = this.getSwipeItem();
        const newSwipeItem = this._collection.getItemBySourceKey(key);

        if (oldSwipeItem) {
            oldSwipeItem.setSwiped(false);
        }
        if (newSwipeItem) {
            newSwipeItem.setSwiped(true);
        }
    }

    /**
     * Запоминает измерения для HTML элемента, к которому привязано выпадающее меню
     * @param realTarget
     */
    private _getFakeMenuTarget(realTarget: HTMLElement): {
        getBoundingClientRect(): ClientRect;
        children: any;
    } {
        const rect = realTarget.getBoundingClientRect();
        return {
            children: [],
            getBoundingClientRect(): ClientRect {
                return rect;
            }
        };
    }

    /**
     * Вычисляет конфигурацию, которая используется в качестве scope у itemActionsTemplate
     */
    private _calculateActionsTemplateConfig(options: IItemActionsControllerOptions): void {
        this._collection.setActionsTemplateConfig({
            toolbarVisibility: options.editingToolbarVisible,
            style: options.style,
            itemActionsClass: options.itemActionsClass,
            size: this._iconSize,
            itemActionsPosition: options.itemActionsPosition || DEFAULT_ACTION_POSITION,
            actionAlignment: options.actionAlignment || DEFAULT_ACTION_ALIGNMENT,
            actionCaptionPosition: options.actionCaptionPosition || DEFAULT_ACTION_CAPTION_POSITION
        });
    }

    /**
     * Набирает операции с записью для указанного элемента коллекции
     * @param item IItemActionsItem
     * @private
     */
    private _collectActionsForItem(item: IItemActionsItem): IItemAction[] {
        const contents = Controller._getItemContents(item);
        const itemActions: IItemAction[] = this._itemActionsProperty
                ? contents.get(this._itemActionsProperty)
                : this._commonItemActions;
        return itemActions.filter((action) =>
            this._itemActionVisibilityCallback(action, contents)
        );
    }

    private _updateSwipeConfig(actionsContainerHeight: number): void {
        const item = this.getSwipeItem();
        if (!item) {
            return;
        }

        let actions = item.getActions().all;
        const actionsTemplateConfig = this._collection.getActionsTemplateConfig();

        if (this._editArrowAction && this._editArrowVisibilityCallback(item)) {
            if (!actions.find((action) => action.id === 'view')) {
                actions = [this._editArrowAction, ...actions];
            }
        }

        let swipeConfig = Controller._calculateSwipeConfig(
            actions,
            actionsTemplateConfig.actionAlignment,
            actionsContainerHeight,
            actionsTemplateConfig.actionCaptionPosition
        );

        if (
            actionsTemplateConfig.actionAlignment !== 'horizontal' &&
            Controller._needsHorizontalMeasurement(swipeConfig)
        ) {
            actionsTemplateConfig.actionAlignment = 'horizontal';
            swipeConfig = Controller._calculateSwipeConfig(
                actions,
                actionsTemplateConfig.actionAlignment,
                actionsContainerHeight,
                actionsTemplateConfig.actionCaptionPosition
            );
            this._collection.setActionsTemplateConfig(actionsTemplateConfig);
        }

        Controller._setItemActions(item, swipeConfig.itemActions);

        if (swipeConfig.twoColumns) {
            const visibleActions = swipeConfig.itemActions.showed;
            swipeConfig.twoColumnsActions = [
                [visibleActions[0], visibleActions[1]],
                [visibleActions[2], visibleActions[3]]
            ];
        }

        this._collection.setSwipeConfig(swipeConfig);
    }

    /**
     * Набирает операции, которые должны быть показаны только в тулбаре или в тулбаре и в меню и возвращает
     * объект {showed, all}
     * @param item
     * @private
     */
    private _getActionsContainer(item: IItemActionsItem): IItemActionsContainer {
        let showed;
        const actions = this._collectActionsForItem(item);
        if (this._collection.isEditing() && !item.isEditing()) {
            showed = []
        } else if (actions.length > 1) {
            showed = actions.filter((action) =>
                    !action.parent &&
                    (
                        action.showType === TItemActionShowType.TOOLBAR ||
                        action.showType === TItemActionShowType.MENU_TOOLBAR
                    )
                );
            if (this._isMenuButtonRequired(actions)) {
                showed.push({
                    id: null,
                    icon: `icon-ExpandDown`,
                    style: 'secondary',
                    iconStyle: 'secondary',
                    _isMenu: true
                });
            }
        } else {
            showed = actions;
        }
        return {
            all: actions,
            showed: showed
        };
    }

    /**
     * Ищет операции, которые должны отображаться только в меню или в меню и тулбаре,
     * и у которых нет родительской операции
     * @param actions
     * @private
     */
    private _isMenuButtonRequired(actions: IItemAction[]): boolean {
        return actions.some(
            (action) =>
                !action.parent &&
                (!action.showType ||
                    action.showType === TItemActionShowType.MENU ||
                    action.showType === TItemActionShowType.MENU_TOOLBAR)
        );
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

    /**
     * Обновляет параметры отображения операций с записью
     * @param actions
     * @private
     */
    private _fixActionsDisplayOptions(actions: IItemActionsContainer): IItemActionsContainer {
        if (actions.all && actions.all.length) {
            actions.all = actions.all.map((action) => {
                action.style = Utils.getStyle(action.style, 'itemActions/Controller');
                action.iconStyle = Utils.getStyle(action.iconStyle, 'itemActions/Controller');
                action.tooltip = Controller._getTooltip(action);
                return action;
            });
        }
        if (actions.showed && actions.showed.length) {
            actions.showed = clone(actions.showed).map((action) => {
                action.icon = Controller._fixActionIconClass(action.icon, this._theme);
                action.showIcon = Controller._needShowIcon(action);
                action.showTitle = Controller._needShowTitle(action);
                return action;
            });
        }
        return actions
    }

    /**
     * Рассчитывает значение для флага showIcon операции с записью
     * @param action
     * @private
     */
    private static _needShowIcon(action: IItemAction): boolean {
        return !!action.icon && (action.displayMode !== TActionDisplayMode.TITLE);
    }

    /**
     * Рассчитывает значение для флага showTitle операции с записью
     * @param action
     * @private
     */
    private static _needShowTitle(action: IItemAction): boolean {
        return !!action.title && (action.displayMode === TActionDisplayMode.TITLE ||
            action.displayMode === TActionDisplayMode.BOTH ||
            (action.displayMode === TActionDisplayMode.AUTO ||
                !action.displayMode) && !action.icon);
    }

    /**
     * Возвращает значение для tooltip операции с записью
     * @param action
     * @private
     */
    private static _getTooltip(action: IItemAction): string|undefined {
        return action.tooltip || action.title;
    }

    /**
     * Устанавливает операции с записью для конкретного элемента коллекции
     * @param item
     * @param actions
     * @private
     */
    private static _setItemActions(
        item: IItemActionsItem,
        actions: IItemActionsContainer
    ): boolean {
        const oldActions = item.getActions();
        if (!oldActions || (actions && !this._isMatchingActions(oldActions, actions))) {
            item.setActions(actions, true);
            return true;
        }
        return false;
    }

    private static _isMatchingActions(
        oldContainer: IItemActionsContainer,
        newContainer: IItemActionsContainer
    ): boolean {
        return (
            this._isMatchingActionLists(oldContainer.all, newContainer.all) &&
            this._isMatchingActionLists(oldContainer.showed, newContainer.showed)
        );
    }

    private static _calculateSwipeConfig(
        actions: IItemAction[],
        actionAlignment: string,
        actionsContainerHeight: number,
        actionCaptionPosition: 'right'|'bottom'|'none'
    ): ISwipeConfig {
        const measurer = actionAlignment === 'vertical' ? verticalMeasurer : horizontalMeasurer;
        const config: ISwipeConfig = measurer.getSwipeConfig(
            actions,
            actionsContainerHeight,
            actionCaptionPosition
        );
        config.needTitle = measurer.needTitle;
        config.needIcon = measurer.needIcon;
        return config;
    }

    private static _needsHorizontalMeasurement(config: ISwipeConfig): boolean {
        const actions = config.itemActions;
        return (
            actions &&
            actions.showed?.length === 1 &&
            actions.all?.length > 1
        );
    }

    private static _fixActionIconClass(icon: string, theme: string): string {
        if (!icon || icon.includes(this._resolveItemActionClass(theme))) {
            return icon;
        }
        return `${icon} ${this._resolveItemActionClass(theme)}`
    }

    private static _resolveItemActionClass(theme: string): string {
        return `controls-itemActionsV__action_icon_theme-${theme} icon-size_theme-${theme}`;
    }

    private static _isMatchingActionLists(
        aActions: IItemAction[],
        bActions: IItemAction[]
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
}

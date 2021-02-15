import * as clone from 'Core/core-clone';
import {Control} from 'UI/Base';
import {Memory} from 'Types/source';
import {isEqual} from 'Types/object';
import {SyntheticEvent} from 'Vdom/Vdom';
import {Model} from 'Types/entity';
import {TItemKey, ISwipeConfig, ANIMATION_STATE} from 'Controls/display';
import {IStickyPopupOptions} from 'Controls/popup';
import {IMenuPopupOptions} from 'Controls/menu';
import {
    TItemActionVisibilityCallback,
    TItemActionShowType,
    TItemActionsSize,
    IItemAction,
    TItemActionsPosition,
    TActionCaptionPosition,
    TEditArrowVisibilityCallback,
    TActionDisplayMode,
    TMenuButtonVisibility
} from './interface/IItemAction';
import {IItemActionsItem} from './interface/IItemActionsItem';
import {IItemActionsCollection} from './interface/IItemActionsCollection';
import {IShownItemAction, IItemActionsObject} from './interface/IItemActionsObject';
import {verticalMeasurer} from './measurers/VerticalMeasurer';
import {horizontalMeasurer} from './measurers/HorizontalMeasurer';
import {Utils} from './Utils';
import {IContextMenuConfig} from './interface/IContextMenuConfig';
import {DependencyTimer} from 'Controls/popup';
import * as mStubs from 'Core/moduleStubs';
import {getActions} from './measurers/ItemActionMeasurer';
import {TItemActionsVisibility} from './interface/IItemActionsOptions';


const DEFAULT_ACTION_ALIGNMENT = 'horizontal';

const DEFAULT_ACTION_CAPTION_POSITION = 'none';

const DEFAULT_ACTION_POSITION = 'inside';

const DEFAULT_ACTION_SIZE = 'm';

const DEFAULT_ACTION_MODE = 'strict';

/**
 * @interface Controls/_itemActions/Controller/IControllerOptions
 * @public
 * @author Аверкиев П.А.
 */
export interface IControllerOptions {
    /**
     * Коллекция элементов, содержащих операции с записью
     */
    collection: IItemActionsCollection;
    /**
     * Операции с записью
     */
    itemActions: IItemAction[];
    /**
     * Название текущей темы оформления
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
     * Класс для установки контейнеру controls-itemActionsV.
     * По умолчанию 'controls-itemActionsV_position_bottomRight'
     */
    itemActionsClass?: string;
    /**
     * Выравнивание опций записи, когда они отображаются в режиме swipe
     * Варианты: 'horizontal' | 'vertical'
     */
    actionAlignment?: 'horizontal' | 'vertical';
    /**
     * Позиция заголовка для опций записи, когда они отображаются в режиме swipe.
     */
    actionCaptionPosition?: TActionCaptionPosition;
    /**
     * Опция записи, которую необходимо тображать в свайпе, если есть editArrow
     */
    editArrowAction?: IItemAction;
    /**
     * Видимость Опция записи, которую необходимо тображать в свайпе, если есть editArrow
     */
    editArrowVisibilityCallback?: TEditArrowVisibilityCallback;
    /**
     * Конфигурация для контекстного меню опции записи.
     */
    contextMenuConfig?: IContextMenuConfig;
    /**
     * Редактируемая запись
     */
    editingItem?: IItemActionsItem;

    actionMode: 'strict' | 'adaptive';
    /**
     * @name Controls/_itemActions/Controller/IControllerOptions#itemActionsVisibility
     * @cfg {Controls/_itemActions/interface/IItemActionsOptions/TItemActionsVisibility.typedef} Отображение опций записи с задержкой или без.
     */
    itemActionsVisibility: TItemActionsVisibility
}

/**
 * Контроллер, управляющий состоянием ItemActions в коллекции
 * @class Controls/_itemActions/Controller
 * @public
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
    private _actionMode: 'adaptive' | 'strict';
    // вариант расположения опций в свайпе на момент инициализации
    private _actionsAlignment: 'horizontal' | 'vertical';

    private _theme: string;

    // Ширина опций записи для рассчётов свайп-конфига после изменения видимости опций записи
    private _actionsWidth: number;

    // Высота опций записи для рассчётов свайп-конфига после изменения видимости опций записи
    private _actionsHeight: number;

    // Текущее позиционирование опций записи
    private _itemActionsPosition: TItemActionsPosition;

    private _activeItemKey: any;

    // Таймер для погрузки зависимостей
    private _dependenciesTimer: DependencyTimer = null;

    private _loadMenuTempPromise: Promise<>;

    // Видимость опций записи
    private _itemActionsVisibility: TItemActionsVisibility;

    private _savedItemActions: IItemActionsObject;

    /**
     * Метод инициализации и обновления параметров.
     * Для старой модели listViewModel возвращает массив id изменённых значений
     * TODO Когда мы перестанем использовать старую listViewModel,
     *  необходимо будет вычистить return методов update() и _updateItemActions(). Эти методы будут void
     * @param options
     */
    update(options: IControllerOptions): Array<number | string> {
        let result: Array<number | string> = [];
        this._theme = options.theme;
        this._editArrowVisibilityCallback = options.editArrowVisibilityCallback || ((item: Model) => true);
        this._editArrowAction = options.editArrowAction;
        this._contextMenuConfig = options.contextMenuConfig;
        this._actionMode = options.actionMode || DEFAULT_ACTION_MODE;
        this._iconSize = options.iconSize || DEFAULT_ACTION_SIZE;
        this._actionsAlignment = options.actionAlignment || DEFAULT_ACTION_ALIGNMENT;
        this._itemActionsPosition = options.itemActionsPosition || DEFAULT_ACTION_POSITION;
        this._collection = options.collection;
        this._itemActionsVisibility = options.itemActionsVisibility;
        this._updateActionsTemplateConfig(options);

        if (!options.itemActions ||
            !isEqual(this._commonItemActions, options.itemActions) ||
            this._itemActionsProperty !== options.itemActionsProperty ||
            this._itemActionVisibilityCallback !== options.visibilityCallback
        ) {
            this._commonItemActions = options.itemActions;
            this._itemActionsProperty = options.itemActionsProperty;
            this._itemActionVisibilityCallback = options.visibilityCallback ||
                ((action: IItemAction, item: Model, isEditing: boolean) => true);
        }
        if (this._commonItemActions || this._itemActionsProperty) {
            result = this._updateItemActions(options.editingItem);
        }
        return result;
    }

    /**
     * Активирует Swipe для меню операций с записью
     * @param itemKey Ключ элемента коллекции, для которого выполняется действие
     * @param actionsContainerWidth ширина контейнера для расчёта видимых опций записи
     * @param actionsContainerHeight высота контейнера для расчёта видимых опций записи
     */
    activateSwipe(itemKey: TItemKey, actionsContainerWidth: number, actionsContainerHeight: number): void {
        const item = this._collection.getItemBySourceKey(itemKey);
        item.setSwipeAnimation(ANIMATION_STATE.OPEN);
        if (this._itemActionsVisibility === 'visible') {
            this._saveItemActions(item);
        }
        this._setSwipeItem(itemKey);
        this._collection.setActiveItem(item);
        if (this._itemActionsPosition !== 'outside') {
            this._updateSwipeConfig(actionsContainerWidth, actionsContainerHeight);

        } else if (this._editArrowAction && this._editArrowVisibilityCallback(item.getContents())) {
            this._addEditArrow(item.getActions().showed);
        }
        this._collection.nextVersion();
    }

    updateItemActions(itemKey: TItemKey, containerWidth: number): void {
        const item = this._collection.getItemBySourceKey(itemKey);
        const actions = item.getActions();
        const visibleActions = getActions(actions, this._iconSize, null, containerWidth);
        item.setActions(this._fixActionsDisplayOptions(visibleActions), true);
    }

    /**
     * Деактивирует Swipe для меню операций с записью
     */
    deactivateSwipe(resetActiveItem: boolean = true): void {
        const currentSwipedItem = this.getSwipeItem();
        if (currentSwipedItem) {
            currentSwipedItem.setSwipeAnimation(null);
            if (this._itemActionsVisibility === 'visible') {
                this._restoreItemActions(currentSwipedItem);
            }
            this._setSwipeItem(null);
            if (resetActiveItem) {
                this._collection.setActiveItem(null);
            }
            this._collection.setSwipeConfig(null);
            this._collection.nextVersion();
        }
    }

    /**
     * Получает последний swiped элемент
     */
    getSwipeItem(): IItemActionsItem {
        return this._collection.find((item) => item.isSwiped());
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
        parentAction: IShownItemAction,
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

        const target = isContextMenu ? null : this._cloneMenuTarget(clickEvent.target as HTMLElement);
        const isActionMenu = !!parentAction && !parentAction.isMenu;
        const templateOptions = this._getActionsMenuTemplateConfig(item, isActionMenu, parentAction, menuActions);

        let menuConfig: IStickyPopupOptions = {
            // @ts-ignore
            opener,
            template: 'Controls/menu:Popup',
            actionOnScroll: 'close',
            // @ts-ignore
            target,
            templateOptions,
            className: `controls-MenuButton_link_iconSize-medium_popup theme_${this._theme}`,
            closeOnOutsideClick: true,
            autofocus: false,
            fittingMode: {
                vertical: 'overflow',
                horizontal: 'adaptive'
            },
            readOnly: false
        };
        if (!isActionMenu) {
            menuConfig = {
                ...menuConfig,
                direction: {
                    horizontal: isContextMenu ? 'right' : 'left'
                },
                targetPoint: {
                    vertical: 'top',
                    horizontal: 'right'
                },
                className: `controls-ItemActions__popup__list_theme-${this._theme}`,
                // @ts-ignore
                nativeEvent: isContextMenu ? clickEvent.nativeEvent : null
            };
        }
        return menuConfig;
    }

    /**
     * Устанавливает активный Item в коллекции
     * @param item Текущий элемент коллекции
     */
    setActiveItem(item: IItemActionsItem): void {
        this._collection.setActiveItem(item);
        if (item && typeof item.getContents !== 'undefined' && typeof item.getContents().getKey !== 'undefined') {
            this._activeItemKey = item.getContents().getKey();
        }
    }

        /**
     * Возвращает текущий активный Item
     */
    getActiveItem(): IItemActionsItem {
        let activeItem = this._collection.getActiveItem();

        /**
         * Проверяем что элемент существует, в противном случае пытаемся его найти.
         */
        if (activeItem === undefined &&
           (typeof this._collection.getItemBySourceKey !== 'undefined' && this._activeItemKey)
        ) {
            activeItem = this._collection.getItemBySourceKey(this._activeItemKey);
        }
        return activeItem;
    }

    /**
     * Устанавливает текущее состояние анимации в модель
     */
    startSwipeCloseAnimation(): void {
        const swipeItem = this.getSwipeItem();
        swipeItem.setSwipeAnimation(ANIMATION_STATE.CLOSE);
    }

    /**
     * Стартует таймер загрузки зависимостей меню
     * @remark
     * Рендер контрола Controls/dropdown:Button намного дороже, поэтому вместо menuButton используем текущую вёрстку и таймеры
     */
    startMenuDependenciesTimer(): void {
        if (!this._dependenciesTimer) {
            this._dependenciesTimer = new DependencyTimer();
        }
        this._dependenciesTimer.start(this._loadDependencies.bind(this));
    }

    /**
     * Останавливает таймер и фактически загружает все зависимости
     */
    stopMenuDependenciesTimer(): void {
        this._dependenciesTimer?.stop();
    }

    /**
     * Возвращает конфиг для шаблона меню опций
     * @param item элемент коллекции, для которого выполняется действие
     * @param isActionMenu
     * @param parentAction
     * @param menuActions
     * @private
     */
    private _getActionsMenuTemplateConfig(
        item: IItemActionsItem,
        isActionMenu: boolean,
        parentAction: IItemAction,
        menuActions: IItemAction[]
    ): IMenuPopupOptions {
        const source = new Memory({
            data: menuActions,
            keyProperty: 'id'
        });
        const iconSize = (this._contextMenuConfig && this._contextMenuConfig.iconSize) || DEFAULT_ACTION_SIZE;
        const headConfig = isActionMenu ? {
            caption: parentAction.title,
            icon: parentAction.icon,
            iconSize
        } : null;
        const root = parentAction && parentAction.id;
        return {
            source,
            footerItemData: {
                item,
                key: Controller._getItemContents(item).getKey()
            },
            keyProperty: 'id',
            parentProperty: 'parent',
            nodeProperty: 'parent@',
            dropdownClassName: 'controls-itemActionsV__popup',
            ...this._contextMenuConfig,
            root,
            // @ts-ignore
            showHeader: isActionMenu,
            headConfig,
            iconSize,
            closeButtonVisibility: !isActionMenu && !root
        };
    }

    private _loadDependencies(): Promise<unknown[]> {
        if (!this._loadMenuTempPromise) {
            const templatesToLoad = ['Controls/menu'];
            if (this._contextMenuConfig) {
                const templates = ['headerTemplate', 'footerTemplate', 'itemTemplate', 'groupTemplate'];
                templates.forEach((template) => {
                    if (typeof this._contextMenuConfig[template] === 'string') {
                        templatesToLoad.push(this._contextMenuConfig[template]);
                    }
                });
            }
            this._loadMenuTempPromise = mStubs.require(templatesToLoad).then((loadedDeps) => {
                return loadedDeps[0].Control.loadCSS(this._theme);
            });
        }
        return this._loadMenuTempPromise;
    }

    /**
     * Вычисляет операции над записью для каждого элемента коллекции
     * Для старой модели listViewModel возвращает массив id изменённых значений
     * TODO Когда мы перестанем использовать старую listViewModel,
     *  необходимо будет вычистить return методов update() и _updateItemActions(). Эти методы будут void
     * @private
     */
    private _updateItemActions(editingItem?: IItemActionsItem): Array<number | string> {
        let hasChanges = false;
        const changedItemsIds: Array<number | string> = [];
        const assignActionsOnItem = (item): void => {
            if (!item['[Controls/_display/GroupItem]'] && !item['[Controls/_display/SearchSeparator]']) {
                const contents = Controller._getItemContents(item);
                const actionsObject = this._fixActionsDisplayOptions(this._getActionsObject(item));
                const itemChanged = Controller._setItemActions(item, actionsObject, this._actionMode);
                hasChanges = hasChanges || itemChanged;
                if (itemChanged) {
                    changedItemsIds.push(contents.getKey());
                }
            }
        };
        if (this._collection.isEventRaising()) {
            this._collection.setEventRaising(false, true);
        }
        this._collection.each(assignActionsOnItem);
        if (editingItem) {
            assignActionsOnItem(editingItem);
        }
        if (!this._collection.isEventRaising()) {
            this._collection.setEventRaising(true, true);
        }
        this._collection.setActionsAssigned(true);

        if (hasChanges) {
            // Если поменялась видимость ItemActions через VisibilityCallback, то надо обновить конфиг свайпа
            if (this._itemActionsPosition !== 'outside') {
                this._updateSwipeConfig(this._actionsWidth, this._actionsHeight);
            }
            this._collection.nextVersion();
        }

        return changedItemsIds;
    }

    /**
     * Получает для указанного элемента коллекции набор опций записи для меню, отфильтрованный по parentAction
     * Если parentAction - кнопка вызова меню или parentAction не указан, то элементы фильтруются по showType.
     * Если parentAction содержит id, то элементы фильтруются по parent===id.
     * Если был сделан свайп по элементу, то возвращаются опции записи, отсутствующие в showed.
     * @see http://axure.tensor.ru/standarts/v7/%D1%81%D0%B2%D0%B0%D0%B9%D0%BF__version_04_.html
     * @param item
     * @param parentAction
     * @private
     */
    private _getMenuActions(item: IItemActionsItem, parentAction: IShownItemAction): IItemAction[] {
        const contents = Controller._getItemContents(item);
        const actionsObject = item.getActions();
        const visibleActions = actionsObject && actionsObject.all && this._filterVisibleActions(actionsObject.all, contents, item.isEditing());
        if (visibleActions) {
            // Кроме как intersection all vs showed мы не можем знать, какие опции Measurer скрыл под кнопку "Ещё",
            // Поэтому для свайпнутой записи имеет смысл показывать в меню те опции, которые отсутствуют в showed
            // массиве или у которых showType MENU_TOOLBAR или MENU
            // см. https://online.sbis.ru/opendoc.html?guid=f43a6f8e-84a5-4f22-b67f-4545bf586adc
            // см. https://online.sbis.ru/opendoc.html?guid=91e7bea1-fa6c-483f-a5dc-860b084ab17a
            // см. https://online.sbis.ru/opendoc.html?guid=b5751217-3833-441f-9eb6-53526625bc0c
            if (item.isSwiped() && parentAction.isMenu) {
                return visibleActions.filter((action) => (
                    !this._hasActionInArray(action, actionsObject.showed) || action.showType !== TItemActionShowType.TOOLBAR)
                );
            }
            return visibleActions.filter((action) => (
                ((!parentAction || parentAction.isMenu) && action.showType !== TItemActionShowType.TOOLBAR) ||
                (!!parentAction && !parentAction.isMenu && action.parent === parentAction.id)
            ));
        }
        return [];
    }

    private _hasActionInArray(action: IItemAction, actions: IItemAction[]): boolean {
        return actions.some((item) => item.id === action.id);
    }

    /**
     * Устанавливает текущий swiped элемент
     * @param key Ключ элемента коллекции, на котором был выполнен swipe
     * @param silent Если true, коллекция не отправит onCollectionChange
     */
    private _setSwipeItem(key: TItemKey, silent?: boolean): void {
        const oldSwipeItem = this.getSwipeItem();
        const newSwipeItem = this._collection.getItemBySourceKey(key);

        if (oldSwipeItem) {
            oldSwipeItem.setSwiped(false, silent);
        }
        if (newSwipeItem) {
            newSwipeItem.setSwiped(true, silent);
        }
    }

    /**
     * В процессе открытия меню, запись может пререрисоваться, и таргета не будет в DOM.
     * Поэтому заменяем метод getBoundingClientRect так, чтобы он возвращал текущие координаты
     * @param realTarget
     */
    private _cloneMenuTarget(realTarget: HTMLElement): HTMLElement {
        const rect = realTarget.getBoundingClientRect();
        return {
            ...clone(realTarget),
            getBoundingClientRect(): ClientRect {
                return rect;
            }
        };
    }

    /**
     * Вычисляет конфигурацию, которая используется в качестве scope у itemActionsTemplate
     */
    private _updateActionsTemplateConfig(options: IControllerOptions): void {
        this._collection.setActionsTemplateConfig({
            toolbarVisibility: options.editingToolbarVisible,
            itemActionsClass: options.itemActionsClass,
            size: this._iconSize,
            itemActionsPosition: this._itemActionsPosition,
            actionAlignment: this._actionsAlignment,
            actionCaptionPosition: options.actionCaptionPosition || DEFAULT_ACTION_CAPTION_POSITION
        });
    }

    private _updateSwipeConfig(actionsContainerWidth: number, actionsContainerHeight: number): void {
        const item = this.getSwipeItem();
        if (!item) {
            return;
        }
        const contents = Controller._getItemContents(item);
        const menuButtonVisibility = this._getSwipeMenuButtonVisibility(this._contextMenuConfig);
        this._actionsWidth = actionsContainerWidth;
        this._actionsHeight = actionsContainerHeight;
        const actions = this._filterVisibleActions(item.getActions().all, contents, item.isEditing());
        const actionsTemplateConfig = this._collection.getActionsTemplateConfig();
        actionsTemplateConfig.actionAlignment = this._actionsAlignment;

        if (this._editArrowAction && this._editArrowVisibilityCallback(contents)) {
            this._addEditArrow(actions);
        }

        let swipeConfig = Controller._calculateSwipeConfig(
            actions,
            actionsTemplateConfig.actionAlignment,
            actionsContainerWidth,
            actionsContainerHeight,
            actionsTemplateConfig.actionCaptionPosition,
            menuButtonVisibility,
            this._theme
        );

        if (
            actionsTemplateConfig.actionAlignment !== 'horizontal' &&
            Controller._needsHorizontalMeasurement(swipeConfig)
        ) {
            actionsTemplateConfig.actionAlignment = 'horizontal';
            swipeConfig = Controller._calculateSwipeConfig(
                actions,
                actionsTemplateConfig.actionAlignment,
                actionsContainerWidth,
                actionsContainerHeight,
                actionsTemplateConfig.actionCaptionPosition,
                menuButtonVisibility,
                this._theme
            );
        }
        this._collection.setActionsTemplateConfig(actionsTemplateConfig);
        Controller._setItemActions(item, swipeConfig.itemActions, this._actionMode);

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
     * Добавляет editArrow к переданному массиву actions
     * @param actions
     * @private
     */
    private _addEditArrow(actions: IItemAction[]): void {
        if (!actions.find((action) => action.id === 'view')) {
            actions.unshift(this._fixShownActionOptions(this._editArrowAction));
        }
    }

    private _saveItemActions(item: IItemActionsItem): void {
        this._savedItemActions = item.getActions();
    }

    private _restoreItemActions(item: IItemActionsItem): void {
        if (this._savedItemActions) {
            item.setActions(this._savedItemActions)
        }
    }

    /**
     * Возвращает значение видимоси кнопки "Ещё" для свайпа
     * @param contextMenuConfig
     * @private
     */
    private _getSwipeMenuButtonVisibility(contextMenuConfig: IContextMenuConfig): TMenuButtonVisibility {
        return (contextMenuConfig && (contextMenuConfig.footerTemplate
            || contextMenuConfig.headerTemplate)) ? 'visible' : 'adaptive';
    }

    /**
     * Набирает операции, которые должны быть показаны только в тулбаре или в тулбаре и в меню и возвращает
     * объект {showed, all}
     * @param item
     * @private
     */
    private _getActionsObject(item: IItemActionsItem): IItemActionsObject {
        let showed;
        const contents = Controller._getItemContents(item);
        const all = this._itemActionsProperty
            ? contents.get(this._itemActionsProperty)
            : this._commonItemActions;
        const visibleActions = this._filterVisibleActions(all, contents, item.isEditing());
        if (this._isEditing(item)) {
            showed = [];
        } else if (visibleActions.length > 1) {
            showed = visibleActions.filter((action) =>
                !action.parent &&
                (
                    action.showType === TItemActionShowType.TOOLBAR ||
                    action.showType === TItemActionShowType.MENU_TOOLBAR
                )
            );
            if (this._isMenuButtonRequired(visibleActions)) {
                showed.push({
                    id: null,
                    icon: 'icon-SettingsNew',
                    style: 'secondary',
                    iconStyle: 'secondary',
                    isMenu: true
                });
            }
        } else {
            showed = visibleActions;
        }
        return { all, showed };
    }

    private _filterVisibleActions(itemActions: IItemAction[], contents: Model, isEditing: boolean): IItemAction[] {
        return itemActions.filter((action) =>
            this._itemActionVisibilityCallback(action, contents, isEditing)
        );
    }

    /**
     * Если в коллекции и у элементов есть методы для проверки редактирования,
     * то учитываем их значение
     * @param item
     * @private
     */
    private _isEditing(item: IItemActionsItem): boolean {
        return this._collection.isEditing() && !item.isEditing();
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
     * Настройка параметров отображения для опций записи, которые показываются
     * при наведении на запись или при свайпе и itemActionsPosition === 'outside'
     * @param action
     * @private
     */
    private _fixShownActionOptions(action: IShownItemAction): IShownItemAction {
        action.icon = Controller._fixActionIconClass(action.icon, this._theme);
        action.showIcon = Controller._needShowIcon(action);
        action.showTitle = Controller._needShowTitle(action);
        return action;
    }

    /**
     * Обновляет параметры отображения операций с записью
     * @param actionsObject
     * @private
     */
    private _fixActionsDisplayOptions(actionsObject: IItemActionsObject): IItemActionsObject {
        if (actionsObject.all && actionsObject.all.length) {
            actionsObject.all = actionsObject.all.map((action) => {
                action.style = Utils.getStyle(action.style, 'itemActions/Controller');
                action.iconStyle = Utils.getStyle(action.iconStyle, 'itemActions/Controller');
                action.tooltip = Controller._getTooltip(action);
                return action;
            });
        }
        if (actionsObject.showed && actionsObject.showed.length) {
            const fixShowOptionsBind = this._fixShownActionOptions.bind(this);
            actionsObject.showed = clone(actionsObject.showed).map(fixShowOptionsBind);
        }
        return actionsObject;
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
    private static _getTooltip(action: IItemAction): string | undefined {
        return action.tooltip || action.title;
    }

    /**
     * Устанавливает операции с записью для конкретного элемента коллекции
     * @param item
     * @param actionsObject
     * @param actionMode
     * @private
     */
    private static _setItemActions(
        item: IItemActionsItem,
        actionsObject: IItemActionsObject,
        actionMode: string
    ): boolean {
        const oldActionsObject = item.getActions();
        if (!oldActionsObject || (actionsObject && !this._isMatchingActions(oldActionsObject, actionsObject, actionMode, item.isSwiped()))) {
            item.setActions(actionsObject, true);
            return true;
        }
        return false;
    }

    private static _isMatchingActions(
        oldActionsObject: IItemActionsObject,
        newActionsObject: IItemActionsObject,
        actionMode: string,
        isSwipedItem: boolean
    ): boolean {
        const isMatchedAll = this._isMatchingActionLists(oldActionsObject.all, newActionsObject.all);
        const isMatchedShowed = this._isMatchingActionLists(oldActionsObject.showed, newActionsObject.showed);
        return actionMode === 'adaptive' && !isSwipedItem ? isMatchedAll : (isMatchedAll && isMatchedShowed);
    }

    private static _calculateSwipeConfig(
        actions: IItemAction[],
        actionAlignment: string,
        actionsContainerWidth: number,
        actionsContainerHeight: number,
        actionCaptionPosition: TActionCaptionPosition,
        menuButtonVisibility: TMenuButtonVisibility,
        theme: string
    ): ISwipeConfig {
        const measurer = actionAlignment === 'vertical' ? verticalMeasurer : horizontalMeasurer;
        const config: ISwipeConfig = measurer.getSwipeConfig(
            actions,
            actionsContainerWidth,
            actionsContainerHeight,
            actionCaptionPosition,
            menuButtonVisibility,
            theme
        );
        config.needTitle = measurer.needTitle;
        config.needIcon = measurer.needIcon;
        return config;
    }

    private static _needsHorizontalMeasurement(config: ISwipeConfig): boolean {
        const actionsObject = config.itemActions;
        return (
            actionsObject &&
            actionsObject.showed?.length === 1 &&
            actionsObject.all?.length > 1
        );
    }

    private static _fixActionIconClass(icon: string, theme: string): string {
        if (!icon || icon.includes(this._resolveItemActionClass(theme))) {
            return icon;
        }
        return `${icon} ${this._resolveItemActionClass(theme)}`;
    }

    private static _resolveItemActionClass(theme: string): string {
        return `controls-itemActionsV__action_icon_theme-${theme}`;
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

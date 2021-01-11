import {Model} from 'Types/entity';

/**
 * @typedef {String} TItemActionShowType
 * @description
 * Позволяет настроить, какие опции записи будут показаны по ховеру, а какие - в доп.меню.
 * Влияет на порядок отображения опций записи по свайпу.
 * Экспортируемый enum: Controls/itemActions:TItemActionShowType
 * @variant MENU показывать опцию только в дополнительном меню
 * @variant MENU_TOOLBAR показывать опцию в дополнительном меню и тулбаре
 * @variant TOOLBAR показывать опцию только в тулбаре
 */
export enum TItemActionShowType {
    // show only in Menu
    MENU,
    // show in Menu and Toolbar
    MENU_TOOLBAR,
    // show only in Toolbar
    TOOLBAR
}

/**
 * @typedef {String} TActionDisplayMode
 * @description
 * Позволяет настроить режим отображения заголовка и иконки опций записи.
 * Экспортируемый enum: Controls/itemActions:TActionDisplayMode
 * @variant TITLE показывать только заголовок
 * @variant ICON показывать только иконку
 * @variant BOTH показывать иконку и заголовок
 * @variant AUTO если есть иконка, то показывать иконку, иначе заголовок
 */
export enum TActionDisplayMode {
    TITLE = 'title',
    ICON = 'icon',
    BOTH = 'both',
    AUTO = 'auto'
}

/**
 * @typedef {String} TIconStyle
 * @variant secondary
 * @variant warning
 * @variant danger
 * @variant success
 */
export type TIconStyle = 'secondary' | 'warning' | 'danger' | 'success';

/**
 * @typedef {String} TActionCaptionPosition
 * @variant right Справа от иконки опции записи.
 * @variant bottom Под иконкой опции записи.
 * @variant none Не будет отображаться.
 */
export type TActionCaptionPosition = 'right' | 'bottom' | 'none';

/**
 * @typedef {String} TItemActionsPosition
 * @variant inside Внутри элемента.
 * @variant outside Под элементом.
 * @variant custom Произвольная позиция отображения. Задаётся через шаблон {@link Controls/interface/IItemTemplate itemTemplate}.
 */
export type TItemActionsPosition = 'inside' | 'outside' | 'custom';

/**
 * @typedef {String} TItemActionsSize
 * Размер иконок опций записи
 * @variant inside Внутри элемента.
 * @variant outside Под элементом.
 */
export type TItemActionsSize = 'm' | 'l';

/**
 * @typedef {String} TMenuButtonVisibility
 * Видимость кнопки "Ещё" в свайпе
 * @variant visible - кнопка видима в любом случае
 * @variant adaptive - Расчёт происходит от количесива элементов в свайпе
 */
export type TMenuButtonVisibility = 'visible' | 'adaptive';

/**
 * @typedef {Function} TItemActionHandler
 * @description
 * Обработчик опции записи. См. {@link /doc/platform/developmentapl/interface-development/controls/list/actions/item-actions/handler/ пример обработчика}.
 * @param item Corresponding list item.
 */
export type TItemActionHandler = (item: Model) => void;

/**
 * Интерфейс {@link /doc/platform/developmentapl/interface-development/controls/list/actions/item-actions/ опций записи}.
 * @interface Controls/_itemActions/interface/IItemAction
 * @remark
 * Опции записи могут быть использованы в следующих вариантах:
 * 
 * 1. Панель опций записи, отображаемая в desktop браузерах
 * 2. Панель опций записи, появляющаяся при свайпе по записи влево.
 * 3. Всплывающее меню, появляющееся при нажатии на кнопку дополнительных опций записи.
 * 4. Всплывающее (контекстное) меню, появляющееся при нажатии правой кнопкой мыши.
 * @public
 * @author Аверкиев П.А.
 */

/*
 * Interface describing configuration for a button which will be shown when the user hovers over a list item.
 * @interface Controls/_itemActions/interface/IItemAction
 * @public
 * @author Аверкиев П.А.
 */
export interface IItemAction {
    /**
     * @name Controls/_itemActions/itemActions/interface/IItemAction#id
     * @cfg {String|Number} Идентификатор опции записи
     */
    /*
     * @name Controls/_itemActions/interface/IItemAction#id
     * @cfg {String|Number} Identifier of the action.
     */
    id: string | number;

    /**
     * @name Controls/_itemActions/interface/IItemAction#title
     * @cfg {String} Название опции записи.
     */
    /*
     * @name Controls/_itemActions/interface/IItemAction#title
     * @cfg {String} Action name.
     */
    title?: string;

    /**
     * @name Controls/_itemActions/interface/IItemAction#icon
     * @cfg {String} Имя иконки для опции записи.
     */
    /*
     * @name Controls/_itemActions/interface/IItemAction#icon
     * @cfg {String} Action's icon.
     */
    icon?: string;

    /**
     * @name Controls/_itemActions/interface/IItemAction#showType
     * @default MENU
     * @cfg {TItemActionShowType} Определяет, где будет отображаться элемент.
     */
    /*
     * @name Controls/_itemActions/interface/IItemAction#showType
     * @default MENU
     * @cfg {TItemActionShowType} Determines where item is displayed.
     */
    showType?: TItemActionShowType;

    /**
     * @name Controls/_itemActions/interface/IItemAction#style
     * @cfg {TIconStyle} стиль контейнера опции записи
     * @remark
     * Значение свойства преобразуется в CSS-класс вида "controls-itemActionsV__action_style_<значение_свойства>".
     * Он будет установлен для html-контейнера самой опции записи,
     * и свойства класса будут применены как к {@link Controls/_itemActions/interface/IItemAction#title тексту}, так и к {@link Controls/_itemActions/interface/IItemAction#icon иконке}.
     */
    /*
     * @name Controls/_itemActions/interface/IItemAction#style
     * @cfg {TIconStyle} Operation style. (secondary | warning | danger | success).
     */
    style?: TIconStyle;

    /**
     * @name Controls/_itemActions/interface/IItemAction#iconStyle
     * @cfg {TIconStyle} Стиль иконки.
     * @remark
     * Каждому значению свойства соответствует стиль, который определяется {@link /doc/platform/developmentapl/interface-development/themes/ темой оформления} приложения.
     * @default secondary
     */
    /*
     * @name Controls/_itemActions/interface/IItemAction#iconStyle
     * @cfg {TIconStyle} Style of the action's icon. (secondary | warning | danger | success).
     * @default secondary
     */
    iconStyle?: TIconStyle;

    /**
     * @name Controls/_itemActions/interface/IItemAction#handler
     * @cfg {TItemActionHandler} Обработчик опции записи.
     * @remark
     * См. {@link /doc/platform/developmentapl/interface-development/controls/list/actions/item-actions/handler/ пример обработчика}.
     */
    /*
     * @name Controls/_itemActions/interface/IItemAction#handler
     * @cfg {TItemActionHandler} item action handler callback
     */
    handler?: TItemActionHandler;

    /**
     * @name Controls/_itemActions/interface/IItemAction#parent@
     * @cfg {Boolean} Поле, описывающее тип узла (список, узел, скрытый узел).
     * @remark
     * Подробнее о различиях между типами узлов можно прочитать {@link /doc/platform/developmentapl/service-development/bd-development/vocabl/tabl/relations/#hierarchy здесь}.
     */
    /*
     * @name Controls/_itemActions/interface/IItemAction#parent@
     * @cfg {Boolean} Field that describes the type of the node (list, node, hidden node).
     */
    'parent@'?: boolean;

    /**
     * @name Controls/_itemActions/interface/IItemAction#displayMode
     * @cfg {TActionDisplayMode} Режим отображения опции записи.
     */
    /*
     * @name Controls/_itemActions/interface/IItemAction#displayMode
     * @cfg {TActionDisplayMode} item action display mode
     */
    displayMode?: TActionDisplayMode;

    /**
     * @name Controls/_itemActions/interface/IItemAction#tooltip
     * @cfg {String} Текст всплывающей подсказки, отображаемой при наведении на опцию записи.
     */
    /*
     * @name Controls/_itemActions/interface/IItemAction#tooltip
     * @cfg {String} tooltip showing on mouse hover
     */
    tooltip?: string;

    /**
     * @name Controls/_itemActions/interface/IItemAction#parent
     * @cfg {String|Number} Идентификатор родительской опции записи.
     * @remark
     * Используется для создания {@link /doc/platform/developmentapl/interface-development/controls/list/actions/item-actions/menu-visibility/ многоуровневого контекстного меню}.
     */
    /*
     * @name Controls/_itemActions/interface/IItemAction#parent
     * @cfg {String|Number} Key of the action's parent.
     */
    parent?: string | number;
}

/**
 * @typedef {Function} TItemActionVisibilityCallback
 * @description
 * Функция обратного вызова для определения видимости опций записи.
 * @param action Item Action to check
 * @param item Model
 */
export type TItemActionVisibilityCallback = (action: IItemAction, item: Model) => boolean;

/**
 * @typedef {Function} TEditArrowVisibilityCallback
 * @description
 * Функция обратного вызова для определения видимости кнопки редактирования в свайпе.
 * @param item Model
 */
export type TEditArrowVisibilityCallback = (item: Model) => boolean;

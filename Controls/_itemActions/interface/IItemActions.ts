import {Control} from 'UI/Base';
import {Model} from 'Types/entity';
import {SyntheticEvent} from 'Vdom/Vdom';
import {IBaseCollection, IItemActionsTemplateConfig, ISwipeConfig, ANIMATION_STATE} from 'Controls/display';
import {ISource} from 'Controls/interface';

export enum TItemActionShowType {
    // show only in Menu
    MENU,
    // show in Menu and Toolbar
    MENU_TOOLBAR,
    // show only in Toolbar
    TOOLBAR
}

/**
 * @typedef {String} TIconStyle
 * @variant secondary
 * @variant warning
 * @variant danger
 * @variant success
 * TODO duplicated from IList
 */
export type TIconStyle = 'secondary'|'warning'|'danger'|'success';

/**
 * @typedef {String} TActionCaptionPosition
 * @variant right Справа от иконки опции записи.
 * @variant bottom Под иконкой опции записи.
 * @variant none Не будет отображаться.
 */
export type TActionCaptionPosition = 'right'|'bottom'|'none';

/**
 * @typedef {String} TActionDisplayMode
 * @variant title показывать только заголовок
 * @variant icon показывать только иконку
 * @variant both показывать иконку и заголовок
 * @variant auto если есть иконка, то показывать иконку, иначе заголовок
 * TODO duplicated from IList
 */
export type TActionDisplayMode = 'title'|'icon'|'both'|'auto';

/**
 * @typedef {String} TItemActionsPosition
 * @variant inside Внутри элемента.
 * @variant outside Под элементом.
 * @variant custom Произвольная позиция отображения. Задаётся через шаблон {@link Controls/interface/IItemTemplate itemTemplate}.
 */
export type TItemActionsPosition = 'inside'|'outside'|'custom';

/**
 * @cfg {string} TItemActionsSize
 * Размер иконок опций записи
 * @variant inside Внутри элемента.
 * @variant outside Под элементом.
 */
export type TItemActionsSize = 'm'|'s';

/**
 * Configuration object for a button which will be shown when the user hovers over a list item.
 * TODO duplicated from IList
 */
export interface IItemAction {
    /**
     * Identifier of the action.
     */
    id: string | number;

    /**
     * Action's name.
     */
    title?: string;

    /**
     * Action's icon.
     */
    icon?: string;

    /**
     * Location of the action.
     * @default MENU
     */
    showType?: TItemActionShowType;

    /**
     * Action's style.
     */
    style?: TIconStyle;

    /**
     * Style of the action's icon.
     * @default secondary
     */
    iconStyle?: TIconStyle;

    /**
     * Action's handler.
     * @param item Corresponding list item.
     */
    handler?: (item: Model) => void;

    /**
     * Determines whether the action opens menu.
     */
    _isMenu?: boolean;

    /**
     * Flag of parent
     */
    'parent@'?: boolean|null;
    displayMode?: TActionDisplayMode;
    tooltip?: string;

    /**
     * Parent action id
     */
    parent?: string | number;
}

export type TActionClickCallback = (clickEvent: SyntheticEvent<MouseEvent>, action: IItemAction, contents: Model) => void;

export type TItemActionVisibilityCallback = (
    action: IItemAction,
    item: unknown
) => boolean;

export interface IItemActionsContainer {
    all: IItemAction[];
    showed: IItemAction[];
}

export interface IItemActionsTemplateOptions {
    style?: string;
    itemActionsPosition: string;
    actionAlignment?: string;
    actionCaptionPosition: TActionCaptionPosition;
    itemActionsClass?: string;
    actionClickCallback?: TActionClickCallback;
    size?: string;
    toolbarVisibility?: boolean;
}

export interface IItemActionsItem {
    getActions(): IItemActionsContainer;
    getContents(): Model;
    setActions(actions: IItemActionsContainer, silent?: boolean): void;
    setActive(active: boolean): void;
    isActive(): boolean;
    setSwiped(swiped: boolean): void;
    isSwiped(): boolean;
}

export interface IItemActionsCollection extends IBaseCollection<IItemActionsItem> {
    setEventRaising?(raising: boolean, analyze?: boolean): void;
    isActionsAssigned(): boolean;
    setActionsAssigned(assigned: boolean): void;
    setActionsTemplateConfig(config: IItemActionsTemplateConfig): void;
    getActionsTemplateConfig(): IItemActionsTemplateConfig;
    setSwipeConfig(config: ISwipeConfig): void;
    getSwipeConfig(): ISwipeConfig;
    setSwipeAnimation(state: ANIMATION_STATE): void;

    /**
     * Было решено переместить get/setActiveItem в коллекцию, т.к.
     * в TileView так организована работа с isHovered, isScaled и isAnimated и
     * мы не можем снять эти состояния при клике внутри ItemActions
     * @param item
     */
    setActiveItem(item: IItemActionsItem): void;
    getActiveItem(): IItemActionsItem;
}

export interface IMenuTemplateOptions {
    source: ISource;
    keyProperty: string;
    parentProperty: string;
    nodeProperty: string;
    dropdownClassName: string;
    closeButtonVisibility: boolean;
    root: number | string;
    showHeader: boolean;
    headConfig?: {
        caption: string;
        icon: string;
    };
}

export type IMenuActionHandler = (event: SyntheticEvent, action: string, data: Model) => void;

export interface IMenuConfig {
    opener: Element | Control<object, unknown>;
    template: string;
    actionOnScroll: string;
    target: {
        getBoundingClientRect(): ClientRect;
    };
    templateOptions: IMenuTemplateOptions;
    closeOnOutsideClick: boolean;
    targetPoint: {
        vertical: string,
        horizontal: string
    };
    direction: {
        horizontal: string
    };
    className: string;
    nativeEvent: Event;
    autofocus: boolean;
    eventHandlers?: {
         onResult: IMenuActionHandler;
         onClose: IMenuActionHandler;
    };
}

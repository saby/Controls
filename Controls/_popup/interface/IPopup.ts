import {IBasePopupOptions} from 'Controls/_popup/interface/IBaseOpener';
import {Control, TemplateFunction, IControlOptions} from 'UI/Base';

/**
 * Приватный интерфейс окон. Используется в работе менеджера окон и контроллеров.
 *
 * @interface Controls/_popup/interface/IPopup
 * @private
 * @author Красильников А.С.
 */

export interface IPopupItem {
    targetCoords: any;
    id: string;
    modal: boolean;
    controller: IPopupController;
    popupOptions: IBasePopupOptions;
    isActive: boolean;
    waitDeactivated: boolean;
    sizes: IPopupSizes;
    activeControlAfterDestroy: Control;
    activeNodeAfterDestroy: HTMLElement;
    popupState: string;
    childs: IPopupItem[];
    parentId?: string;
    closeId?: number;
    position?: IPopupPosition;
    currentZIndex?: number;
    className?: string;
    calculatedRestrictiveContainer?: HTMLElement;
    isDragOnPopup?: boolean; // Осуществляется ли d'n'd внутри окна
    _destroyDeferred?: Promise<undefined>;
    margins?: {
        top: number,
        left: number
    };
}

export interface IPopupSizes {
    width?: number;
    height?: number;
    margins?: {
        top: number,
        left: number
    };
}

export interface IPopupPosition {
    position?: string;
    left?: number;
    right?: number;
    top?: number;
    bottom?: number;
    width?: number;
    height?: number;
    maxWidth?: number;
    minWidth?: number;
    maxHeight?: number;
    minHeight?: number;
    invisible?: boolean;
    hidden?: boolean;
    margin?: number;
}

export interface IEventHandlers {
    onOpen?: Function;
    onClose?: Function;
    onResult?: Function;
}

export interface IPopupOptions extends IBasePopupOptions {
    width?: number;
    height?: number;
    minWidth?: number;
    maxWidth?: number;
    minHeight?: number;
    maxHeight?: number;
    hidden?: boolean;
    maximize?: boolean;
    autoClose?: boolean;
}

export interface IDragOffset {
    x: number;
    y: number;
}

export interface IPopupController {
    TYPE: string;
    POPUP_STATE_INITIALIZING: string;
    POPUP_STATE_CREATED: string;
    POPUP_STATE_UPDATING: string;
    POPUP_STATE_UPDATED: string;
    POPUP_STATE_START_DESTROYING: string;
    POPUP_STATE_DESTROYING: string;
    POPUP_STATE_DESTROYED: string;

    elementCreatedWrapper(item: IPopupItem, container: HTMLElement): boolean;

    elementUpdatedWrapper(item: IPopupItem, container: HTMLElement): boolean;

    elementAfterUpdatedWrapper(item: IPopupItem, container: HTMLElement): boolean;

    beforeElementDestroyed(item: IPopupItem, container: HTMLElement): void;

    elementDestroyedWrapper(item: IPopupItem, container: HTMLElement): Promise<void>;

    getDefaultConfig(item: IPopupItem): Promise<void> | void;

    elementUpdateOptions(item: IPopupItem, container: HTMLElement): boolean | Promise<boolean>;

    orientationChanged(item: IPopupItem, container: HTMLElement): boolean;

    closePopupByOutsideClick(item: IPopupItem): void;

    popupDragStart(item: IPopupItem, container: HTMLElement, offset: IDragOffset): void;

    popupDragEnd(item: IPopupItem, offset: number): void;

    popupMouseEnter(item: IPopupItem): boolean;

    popupMouseLeave(item: IPopupItem): boolean;

    resizeInner(item: IPopupItem, container: HTMLElement): boolean;

    dragNDropOnPage(item: IPopupItem, container: HTMLElement, isInsideDrag: boolean): boolean;

    popupResizingLine(item: IPopupItem, offset: number): boolean;

    elementAnimated(item: IPopupItem, container: HTMLElement): boolean;

    elementMaximized(item: IPopupItem, container: HTMLElement, state: boolean): boolean;

    beforeUpdateOptions(item: IPopupItem): void;

    afterUpdateOptions(item: IPopupItem): void;

    workspaceResize(): boolean;

    needRecalcOnKeyboardShow(): boolean;
}

export interface IPopupItemInfo {
    id: string;
    type: string;
    parentId: string;
    parentZIndex: null | number;
    popupOptions: {
        maximize: boolean,
        modal: boolean,
        template: Control<IControlOptions, unknown> | TemplateFunction | string
    };
}

export default interface IPopup {
    readonly '[Controls/_popup/interface/IPopup]': boolean;
}

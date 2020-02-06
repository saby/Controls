import {IBasePopupOptions} from './IBaseOpener';
import {IBasePopupOptions} from './ISticky';
import {Control} from 'UI/Base';
import {IDragOffset} from '../../_popupTemplate/BaseController';

/**
 * Приватный интерфейс окон. Используется в работе менеджера окон и контроллеров.
 *
 * @interface Controls/_popup/interface/IPopup
 * @private
 * @author Красильников А.С.
 */

export interface IPopupItem {
   id: string;
   modal: boolean;
   controller: IPopupController;
   popupOptions: IPopupOptions;
   isActive: boolean;
   waitDeactivated: boolean;
   sizes: IPopupSizes;
   activeControlAfterDestroy: Control;
   activeNodeAfterDestroy: HTMLElement;
   popupState: string;
   hasMaximizePopup: boolean;
   childs: IPopupItem[];
   parentId?: string;
   position?: IPopupPosition;
   currentZIndex?: number;
   _destroyDeferred?: Promise<undefined>;
}

export interface IPopupSizes {
   width?: number;
   height?: number;
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
   hidden?: boolean;
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
   id?: string;
   maximize?: boolean;
   content?: Function;
}

export interface IPopupController {
   POPUP_STATE_INITIALIZING: string;
   POPUP_STATE_CREATING: string;
   POPUP_STATE_CREATED: string;
   POPUP_STATE_UPDATING: string;
   POPUP_STATE_UPDATED: string;
   POPUP_STATE_DESTROYING: string;
   POPUP_STATE_DESTROYED: string;
   _elementCreated(item: IPopupItem, container: HTMLElement): boolean;
   _elementUpdated(item: IPopupItem, container: HTMLElement): boolean;
   _elementAfterUpdated(item: IPopupItem, container: HTMLElement): boolean;
   _elementDestroyed(item: IPopupItem, container: HTMLElement): Promise<undefined>;
   getDefaultConfig(item: IPopupItem): null|Promise<void>;
   _popupDragEnd(item: IPopupItem): boolean;
   _popupResizingLine(item: IPopupItem, offset: IDragOffset): boolean;
   _elementAnimated(item: IPopupItem): boolean;
   _elementMaximized(item: IPopupItem, container: HTMLElement, state: boolean): boolean;
}

export default interface IPopup {
   readonly '[Controls/_popup/interface/IPopup]': boolean;
}

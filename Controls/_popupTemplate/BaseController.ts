import Deferred = require('Core/Deferred');
import Utils = require('Types/util');
import {Controller as ManagerController} from 'Controls/popup';

export interface IPopupItem {
    id: string;
    position: object;
    popupOptions: IPopupOptions;
    popupState: string;
    sizes: ISizes;
    _destroyDeferred: Promise<undefined>;
}

interface ISizes {
    width: number;
    height: number;
}

interface IPopupOptions {
    template: string;
    closeOnOutsideClick: boolean;
    width: number;
    height: number;
    minWidth: number;
    maxWidth: number;
    minHeight: number;
    maxHeight: number;
}

/**
 * Base Popup Controller
 * @category Popup
 * @class Controls/_popupTemplate/BaseController
 * @author Красильников А.С.
 */
abstract class BaseController {

    POPUP_STATE_INITIALIZING: string = 'initializing';
    POPUP_STATE_CREATING: string = 'creating';
    POPUP_STATE_CREATED: string = 'created';
    POPUP_STATE_UPDATING: string = 'updating';
    POPUP_STATE_UPDATED: string = 'updated';
    POPUP_STATE_DESTROYING: string = 'destroying';
    POPUP_STATE_DESTROYED: string = 'destroyed';
    abstract elementCreated(item: IPopupItem, container: HTMLDivElement): boolean;

    abstract  elementUpdated(item: IPopupItem, container: HTMLDivElement): boolean;

    protected elementAfterUpdated(item: IPopupItem, container: HTMLDivElement): boolean {
        return false;
    }

    abstract  elementMaximized(item: IPopupItem, container: HTMLDivElement, state: boolean): boolean;

    abstract  popupResizingLine(item: IPopupItem, offset: object): boolean;

    abstract  popupDragStart(item: IPopupItem, offset: object): boolean;

    abstract  popupDragEnd(item: IPopupItem): boolean;

    abstract  popupMouseEnter(item: IPopupItem): boolean;

    abstract  popupMouseLeave(item: IPopupItem): boolean;

    abstract  elementAnimated(item: IPopupItem): boolean;

    _elementCreated(item: IPopupItem, container: HTMLDivElement): boolean {
        if (this._checkContainer(item, container, 'elementCreated')) {
            item.popupState = this.POPUP_STATE_CREATED;
            return this.elementCreated && this.elementCreated.apply(this, arguments);
        }
    }

    _elementUpdated(item: IPopupItem, container: HTMLDivElement): boolean {
        if (this._checkContainer(item, container, 'elementUpdated')) {
            if (item.popupState === this.POPUP_STATE_CREATED ||
                item.popupState === this.POPUP_STATE_UPDATED ||
                item.popupState === this.POPUP_STATE_UPDATING) {
                item.popupState = this.POPUP_STATE_UPDATING;
                this.elementUpdated && this.elementUpdated.apply(this, arguments);
                return true;
            }
        }
        return false;
    }

    _elementAfterUpdated(item: IPopupItem, container: HTMLDivElement): boolean {
        if (this._checkContainer(item, container, 'elementAfterUpdated')) {
            // We react only after the update phase from the controller
            if (item.popupState === this.POPUP_STATE_UPDATING) {
                item.popupState = this.POPUP_STATE_UPDATED;
                return this.elementAfterUpdated && this.elementAfterUpdated.apply(this, arguments);
            }
        }
        return false;
    }

    _elementDestroyed(item: IPopupItem, container: HTMLDivElement): Promise<undefined> {
        if (item.popupState === this.POPUP_STATE_INITIALIZING) {
            return (new Deferred()).callback();
        }
        if (item.popupState === this.POPUP_STATE_DESTROYED || item.popupState === this.POPUP_STATE_DESTROYING) {
            return item._destroyDeferred;
        }

        if (item.popupState !== this.POPUP_STATE_DESTROYED) {
            item.popupState = this.POPUP_STATE_DESTROYING;
            item._destroyDeferred = this.elementDestroyed && this.elementDestroyed.apply(this, arguments);
            return item._destroyDeferred.addCallback(() => {
                item.popupState = this.POPUP_STATE_DESTROYED;
            });
        }
        return (new Deferred()).callback();
    }

    _elementMaximized(item: IPopupItem, container: HTMLDivElement, state: boolean): boolean {
        return this.elementMaximized && this.elementMaximized(item, container, state);
    }

    _popupResizingLine(item: IPopupItem, offset: object): boolean {
        return this.popupResizingLine && this.popupResizingLine(item, offset);
    }

    getDefaultConfig(item: IPopupItem): void {
        item.position = {
            top: -10000,
            left: -10000,
            maxWidth: item.popupOptions.maxWidth,
            minWidth: item.popupOptions.minWidth,
            maxHeight: item.popupOptions.maxHeight,
            minHeight: item.popupOptions.minHeight
        };
    }

    protected elementDestroyed(item: IPopupItem): Promise<undefined> {
        return (new Deferred()).callback();
    }

    protected elementUpdateOptions(item: IPopupItem, container: HTMLDivElement): boolean | Promise<boolean> {
        return this._elementUpdated(item, container);
    }

    protected pageScrolled(item: IPopupItem, container: HTMLDivElement): boolean {
        return this._elementUpdated(item, container);
    }

    protected popupDeactivated(item: IPopupItem): void {
        if (item.popupOptions.closeOnOutsideClick && ManagerController) {
            ManagerController.remove(item.id);
        }
    }

    protected popupResize(item: IPopupItem, container: HTMLDivElement): boolean {
        return this._elementUpdated(item, container);
    }

    protected needRecalcOnKeyboardShow(): boolean {
        return false;
    }

    protected needRestoreFocus(): boolean {
        return true;
    }

    protected getCustomZIndex(): number | null {
        return null;
    }

    protected _getPopupSizes(item: IPopupItem, container: HTMLDivElement): ISizes {
        const containerSizes: ISizes = this.getContentSizes(container);

        item.sizes = {
            width: item.popupOptions.width || containerSizes.width,
            height: item.popupOptions.height || containerSizes.height
        };
        return item.sizes;
    }

    protected _getPopupContainer(id: string): HTMLDivElement {
        const popupContainer = ManagerController.getContainer();
        const item = popupContainer && popupContainer._children[id];
        // todo https://online.sbis.ru/opendoc.html?guid=d7b89438-00b0-404f-b3d9-cc7e02e61bb3
        let container = item && item._container;
        if (container && container.jquery) {
            container = container[0];
        }
        return container;
    }

    private _checkContainer(item: IPopupItem, container: HTMLDivElement, stage: string): boolean {
        if (!container) {
            // if popup has initializing state then container doesn't created yet
            if (item.popupState !== this.POPUP_STATE_INITIALIZING) {
                const message = `Error when building the template ${item.popupOptions.template} on stage ${stage}`;
                Utils.logger.error('Controls/popup', message);
            }
            return false;
        }
        return true;
    }

    private getContentSizes(container: HTMLDivElement): ISizes {
        return {
            width: container.offsetWidth,
            height: container.offsetHeight
        };
    }
}

export default BaseController;

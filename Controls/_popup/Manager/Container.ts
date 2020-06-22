import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import {List} from 'Types/collection';
import {IPopupItem} from 'Controls/_popup/interface/IPopup';
import {dispatcherHandler} from 'UI/HotKeys';
import ManagerController from 'Controls/_popup/Manager/ManagerController';
import PendingClass from './PendingClass';
import Deferred = require('Core/Deferred');
import {IConfig} from './PendingClass';
import template = require('wml!Controls/_popup/Manager/Container');

// step zindex between popups.
// It should be enough to place all the additional popups (menu, infobox, suggest) on the main popups (stack, window)
const POPUP_ZINDEX_STEP: number = 10;

class Container extends Control<IControlOptions> {

    /**
     * Container for displaying popups
     * @class Controls/_popup/Manager/Container
     * @extends Core/Control
     * @control
     * @private
     * @category Popup
     * @author Красильников А.С.
     */

    protected _template: TemplateFunction = template;
    protected _overlayId: string;
    protected _zIndexStep: number = POPUP_ZINDEX_STEP;
    protected _popupItems: List<IPopupItem>;
    protected _pendingController: PendingClass;

    protected _beforeMount(): void {
        this._popupItems = new List();
        this._pendingController = new PendingClass(this._notifyHandler.bind(this));
    }
    protected _afterMount(): void {
        ManagerController.setContainer(this);
    }

    /**
     * Set a new set of popups
     * @function Controls/_popup/Manager/Container#setPopupItems
     * @param {List} popupItems new popup set
     */
    setPopupItems(popupItems: List<IPopupItem>): void {
        this._popupItems = popupItems;
    }

    getPopupById(id: string): Control {
        return this._children[id] as Control;
    }

    activatePopup(id: string): void {
        const popup = this.getPopupById(id);
        if (popup) {
            popup.activatePopup();
        }
    }

    getPending(): PendingClass {
        return this._pendingController;
    }

    protected _notifyHandler(eventName: string, args?: []): void {
        this._notify(eventName, args, {bubbling: true});
    }

    private _registerPendingHandler(event: Event, deferred: Deferred, config: IConfig): void {
        this._pendingController.registerPending(deferred, config);
    }

    private _finishPendingHandler(event: Event, forceFinishValue: boolean, root: string): void {
        this._pendingController.finishPendingOperations(forceFinishValue, true, root);
    }

    private _cancelFinishingPendingHandler(event: Event, root: string): void {
        this._pendingController.cancelFinishingPending(root);
    }

    // todo: https://online.sbis.ru/opendoc.html?guid=728a9f94-c360-40b1-848c-e2a0f8fd6d17
    protected _getItems(popupItems: List<IPopupItem>): List<IPopupItem> {
        const reversePopupList: List<IPopupItem> = new List();
        let maxModalPopup: IPopupItem;
        popupItems.each((item: IPopupItem) => {
            let at;
            // Для поддержки старых автотестов, нужно, чтобы открываемые стековые и диалоговые окна в DOM располагались
            // выше чем уже открытые. Со всеми окнами так делать нельзя, доп окна (стики) открываемые на 1 уровне, имеют
            // одинаковый z-index и последнее открытое окно должно быть выше, это осуществялется за счет позиции в DOM.
            if (item.controller.TYPE === 'Stack' || item.controller.TYPE === 'Dialog') {
                at = 0;
            }
            if (item.modal) {
                if (!maxModalPopup || item.currentZIndex > maxModalPopup.currentZIndex) {
                    maxModalPopup = item;
                }
            }
            reversePopupList.add(item, at);
        });
        this._overlayId = maxModalPopup?.id;
        return reversePopupList;
    }

    protected _keyDownHandler(event: Event): void {
        return dispatcherHandler(event);
    }

    protected _popupDeactivated(event: Event, popupId: string, data: boolean): void {
        this._notify('popupDeactivated', [popupId, data], {bubbling: true});
    }

    protected _popupActivated(event: Event, popupId: string, data: boolean): void {
        this._notify('popupActivated', [popupId, data], {bubbling: true});
    }

    protected _overlayClickHandler(event: Event): void {
        // Click on the overlay shouldn't do anything
        event.preventDefault();
        event.stopPropagation();
    }

    protected _beforeUnmount(): void {
        if (this._pendingController) {
            this._pendingController.destroy();
        }
    }

    // To calculate the zIndex in a compatible notification Manager
    static POPUP_ZINDEX_STEP: number = POPUP_ZINDEX_STEP;
    static _theme: string[] = ['Controls/popup'];
}

export default Container;

import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import {List} from 'Types/collection';
import {IPopupItem} from 'Controls/_popup/interface/IPopup';
import ManagerController from 'Controls/_popup/Manager/ManagerController';
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
    protected _overlayId: number = null;
    protected _zIndexStep: number = POPUP_ZINDEX_STEP;
    protected _popupItems: List<IPopupItem>;

    protected _beforeMount(): void {
        this._popupItems = new List();
    }
    protected _afterMount(): void {
        ManagerController.setContainer(this);
    }

    /**
     * Set the index of popup, under which the overlay will be drawn
     * @function Controls/_popup/Manager/Container#setPopupItems
     * @param {Integer} index индекс попапа
     */
    setOverlay(index: number): void {
        this._overlayId = index;
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

    getPendingById(id: string): Control {
        return this._children[id + '_registrator'] as Control;
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

    protected _getPopupZIndex(item: IPopupItem, index: number): number {
        // TODO: По работе с простановкой zindex окнам этот код должен уехать в manager
        const customZIndex = item.controller.getCustomZIndex(this._popupItems, item);
        const zIndex = item.popupOptions.zIndex || customZIndex || (index + 1) * POPUP_ZINDEX_STEP;
        item.currentZIndex = zIndex;
        return zIndex;
    }

    // To calculate the zIndex in a compatible notification Manager
    static POPUP_ZINDEX_STEP: number = POPUP_ZINDEX_STEP;
    static _theme = ['Controls/popup'];
}

export default Container;

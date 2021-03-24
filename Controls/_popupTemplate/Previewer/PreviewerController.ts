import Deferred = require('Core/Deferred');
import StickyController = require('Controls/_popupTemplate/Sticky/StickyController');
import {IPopupItem} from 'Controls/popup';
import 'css!Controls/popupTemplate';

class PreviewerController extends StickyController.constructor {
    _openedPopupIds: string[] = [];
    _destroyDeferred: object = {};
    TYPE: string = 'Previewer';

    elementCreated(item: IPopupItem, container: HTMLDivElement): boolean {
        /**
         * Only one window can be opened.
         */
        if (!this._isLinkedPopup(item)) {
            require('Controls/popup').Controller.remove(this._openedPopupIds[0]);
        }
        this._openedPopupIds.push(item.id);
        return super.elementCreated.apply(this, arguments);
    }

    elementDestroyed(item: IPopupItem): boolean {
        const itemIndex: number = this._openedPopupIds.indexOf(item.id);
        if (itemIndex > -1) {
            this._openedPopupIds.splice(itemIndex, 1);
        }

        this._destroyDeferred[item.id] = new Deferred();
        item.popupOptions.className = (item.popupOptions.className || '') + ' controls-PreviewerController_close';
        return this._destroyDeferred[item.id];
    }

    elementAnimated(item: IPopupItem): boolean {
        if (this._destroyDeferred[item.id]) {
            this._destroyDeferred[item.id].callback();
            delete this._destroyDeferred[item.id];
            return true;
        }
        return false;
    }

    needRestoreFocus(isActive: boolean): boolean {
        return isActive;
    }

    private _isLinkedPopup(item: IPopupItem): boolean {
        for (let i = 0; i < this._openedPopupIds.length; i++) {
            if (this._openedPopupIds[i] === item.parentId) {
                return true;
            }
        }
        return false;
    }
}

export = new PreviewerController();

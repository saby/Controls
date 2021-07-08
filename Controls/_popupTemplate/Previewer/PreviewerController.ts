import * as Deferred from 'Core/Deferred';
import {StickyController, IStickyItem} from 'Controls/_popupTemplate/Sticky/StickyController';
import {IPopupItem, Controller as ManagerController} from 'Controls/popup';
import 'css!Controls/popupTemplate';

class PreviewerController extends StickyController {
    _openedPopupIds: string[] = [];
    _destroyDeferred: object = {};
    TYPE: string = 'Previewer';

    elementCreated(item: IStickyItem, container: HTMLDivElement): boolean {
        /**
         * Only one window can be opened.
         */
        if (!this._isLinkedPopup(item)) {
            ManagerController.remove(this._openedPopupIds[0]);
        }
        this._openedPopupIds.push(item.id);
        return super.elementCreated.apply(this, arguments);
    }

    elementDestroyed(item: IStickyItem): Promise<void> {
        const itemIndex: number = this._openedPopupIds.indexOf(item.id);
        if (itemIndex > -1) {
            this._openedPopupIds.splice(itemIndex, 1);
        }

        this._destroyDeferred[item.id] = new Deferred();
        item.popupOptions.className = (item.popupOptions.className || '') + ' controls-PreviewerController_close';
        return this._destroyDeferred[item.id];
    }

    elementAnimated(item: IStickyItem): boolean {
        if (this._destroyDeferred[item.id]) {
            this._destroyDeferred[item.id].callback();
            delete this._destroyDeferred[item.id];
            return true;
        }
        return false;
    }

    private _isLinkedPopup(previewerItem: IStickyItem): boolean {
        let item: IPopupItem = previewerItem;
        const parents = [];
        while (item && item.parentId) {
            parents.push(item.parentId);
            item = ManagerController.find(item.parentId);
        }
        for (let i = 0; i < this._openedPopupIds.length; i++) {
            const previewerId = this._openedPopupIds[i];
            if (parents.includes(previewerId)) {
                return true;
            }
        }
        return false;
    }
}

export default new PreviewerController();

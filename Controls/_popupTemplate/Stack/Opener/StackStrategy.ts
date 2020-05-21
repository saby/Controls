/**
 * Created by as.krasilnikov on 21.03.2018.
 */
import {Control} from 'UI/Base';
import {detection} from 'Env/Env';
import {goUpByControlTree} from 'UI/Focus';
import {Controller, IPopupItem, IPopupPosition} from 'Controls/popup';

interface IPosition {
    right: number;
    top: number;
    bottom: number;
    width?: number;
    minWidth?: number;
    maxWidth?: number;
    position?: string;
}

// Minimum popup indentation from the right edge
const MINIMAL_PANEL_DISTANCE = 100;

const _private = {
    getPanelWidth(item: IPopupItem, tCoords, maxPanelWidth: number): number {
        let panelWidth;
        const maxPanelWidthWithOffset = maxPanelWidth - tCoords.right;
        const isCompoundTemplate = item.popupOptions.isCompoundTemplate;
        let minWidth = parseInt(item.popupOptions.minWidth, 10);
        const maxWidth = parseInt(item.popupOptions.maxWidth, 10);

        // todo:https://online.sbis.ru/opendoc.html?guid=8f7f8cea-b39d-4046-b5b2-f8dddae143ad
        if (_private.isMaximizedPanel(item) && !item.popupOptions.propStorageId) {
            if (!_private.isMaximizedState(item)) {
                panelWidth = item.popupOptions.minimizedWidth;
            } else {
                panelWidth = Math.min(maxWidth, maxPanelWidthWithOffset);
                // todo: https://online.sbis.ru/opendoc.html?gu run buildid=256679aa-fac2-4d95-8915-d25f5d59b1ca
                if (minWidth) {
                    panelWidth = Math.max(panelWidth, minWidth); // more then minWidth
                }
            }
            return panelWidth;
        }
        // If the minimum width does not fit into the screen - positioned on the right edge of the window
        if (minWidth > maxPanelWidthWithOffset && !isCompoundTemplate) {
            if (_private.isMaximizedPanel(item)) {
                minWidth = item.popupOptions.minimizedWidth;
            }
            if (minWidth > maxPanelWidthWithOffset) {
                tCoords.right = 0;
            }
            panelWidth = minWidth;
        }
        if (item.popupOptions.width) {
            // todo: https://online.sbis.ru/opendoc.html?guid=256679aa-fac2-4d95-8915-d25f5d59b1ca
            panelWidth = Math.min(item.popupOptions.width, maxPanelWidth); // less then maxWidth
            panelWidth = Math.max(panelWidth, item.popupOptions.minimizedWidth || minWidth || 0); // more then minWidth
        }

        // Если родитель не уместился по ширине и спозиционировался по правому краю экрана -
        // все дети тоже должны быть по правому краю, не зависимо от своих размеров
        const parentPosition = _private.getParentPosition(item);
        if (parentPosition?.right === 0) {
            tCoords.right = 0;
        }
        // Если панель не уместилась по ширине, то позиционирование панели осуществляется от правого края экрана
        if ((panelWidth + tCoords.right) > _private.getBodyWidth()) {
            tCoords.right = 0;
        }

        return panelWidth;
    },
    getBodyWidth() {
        return document?.body.clientWidth;
    },

    getParentPosition(item: IPopupItem): IPopupPosition {
        const parentItem = Controller.find(item.parentId);
        return parentItem?.position;
    },

    getAvailableMaxWidth(itemMaxWidth: number, maxPanelWidth: number): number {
        return itemMaxWidth ? Math.min(itemMaxWidth, maxPanelWidth) : maxPanelWidth;
    },

    isMaximizedPanel(item: IPopupItem) {
        return !!item.popupOptions.minimizedWidth && !item.popupOptions.propStorageId;
    },

    isMaximizedState(item: IPopupItem) {
        return !!item.popupOptions.maximized;
    },
    calculateMaxWidth(self, popupOptions, tCoords) {
        const maxPanelWidth = self.getMaxPanelWidth();
        let maxWidth = maxPanelWidth;

        // maxWidth limit on the allowable width
        if (popupOptions.maxWidth) {
            maxWidth = Math.min(popupOptions.maxWidth, maxPanelWidth - tCoords.right);
        }

        // Not less than minWidth
        if (popupOptions.minWidth) {
            maxWidth = Math.max(popupOptions.minWidth, maxWidth);
        }
        return maxWidth;
    }
};

export = {

    /**
     * Returns popup position
     * @function Controls/_popupTemplate/Stack/Opener/StackController#getPosition
     * @param tCoords Coordinates of the container relative to which the panel is displayed
     * @param item Popup configuration
     */
    getPosition(tCoords, item: IPopupItem): IPosition {
        const maxPanelWidth = this.getMaxPanelWidth();
        const width = _private.getPanelWidth(item, tCoords, maxPanelWidth);
        const hasMaximizePopup: boolean = this._hasMaximizePopup(item);
        const position: IPosition = {
            width,
            right: hasMaximizePopup ? 0 : tCoords.right,
            top: tCoords.top,
            bottom: 0
        };

        // on mobile device fixed container proxying scroll on bottom container
        if (!detection.isMobilePlatform) {
            position.position = 'fixed';
        }

        if (item.popupOptions.minWidth) {
            // todo: Delete minimizedWidth https://online.sbis.ru/opendoc.html?guid=8f7f8cea-b39d-4046-b5b2-f8dddae143ad
            position.minWidth = item.popupOptions.minimizedWidth || item.popupOptions.minWidth;
        }
        position.maxWidth = _private.calculateMaxWidth(this, item.popupOptions, tCoords);

        return position;
    },

    _hasMaximizePopup(item: IPopupItem): boolean {
        const openerContainer: HTMLElement = item.popupOptions?.opener?._container;
        const parents: Control[] = this._goUpByControlTree(openerContainer);
        const popupModuleName: string = 'Controls/_popup/Manager/Popup';
        const oldPopupModuleName: string = 'Lib/Control/Dialog/Dialog'; // Compatible

        for (let i = 0; i < parents.length; i++) {
            if (parents[i]._moduleName ===  popupModuleName || parents[i]._moduleName === oldPopupModuleName) {
                if (parents[i]._options.maximize) {
                    return true;
                }
            }
        }
        return false;

    },

    _goUpByControlTree(container: HTMLElement): Control[] {
        return goUpByControlTree(container);
    },

    /**
     * Returns the maximum possible width of popup
     * @function Controls/_popupTemplate/Stack/Opener/StackController#getMaxPanelWidth
     */
    getMaxPanelWidth(): number {
        // window.innerWidth брать нельзя, при масштабировании на ios значение меняется, что влияет на ширину панелей.
        return document.body.clientWidth - MINIMAL_PANEL_DISTANCE;
    },

    isMaximizedPanel: _private.isMaximizedPanel,

    _private
};


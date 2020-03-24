/**
 * Created by as.krasilnikov on 21.03.2018.
 */
import {detection} from 'Env/Env';
import {goUpByControlTree} from 'UI/Focus';
import * as isNewEnvironment from 'Core/helpers/isNewEnvironment';

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
    getPanelWidth(item, tCoords, maxPanelWidth) {
        let panelWidth;
        const maxPanelWidthWithOffset = maxPanelWidth - tCoords.right;
        const isCompoundTemplate = item.popupOptions.isCompoundTemplate;
        let minWidth = parseInt(item.popupOptions.minWidth, 10);
        const maxWidth = parseInt(item.popupOptions.maxWidth, 10);

        if (_private.isMaximizedPanel(item) && !item.popupOptions.propStorageId) { // todo:https://online.sbis.ru/opendoc.html?guid=8f7f8cea-b39d-4046-b5b2-f8dddae143ad
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
        if (minWidth > maxPanelWidthWithOffset && !isCompoundTemplate) { // If the minimum width does not fit into the screen - positioned on the right edge of the window
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
        return panelWidth;
    },

    getAvailableMaxWidth(itemMaxWidth: number, maxPanelWidth: number): number {
        return itemMaxWidth ? Math.min(itemMaxWidth, maxPanelWidth) : maxPanelWidth;
    },

    isMaximizedPanel(item) {
        return !!item.popupOptions.minimizedWidth && !item.popupOptions.propStorageId;
    },

    isMaximizedState(item) {
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
    getPosition(tCoords, item): IPosition {
        const maxPanelWidth = this.getMaxPanelWidth();
        const width = _private.getPanelWidth(item, tCoords, maxPanelWidth);
        // todo Оставить только метод, т.к. он универсальный для обоих окружений и позволяет избавиться от передачи
        // hasMaximizePopup по конфину окон. https://online.sbis.ru/opendoc.html?guid=19962a29-0597-4b7d-a2c8-c0461f83392b
        const hasMaximizePopup: boolean = item.hasMaximizePopup || this.hasMaximizePopup(item);
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
            // todo: Удалить minimizedWidth https://online.sbis.ru/opendoc.html?guid=8f7f8cea-b39d-4046-b5b2-f8dddae143ad
            position.minWidth = item.popupOptions.minimizedWidth || item.popupOptions.minWidth;
        }
        position.maxWidth = _private.calculateMaxWidth(this, item.popupOptions, tCoords);

        return position;
    },

    hasMaximizePopup(item): boolean {
        // Сделал пока только для старого окружения
        // https://online.sbis.ru/opendoc.html?guid=19962a29-0597-4b7d-a2c8-c0461f83392b
        if (!isNewEnvironment()) {
            const openerContainer = item.popupOptions?.opener?._container;
            const parents = goUpByControlTree(openerContainer);
            for (let i = 0; i < parents.length; i++) {
                if (parents[i]._moduleName === 'Controls/_popup/Manager/Popup' || 'Lib/Control/Dialog/Dialog') {
                    if (parents[i]._options.maximize) {
                        return true;
                    }
                }
            }
        }
        return false;

    },

    /**
     * Returns the maximum possible width of popup
     * @function Controls/_popupTemplate/Stack/Opener/StackController#getMaxPanelWidth
     */
    getMaxPanelWidth() {
        // window.innerWidth брать нельзя, при масштабировании на ios это значение меняется, что влияет на ширину панелей.
        return document.body.clientWidth - MINIMAL_PANEL_DISTANCE;
    },

    isMaximizedPanel: _private.isMaximizedPanel,

    _private
};


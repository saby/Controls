/**
 * Created by as.krasilnikov on 21.03.2018.
 */
import {detection} from 'Env/Env';
import {Controller as ManagerController, Controller, IPopupItem, IPopupPosition} from 'Controls/popup';

// Minimum popup indentation from the right edge
const MINIMAL_PANEL_DISTANCE = 48;
const RIGHT_PANEL_WIDTH = 52; // --width_stack-right_panel

export class StackStrategy {
    /**
     * Returns popup position
     * @function Controls/_popupTemplate/Stack/Opener/StackController#getPosition
     * @param tCoords Coordinates of the container relative to which the panel is displayed
     * @param item Popup configuration
     * @param isAboveMaximizePopup {Boolean}
     */
    getPosition(tCoords, item: IPopupItem, isAboveMaximizePopup: boolean = false): IPopupPosition {
        const maxPanelWidth = this.getMaxPanelWidth();
        const width = this._getPanelWidth(item, tCoords, maxPanelWidth);
        const right = this._getRightPosition(tCoords, isAboveMaximizePopup);
        const position: IPopupPosition = {
            width,
            right,
            top: tCoords.top
        };

        // Увеличиваю отзывчивость интерфейса за счет уменьшения кол-во перерисовок при ресайзе.
        // Если restrictiveContainer нет, то окно растягивается на всю высоту окна => не нужно менять height.
        if (item.calculatedRestrictiveContainer) {
            position.height = tCoords.height;
        } else {
            position.bottom = 0;
        }

        // on mobile device fixed container proxying scroll on bottom container
        if (!detection.isMobilePlatform) {
            position.position = 'fixed';
        }

        if (item.popupOptions.minWidth) {
            // todo: Delete minimizedWidth https://online.sbis.ru/opendoc.html?guid=8f7f8cea-b39d-4046-b5b2-f8dddae143ad
            position.minWidth = item.popupOptions.minimizedWidth || item.popupOptions.minWidth;
        }
        position.maxWidth = this._calculateMaxWidth(item.popupOptions, tCoords);

        return position;
    }

    isMaximizedPanel(item: IPopupItem): boolean {
        return !!item.popupOptions.minimizedWidth && !item.popupOptions.propStorageId;
    }

    /**
     * Returns the maximum possible width of popup
     * @function Controls/_popupTemplate/Stack/Opener/StackController#getMaxPanelWidth
     */
    getMaxPanelWidth(): number {
        // window.innerWidth брать нельзя, при масштабировании на ios значение меняется, что влияет на ширину панелей.
        return document.body.clientWidth - MINIMAL_PANEL_DISTANCE;
    }

    private _getRightPosition(tCoords, isAboveMaximizePopup: boolean): number {
        if (isAboveMaximizePopup) {
            const rightTemplate = this._getRightTemplate();
            if (rightTemplate) {
                return RIGHT_PANEL_WIDTH;
            }
            return 0;
        }
        return tCoords.right;
    }

    private _getRightTemplate(): string {
        return ManagerController.getRightTemplate();
    }

    private _getPanelWidth(item: IPopupItem, tCoords, maxPanelWidth: number): number {
        let panelWidth;
        const maxPanelWidthWithOffset = maxPanelWidth - tCoords.right;
        const minRightSpace = this._getRightTemplate() ? RIGHT_PANEL_WIDTH : 0;
        let minWidth = parseInt(item.popupOptions.minWidth, 10);
        const maxWidth = parseInt(item.popupOptions.maxWidth, 10);

        // todo:https://online.sbis.ru/opendoc.html?guid=8f7f8cea-b39d-4046-b5b2-f8dddae143ad
        if (this.isMaximizedPanel(item) && !item.popupOptions.propStorageId) {
            if (!this._isMaximizedState(item)) {
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
        if (minWidth > maxPanelWidthWithOffset) {
            if (this.isMaximizedPanel(item)) {
                minWidth = item.popupOptions.minimizedWidth;
            }
            if (minWidth > maxPanelWidthWithOffset) {
                tCoords.right = minRightSpace;
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
        const parentPosition = this._getParentPosition(item);
        if (parentPosition?.right === minRightSpace) {
            tCoords.right = minRightSpace;
        }
        return panelWidth;
    }

    private _getParentPosition(item: IPopupItem): IPopupPosition {
        const parentItem = Controller.find(item.parentId);
        return parentItem?.position;
    }

    private _isMaximizedState(item: IPopupItem): boolean {
        return !!item.popupOptions.maximized;
    }
    private _calculateMaxWidth(popupOptions, tCoords): number {
        const maxPanelWidth = this.getMaxPanelWidth();
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
}

export default new StackStrategy();

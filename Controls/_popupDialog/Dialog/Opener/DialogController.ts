import {default as BaseController, IDragOffset} from 'Controls/_popupTemplate/BaseController';
import {IPopupItem, IPopupOptions, IPopupSizes, IPopupPosition} from 'Controls/popup';
import {detection} from 'Env/Env';
import * as Deferred from 'Core/Deferred';
import DialogStrategy = require('Controls/_popupDialog/Dialog/Opener/DialogStrategy');
import {setSettings, getSettings} from 'Controls/Application/SettingsController';

interface IDialogItem extends IPopupItem {
    popupOptions: IDialogOptions;
    startPosition: IPopupPosition;
    dragged: boolean;
}

interface IDialogOptions extends IPopupOptions {
    maximize: boolean;
    top: number;
    left: number;
    propStorageId: string;
}

interface IWindow {
    width?: number;
    height?: number;
    scrollTop?: number;
    scrollLeft?: number;
}

const IPAD_MIN_WIDTH = 1024;

/**
 * Dialog Popup Controller
 * @class Controls/_popupDialog/Dialog/Opener/DialogController
 * @control
 * @private
 * @category Popup
 * @extends Controls/_popupTemplate/BaseController
 */
class DialogController extends BaseController {
    TYPE: string = 'Dialog';

    elementCreated(item: IDialogItem, container: HTMLDivElement): boolean {
        this._prepareConfigWithSizes(item, container);
        return true;
    }

    elementUpdated(item: IDialogItem, container: HTMLDivElement): boolean {
        /* start: We remove the set values that affect the size and positioning to get the real size of the content */
        const width: string = container.style.width;
        const height: string = container.style.height;
        // We won't remove width and height, if they are set explicitly or popup is maximize.

        if (!item.popupOptions.maximize) {
            if (!item.popupOptions.width) {
                container.style.width = 'auto';
            }
            if (!item.popupOptions.height) {
                container.style.height = 'auto';
            }
            if (item.popupOptions.maxWidth) {
                container.style.maxWidth = item.popupOptions.maxWidth + 'px';
            } else {
                container.style.maxWidth = '';
            }
            if (item.popupOptions.maxHeight) {
                container.style.maxHeight = item.popupOptions.maxHeight + 'px';
            } else {
                container.style.maxHeight = '';
            }
        }

        /* end: We remove the set values that affect the size and positioning to get the real size of the content */
        this._prepareConfigWithSizes(item, container);

        /* start: Return all values to the node. Need for vdom synchronizer */
        container.style.width = width;
        container.style.height = height;
        container.style.maxWidth = '';
        container.style.maxHeight = '';

        /* end: Return all values to the node. Need for vdom synchronizer */

        return true;
    }

    elementDestroyed(item: IPopupItem): Promise<null> {
        return (new Deferred()).callback();
    }

    getDefaultConfig(item: IDialogItem): void|Promise<void> {
        if (item.popupOptions.propStorageId) {
            return this._getPopupCoords(item).then(() => {
                this._getDefaultConfig(item);
            });
        } else {
            this._getDefaultConfig(item);
        }
    }

    popupDragStart(item: IDialogItem, container: HTMLDivElement, offset: IDragOffset): void {
        if (!item.startPosition) {
            item.startPosition = {
                left: item.position.left,
                top: item.position.top
            };
        }
        item.dragged = true;
        item.position.left = item.startPosition.left + offset.x;
        item.position.top = item.startPosition.top + offset.y;

        // Take the size from cache, because they don't change when you move
        this._prepareConfig(item, item.sizes);
    }

    popupDragEnd(item: IDialogItem): void {
        this._savePopupCoords(item);
        delete item.startPosition;
    }

    resizeOuter(item: IPopupItem, container: HTMLDivElement): boolean {
        // На ios ресайз страницы - это зум. Не реагируем на него.
        if (!detection.isMobileIOS) {
            return this._elementUpdated(item, container);
        }
        // ресайз страницы это также смена ориентации устройства
        // если окно открыто на полный экран, то после переворота оно должно остаться на весь экран
        //TODO: will be fixed by https://online.sbis.ru/opendoc.html?guid=1b290673-5722-41cb-8120-ad6af46e64aa
        if (window.innerWidth >= IPAD_MIN_WIDTH && item.popupOptions.maximize ) {
            return this._elementUpdated(item, container);
        }
        return false;
    }

    pageScrolled(): boolean {
        // Don't respond to page scrolling. The popup should remain where it originally positioned.
        return false;
    }

    needRecalcOnKeyboardShow(): boolean {
        return true;
    }

    _isIOS12(): boolean {
        return detection.isMobileIOS && detection.IOSVersion === 12;
    }

    _prepareConfigWithSizes(item: IDialogItem, container: HTMLDivElement): void {
        const sizes: IPopupSizes = this._getPopupSizes(item, container);
        item.sizes = sizes;
        this._prepareConfig(item, sizes);
    }

    _prepareConfig(item: IDialogItem, sizes: IPopupSizes): void {
        // After popup will be transferred to the synchronous change of coordinates,
        // we need to return the calculation of the position with the keyboard.
        // Positioning relative to body
        item.position = DialogStrategy.getPosition(this._getWindowSize(), sizes, item);
        this._fixCompatiblePosition(item);
    }

    _fixCompatiblePosition(item: IDialogItem): void {
        // COMPATIBLE: for old windows user can set the coordinates relative to the body
        if (!item.dragged) {
            if (item.popupOptions.top !== undefined) {
                item.position.top = item.popupOptions.top;
            }
            if (item.popupOptions.left !== undefined) {
                // Calculating the left position when reducing the size of the browser window
                const differenceWindowWidth: number =
                    (item.popupOptions.left + item.popupOptions.width) - this._getWindowSize().width;
                if (differenceWindowWidth > 0) {
                    item.position.left = item.popupOptions.left - differenceWindowWidth;
                } else {
                    item.position.left = item.popupOptions.left;
                }
            }
        }
    }

    private _getPopupCoords(item: IDialogItem): Promise<undefined> {
        return new Promise((resolve) => {
            const propStorageId = item.popupOptions.propStorageId;
            if (propStorageId) {
                getSettings([propStorageId]).then((storage) => {
                    if (storage && storage[propStorageId]) {
                        item.popupOptions.top = storage[propStorageId].top;
                        item.popupOptions.left = storage[propStorageId].left;
                    }
                    resolve();
                });
            } else {
                resolve();
            }
        });
    }

    private _savePopupCoords(item: IDialogItem): void {
        const propStorageId = item.popupOptions.propStorageId;
        if (propStorageId && item.position.top >= 0 && item.position.left >= 0) {
            setSettings({[propStorageId]: {
                    top: item.position.top,
                    left: item.position.left
                }});
        }
    }

    private _getDefaultConfig(item: IDialogItem): void {
        // set sizes before positioning. Need for templates who calculate sizes relatively popup sizes
        const sizes: IPopupSizes = {
            width: 0,
            height: 0
        };
        let defaultCoordinate: number = -10000;
        this._prepareConfig(item, sizes);

        // Error on ios when position: absolute container is created outside the screen and stretches the page
        // which leads to incorrect positioning due to incorrect coordinates. + on page scroll event firing
        if (this._isIOS12()) {
            defaultCoordinate = 0;
            item.position.invisible = true;
        }
        // Get top and left coordinate from propStorageId
        item.position.top = item.popupOptions.top || defaultCoordinate;
        item.position.left = item.popupOptions.left || defaultCoordinate;
    }

    private _getWindowSize(): IWindow {
        //TODO: https://online.sbis.ru/opendoc.html?guid=e049a729-ff28-46a4-9122-76e198ab30bd
        return {
            width: window.innerWidth,
            height: window.innerHeight,
            scrollTop: window.scrollY,
            scrollLeft: window.scrollX
        };
    }
}

export = new DialogController();

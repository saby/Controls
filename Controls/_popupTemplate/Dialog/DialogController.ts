import {default as BaseController, RIGHT_PANEL_WIDTH} from 'Controls/_popupTemplate/BaseController';
import {IPopupItem, IDialogPopupOptions, IPopupSizes, IPopupPosition, Controller as ManagerController, IDragOffset} from 'Controls/popup';
import {detection} from 'Env/Env';
import {List} from 'Types/collection';
import * as Deferred from 'Core/Deferred';
import DialogStrategy from 'Controls/_popupTemplate/Dialog/DialogStrategy';
import {setSettings, getSettings} from 'Controls/Application/SettingsController';
import {getPositionProperties, HORIZONTAL_DIRECTION, VERTICAL_DIRECTION} from './DirectionUtil';

export interface IDialogItem extends IPopupItem {
    hasSavedPosition: boolean;
    popupOptions: IDialogPopupOptions;
    startPosition: IPopupPosition;
    dragged: boolean;
    targetCoords: object;
    contextIsTouch: boolean;
}

const IPAD_MIN_WIDTH = 1024;

/**
 * Dialog Popup Controller
 * @class Controls/_popupTemplate/Dialog/Opener/DialogController
 *
 * @private
 * @extends Controls/_popupTemplate/BaseController
 */
class DialogController extends BaseController {
    TYPE: string = 'Dialog';
    _dialogList: List<IDialogItem> = new List();

    elementCreated(item: IDialogItem, container: HTMLElement): boolean {
        this._prepareConfigWithSizes(item, container);
        this._dialogList.add(item);
        return true;
    }

    elementUpdated(item: IDialogItem, container: HTMLElement): boolean {
        /* start: We remove the set values that affect the size and positioning to get the real size of the content */
        const width: string = container.style.width;
        const height: string = container.style.height;
        // Если внутри лежит скроллконтейнер, то восстанавливаем позицию скролла после изменения размеров
        const scroll = container.querySelector('.controls-Scroll__content');
        const scrollTop = scroll?.scrollTop;
        // We won't remove width and height, if they are set explicitly or popup is maximize.

        if (!item.popupOptions.maximize) {
            if (item.popupOptions.maxWidth) {
                container.style.maxWidth = item.popupOptions.maxWidth + 'px';
            } else {
                container.style.maxWidth = '';
            }
            const bodyHeight = document?.body.clientHeight;
            if (item.popupOptions.maxHeight) {
                let maxHeight = item.popupOptions.maxHeight;
                if (bodyHeight && bodyHeight < maxHeight) {
                    maxHeight = bodyHeight;
                }
                container.style.maxHeight = maxHeight + 'px';
            } else {
                container.style.maxHeight = bodyHeight + 'px';
            }
            if (!item.popupOptions.width) {
                container.style.width = 'auto';
            }
            if (!item.popupOptions.height) {
                container.style.height = 'auto';
            }
        }

        /* end: We remove the set values that affect the size and positioning to get the real size of the content */
        this._prepareConfigWithSizes(item, container);

        /* start: Return all values to the node. Need for vdom synchronizer */
        container.style.width = width;
        container.style.height = height;
        container.style.maxWidth = item.position.maxWidth ? `${item.position.maxWidth}px` : '';
        container.style.maxHeight = item.position.maxHeight ? `${item.position.maxHeight}px` : '';
        scroll?.scrollTop = scrollTop;
        /* end: Return all values to the node. Need for vdom synchronizer */

        return true;
    }

    elementDestroyed(item: IDialogItem): Promise<null> {
        this._dialogList.remove(item);
        return (new Deferred()).callback();
    }

    getDefaultConfig(item: IDialogItem): void|Promise<void> {
        const {
            horizontal: horisontalProperty,
            vertical: verticalProperty
        } = getPositionProperties(item.popupOptions.resizeDirection);
        if (item.popupOptions.propStorageId) {
            return this._getPopupCoords(item, horisontalProperty, verticalProperty).then(() => {
                this._getDefaultConfig(item, horisontalProperty, verticalProperty);
            });
        } else {
            this._getDefaultConfig(item, horisontalProperty, verticalProperty);
        }
    }

    popupDragStart(item: IDialogItem, container: HTMLElement, offset: IDragOffset): void {
        const {
            horizontal: horizontalProperty,
            vertical: verticalProperty
        } = getPositionProperties(item.popupOptions.resizeDirection);
        const horizontalOffset = horizontalProperty === HORIZONTAL_DIRECTION.LEFT ? offset.x : -offset.x;
        const verticalOffset = verticalProperty === VERTICAL_DIRECTION.TOP ? offset.y : -offset.y;
        if (!item.startPosition) {
            item.startPosition = {
                [horizontalProperty]: item.position[horizontalProperty],
                [verticalProperty]: item.position[verticalProperty]
            };
        }
        item.dragged = true;
        item.position[horizontalProperty] = item.startPosition[horizontalProperty] + horizontalOffset;
        item.position[verticalProperty] = item.startPosition[verticalProperty] + verticalOffset;

        // Take the size from cache, because they don't change when you move
        this._prepareConfig(item, item.sizes);
    }

    popupDragEnd(item: IDialogItem, offset: number): void {
        this._savePopupCoords(item);
        delete item.startPosition;
    }

    resizeOuter(item: IDialogItem, container: HTMLElement): boolean {
        // На ios ресайз страницы - это зум. Не реагируем на него.
        if (!detection.isMobileIOS) {
            return this.elementUpdatedWrapper(item, container);
        }
        // ресайз страницы это также смена ориентации устройства
        // если окно открыто на полный экран, то после переворота оно должно остаться на весь экран
        //TODO: will be fixed by https://online.sbis.ru/opendoc.html?guid=1b290673-5722-41cb-8120-ad6af46e64aa
        if (window.innerWidth >= IPAD_MIN_WIDTH && item.popupOptions.maximize) {
            return this.elementUpdatedWrapper(item, container);
        }
        return false;
    }

    resizeInner(item: IDialogItem, container: HTMLElement): boolean {
        /* Если задан resizeDirection не перепозиционируем,
           т.к. это опция отвечает как раз за ресайз без изменения позиции */
        if (item.popupOptions?.resizeDirection) {

            // Обновляем только размеры попапа
            item.sizes = this._getPopupSizes(item, container);
            return false;
        }
        return super.resizeInner(item, container);
    }

    pageScrolled(): boolean {
        // Don't respond to page scrolling. The popup should remain where it originally positioned.
        return false;
    }

    needRecalcOnKeyboardShow(): boolean {
        return true;
    }

    dragNDropOnPage(item: IDialogItem, container: HTMLElement, isInsideDrag: boolean): boolean {
        if (item.popupOptions.target) {
            if (!isInsideDrag && !item.hasSavedPosition) {
                item.dragged = false;
                this._prepareConfigWithSizes(item, container);
            }
        }
        return false;
    }

    private _isIOS12(): boolean {
        return detection.isMobileIOS && detection.IOSVersion === 12;
    }

    private _prepareConfigWithSizes(item: IDialogItem, container: HTMLElement): void {
        const sizes: IPopupSizes = this._getPopupSizes(item, container);
        item.sizes = sizes;
        this._prepareConfig(item, sizes);
    }

    private _prepareConfig(item: IDialogItem, sizes: IPopupSizes): void {
        // After popup will be transferred to the synchronous change of coordinates,
        // we need to return the calculation of the position with the keyboard.
        // Positioning relative to body
        if (item.popupOptions.target) {
            item.targetCoords = this._getTargetCoords(item);
        }
        const windowData = this._getRestrictiveContainerSize(item);
        if (!item.sizes) {
            item.sizes = {};
        }
        item.sizes.margins = this._getMargins(item);
        item.position = DialogStrategy.getPosition(windowData, sizes, item);
    }

    private _getPopupCoords(
        item: IDialogItem,
        horizontalPositionProperty: string,
        verticalPositionProperty: string
    ): Promise<undefined> {
        return new Promise((resolve) => {
            const propStorageId = item.popupOptions.propStorageId;
            if (propStorageId) {
                getSettings([propStorageId]).then((storage) => {
                    if (storage && storage[propStorageId]) {
                        const vertical = storage[propStorageId][verticalPositionProperty];
                        const horizontal = storage[propStorageId][horizontalPositionProperty];
                        if (vertical !== undefined && horizontal !== undefined) {
                            item.hasSavedPosition = true;
                            item.popupOptions[verticalPositionProperty] = vertical;
                            item.popupOptions[horizontalPositionProperty] = horizontal;
                            // Если сохранена позиция, то считаем что окно уже перемещали.
                            item.dragged = true;
                        }
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
        const {
            vertical: verticalProperty,
            horizontal: horizontalProperty
        } = getPositionProperties(item.popupOptions.resizeDirection);
        if (propStorageId && item.position[verticalProperty] >= 0 && item.position[horizontalProperty] >= 0) {
            setSettings({[propStorageId]: {
                [verticalProperty]: item.position[verticalProperty],
                [horizontalProperty]: item.position[horizontalProperty]
            }});
        }
    }

    private _getDefaultConfig(
        item: IDialogItem,
        horizontalPositionProperty: string,
        verticalPositionProperty: string
    ): void {
        // set sizes before positioning. Need for templates who calculate sizes relatively popup sizes
        const sizes: IPopupSizes = {
            width: 0,
            height: 0
        };
        this._prepareConfig(item, sizes);
        let defaultCoordinate: number = -10000;

        // Error on ios when position: absolute container is created outside the screen and stretches the page
        // which leads to incorrect positioning due to incorrect coordinates. + on page scroll event firing
        if (this._isIOS12()) {
            defaultCoordinate = 0;
            item.position.invisible = true;
        }

        // Диалог изначально должен позиционироваться вне экрана, если не задана позиция(например из propStorage)
        item.position[verticalPositionProperty] = item.popupOptions[verticalPositionProperty] || defaultCoordinate;
        item.position[horizontalPositionProperty] = item.popupOptions[horizontalPositionProperty] || defaultCoordinate;
    }

    private _hasMaximizePopup(): boolean {
        let hasMaximizePopup = false;
        this._dialogList.each((item: IDialogItem) => {
            if (item.popupOptions.maximize) {
                hasMaximizePopup = true;
            }
        });
        return hasMaximizePopup;
    }

    private _getRestrictiveContainerSize(item: IDialogItem): IPopupPosition {
        // Если окно развернуто на весь экран, то оно должно строиться по позиции body.
        // Так же если окно открывается выше окна на весь экран (задана опция topPopup,
        // либо есть связака по опенерам), позиция должна быть так же по body.
        const isBodyTargetContainer = item.popupOptions.maximize ||
            (item.popupOptions.topPopup && this._hasMaximizePopup()) || this._isAboveMaximizePopup(item);

        if (isBodyTargetContainer) {
            return BaseController.getCoordsByContainer('body') as IPopupPosition;
        }
        const dialogTargetContainer = '.controls-Popup__dialog-target-container';
        const position = BaseController.getRootContainerCoords(item, dialogTargetContainer) as IPopupPosition;
        if (ManagerController.getRightTemplate()) {
            position.width += RIGHT_PANEL_WIDTH;
        }
        return position;
    }
}

export default new DialogController();

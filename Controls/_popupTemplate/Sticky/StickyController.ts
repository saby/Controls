import {default as BaseController} from 'Controls/_popupTemplate/BaseController';
import StickyStrategy from 'Controls/_popupTemplate/Sticky/StickyStrategy';
import * as cMerge from 'Core/core-merge';
import * as cClone from 'Core/core-clone';
import * as cInstance from 'Core/core-instance';
import * as StickyContent from 'wml!Controls/_popupTemplate/Sticky/Template/StickyContent';
import getTargetCoords from 'Controls/_popupTemplate/TargetCoords';
import {Logger} from 'UI/Utils';
import {getScrollbarWidthByMeasuredBlock} from 'Controls/scroll';
import {ControllerClass as DnDController} from 'Controls/dragnDrop';
import {constants, detection} from 'Env/Env';
import {IPopupItem, IPopupSizes, IStickyPopupOptions, IStickyPosition} from 'Controls/popup';
import {ITargetCoords} from 'Controls/_popupTemplate/TargetCoords';

export type TVertical = 'top' | 'bottom' | 'center';
export type THorizontal = 'left' | 'right' | 'center';

export interface IStickyAlignment {
    vertical?: TVertical;
    horizontal?: THorizontal;
}

export interface IStickyOffset {
    vertical: number;
    horizontal: number;
}

interface IStickyPositionConfigSizes {
    width: number;
    height: number;
    minWidth: number;
    minHeight: number;
    maxWidth: number;
    maxHeight: number;
}

export interface IStickyPositionConfig {
    targetPoint?: IStickyAlignment;
    direction?: IStickyAlignment;
    offset?: IStickyOffset;
    config: IStickyPositionConfigSizes;
    fittingMode: IStickyPosition;
    restrictiveContainerCoords?: ITargetCoords;
    sizes: IPopupSizes;
}

export interface IStickyItem extends IPopupItem {
    popupOptions: IStickyPopupOptions;
    positionConfig: IStickyPositionConfig;
}

const DEFAULT_OPTIONS = {
    direction: {
        horizontal: 'right',
        vertical: 'bottom'
    },
    offset: {
        horizontal: 0,
        vertical: 0
    },
    targetPoint: {
        vertical: 'top',
        horizontal: 'left'
    },
    fittingMode: {
        horizontal: 'adaptive',
        vertical: 'adaptive'
    }
};

/**
 * Sticky Popup Controller
 * @class Controls/_popupTemplate/Sticky/StickyController
 *
 * @private
 */
export class StickyController extends BaseController {
    TYPE: string = 'Sticky';
    _bodyOverflow: string;

    elementCreated(item: IStickyItem, container: HTMLElement): boolean {
        if (this._isTargetVisible(item)) {
            this._setStickyContent(item);
            item.position.position = undefined;
            this.prepareConfig(item, container);
        } else {
            this._printTargetRemovedWarn();
        }
        return true;
    }

    elementUpdated(item: IStickyItem, container: HTMLElement): boolean {
        this._setStickyContent(item);
        const targetCoords = this._getTargetCoords(item, item.positionConfig.sizes);
        this._updateStickyPosition(item, item.positionConfig, targetCoords);
        if (this._isTargetVisible(item)) {
            this._updateClasses(item, item.positionConfig);

            // If popupOptions has new sizes, calculate position using them.
            // Else calculate position using current container sizes.
            this._updateSizes(item.positionConfig, item.popupOptions);
            const targetCoords = this._getTargetCoords(item, item.positionConfig.sizes);

            item.position = StickyStrategy.getPosition(item.positionConfig, targetCoords);

            // In landscape orientation, the height of the screen is low when the keyboard is opened.
            // Open Windows are not placed in the workspace and chrome scrollit body.
            if (detection.isMobileAndroid) {
                const height = item.position.height || container.clientHeight;
                if (height > document.body.clientHeight) {
                    item.position.height = document.body.clientHeight;
                    item.position.top = 0;
                } else if (item.position.height + item.position.top > document.body.clientHeight) {
                    // opening the keyboard reduces the height of the body. If popup was positioned at the bottom of
                    // the window, he did not have time to change his top coordinate => a scroll appeared on the body
                    const dif = item.position.height + item.position.top - document.body.clientHeight;
                    item.position.top -= dif;
                }
            }
        } else {
            this._printTargetRemovedWarn();
        }
        return true;
    }

    elementAfterUpdated(item: IStickyItem, container: HTMLElement): boolean {
        // TODO https://online.sbis.ru/doc/a88a5697-5ba7-4ee0-a93a-221cce572430
        if (!this._isTargetVisible(item)) {
            this._printTargetRemovedWarn();
            return false;
        }
        /* start: We remove the set values that affect the size and positioning to get the real size of the content */
        const isBrowser = constants.isBrowserPlatform;
        const width = container.style.width;
        const maxWidth = container.style.maxWidth;
        // Если внутри лежит скроллконтейнер, то восстанавливаем позицию скролла после изменения размеров
        const scroll = container.querySelector('.controls-Scroll__content');
        const scrollTop = scroll?.scrollTop;
        container.style.maxHeight = item.popupOptions.maxHeight ? item.popupOptions.maxHeight + 'px' : '100vh';
        container.style.maxWidth = item.popupOptions.maxWidth ? item.popupOptions.maxWidth + 'px' : '100vw';
        const hasScrollBeforeReset = isBrowser && (document.body.scrollHeight > document.body.clientHeight);
        // Если значения явно заданы на опциях, то не сбрасываем то что на контейнере
        if (!item.popupOptions.width) {
            container.style.width = 'auto';
        }
        if (!item.popupOptions.height) {
            container.style.height = 'auto';
        }
        let hasScrollAfterReset = isBrowser && (document.body.scrollHeight > document.body.clientHeight);
        if (hasScrollAfterReset) {
            // Скролл на боди может быть отключен через стили
           if (!this._bodyOverflow) {
               this._bodyOverflow = getComputedStyle(document.body).overflowY;
           }
           if (this._bodyOverflow === 'hidden') {
               hasScrollAfterReset = false;
           }
        }

        /* end: We remove the set values that affect the size and positioning to get the real size of the content */

        this.prepareConfig(item, container);

        // Для ситуаций, когда скролл на боди: После сброса высоты для замеров содержимого (style.height = 'auto'),
        // содержимое может быть настолько большим, что выходит за пределы окна браузера (maxHeight 100vh не помогает,
        // т.к. таргет может находиться по центру, соответственно пол попапа все равно уйдет за пределы экрана).
        // Если контент вылез за пределы - на боди появится скролл, но он пропадет, после того как мы высчитаем позицию
        // окна (а считать будем с учетом скролла на странице) и ограничим его размеры.
        // Если позиция идет по координате right (теоретически тоже самое для bottom), то это показ/скрытие скролла
        // влияет на позиционирование. Компенсирую размеры скроллбара.
        if (!hasScrollBeforeReset && hasScrollAfterReset) {
            if (item.position.right) {
                item.position.right += getScrollbarWidthByMeasuredBlock();
            }
        }

        /* start: Return all values to the node. Need for vdom synchronizer */
        container.style.width = width;
        container.style.maxWidth = maxWidth;
        // После того, как дочерние контролы меняют размеры, они кидают событие controlResize, окно отлавливает событие,
        // измеряет верстку и выставляет себе новую позицию и размеры. Т.к. это проходит минимум в 2 цикла синхронизации
        // то визуально видны прыжки. Уменьшаю на 1 цикл синхронизации простановку размеров
        // Если ограничивающих размеров нет (контент влезает в экран), то ставим высоту по контенту.
        container.style.maxHeight = item.position.maxHeight ? item.position.maxHeight + 'px' : '';
        container.style.height = item.position.height ? item.position.height + 'px' : 'auto';

        // Синхронно ставлю новую позицию, чтобы не было прыжков при изменении контента
        const verticalPosition = item.position.top ? 'top' : 'bottom';
        const revertVerticalPosition = item.position.top ? 'bottom' : 'top';
        container.style[verticalPosition] = item.position[verticalPosition] + 'px';
        container.style[revertVerticalPosition] = 'auto';

        //TODO: https://online.sbis.ru/opendoc.html?guid=5ddf9f3b-2d0e-49aa-b5ed-12e943c761d8
        scroll?.scrollTop = scrollTop;
        /* end: Return all values to the node. Need for vdom synchronizer */

        return true;
    }

    resizeInner(item: IStickyItem, container: HTMLElement): boolean {
        return this.elementAfterUpdated(item, container);
    }

    dragNDropOnPage(item: IStickyItem, container: HTMLDivElement, isInsideDrag: boolean): boolean {
        const hasChilds = !!item.childs.length;
        const needClose = !isInsideDrag && item.popupOptions.closeOnOutsideClick && !hasChilds;
        if (needClose) {
            return true;
        }
        // Если не закрылись, то зовем пересчет позиции, после драга таргет мог поменять позицию
        this.prepareConfig(item, container);
    }

    getDefaultConfig(item: IStickyItem): void {
        this._setStickyContent(item);
        item.popupOptions = this._prepareOriginPoint(item.popupOptions);
        const popupCfg = this._getPopupConfig(item);
        this._updateStickyPosition(item, popupCfg);
        // Если идет dnd на странице, стики окна не открываем
        if (DnDController.isDragging()) {
            return;
        }
        item.position = {
            top: -10000,
            left: -10000,
            minWidth: item.popupOptions.minWidth,
            maxWidth: item.popupOptions.maxWidth || this._getWindowWidth(),
            minHeight: item.popupOptions.minHeight,
            maxHeight: item.popupOptions.maxHeight || this._getWindowHeight(),
            width: item.popupOptions.width,
            height: item.popupOptions.height,

            // Error on ios when position: absolute container is created outside the screen and stretches the page
            // which leads to incorrect positioning due to incorrect coordinates. + on page scroll event firing
            // Treated position:fixed when positioning pop-up outside the screen
            position: 'fixed'
        };

        if (detection.isMobileIOS) {
            item.position.top = 0;
            item.position.left = 0;
            item.position.invisible = true;
        }
    }

    needRecalcOnKeyboardShow(): boolean {
        return true;
    }

    beforeUpdateOptions(item: IStickyItem): void {
        // sticky must update on elementAfterUpdatePhase
    }

    afterUpdateOptions(item: IStickyItem): void {
        // sticky must update on elementAfterUpdatePhase
    }

    prepareConfig(item: IStickyItem, container: HTMLElement): void {
        this._removeOrientationClasses(item);
        this._getPopupSizes(item, container);
        item.sizes.margins = this._getMargins(item);
        this._prepareConfig(item, item.sizes);
    }

    _getPopupConfig(item: IStickyItem, sizes: IPopupSizes = {}): IStickyPositionConfig {
        const restrictiveContainerCoords = this._getRestrictiveContainerCoords(item);
        return {
            targetPoint: cMerge(cClone(DEFAULT_OPTIONS.targetPoint), item.popupOptions.targetPoint || {}),
            restrictiveContainerCoords,
            direction: cMerge(cClone(DEFAULT_OPTIONS.direction), item.popupOptions.direction || {}),
            offset: cMerge(cClone(DEFAULT_OPTIONS.offset), item.popupOptions.offset || {}),
            config: {
                width: item.popupOptions.width,
                height: item.popupOptions.height,
                minWidth: item.popupOptions.minWidth,
                minHeight: item.popupOptions.minHeight,
                maxWidth: item.popupOptions.maxWidth,
                maxHeight: item.popupOptions.maxHeight
            },
            sizes,
            fittingMode: item.popupOptions.fittingMode as IStickyPosition
        };
    }

    private _prepareOriginPoint(config: IStickyPopupOptions): IStickyPopupOptions {
        const newCfg = {...config};
        newCfg.direction = newCfg.direction || {};
        newCfg.offset = newCfg.offset || {};

        if (typeof config.fittingMode === 'string') {
            newCfg.fittingMode = {
                vertical: config.fittingMode,
                horizontal: config.fittingMode
            };
        } else {
            if (config.fittingMode) {
                if (!config.fittingMode.vertical) {
                    newCfg.fittingMode.vertical = 'adaptive';
                }
                if (!config.fittingMode.horizontal) {
                    newCfg.fittingMode.horizontal = 'adaptive';
                }
            }
        }
        if (!config.fittingMode) {
            newCfg.fittingMode =  DEFAULT_OPTIONS.fittingMode;
        }
        return newCfg;
    }
    private _prepareConfig(item: IStickyItem, sizes: IPopupSizes): void {
        item.popupOptions = this._prepareOriginPoint(item.popupOptions);
        const popupCfg = this._getPopupConfig(item, sizes);

        const targetCoords = this._getTargetCoords(item, sizes);
        item.position = StickyStrategy.getPosition(popupCfg, targetCoords);
        this._updateStickyPosition(item, popupCfg, targetCoords);

        item.positionConfig = popupCfg;
        this._updateClasses(item, popupCfg);
    }

    private _updateClasses(item: IStickyItem, popupCfg: IStickyPositionConfig): void {
        // Remove the previous classes of direction and add new ones
        this._removeOrientationClasses(item);
        item.popupOptions.className = (item.popupOptions.className || '') + ' ' + this._getOrientationClasses(popupCfg);
    }

    private _updateSizes(positionCfg: IStickyPositionConfig, popupOptions: IStickyPopupOptions): void {
        const properties = ['width', 'maxWidth', 'minWidth', 'height', 'maxHeight', 'minHeight'];
        properties.forEach((prop) => {
            if (popupOptions[prop]) {
                positionCfg.config[prop] = popupOptions[prop];
            }
        });
    }

    private _getOrientationClasses(popupOptions: IStickyPopupOptions): string {
        let className = 'controls-Popup-corner-vertical-' + popupOptions.targetPoint.vertical;
        className += ' controls-Popup-corner-horizontal-' + popupOptions.targetPoint.horizontal;
        className += ' controls-Popup-align-horizontal-' + popupOptions.direction.horizontal;
        className += ' controls-Popup-align-vertical-' + popupOptions.direction.vertical;
        return className;
    }

    private _removeOrientationClasses(item: IStickyItem): void {
        if (item.popupOptions.className) {
            item.popupOptions.className = item.popupOptions.className.replace(/controls-Popup-corner\S*|controls-Popup-align\S*/g, '').trim();
        }
    }

    private _updateStickyPosition(item: IStickyItem, position: IStickyPositionConfig,
                                  targetCoords?: ITargetCoords): void {
        const newStickyPosition = {
            targetPoint: position.targetPoint,
            direction: position.direction,
            offset: position.offset,
            position: item.position,
            targetPosition: targetCoords,
            margins: item.margins,
            sizes: item.sizes
        };
        // быстрая проверка на равенство простых объектов
        if (JSON.stringify(item.popupOptions.stickyPosition) !== JSON.stringify(newStickyPosition)) {
            item.popupOptions.stickyPosition = newStickyPosition;
        }
    }

    private _getWindowWidth(): number {
        return constants.isBrowserPlatform && window.innerWidth;
    }
    private _getWindowHeight(): number {
        return constants.isBrowserPlatform && window.innerHeight;
    }
    private _setStickyContent(item: IStickyItem): void {
        item.popupOptions.content = StickyContent;
    }

    private _getRestrictiveContainerCoords(item: IStickyItem): ITargetCoords {
        if (item.popupOptions.restrictiveContainer) {
            let restrictiveContainer;
            if (cInstance.instanceOfModule(item.popupOptions.restrictiveContainer, 'UI/Base:Control')) {
                restrictiveContainer = item.popupOptions.restrictiveContainer._container;
            } else if (item.popupOptions.restrictiveContainer instanceof HTMLElement) {
                restrictiveContainer = item.popupOptions.restrictiveContainer;
            } else if (typeof item.popupOptions.restrictiveContainer === 'string') {
                // ищем ближайшего
                restrictiveContainer = item.popupOptions.target.closest(item.popupOptions.restrictiveContainer);
                if (!restrictiveContainer) {
                    restrictiveContainer = document.querySelector(item.popupOptions.restrictiveContainer);
                }
            }

            if (restrictiveContainer) {
                return getTargetCoords(restrictiveContainer);
            }
        }
    }

    private _printTargetRemovedWarn(): void {
        Logger.warn('Controls/popup:Sticky: Пропал target из DOM. Позиция окна может быть не верная');
    }

    protected _isTargetVisible(item: IStickyItem): boolean {
        const targetCoords = this._getTargetCoords(item, {});
        return !!targetCoords.width;
    }
}

export default new StickyController();

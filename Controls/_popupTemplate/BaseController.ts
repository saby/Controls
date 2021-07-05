import Deferred = require('Core/Deferred');
import Utils = require('Types/util');
import oldWindowManager from 'Controls/_popupTemplate/_oldWindowManager';
import {Controller as ManagerController, IPopupItem, IPopupPosition, IPopupSizes} from 'Controls/popup';
import * as TargetCoords from 'Controls/_popupTemplate/TargetCoords';
import {Control} from 'UI/Base';
import {goUpByControlTree} from 'UI/Focus';
import {Logger} from 'UI/Utils';
import {constants} from 'Env/Env';
import * as cMerge from 'Core/core-merge';
import * as cInstance from 'Core/core-instance';

export interface IDragOffset {
    x: number;
    y: number;
}

let _fakeDiv: HTMLDivElement;
/**
 * Base Popup Controller
 * @class Controls/_popupTemplate/BaseController
 * @author Красильников А.С.
 * @private
 */
abstract class BaseController {

    POPUP_STATE_INITIALIZING: string = 'initializing'; // До того как окно замаунтилось
    POPUP_STATE_CREATED: string = 'created'; // Окно замаунтилось
    POPUP_STATE_UPDATING: string = 'updating'; // Перед обновлением опций окна
    POPUP_STATE_UPDATED: string = 'updated'; // После обновления опций окна
    POPUP_STATE_START_DESTROYING: string = 'startDestroying'; // Окно начало удаление, перед всеми операциями по закрытию детей и пендингов
    POPUP_STATE_DESTROYING: string = 'destroying'; // Окно в процессе удаления (используется где есть операции перед удалением, например анимация)
    POPUP_STATE_DESTROYED: string = 'destroyed'; // Окно удалено из верстки

    abstract elementCreated(item: IPopupItem, container: HTMLDivElement): boolean;

    abstract elementUpdated(item: IPopupItem, container: HTMLDivElement): boolean;

    abstract elementAfterUpdated(item: IPopupItem, container: HTMLDivElement): boolean;

    abstract elementMaximized(item: IPopupItem, container: HTMLDivElement, state: boolean): boolean;

    abstract popupResizingLine(item: IPopupItem, offset: IDragOffset): boolean;

    abstract popupDragStart(item: IPopupItem, container: HTMLDivElement, offset: IDragOffset): void;

    abstract popupDragEnd(item: IPopupItem): void;

    abstract elementAnimated(item: IPopupItem): boolean;

    _elementCreated(item: IPopupItem, container: HTMLDivElement): boolean {
        if (this._checkContainer(item, container, 'elementCreated')) {
            item.popupState = this.POPUP_STATE_CREATED;
            oldWindowManager.addZIndex(item.currentZIndex);
            if (item.popupOptions.autoClose) {
                this._closeByTimeout(item);
            }
            return this.elementCreated && this.elementCreated.apply(this, arguments);
        }
    }
    _popupDragEnd(item: IPopupItem): boolean {
        return this.popupDragEnd && this.popupDragEnd.apply(this, arguments);
    }
    _elementUpdated(item: IPopupItem, container: HTMLDivElement): boolean {
        if (this._checkContainer(item, container, 'elementUpdated')) {
            if (item.popupState === this.POPUP_STATE_CREATED ||
                item.popupState === this.POPUP_STATE_UPDATED ||
                item.popupState === this.POPUP_STATE_UPDATING) {
                item.popupState = this.POPUP_STATE_UPDATING;
                this.elementUpdated && this.elementUpdated.apply(this, arguments);
                return true;
            }
        }
        return false;
    }

    _elementAfterUpdated(item: IPopupItem, container: HTMLDivElement): boolean {
        if (this._checkContainer(item, container, 'elementAfterUpdated')) {
            // We react only after the update phase from the controller
            if (item.popupState === this.POPUP_STATE_UPDATING) {
                item.popupState = this.POPUP_STATE_UPDATED;
                return this.elementAfterUpdated && this.elementAfterUpdated.apply(this, arguments);
            }
        }
        return false;
    }

    _beforeElementDestroyed(item: IPopupItem, container: HTMLDivElement): void {
        item.popupState = this.POPUP_STATE_START_DESTROYING;
    }

    _elementDestroyed(item: IPopupItem, container: HTMLDivElement): Promise<undefined> {
        if (item.popupState === this.POPUP_STATE_INITIALIZING) {
            return (new Deferred()).callback();
        }
        if (item.popupState === this.POPUP_STATE_DESTROYED || item.popupState === this.POPUP_STATE_DESTROYING) {
            return item._destroyDeferred;
        }

        if (item.popupState !== this.POPUP_STATE_DESTROYED) {
            item.popupState = this.POPUP_STATE_DESTROYING;
            item._destroyDeferred = this.elementDestroyed && this.elementDestroyed.apply(this, arguments);
            return item._destroyDeferred.addCallback(() => {
                oldWindowManager.removeZIndex(item.currentZIndex);
                item.popupState = this.POPUP_STATE_DESTROYED;
            });
        }
        return (new Deferred()).callback();
    }

    _elementMaximized(item: IPopupItem, container: HTMLDivElement, state: boolean): boolean {
        return this.elementMaximized && this.elementMaximized(item, container, state);
    }

    _popupResizingLine(item: IPopupItem, offset: IDragOffset): boolean {
        return this.popupResizingLine && this.popupResizingLine(item, offset);
    }

    _elementAnimated(item: IPopupItem): boolean {
        return this.elementAnimated && this.elementAnimated(item);
    }

    orientationChanged(item: IPopupItem, container: HTMLDivElement): boolean {
        return this._elementUpdated(item, container);
    }

    getDefaultConfig(item: IPopupItem): void {
        item.position = {
            top: -10000,
            left: -10000,
            maxWidth: item.popupOptions.maxWidth,
            minWidth: item.popupOptions.minWidth,
            maxHeight: item.popupOptions.maxHeight,
            minHeight: item.popupOptions.minHeight
        };
    }

    closePopupByOutsideClick(item: IPopupItem): void {
        if (ManagerController) {
            ManagerController.remove(item.id);
        }
    }

    _beforeUpdateOptions(item: IPopupItem): void {
        item.popupState = item.controller.POPUP_STATE_INITIALIZING;
    }

    _afterUpdateOptions(item: IPopupItem): void {
        item.popupState = item.controller.POPUP_STATE_CREATED;
    }

    protected elementDestroyed(item: IPopupItem): Promise<undefined> {
        return (new Deferred()).callback();
    }

    protected elementUpdateOptions(item: IPopupItem, container: HTMLDivElement): boolean | Promise<boolean> {
        return this._elementUpdated(item, container);
    }

    protected pageScrolled(item: IPopupItem, container: HTMLDivElement): boolean {
        return this._elementUpdated(item, container);
    }

    protected popupDeactivated(item: IPopupItem): void {
        if (item.popupOptions.closeOnOutsideClick && ManagerController) {
            ManagerController.remove(item.id);
        }
    }

    protected resizeInner(item: IPopupItem, container: HTMLDivElement): boolean {
        return this._elementUpdated(item, container);
    }

    protected resizeOuter(item: IPopupItem, container: HTMLDivElement): boolean {
        return this._elementUpdated(item, container);
    }

    protected workspaceResize(): boolean {
        return false;
    }

    protected dragNDropOnPage(item: IPopupItem, container: HTMLDivElement, isInsideDrag: boolean): boolean {
        return false;
    }

    protected needRecalcOnKeyboardShow(): boolean {
        return false;
    }

    protected needRestoreFocus(): boolean {
        return true;
    }

    protected popupMouseEnter(item: IPopupItem): void {
        if (item.popupOptions.autoClose) {
            if (item.closeId) {
                clearTimeout(item.closeId);
                item.closeId = null;
            }
        }
    }

    protected popupMouseLeave(item: IPopupItem): void {
        if (item.popupOptions.autoClose) {
            this._closeByTimeout(item);
        }
    }

    protected _getPopupSizes(item: IPopupItem, container: HTMLDivElement): IPopupSizes {
        const containerSizes: IPopupSizes = this.getContentSizes(container);

        item.sizes = {
            width: item.popupOptions.width || containerSizes.width,
            height: item.popupOptions.height || containerSizes.height
        };
        return item.sizes;
    }

    protected _getPopupContainer(id: string): HTMLDivElement {
        const popupContainer = ManagerController.getContainer();
        const item = popupContainer && popupContainer._children[id];
        // todo https://online.sbis.ru/opendoc.html?guid=d7b89438-00b0-404f-b3d9-cc7e02e61bb3
        let container = item && item._container;
        if (container && container.jquery) {
            container = container[0];
        }
        return container;
    }

    private _closeByTimeout(item: IPopupItem): void {
        const timeAutoClose = 5000;

        item.closeId = setTimeout(() => {
            ManagerController.remove(item.id);
        }, timeAutoClose);
    }

    private _checkContainer(item: IPopupItem, container: HTMLDivElement, stage: string): boolean {
        if (!container) {
            // if popup has initializing state then container doesn't created yet
            if (item.popupState !== this.POPUP_STATE_INITIALIZING) {
                const message = `Error when building the template ${item.popupOptions.template} on stage ${stage}`;
                Utils.logger.error('Controls/popup', message);
            }
            return false;
        }
        return true;
    }

    private getContentSizes(container?: HTMLDivElement = null): IPopupSizes {
        // Чтобы размер контейнера не искажался при масштабировании использую getBoundingClientRect
        const sizes = container?.getBoundingClientRect();
        return {
            width: Math.round(sizes?.width),
            height: Math.round(sizes?.height)
        };
    }

    protected _isAboveMaximizePopup(item: IPopupItem): boolean {
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
    }

    private _goUpByControlTree(container: HTMLElement): Control[] {
        return goUpByControlTree(container);
    }

    protected _getTargetCoords(cfg, sizes = {}) {
        if (cfg.popupOptions.nativeEvent) {
            const top = cfg.popupOptions.nativeEvent.clientY;
            const left = cfg.popupOptions.nativeEvent.clientX;
            const size = 1;
            const positionCfg = {
                direction: {
                    horizontal: 'right',
                    vertical: 'bottom'
                }
            };
            cMerge(cfg.popupOptions, positionCfg);
            sizes.margins = {top: 0, left: 0};
            return {
                width: size,
                height: size,
                top,
                left,
                bottom: top + size,
                right: left + size,
                topScroll: 0,
                leftScroll: 0
            };
        }

        if (!constants.isBrowserPlatform) {
            return {
                width: 0,
                height: 0,
                top: 0,
                left: 0,
                bottom: 0,
                right: 0,
                topScroll: 0,
                leftScroll: 0
            };
        }
        return TargetCoords.get(this._getTargetNode(cfg));
    }

    private _getTargetNode(item: IPopupItem): HTMLElement {
        if (cInstance.instanceOfModule(item.popupOptions.target, 'UI/Base:Control')) {
            return item.popupOptions.target._container;
        }
        return item.popupOptions.target || (constants.isBrowserPlatform && document.body);
    }

    protected _getMargins(item: IPopupItem): {top: number, left: number} {
        // If the classes have not changed, then the indents remain the same
        if ((item.className || '') === (item.popupOptions.className || '')) {
            if (!item.margins) {
                item.margins = {
                    top: 0,
                    left: 0
                };
            }
        } else {
            item.className = item.popupOptions.className;
            item.margins = this._getFakeDivMargins(item);
        }

        return {
            top: item.margins.top || 0,
            left: item.margins.left || 0
        };
    }

    private _getFakeDivMargins(item: IPopupItem): {top: number, left: number} {
        const fakeDiv = this._getFakeDiv();
        const theme = ManagerController.getTheme();
        fakeDiv.className = item.popupOptions.className + ` controls_popupTemplate_theme-${theme}`;

        const styles = this._getContainerStyles(fakeDiv);
        return {
            top: parseFloat(styles.marginTop),
            left: parseFloat(styles.marginLeft)
        };
    }

    private _getFakeDiv(): HTMLDivElement {
        if (!constants.isBrowserPlatform) {
            return {
                marginLeft: 0,
                marginTop: 0
            };
        }
        // create fake div on invisible part of window, cause user class can overlap the body
        if (!_fakeDiv) {
            _fakeDiv = document.createElement('div');
            _fakeDiv.style.position = 'absolute';
            _fakeDiv.style.left = '-10000px';
            _fakeDiv.style.top = '-10000px';
            document.body.appendChild(_fakeDiv);
        }
        return _fakeDiv;
    }

    private _getContainerStyles(container: Element): object {
        return window.getComputedStyle(container);
    }

    private static rootContainers = {};

    static getRootContainerCoords(item: IPopupItem, baseRootSelector: string, rightOffset?: number): IPopupPosition | void {
        const getRestrictiveContainer = (popupItem: IPopupItem) => {
            if (popupItem.popupOptions.restrictiveContainer) {
                return popupItem.popupOptions.restrictiveContainer;
            }
            // Проверяем, есть ли у родителя ограничивающий контейнер
            if (popupItem.parentId) {
                const parentItem = require('Controls/popup').Controller.find(popupItem.parentId);
                if (!parentItem) {
                    Logger.error(`Ошибка при открытии окна с шаблоном ${item.popupOptions.template},
                     один из его родителей уничтожен, проверьте opener у окна с
                     шаблоном ${popupItem.popupOptions.template}`);
                }
                return getRestrictiveContainer(parentItem);
            }
        };
        const itemRestrictiveContainer = getRestrictiveContainer(item);
        item.calculatedRestrictiveContainer = itemRestrictiveContainer;
        const bodySelector = 'body';
        const getCoords = (container) => {
            if (container) {
                let coordsByContainer = BaseController.getCoordsByContainer(container);
                if (coordsByContainer) {
                    coordsByContainer = {...coordsByContainer};
                    if (rightOffset) {
                        coordsByContainer.width -= rightOffset;
                        coordsByContainer.right -= rightOffset;
                    }
                    return coordsByContainer;
                }
            }
        };

        // Если задан restrictiveContainer или он задан у родителя, то берем его координату
        const itemRestrictiveContainerCoords = getCoords(itemRestrictiveContainer);
        if (itemRestrictiveContainerCoords) {
            return  itemRestrictiveContainerCoords;
        }

        // Если приложение сообщило размеры контента - берем их
        const contentData = ManagerController.getContentData();
        if (contentData) {
            const bodyCoords = BaseController.getCoordsByContainer(bodySelector);
            return {
                right: contentData.left + contentData.width,
                top: contentData.top,
                bottom: bodyCoords.bottom,
                left: contentData.left,
                height: bodyCoords.height,
                width: contentData.width,
                topScroll: bodyCoords.topScroll,
                leftScroll: bodyCoords.leftScroll
            };
        }

        const restrictiveContainers = [baseRootSelector, bodySelector];
        for (const restrictiveContainer of restrictiveContainers) {
            const coords = getCoords(restrictiveContainer);
            if (coords) {
                return coords;
            }
        }
    }

    static resetRootContainerCoords(): void {
        BaseController.rootContainers = {};
    }

    static getCoordsByContainer(restrictiveContainer: any): IPopupPosition | void {
        if (BaseController.rootContainers[restrictiveContainer]) {
            return BaseController.rootContainers[restrictiveContainer];
        }

        if (restrictiveContainer instanceof HTMLElement) {
            const errorMessage = 'Неверное значение опции restrictiveContainer.' +
                ' Опция принимает в качестве значения селектор (строку)';
            Logger.error(`Controls/popup: ${errorMessage}`);
            return;
        }

        const restrictiveContainerNode = document?.querySelector(restrictiveContainer);

        if (restrictiveContainerNode) {
            // TODO: В рамках оптимизации нижний попап скрывается через ws-hidden
            // Нужно это учитывать при расчете размеров https://online.sbis.ru/doc/a88a5697-5ba7-4ee0-a93a-221cce572430
            const popup = restrictiveContainerNode.closest('.controls-Popup');
            const hiddenClass = 'ws-hidden';
            const isPopupHidden = popup && popup.classList.contains(hiddenClass);
            if (isPopupHidden) {
                popup.classList.remove(hiddenClass);
            }

            const targetCoords = TargetCoords.get(restrictiveContainerNode);

            if (isPopupHidden) {
                popup.classList.add(hiddenClass);
            }
            return BaseController.rootContainers[restrictiveContainer] = targetCoords;
        }
    }
}

export default BaseController;

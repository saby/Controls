import {Controller as ManagerController, IPopupItem, IPopupPosition, IPopupSizes, IPopupController, IDragOffset} from 'Controls/popup';
import * as TargetCoords from 'Controls/_popupTemplate/TargetCoords';
import {Control} from 'UI/Base';
import {goUpByControlTree} from 'UI/Focus';
import {Logger} from 'UI/Utils';
import {constants} from 'Env/Env';
import oldWindowManager from 'Controls/_popupTemplate/_oldWindowManager';
import * as Deferred from 'Core/Deferred';
import * as cMerge from 'Core/core-merge';
import * as cInstance from 'Core/core-instance';

export const RIGHT_PANEL_WIDTH = 54; // --width_stack-right_panel + borders

let _fakeDiv: HTMLElement;
/**
 * Base Popup Controller
 * @class Controls/_popupTemplate/BaseController
 * @author Красильников А.С.
 * @private
 */
abstract class BaseController implements IPopupController {
    // Перед добавлением окна в верстку
    POPUP_STATE_INITIALIZING: string = 'initializing';
    // После добавления окна в верстку
    POPUP_STATE_CREATED: string = 'created';
    // Перед обновлением опций окна
    POPUP_STATE_UPDATING: string = 'updating';
    // После обновления опций окна
    POPUP_STATE_UPDATED: string = 'updated';
    // Окно начало удаление, перед всеми операциями по закрытию детей и пендингов
    POPUP_STATE_START_DESTROYING: string = 'startDestroying';
    // Окно в процессе удаления (используется где есть операции перед удалением, например анимация)
    POPUP_STATE_DESTROYING: string = 'destroying';
    // Окно удалено из верстки
    POPUP_STATE_DESTROYED: string = 'destroyed';

    elementCreatedWrapper(item: IPopupItem, container: HTMLElement): boolean {
        if (this._checkContainer(item, container, 'elementCreated')) {
            item.popupState = this.POPUP_STATE_CREATED;
            oldWindowManager.addZIndex(item.currentZIndex);
            if (item.popupOptions.autoClose) {
                this._closeByTimeout(item);
            }
            return this.elementCreated.apply(this, arguments);
        }
    }

    protected elementCreated(item: IPopupItem, container: HTMLElement): boolean {
        // method can be implemented
        return false;
    }

    elementUpdatedWrapper(item: IPopupItem, container: HTMLElement): boolean {
        if (this._checkContainer(item, container, 'elementUpdated')) {
            if (item.popupState === this.POPUP_STATE_CREATED ||
                item.popupState === this.POPUP_STATE_UPDATED ||
                item.popupState === this.POPUP_STATE_UPDATING) {
                item.popupState = this.POPUP_STATE_UPDATING;
                this.elementUpdated.apply(this, arguments);
                return true;
            }
        }
        return false;
    }

    protected elementUpdated(item: IPopupItem, container: HTMLElement): boolean {
        // method can be implemented
        return false;
    }

    elementAfterUpdatedWrapper(item: IPopupItem, container: HTMLElement): boolean {
        if (this._checkContainer(item, container, 'elementAfterUpdated')) {
            // We react only after the update phase from the controller
            if (item.popupState === this.POPUP_STATE_UPDATING) {
                item.popupState = this.POPUP_STATE_UPDATED;
                return this.elementAfterUpdated.apply(this, arguments);
            }
        }
        return false;
    }

    protected elementAfterUpdated(item: IPopupItem, container: HTMLElement): boolean {
        // method can be implemented
        return false;
    }

    beforeElementDestroyed(item: IPopupItem, container: HTMLElement): void {
        item.popupState = this.POPUP_STATE_START_DESTROYING;
    }

    elementDestroyedWrapper(item: IPopupItem, container: HTMLElement): Promise<void> {
        if (item.popupState === this.POPUP_STATE_INITIALIZING) {
            return (new Deferred()).callback();
        }
        if (item.popupState === this.POPUP_STATE_DESTROYED || item.popupState === this.POPUP_STATE_DESTROYING) {
            return item._destroyDeferred;
        }

        if (item.popupState !== this.POPUP_STATE_DESTROYED) {
            item.popupState = this.POPUP_STATE_DESTROYING;
            item._destroyDeferred = this.elementDestroyed.apply(this, arguments);
            return item._destroyDeferred.addCallback(() => {
                oldWindowManager.removeZIndex(item.currentZIndex);
                item.popupState = this.POPUP_STATE_DESTROYED;
            });
        }
        return (new Deferred()).callback();
    }

    protected elementDestroyed(item: IPopupItem): Promise<void> {
        return (new Deferred()).callback();
    }

    getDefaultConfig(item: IPopupItem): Promise<void> | void {
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

    beforeUpdateOptions(item: IPopupItem): void {
        item.popupState = item.controller.POPUP_STATE_INITIALIZING;
    }

    afterUpdateOptions(item: IPopupItem): void {
        item.popupState = item.controller.POPUP_STATE_CREATED;
    }

    elementUpdateOptions(item: IPopupItem, container: HTMLElement): boolean | Promise<boolean> {
        this.elementUpdatedWrapper(item, container);
        return true;
    }

    elementAnimated(item: IPopupItem): boolean {
        // method can be implemented
        return false;
    }

    popupDragStart(item: IPopupItem, container: HTMLElement, offset: IDragOffset): void {
        // method can be implemented
    }

    popupDragEnd(item: IPopupItem, offset: number): void {
        // method can be implemented
    }

    elementMaximized(item: IPopupItem, container: HTMLElement, state: boolean): boolean {
        // method can be implemented
        return false;
    }

    popupResizingLine(item: IPopupItem, offset: number): boolean {
        // method can be implemented
        return false;
    }

    popupMouseEnter(item: IPopupItem): boolean {
        if (item.popupOptions.autoClose) {
            if (item.closeId) {
                clearTimeout(item.closeId);
                item.closeId = null;
            }
        }
        return false;
    }

    popupMouseLeave(item: IPopupItem): boolean {
        if (item.popupOptions.autoClose) {
            this._closeByTimeout(item);
        }
        return false;
    }

    orientationChanged(item: IPopupItem, container: HTMLElement): boolean {
        return this.elementUpdatedWrapper(item, container);
    }

    pageScrolled(item: IPopupItem, container: HTMLElement): boolean {
        return this.elementUpdatedWrapper(item, container);
    }

    resizeInner(item: IPopupItem, container: HTMLElement): boolean {
        return this.elementUpdatedWrapper(item, container);
    }

    resizeOuter(item: IPopupItem, container: HTMLElement): boolean {
        return this.elementUpdatedWrapper(item, container);
    }

    workspaceResize(): boolean {
        return false;
    }

    dragNDropOnPage(item: IPopupItem, container: HTMLElement, isInsideDrag: boolean): boolean {
        return false;
    }

    needRecalcOnKeyboardShow(): boolean {
        return false;
    }

    needRestoreFocus(): boolean {
        return true;
    }

    protected _getPopupSizes(item: IPopupItem, container: HTMLElement): IPopupSizes {
        const containerSizes: IPopupSizes = this.getContentSizes(container);

        item.sizes = {
            width: item.popupOptions.width || containerSizes.width,
            height: item.popupOptions.height || containerSizes.height
        };
        return item.sizes;
    }

    protected _getPopupContainer(id: string): HTMLElement {
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

    private _checkContainer(item: IPopupItem, container: HTMLElement, stage: string): boolean {
        if (!container) {
            // if popup has initializing state then container doesn't created yet
            if (item.popupState !== this.POPUP_STATE_INITIALIZING) {
                const message = `Error when building the template ${item.popupOptions.template} on stage ${stage}`;
                Logger.error('Controls/popup', message);
            }
            return false;
        }
        return true;
    }

    private getContentSizes(container?: HTMLElement = null): IPopupSizes {
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

    protected _getTargetCoords(item: IPopupItem, sizes: IPopupSizes = {}) {
        if (item.popupOptions.nativeEvent) {
            const top = item.popupOptions.nativeEvent.clientY;
            const left = item.popupOptions.nativeEvent.clientX;
            const size = 1;
            const positionCfg = {
                direction: {
                    horizontal: 'right',
                    vertical: 'bottom'
                }
            };
            cMerge(item.popupOptions, positionCfg);
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
        return TargetCoords.get(this._getTargetNode(item));
    }

    protected _getTargetNode(item: IPopupItem): HTMLElement {
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

    private _getFakeDiv(): HTMLElement {
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

    private _getContainerStyles(container: Element): {marginTop: string, marginLeft: string} {
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

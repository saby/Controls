import Deferred = require('Core/Deferred');
import Utils = require('Types/util');
import oldWindowManager from 'Controls/_popupTemplate/_oldWindowManager';
import {Controller as ManagerController, IPopupItem, IPopupPosition, IPopupSizes} from 'Controls/popup';
import * as TargetCoords from 'Controls/_popupTemplate/TargetCoords';
import {Control} from 'UI/Base';
import {goUpByControlTree} from 'UI/Focus';
import {Logger} from 'UI/Utils';

export interface IDragOffset {
    x: number;
    y: number;
}

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

    abstract popupMouseEnter(item: IPopupItem): void;

    abstract popupMouseLeave(item: IPopupItem): void;

    abstract elementAnimated(item: IPopupItem): boolean;

    _elementCreated(item: IPopupItem, container: HTMLDivElement): boolean {
        if (this._checkContainer(item, container, 'elementCreated')) {
            item.popupState = this.POPUP_STATE_CREATED;
            oldWindowManager.addZIndex(item.currentZIndex);
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

    protected needRecalcOnKeyboardShow(): boolean {
        return false;
    }

    protected needRestoreFocus(): boolean {
        return true;
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

    private static rootContainers = {};

    static getRootContainerCoords(item: IPopupItem, baseRootSelector: string): IPopupPosition | void {
        const getRestrictiveContainer = (popupItem: IPopupItem) => {
            if (popupItem.popupOptions.restrictiveContainer) {
                return popupItem.popupOptions.restrictiveContainer;
            }
            // Проверяем, есть ли у родителя ограничивающий контейнер
            if (popupItem.parentId) {
                const parentItem = require('Controls/popup').Controller.find(popupItem.parentId);
                if (!parentItem) {
                    Logger.error(`У окна с id=${popupItem.id} opener задестроен, проверьте цепочку opener'ов`);
                }
                return getRestrictiveContainer(parentItem);
            }
        };
        const itemRestrictiveContainer = getRestrictiveContainer(item);
        item.calculatedRestrictiveContainer = itemRestrictiveContainer;
        const bodySelector = 'body';
        const getCoords = (container) => {
            if (container) {
                const coordsByContainer = BaseController.getCoordsByContainer(container);
                if (coordsByContainer) {
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
                width: contentData.width,
                height: bodyCoords.height,
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

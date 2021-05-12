import BaseController from 'Controls/_popupTemplate/BaseController';
import {IPopupItem, IPopupSizes, IPopupOptions, IPopupPosition} from 'Controls/popup';
import StackStrategy from 'Controls/_popupTemplate/Stack/Opener/StackStrategy';
import {setSettings, getSettings} from 'Controls/Application/SettingsController';
import * as isNewEnvironment from 'Core/helpers/isNewEnvironment';
import collection = require('Types/collection');
import TargetCoords = require('Controls/_popupTemplate/TargetCoords');
import Deferred = require('Core/Deferred');
import {parse as parserLib} from 'Core/library';
import StackContent = require('Controls/_popupTemplate/Stack/Opener/StackContent');
import {detection} from 'Env/Env';
import {Bus} from 'Env/Event';

/**
 * Stack Popup Controller
 * @class Controls/_popupTemplate/Stack/Opener/StackController
 *
 * @private
 */

const ACCORDEON_MIN_WIDTH = 50;

class StackController extends BaseController {
    TYPE: string = 'Stack';
    _stack: collection.List<IPopupItem> = new collection.List();

    private _sideBarVisible: boolean = true;
    private _positionBeforeUpdate: IPopupPosition;

    elementCreated(item: IPopupItem, container: HTMLDivElement): boolean {
        const isSinglePopup = this._stack.getCount() < 2;
        let positionUpdate: boolean = false;

        if (isSinglePopup) {
            this._prepareSizeWithoutDOM(item);
        } else {
            this._prepareSizes(item, container);
        }
        if (item.popupOptions.isCompoundTemplate) {
            this._setStackContent(item);
            this._stack.add(item);
            this._update();
        } else if (!isSinglePopup) {
            this._update();
        } else {
            positionUpdate = this._updateItemPosition(item);
        }

        if (!isNewEnvironment()) {
            if (isSinglePopup) {
                this._updateSideBarVisibility();
            }
        }

        if (item.popupOptions.isCompoundTemplate) {
            return true;
        }

        // Если стековое окно 1, то перерисовок звать не надо, только если после маунта позиция и размеры изменились
        // Если окон больше, то перерисовка должна быть, меняются классы, видимость.
        return !isSinglePopup || positionUpdate;
    }

    elementUpdateOptions(item: IPopupItem, container: HTMLDivElement): boolean|Promise<boolean> {
        this._preparePropStorageId(item);
        if (!item.popupOptions.propStorageId) {
            return this._updatePopup(item, container);
        } else {
            return this._getPopupWidth(item).then(() => {
                return this._updatePopup(item, container);
            });
        }
    }

    elementUpdated(item: IPopupItem, container: HTMLDivElement): boolean {
        this._positionBeforeUpdate = item.position;
        this._updatePopup(item, container);
        return true;
    }

    elementAfterUpdated(item: IPopupItem, container: HTMLDivElement): boolean {
        let needUpdate = false;
        if (item.childs.length) {
            // Если у окна restrictiveContainer лежит на другом окне - то нужно высчитывать позицию только когда
            // родительское окно ее высчитает. Иначе при ресайзе страницы и родитель и дочернее обновят позицию в
            // 1 цикл, что приведет к неправильной позиции дочернего.
            if (JSON.stringify(item.position) !== JSON.stringify(this._positionBeforeUpdate)) {
                BaseController.resetRootContainerCoords();
                for (const child of item.childs) {
                    if (child.controller.TYPE === this.TYPE) {
                        needUpdate = true;
                    }
                }
                if (needUpdate) {
                    this._update();
                }
            }
        }
        return needUpdate;
    }

    elementDestroyed(item: IPopupItem): Promise<null> {
        this._stack.remove(item);
        this._update();
        return (new Deferred()).callback();
    }

    getDefaultConfig(item: IPopupItem): void|Promise<void> {
        this._preparePropStorageId(item);
        if (item.popupOptions.propStorageId) {
            return this._getPopupWidth(item).then(() => {
                this._getDefaultConfig(item);
            });
        } else {
            this._getDefaultConfig(item);
        }
    }

    elementMaximized(item: IPopupItem, container: HTMLDivElement, state: boolean): boolean {
        this._setMaximizedState(item, state);

        // todo https://online.sbis.ru/opendoc.html?guid=256679aa-fac2-4d95-8915-d25f5d59b1ca
        item.popupOptions.width = state ? item.popupOptions.maxWidth : (item.popupOptions.minimizedWidth || item.popupOptions.minWidth);
        this._prepareSizes(item, container);
        this._update();
        return true;
    }

    resizeInner(): boolean {
        return false;
    }

    workspaceResize(): boolean {
        this._update();
        return !!this._stack.getCount();
    }

    popupResizingLine(item: IPopupItem, offset: number): void {
        // По идее position.width есть всегда и достаточно брать его. Для избежания падения в исключительных случаях
        // оставляю еще проверну на popupOptions.stackWidth.
        // popupOptions.width брать нельзя, т.к. в нем может содержаться значение, которое недопустимо в
        // текущих условиях ( например на ipad ширина стекового окна не больше 1024)
        const currentWidth = (item.position.width || item.popupOptions.stackWidth);
        const newValue = currentWidth + offset;
        item.popupOptions.stackWidth = newValue;
        item.popupOptions.width = newValue;
        item.popupOptions.workspaceWidth = newValue;
        this._update();
        this._savePopupWidth(item);
    }

    private _updateItemPosition(item: IPopupItem): boolean {
        // Пересчитаем еще раз позицию, на случай, если ресайзили окно браузера
        const position = this._getItemPosition(item);
        // быстрая проверка на равенство простых объектов
        if (JSON.stringify(item.position) !== JSON.stringify(position)) {
            item.position = position;
            this._updatePopupOptions(item);
            return true;
        }

        return false;
    }

    private _update(): void {
        const maxPanelWidth = StackStrategy.getMaxPanelWidth();
        let cache: IPopupItem[] = [];
        this._stack.each((item) => {
            if (item.popupState !== this.POPUP_STATE_DESTROYING) {
                this._updateItemPosition(item);
                this._updatePopupWidth(item, item.position.width);
                this._removeLastStackClass(item);
                const currentWidth = this._getPopupHorizontalLength(item);
                let forRemove;
                if (currentWidth) {
                    const cacheItem = cache.find((el) => {
                        const itemWidth = this._getPopupHorizontalLength(el);
                        return itemWidth === currentWidth;
                    });

                    if (cacheItem) {
                        forRemove = cacheItem;
                        this._hidePopup(cacheItem);
                    }
                    this._showPopup(item);
                    cache.push(item);
                }

                cache = cache.filter((el) => {
                    if (el === forRemove) {
                        forRemove = null;
                        return false;
                    }
                    const itemWidth = this._getPopupHorizontalLength(el);
                    const isVisiblePopup = itemWidth >= (currentWidth || 0);
                    if (!isVisiblePopup) {
                        this._hidePopup(el);
                    }
                    return isVisiblePopup;
                });

                if (StackStrategy.isMaximizedPanel(item)) {
                    this._prepareMaximizedState(maxPanelWidth, item);
                }
            }
        });
        const lastItem = this._stack.at(this._stack.getCount() - 1);
        if (lastItem) {
            this._addLastStackClass(lastItem);
        }
        if (!isNewEnvironment()) {
            this._updateSideBarVisibility();
        }
    }

    // length = popup size + popup padding
    private _getPopupHorizontalLength(item: IPopupItem): number {
        return (item.containerWidth || item.position.width) + (item.position?.right || 0);
    }

    private _prepareSizes(item: IPopupItem, container?: HTMLDivElement): void {
        let width;
        let maxWidth;
        let minWidth;
        let templateContainer;

        if (container) {
            /* start: Remove the set values that affect the size and positioning to get the real size of the content */
            templateContainer = this._getStackContentWrapperContainer(container);
            width = templateContainer.style.width;
            maxWidth = templateContainer.style.maxWidth;
            minWidth = templateContainer.style.minWidth;
            // We won't remove width and height, if they are set explicitly.
            if (!item.popupOptions.width) {
                templateContainer.style.width = 'auto';
            }
            if (!item.popupOptions.maxWidth) {
                templateContainer.style.maxWidth = 'auto';
            }
            if (!item.popupOptions.minWidth) {
                templateContainer.style.minWidth = 'auto';
            }
            /* end: We remove the set values that affect the size and positioning to get the real size of the content */
        }
        const templateStyle = container ? getComputedStyle(container.children[0]) : {};
        const defaultOptions = this._getDefaultOptions(item);

        item.popupOptions.minWidth = this._prepareSize([item.popupOptions, defaultOptions, templateStyle], 'minWidth');
        item.popupOptions.maxWidth = this._prepareSize([item.popupOptions, defaultOptions, templateStyle], 'maxWidth');
        item.popupOptions.width = this._prepareSize([item.popupOptions, defaultOptions], 'width');

        this._validateConfiguration(item);

        if (!item.popupOptions.hasOwnProperty('minimizedWidth')) {
            item.popupOptions.minimizedWidth = defaultOptions.minimizedWidth;
        }

        if (container) {
            /* start: Return all values to the node. Need for vdom synchronizer */
            templateContainer.style.width = width;
            templateContainer.style.maxWidth = maxWidth;
            templateContainer.style.minWidth = minWidth;
            /* end: Return all values to the node. Need for vdom synchronizer */
        }
    }

    private _prepareSize(optionsSet: IPopupOptions[], property: string): number | void {
        for (let i = 0; i < optionsSet.length; i++) {
            // get size, if it's not percentage value
            if (optionsSet[i][property] &&
                (typeof optionsSet[i][property] !== 'string' ||
                    !optionsSet[i][property].includes('%'))) {
                return parseInt(optionsSet[i][property], 10);
            }
        }
        return undefined;
    }

    private _getDefaultConfig(item: IPopupItem): void {
        this._prepareSizeWithoutDOM(item);
        this._setStackContent(item);
        if (StackStrategy.isMaximizedPanel(item)) {
            // set default values
            item.popupOptions.templateOptions.showMaximizedButton = undefined; // for vdom dirtyChecking
            const maximizedState = item.popupOptions.hasOwnProperty('maximized') ? item.popupOptions.maximized : false;
            this._setMaximizedState(item, maximizedState);
        }

        if (item.popupOptions.isCompoundTemplate) {
            // set sizes before positioning. Need for templates who calculate sizes relatively popup sizes
            const position = this._getItemPosition(item);
            item.position = {
                top: -10000,
                left: -10000,
                height: this._getWindowSize().height,
                width: position.width || undefined
            };
        } else {
            // TODO KINGO
            // Когда несколько раз зовут open до того как построилось окно и у него может вызываться фаза update
            // мы обновляем опции, которые пришли в последний вызов метода open и зовем getDefaultConfig, который
            // добавляет item в _stack. Добавление нужно делать 1 раз, чтобы не дублировалась конфигурация.
            const itemIndex = this._stack.getIndexByValue('id', item.id);
            if (itemIndex === -1) {
                this._stack.add(item);
            } else {
                this._stack.replace(item, itemIndex);
            }
            item.position = this._getItemPosition(item);
            if (this._stack.getCount() <= 1) {
                if (StackStrategy.isMaximizedPanel(item)) {
                    this._prepareMaximizedState(StackStrategy.getMaxPanelWidth(), item);
                }
                this._updatePopupOptions(item);
                this._addLastStackClass(item);
            }
        }
    }

    private _getItemPosition(item: IPopupItem): IPopupPosition {
        const targetCoords = this._getStackParentCoords(item);
        const isAboveMaximizePopup: boolean = this._isAboveMaximizePopup(item);
        const position = StackStrategy.getPosition(targetCoords, item, isAboveMaximizePopup);
        item.popupOptions.stackWidth = position.width;
        item.popupOptions.workspaceWidth = position.width;
        item.popupOptions.stackMinWidth = position.minWidth;
        item.popupOptions.stackMaxWidth = position.maxWidth;
        // todo https://online.sbis.ru/opendoc.html?guid=256679aa-fac2-4d95-8915-d25f5d59b1ca
        item.popupOptions.stackMinimizedWidth = item.popupOptions.minimizedWidth;

        this._updatePopupWidth(item, position.width);
        return position;
    }

    private _validateConfiguration(item: IPopupItem): void {
        if (item.popupOptions.maxWidth < item.popupOptions.minWidth) {
            item.popupOptions.maxWidth = item.popupOptions.minWidth;
        }

        if (item.popupOptions.width > item.popupOptions.maxWidth) {
            item.popupOptions.width = item.popupOptions.maxWidth;
        }

        if (item.popupOptions.width < item.popupOptions.minWidth) {
            item.popupOptions.width = item.popupOptions.minWidth;
        }
    }

    private _updatePopup(item: IPopupItem, container: HTMLDivElement): boolean {
        this._updatePopupOptions(item);
        this._setStackContent(item);
        this._prepareSizes(item, container);
        this._update();
        return true;
    }

    private _prepareSizeWithoutDOM(item: IPopupItem): void {
        this._prepareSizes(item);
    }

    private _getContainerWidth(container: HTMLDivElement): number {
        // The width can be set when the panel is displayed. To calculate the width of the content, remove this value.
        const currentContainerWidth = container.style.width;
        container.style.width = 'auto';

        const templateWidth = container.querySelector('.controls-Stack__content-wrapper').offsetWidth;
        container.style.width = currentContainerWidth;
        return templateWidth;
    }

    private _updatePopupWidth(item: IPopupItem, width: number): void {
        if (!width && item.popupState !== this.POPUP_STATE_INITIALIZING) {
            item.containerWidth = this._getContainerWidth(this._getPopupContainer(item.id));
        }
    }

    private _getStackContentWrapperContainer(stackContainer: HTMLDivElement): HTMLDivElement {
        return stackContainer.querySelector('.controls-Stack__content-wrapper');
    }

    private _getStackParentCoords(item: IPopupItem): IPopupPosition {
        return StackController.calcStackParentCoords(item);
    }

    private _showPopup(item: IPopupItem): void {
        item.position.hidden = false;
    }

    private _hidePopup(item: IPopupItem): void {
        item.position.hidden = true;
    }

    private _updatePopupOptions(item: IPopupItem): void {
        // for vdom synchronizer. Updated the link to the options when className was changed
        if (!item.popupOptions._version) {
            item.popupOptions.getVersion = () => {
                return item.popupOptions._version;
            };
            item.popupOptions._version = 0;
        }
        item.popupOptions._version++;
    }

    private _prepareMaximizedState(maxPanelWidth: number, item: IPopupItem): void {
        const canMaximized = maxPanelWidth > item.popupOptions.minWidth;
        if (!canMaximized) {
            // If we can't turn around, we hide the turn button and change the state
            item.popupOptions.templateOptions.showMaximizedButton = false;
            item.popupOptions.templateOptions.maximized = false;
        } else {
            item.popupOptions.templateOptions.showMaximizedButton = true;

            // Restore the state after resize
            item.popupOptions.templateOptions.maximized = item.popupOptions.maximized;
        }
    }

    private _setMaximizedState(item: IPopupItem, state: boolean): void {
        item.popupOptions.maximized = state;
        item.popupOptions.templateOptions.maximized = state;
    }

    private _getWindowSize(): IPopupSizes {
        return {
            width: window.innerWidth,
            height: window.innerHeight
        };
    }

    private _setStackContent(item: IPopupItem): void {
        item.popupOptions.content = StackContent;
    }

    private _getDefaultOptions(item: IPopupItem): IPopupOptions {
        const template = item.popupOptions.template;

        let templateClass;

        if (typeof template === 'string') {
            const templateInfo = parserLib(template);
            templateClass = require(templateInfo.name);

            templateInfo.path.forEach((key) => {
                templateClass = templateClass[key];
            });
        } else {
            templateClass = template;
        }

        // library export
        if (templateClass && templateClass.default) {
            templateClass = templateClass.default;
        }

        return templateClass && templateClass.getDefaultOptions ? templateClass.getDefaultOptions() : {};
    }

    private _preparePropStorageId(item: IPopupItem): void {
        if (!item.popupOptions.propStorageId) {
            const defaultOptions = this._getDefaultOptions(item);
            item.popupOptions.propStorageId = defaultOptions.propStorageId;
        }
    }

    private _getPopupWidth(item: IPopupItem): Promise<undefined> {
        return new Promise((resolve) => {
            const propStorageId = item.popupOptions.propStorageId;
            if (propStorageId) {
                getSettings([propStorageId]).then((storage) => {
                    if (storage && storage[propStorageId]) {
                        item.popupOptions.width = storage[propStorageId];
                    }
                    resolve();
                });
            } else {
                resolve();
            }
        });
    }

    private _savePopupWidth(item: IPopupItem): void {
        const propStorageId = item.popupOptions.propStorageId;
        if (propStorageId && item.position.width) {
            setSettings({[propStorageId]: item.position.width});
        }
    }

    private _addLastStackClass(item: IPopupItem): void {
        item.popupOptions.className = (item.popupOptions.className || '') + ' controls-Stack__last-item';
    }

    private _removeLastStackClass(item: IPopupItem): void {
        const className = (item.popupOptions.className || '').replace(/controls-Stack__last-item/ig, '');
        item.popupOptions.className = className.trim();
    }

    // TODO COMPATIBLE
    private _getSideBarWidth(): number {
        const sideBar = document.querySelector('.ws-float-area-stack-sidebar, .navSidebar__sideLeft, .online-Sidebar');
        return sideBar && sideBar.clientWidth || 0;
    }

    private _updateSideBarVisibility(): void {
        let maxStackWidth = 0;
        this._stack.each((item) => {
            if (item.popupOptions.width > maxStackWidth) {
                maxStackWidth = item.popupOptions.width;
            }
        });

        const isVisible = this._getWindowSize().width - maxStackWidth >= this._getSideBarWidth() + ACCORDEON_MIN_WIDTH;

        if (isVisible !== this._sideBarVisible) {
            this._sideBarVisible = isVisible;
            Bus.channel('navigation').notify('accordeonVisibilityStateChange', this._sideBarVisible);
        }
    }

    static calcStackParentCoords(item: IPopupItem): IPopupPosition {
        let rootCoords;
        // TODO: Ветка для старой страницы
        if (!isNewEnvironment()) {
            let stackRoot = document.querySelector('.ws-float-area-stack-root');
            const isNewPageTemplate = document.body.classList.contains('ws-new-page-template');
            const contentIsBody = stackRoot === document.body;
            if (!contentIsBody && !isNewPageTemplate && stackRoot) {
                stackRoot = stackRoot.parentElement as HTMLDivElement;
            }
            rootCoords = TargetCoords.get(stackRoot || document.body);
        } else {
            rootCoords = BaseController.getRootContainerCoords(item, '.controls-Popup__stack-target-container');
        }

        // calc with scroll only on desktop devices, because stack popup has fixed position and can scroll with page
        // except for safari, because windowSizes doesn't change at zoom, but there is information about leftScroll.

        const leftPageScroll = detection.isMobilePlatform || detection.safari ? 0 : rootCoords.leftScroll;
        return {
            top: Math.max(rootCoords.top, 0),
            height: rootCoords.height,
            right: document.documentElement.clientWidth - rootCoords.right + leftPageScroll
        };
    }
}

export = new StackController();

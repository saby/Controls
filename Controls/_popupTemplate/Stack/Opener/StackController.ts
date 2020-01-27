import BaseController from 'Controls/_popupTemplate/BaseController';
import {IPopupItem, IPopupSizes, IPopupOptions, IPopupPosition} from 'Controls/popup';
import StackStrategy = require('Controls/_popupTemplate/Stack/Opener/StackStrategy');
import {setSettings, getSettings} from 'Controls/Application/SettingsController';
import collection = require('Types/collection');
import TargetCoords = require('Controls/_popupTemplate/TargetCoords');
import Deferred = require('Core/Deferred');
import {parse as parserLib} from 'Core/library';
import StackContent = require('Controls/_popupTemplate/Stack/Opener/StackContent');
import {detection} from 'Env/Env';

/**
 * Stack Popup Controller
 * @class Controls/_popupTemplate/Stack/Opener/StackController
 * @control
 * @private
 * @category Popup
 */

class StackController extends BaseController {
    TYPE: string = 'Stack';
    _stack: collection.List<IPopupItem> = new collection.List();

    elementCreated(item: IPopupItem, container: HTMLDivElement): boolean {
        const isSinglePopup = this._stack.getCount() < 2;
        if (isSinglePopup) {
            this._prepareSizeWithoutDOM(item);
            this._addLastStackClass(item);
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
            // Пересчитаем еще раз позицию, на случай, если ресайзили окно браузера
            item.position = this._getItemPosition(item);
        }
        return true;
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
        this._updatePopup(item, container);
        return true;
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

    popupResizingLine(item: IPopupItem, offset: number): void {
        item.popupOptions.stackWidth += offset;
        item.popupOptions.width += offset;
        item.popupOptions.workspaceWidth += offset;
        this._update();
        this._savePopupWidth(item);
    }

    private _update(): void {
        const maxPanelWidth = StackStrategy.getMaxPanelWidth();
        let cache: IPopupItem[] = [];
        this._stack.each((item) => {
            if (item.popupState !== this.POPUP_STATE_DESTROYING) {
                item.position = this._getItemPosition(item);
                this._updatePopupWidth(item);
                this._removeLastStackClass(item);
                const currentWidth = item.containerWidth || item.position.width;
                let forRemove;
                if (currentWidth) {
                    const cacheItem = cache.find((el) => {
                        const itemWidth = el.containerWidth || el.position.width;
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
                    const itemWidth = el.containerWidth || el.position.width;
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
                this._showPopup(item);
                if (StackStrategy.isMaximizedPanel(item)) {
                    this._prepareMaximizedState(StackStrategy.getMaxPanelWidth(), item);
                }
                this._updatePopupOptions(item);
            }
        }
    }

    private _getItemPosition(item: IPopupItem): IPopupPosition {
        const targetCoords = this._getStackParentCoords();
        item.position = StackStrategy.getPosition(targetCoords, item);
        item.popupOptions.stackWidth = item.position.width;
        item.popupOptions.workspaceWidth = item.position.width;
        item.popupOptions.stackMinWidth = item.position.minWidth;
        item.popupOptions.stackMaxWidth = item.position.maxWidth;
        // todo https://online.sbis.ru/opendoc.html?guid=256679aa-fac2-4d95-8915-d25f5d59b1ca
        item.popupOptions.stackMinimizedWidth = item.popupOptions.minimizedWidth;

        this._updatePopupWidth(item);
        this._updatePopupOptions(item);
        return item.position;
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

    private _updatePopupWidth(item: IPopupItem): void {
        if (!item.containerWidth && !item.position.width && item.popupState !== this.POPUP_STATE_INITIALIZING) {
            item.containerWidth = this._getContainerWidth(this._getPopupContainer(item.id));
        }
    }

    private _getStackContentWrapperContainer(stackContainer: HTMLDivElement): HTMLDivElement {
        return stackContainer.querySelector('.controls-Stack__content-wrapper');
    }

    private _getStackParentCoords(): IPopupPosition {
        const elements = document.getElementsByClassName('controls-Popup__stack-target-container');
        const targetCoords = TargetCoords.get(elements && elements.length ? elements[0] : document.body);
        // calc with scroll, because stack popup has fixed position only on desktop and can scroll with page
        const leftPageScroll = detection.isMobilePlatform ? 0 : targetCoords.leftScroll;
        return {
            top: Math.max(targetCoords.top, 0),
            right: document.documentElement.clientWidth - targetCoords.right + leftPageScroll
        };
    }

    private _showPopup(item: IPopupItem): void {
        item.popupOptions.hidden = false;
    }

    private _hidePopup(item: IPopupItem): void {
        item.popupOptions.hidden = true;
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
}

export = new StackController();

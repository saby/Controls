import {default as BaseController} from 'Controls/_popupTemplate/BaseController';
import StickyStrategy = require('Controls/_popupTemplate/Sticky/StickyStrategy');
import cMerge = require('Core/core-merge');
import cClone = require('Core/core-clone');
import TargetCoords = require('Controls/_popupTemplate/TargetCoords');
import StickyContent = require('wml!Controls/_popupTemplate/Sticky/StickyContent');
import * as cInstance from 'Core/core-instance';
import {Logger} from 'UI/Utils';
import {getScrollbarWidthByMeasuredBlock} from 'Controls/scroll';
import {constants, detection} from 'Env/Env';

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

export interface IStickyPopupPosition {
    targetPoint?: IStickyAlignment;
    direction?: IStickyAlignment;
    offset?: IStickyOffset;
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

let _fakeDiv;

const _private = {
    prepareOriginPoint(config) {
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
    },
    prepareConfig(self, cfg, sizes) {
        cfg.popupOptions = _private.prepareOriginPoint(cfg.popupOptions);
        const popupCfg = self._getPopupConfig(cfg, sizes);

        const targetCoords = self._getTargetCoords(cfg, sizes);
        cfg.position = StickyStrategy.getPosition(popupCfg, targetCoords);
        _private.updateStickyPosition(cfg, popupCfg, targetCoords);

        cfg.positionConfig = popupCfg;
        _private.updateClasses(cfg, popupCfg);
    },

    updateClasses(cfg, popupCfg) {
        // Remove the previous classes of direction and add new ones
        _private.removeOrientationClasses(cfg);
        cfg.popupOptions.className = (cfg.popupOptions.className || '') + ' ' + _private.getOrientationClasses(popupCfg);
    },

    updateSizes(positionCfg, popupOptions) {
        const properties = ['width', 'maxWidth', 'minWidth', 'height', 'maxHeight', 'minHeight'];
        properties.forEach((prop) => {
            if (popupOptions[prop]) {
                positionCfg.config[prop] = popupOptions[prop];
            }
        });
    },

    getOrientationClasses(cfg) {
        let className = 'controls-Popup-corner-vertical-' + cfg.targetPoint.vertical;
        className += ' controls-Popup-corner-horizontal-' + cfg.targetPoint.horizontal;
        className += ' controls-Popup-align-horizontal-' + cfg.direction.horizontal;
        className += ' controls-Popup-align-vertical-' + cfg.direction.vertical;
        return className;
    },

    removeOrientationClasses(cfg) {
        if (cfg.popupOptions.className) {
            cfg.popupOptions.className = cfg.popupOptions.className.replace(/controls-Popup-corner\S*|controls-Popup-align\S*/g, '').trim();
        }
    },

    updateStickyPosition(item, position, targetCoords): void {
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
    },

    getWindowWidth() {
        return constants.isBrowserPlatform && window.innerWidth;
    },
    getWindowHeight() {
        return constants.isBrowserPlatform && window.innerHeight;
    },
    setStickyContent(item) {
        item.popupOptions.content = StickyContent;
    },
    getMargins(item) {
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
            item.margins = _private.getFakeDivMargins(item);
        }

        return {
            top: item.margins.top,
            left: item.margins.left
        };
    },

    getFakeDivMargins(item) {
        const fakeDiv = _private.getFakeDiv();
        fakeDiv.className = item.popupOptions.className;

        const styles = fakeDiv.currentStyle || window.getComputedStyle(fakeDiv);
        return {
            top: parseFloat(styles.marginTop),
            left: parseFloat(styles.marginLeft)
        };
    },

    /**
     * Creates fake div to calculate margins.
     * Element is created with position absolute and far beyond the screen left position
     */
    getFakeDiv(): HTMLDivElement {
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
};

/**
 * Sticky Popup Controller
 * @class Controls/_popupTemplate/Sticky/StickyController
 * 
 * @private
 */
class StickyController extends BaseController {
    TYPE: string = 'Sticky';
    _private = _private;
    _bodyOverflow: string;

    elementCreated(item, container) {
        if (this._isTargetVisible(item)) {
            _private.setStickyContent(item);
            item.position.position = undefined;
            this.prepareConfig(item, container);
        } else {
            this._printTargetRemovedWarn();
        }
        return true;
    }

    elementUpdated(item, container) {
        _private.setStickyContent(item);
        const targetCoords = this._getTargetCoords(item, item.positionConfig.sizes);
        _private.updateStickyPosition(item, item.positionConfig, targetCoords);
        if (this._isTargetVisible(item)) {
            _private.updateClasses(item, item.positionConfig);

            // If popupOptions has new sizes, calculate position using them.
            // Else calculate position using current container sizes.
            _private.updateSizes(item.positionConfig, item.popupOptions);

            item.position = StickyStrategy.getPosition(item.positionConfig, this._getTargetCoords(item, item.positionConfig.sizes));

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
    }

    elementAfterUpdated(item, container) {
        // TODO https://online.sbis.ru/doc/a88a5697-5ba7-4ee0-a93a-221cce572430
        if (!this._isTargetVisible(item)) {
            this._printTargetRemovedWarn();
            return false;
        }
        /* start: We remove the set values that affect the size and positioning to get the real size of the content */
        const width = container.style.width;
        const maxHeight = container.style.maxHeight;
        const maxWidth = container.style.maxWidth;
        // Если внутри лежит скроллконтейнер, то восстанавливаем позицию скролла после изменения размеров
        const scroll = container.querySelector('.controls-Scroll__content');
        const scrollTop = scroll?.scrollTop;
        container.style.maxHeight = item.popupOptions.maxHeight ? item.popupOptions.maxHeight + 'px' : '100vh';
        container.style.maxWidth = item.popupOptions.maxWidth ? item.popupOptions.maxWidth + 'px' : '100vw';
        const hasScrollBeforeReset = constants.isBrowserPlatform && (document.body.scrollHeight > document.body.clientHeight);
        // Если значения явно заданы на опциях, то не сбрасываем то что на контейнере
        if (!item.popupOptions.width) {
            container.style.width = 'auto';
        }
        if (!item.popupOptions.height) {
            container.style.height = 'auto';
        }
        let hasScrollAfterReset = constants.isBrowserPlatform && (document.body.scrollHeight > document.body.clientHeight);
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
        // измеряет верстку и выставляет себе новую позицию и размеры. Т.к. это проходит минимум в 2 цикла синхронизации,
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

        // toDO выписана задача https://online.sbis.ru/opendoc.html?guid=79cdc24c-cf4c-45da-97b4-7353540a2b1b
        if (item.popupOptions.resizeCallback instanceof Function) {
            item.popupOptions.resizeCallback();
        }
        return true;
    }

    resizeInner(item, container): Boolean {
        return this.elementAfterUpdated(item, container);
    }

    getDefaultConfig(item) {
        _private.setStickyContent(item);
        item.popupOptions = _private.prepareOriginPoint(item.popupOptions);
        const popupCfg = this._getPopupConfig(item);
        _private.updateStickyPosition(item, popupCfg);
        item.position = {
            top: -10000,
            left: -10000,
            maxWidth: item.popupOptions.maxWidth || _private.getWindowWidth(),
            maxHeight: item.popupOptions.maxHeight || _private.getWindowHeight(),
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

    prepareConfig(item, container) {
        _private.removeOrientationClasses(item);
        this._getPopupSizes(item, container);
        item.sizes.margins = _private.getMargins(item);
        _private.prepareConfig(this, item, item.sizes);
    }

    needRecalcOnKeyboardShow() {
        return true;
    }

    _getPopupConfig(cfg, sizes) {
        const restrictiveContainerCoords = this._getRestrictiveContainerCoords(cfg);
        return {
            targetPoint: cMerge(cClone(DEFAULT_OPTIONS.targetPoint), cfg.popupOptions.targetPoint || {}),
            restrictiveContainerCoords,
            direction: cMerge(cClone(DEFAULT_OPTIONS.direction), cfg.popupOptions.direction || {}),
            offset: cMerge(cClone(DEFAULT_OPTIONS.offset), cfg.popupOptions.offset || {}),
            config: {
                width: cfg.popupOptions.width,
                height: cfg.popupOptions.height,
                minWidth: cfg.popupOptions.minWidth,
                minHeight: cfg.popupOptions.minHeight,
                maxWidth: cfg.popupOptions.maxWidth,
                maxHeight: cfg.popupOptions.maxHeight
            },
            sizes,
            fittingMode: cfg.popupOptions.fittingMode
        };
    }

    private _getRestrictiveContainerCoords(item) {
        if (item.popupOptions.restrictiveContainer) {
            let restrictiveContainer;
            if (cInstance.instanceOfModule(item.popupOptions.restrictiveContainer, 'UI/Base:Control')) {
                restrictiveContainer = item.popupOptions.restrictiveContainer._container;
            } else if (item.popupOptions.restrictiveContainer instanceof HTMLElement) {
                restrictiveContainer = item.popupOptions.restrictiveContainer;
            } else if (typeof item.popupOptions.restrictiveContainer === 'string') {
                // ищем ближайшего
                restrictiveContainer = item.popupOptions.target.closest(item.popupOptions.restrictiveContainer);
            }

            if (restrictiveContainer) {
                return TargetCoords.get(restrictiveContainer);
            }
        }
    }

    private _getTargetCoords(cfg, sizes) {
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
            sizes = sizes || {};
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
        return TargetCoords.get(StickyController._getTargetNode(cfg));
    }

    private _printTargetRemovedWarn(): void {
        Logger.warn('Controls/popup:Sticky: Пропал target из DOM. Позиция окна может быть не верная');
    }

    private _isTargetVisible(item): boolean {
        const targetCoords = this._getTargetCoords(item, {});
        return !!targetCoords.width;
    }

    protected static _getTargetNode(cfg): HTMLElement {
        if (cInstance.instanceOfModule(cfg.popupOptions.target, 'UI/Base:Control')) {
            return cfg.popupOptions.target._container;
        }
        return cfg.popupOptions.target || (constants.isBrowserPlatform && document.body);
    }
}

export = new StickyController();

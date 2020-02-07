import {default as BaseController} from 'Controls/_popupTemplate/BaseController';
import StickyStrategy = require('Controls/_popupTemplate/Sticky/StickyStrategy');
import cMerge = require('Core/core-merge');
import cClone = require('Core/core-clone');
import Env = require('Env/Env');
import TargetCoords = require('Controls/_popupTemplate/TargetCoords');
import StickyContent = require('wml!Controls/_popupTemplate/Sticky/StickyContent');
import * as cInstance from 'Core/core-instance';

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
        const newCfg = cClone(config);
        newCfg.direction = newCfg.direction || {};
        newCfg.offset = newCfg.offset || {};

        if (newCfg.horizontalAlign && typeof (config.horizontalAlign) === 'object') {
            if ('side' in newCfg.horizontalAlign) {
                newCfg.direction.horizontal = newCfg.horizontalAlign.side;
            }
            if ('offset' in newCfg.horizontalAlign) {
                newCfg.offset.horizontal = newCfg.horizontalAlign.offset;
            }
        }

        if (newCfg.verticalAlign && typeof (config.verticalAlign) === 'object') {
            if ('side' in newCfg.verticalAlign) {
                newCfg.direction.vertical = newCfg.verticalAlign.side;
            }
            if ('offset' in newCfg.verticalAlign) {
                newCfg.offset.vertical = newCfg.verticalAlign.offset;
            }
        }
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

        cfg.position = StickyStrategy.getPosition(popupCfg, self._getTargetCoords(cfg, sizes));

        cfg.popupOptions.stickyPosition = this.prepareStickyPosition(popupCfg);

        cfg.positionConfig = popupCfg;
        _private.updateClasses(cfg, popupCfg);
    },

    updateClasses(cfg, popupCfg) {
        // Remove the previous classes of direction and add new ones
        _private.removeOrientationClasses(cfg);
        cfg.popupOptions.className = (cfg.popupOptions.className || '') + ' ' + _private.getOrientationClasses(popupCfg);
    },

    getOrientationClasses(cfg) {
        let className = 'controls-Popup-corner-vertical-' + cfg.targetPoint.vertical;
        className += ' controls-Popup-corner-horizontal-' + cfg.targetPoint.horizontal;
        className += ' controls-Popup-align-horizontal-' + cfg.direction.horizontal;
        className += ' controls-Popup-align-vertical-' + cfg.direction.vertical;
        className += ' controls-Sticky__reset-margins';
        return className;
    },

    removeOrientationClasses(cfg) {
        if (cfg.popupOptions.className) {
            cfg.popupOptions.className = cfg.popupOptions.className.replace(/controls-Popup-corner\S*|controls-Popup-align\S*|controls-Sticky__reset-margins/g, '').trim();
        }
    },

    getTargetNode(cfg): HTMLElement {
        if (cInstance.instanceOfModule(cfg.popupOptions.target, 'UI/Base:Control')) {
            return cfg.popupOptions.target._container;
        }
        return cfg.popupOptions.target || (document && document.body);
    },

    prepareStickyPosition(cfg) {
        return {
            targetPoint: cfg.targetPoint,
            direction: cfg.direction,
            offset: cfg.offset,
            horizontalAlign: { // TODO: to remove
                side: cfg.direction.horizontal,
                offset: cfg.offset.horizontal
            },
            verticalAlign: { // TODO: to remove
                side: cfg.direction.vertical,
                offset: cfg.offset.vertical
            },
            corner: cfg.corner // TODO: to remove
        };
    },

    getWindowWidth() {
        return window && window.innerWidth;
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
        if (!document) {
            return {
                left: 0,
                top: 0
            };
        }

        const fakeDiv = _private.getFakeDiv();
        fakeDiv.className = item.popupOptions.className;

        const styles = fakeDiv.currentStyle || window.getComputedStyle(fakeDiv);
        return {
            top: parseInt(styles.marginTop, 10),
            left: parseInt(styles.marginLeft, 10)
        };
    },

    /**
     * Creates fake div to calculate margins.
     * Element is created with position absolute and far beyond the screen left position
     */
    getFakeDiv(): HTMLDivElement {
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
 * @control
 * @private
 * @category Popup
 */
class StickyController extends BaseController {
    TYPE = 'Sticky';
    _private = _private;

    elementCreated(item, container) {
        if (this._isTargetVisible(item)) {
            _private.setStickyContent(item);
            item.position.position = undefined;
            this.prepareConfig(item, container);
        } else {
            require('Controls/popup').Controller.remove(item.id);
        }
    }

    elementUpdated(item, container) {
        _private.setStickyContent(item);
        item.popupOptions.stickyPosition = _private.prepareStickyPosition(item.positionConfig);
        if (this._isTargetVisible(item)) {
            _private.updateClasses(item, item.positionConfig);
            item.position = StickyStrategy.getPosition(item.positionConfig, this._getTargetCoords(item, item.positionConfig.sizes));

            // In landscape orientation, the height of the screen is low when the keyboard is opened.
            // Open Windows are not placed in the workspace and chrome scrollit body.
            if (Env.detection.isMobileAndroid) {
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
            require('Controls/popup').Controller.remove(item.id);
        }
    }

    elementAfterUpdated(item, container) {
        /* start: We remove the set values that affect the size and positioning to get the real size of the content */
        const width = container.style.width;
        container.style.width = 'auto';
        container.style.height = 'auto';

        /* end: We remove the set values that affect the size and positioning to get the real size of the content */

        this.prepareConfig(item, container);

        /* start: Return all values to the node. Need for vdom synchronizer */
        container.style.width = width;
        // После того, как дочерние контролы меняют размеры, они кидают событие controlResize, окно отлавливает событие,
        // измеряет верстку и выставляет себе новую позицию и размеры. Т.к. это проходит минимум в 2 цикла синхронизации,
        // то визуально видны прыжки. Уменьшаю на 1 цикл синхронизации простановку размеров
        // Если ограничивающих размеров нет (контент влезает в экран), то ставим высоту по контенту.
        container.style.height = item.position.height ? item.position.height + 'px' : 'auto';

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
        item.popupOptions.stickyPosition = _private.prepareStickyPosition(popupCfg);
        item.position = {
            top: -10000,
            left: -10000,
            maxWidth: item.popupOptions.maxWidth || _private.getWindowWidth(),

            // Error on ios when position: absolute container is created outside the screen and stretches the page
            // which leads to incorrect positioning due to incorrect coordinates. + on page scroll event firing
            // Treated position:fixed when positioning pop-up outside the screen
            position: 'fixed'
        };

        if (Env.detection.isMobileIOS && Env.detection.IOSVersion === 12) {
            item.position.top = 0;
            item.position.left = 0;
            item.position.hidden = true;
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
        return {
            targetPoint: cMerge(cClone(DEFAULT_OPTIONS.targetPoint), cfg.popupOptions.targetPoint || {}),
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

        if (!document) {
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
        return TargetCoords.get(_private.getTargetNode(cfg));
    }

    private _isTargetVisible(item): boolean {
        const targetCoords = this._getTargetCoords(item, {});
        return !!targetCoords.width;
    }
}

export = new StickyController();

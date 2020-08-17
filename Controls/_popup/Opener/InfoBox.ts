import cClone = require('Core/core-clone');
import {IPopupItemInfo} from 'Controls/_popup/interface/IPopup';
import BaseOpener, {IBaseOpenerOptions, ILoadDependencies} from 'Controls/_popup/Opener/BaseOpener';
import getZIndex = require('Controls/Utils/getZIndex');
import {DefaultOpenerFinder} from 'UI/Focus';
import {IInfoBoxPopupOptions, IInfoBoxOpener} from 'Controls/_popup/interface/IInfoBoxOpener';
import {Control} from 'UI/Base';

/**
 * Component that opens a popup that is positioned relative to a specified element. {@link https://wi.sbis.ru/doc/platform/developmentapl/interface-development/controls/openers/infobox/ see more}.
 * @remark
 * Private control. This control uses Popup/Infobox and Application to open popup on openInfobox events
 * @class Controls/_popup/Opener/InfoBox
 * @mixes Controls/_popup/interface/IInfoBoxOpener
 * @extends Core/Control
 *
 * @private
 * @control
 * @category Popup
 * @author Красильников А.С.
 * @private
 */

const INFOBOX_HIDE_DELAY = 300;
const INFOBOX_SHOW_DELAY = 300;
const POPUP_CONTROLLER = 'Controls/popupTemplate:InfoBoxController';
const Z_INDEX_STEP = 10;
const MIN_INTERVAL = 10;

// Default popup configuration
const DEFAULT_CONFIG = {
    style: 'secondary',
    position: 'tl',
    targetSide: 'top',
    alignment: 'start',
    floatCloseButton: false,
    closeOnOutsideClick: true,
    hideDelay: INFOBOX_HIDE_DELAY,
    showDelay: INFOBOX_SHOW_DELAY
};

let InfoBoxId: string;
let openId: number;
let closeId: number;

interface IInfoBoxOpenerOptions extends IInfoBoxPopupOptions, IBaseOpenerOptions {
    templateOptions?: IInfoBoxPopupOptions;
}

class InfoBox extends BaseOpener<IInfoBoxOpenerOptions> implements IInfoBoxOpener {
    readonly '[Controls/_popup/interface/IInfoBoxOpener]': boolean;
    _style: number = null;
    private _target: HTMLElement | EventTarget | Control<{}, void>;
    private _timerId: number;

    _beforeUnmount(): void {
        this.close(0);
        clearInterval(this._timerId);
    }

// TODO https://online.sbis.ru/doc/a88a5697-5ba7-4ee0-a93a-221cce572430
    open(cfg: IInfoBoxPopupOptions): void {
        // Only one popup can be opened
        if (this.isOpened()) {
            this.close(0);
        }
        InfoBox._open((newCfg: object) => {
            super.open(newCfg, POPUP_CONTROLLER);
        }, cfg);
    }

    _getIndicatorConfig(): void {
        // В случае с подсказкой оверлей не нужен. Только мешает работе ховеров для открытия/закрытия.
        // Открытие подсказки всегда быстрее 2с, поэтому визуально оверлея с индикатором не появляется.
        const baseConfig = super._getIndicatorConfig();
        baseConfig.overlay = 'none';
        return baseConfig;
    }

    close(delay?: number): void {
        InfoBox._close(() => {
            super.close();
        }, delay);
    }

    _closeOnTargetScroll(): void {
        this.close(0);
    }

    private static _getInfoBoxConfig(cfg: IInfoBoxPopupOptions): IInfoBoxOpenerOptions {
        // smart merge of two objects. Standart "core-merge util" will rewrite field value of first object even
        // if value of second object will be undefined
        const newCfg = cClone(DEFAULT_CONFIG);
        cfg = cfg || {};
        for (const i in cfg) {
            if (cfg.hasOwnProperty(i)) {
                if (cfg[i] !== undefined) {
                    newCfg[i] = cfg[i];
                }
            }
        }

        if (cfg.targetSide || cfg.alignment) {
            newCfg.position = InfoBox._preparePosition(cfg.targetSide, cfg.alignment);
        }

        // Find opener for InfoBox
        if (!newCfg.opener && newCfg.target) {
            newCfg.opener = DefaultOpenerFinder.find(newCfg.target);
        }

        // Высчитывается только на старой странице через утилиту getZIndex, т.к. открывать инфобокс могут со старых окон
        // Аналогично новому механизму, zIndex инфобокса на 1 больше родительского.
        const zIndex = newCfg.zIndex || (getZIndex(newCfg.opener || this) - (Z_INDEX_STEP - 1));
        return {
            // todo: https://online.sbis.ru/doc/7c921a5b-8882-4fd5-9b06-77950cbe2f79
            target: newCfg.target && newCfg.target[0] || newCfg.target,
            position: newCfg.position,
            autofocus: false,
            maxWidth: newCfg.maxWidth,
            eventHandlers: newCfg.eventHandlers,
            closeOnOutsideClick: newCfg.closeOnOutsideClick,
            opener: newCfg.opener,
            zIndexCallback: (item: IPopupItemInfo) => {
                if (zIndex) {
                    return zIndex;
                }
                if (item.parentZIndex) {
                    return item.parentZIndex + 1;
                }
            },
            templateOptions: { // for template: Opener/InfoBox/resources/template
                template: newCfg.template,
                templateOptions: newCfg.templateOptions, // for user template: newCfg.template
                message: newCfg.message,
                style: newCfg.style || 'secondary',
                floatCloseButton: newCfg.floatCloseButton,
                validationStatus: newCfg.validationStatus
            },
            template: 'Controls/popupTemplate:templateInfoBox',
            showDelay: newCfg.showDelay
        };
    }

    private static _preparePosition(targetSide: string, alignment: string): string {
        let position = targetSide[0];
        const leftRight = {
            start: 't',
            center: 'c',
            end: 'b'
        };
        const topBottom = {
            start: 'l',
            center: 'c',
            end: 'r'
        };
        if (targetSide === 'left' || targetSide === 'right') {
            position += leftRight[alignment];
        } else {
            position += topBottom[alignment];
        }
        return position;
    }

    private static _clearTimeout(): void {
        if (openId) {
            clearTimeout(openId);
        }
        if (closeId) {
            clearTimeout(closeId);
        }
    }

    private static _close(callback: Function, delay: number = INFOBOX_HIDE_DELAY): void {
        InfoBox._clearTimeout();
        clearInterval(this._timerId);
        this._timerId = null;
        if (delay > 0) {
            closeId = setTimeout(callback, delay);
        } else {
            callback();
        }
    }

    private static _open(callback: Function, cfg: IInfoBoxPopupOptions): void {
        InfoBox._clearTimeout();
        this._target = cfg.target && cfg.target[0] || cfg.target;
        if (!this._timerId) {
            this._timerId = setInterval(() => {
                if (this._target.closest('.ws-hidden')) {
                    InfoBox._close(() => {
                        BaseOpener.closeDialog(InfoBoxId);
                    }, 0);
                    clearInterval(this._timerId);
                }
            }, MIN_INTERVAL);
        }
        const newCfg: IInfoBoxOpenerOptions = InfoBox._getInfoBoxConfig(cfg);
        if (newCfg.showDelay > 0) {
            openId = setTimeout(() => {
                callback(newCfg);
            }, newCfg.showDelay);
        } else {
            callback(newCfg);
        }
    }

    static openPopup(config: IInfoBoxPopupOptions): void {
        InfoBox._open((newCfg) => {
            BaseOpener.requireModules(newCfg, POPUP_CONTROLLER).then((result: ILoadDependencies) => {
                BaseOpener.showDialog(result.template, newCfg, result.controller).then((popupId: string) => {
                    InfoBoxId = popupId;
                });
            });
        }, config);
    }

    static closePopup(delay?: number): void {
        InfoBox._close(() => {
            BaseOpener.closeDialog(InfoBoxId);
        }, delay);
    }

    static getDefaultOptions(): IInfoBoxOpenerOptions {
        const options = BaseOpener.getDefaultOptions();

        options.actionOnScroll = 'close';
        options.showIndicator = false;
        return options;
    }
}

export default InfoBox;

import BaseOpener, {IBaseOpenerOptions, ILoadDependencies} from 'Controls/_popup/Opener/BaseOpener';
import ManagerController from 'Controls/_popup/Manager/ManagerController';
import * as randomId from 'Core/helpers/Number/randomId';
import * as cClone from 'Core/core-clone';
import {IPreviewerOpener, IPreviewerPopupOptions} from 'Controls/_popup/interface/IPreviewerOpener';

interface IPreviewerOpenerOptions extends IPreviewerPopupOptions, IBaseOpenerOptions {}

const DISPLAY_DURATION: number = 1000;
const POPUP_CONTROLLER = 'Controls/popupTemplate:PreviewerController';

const clearClosingTimeout = (config: IPreviewerPopupOptions) => {
    if (config.closingTimerId) {
        clearTimeout(config.closingTimerId);
        config.closingTimerId = null;
    }
};

const clearOpeningTimeout = (config: IPreviewerPopupOptions) => {
    if (config.openingTimerId) {
        clearTimeout(config.openingTimerId);
        config.openingTimerId = null;
    }
};

const prepareConfig = (config: IPreviewerPopupOptions) => {
    const newConfig: IPreviewerPopupOptions = cClone(config);

    newConfig.closeOnOutsideClick = true;
    newConfig.className = 'controls-PreviewerController';
    return newConfig;
};

const open = (callback: Function, config: IPreviewerPopupOptions, type?: string): void => {
    clearOpeningTimeout(config);
    clearClosingTimeout(config);

    if (type === 'hover') {
        config.openingTimerId = setTimeout(() => {
            config.openingTimerId = null;
            callback();
        }, DISPLAY_DURATION);
    } else {
        callback();
    }
};

const close = (callback: Function, config: IPreviewerPopupOptions, type?: string): void => {
    clearOpeningTimeout(config);
    clearClosingTimeout(config);
    if (type === 'hover') {
        config.closingTimerId = setTimeout(() => {
            config.closingTimerId = null;
            callback();
        }, DISPLAY_DURATION);
    } else {
        callback();
    }
};

const cancel = (config: IPreviewerPopupOptions, action: string): void => {
    switch (action) {
        case 'opening':
            config.isCancelOpening = true;
            clearOpeningTimeout(config);
            break;
        case 'closing':
            clearClosingTimeout(config);
            break;
    }
};

class Previewer extends BaseOpener<IPreviewerOpenerOptions> implements IPreviewerOpener {
    readonly '[Controls/_popup/interface/IPreviewerOpener]': boolean;
    private _currentConfig: IPreviewerPopupOptions = {};

    protected _beforeUnmount(): void {
        clearClosingTimeout(this._currentConfig);
        clearOpeningTimeout(this._currentConfig);
    }

    open(cfg: IPreviewerPopupOptions, type?: string): void {
        this.close();
        const newCfg = prepareConfig(cfg);
        open(() => {
            this._currentConfig = newCfg;
            super.open(newCfg, POPUP_CONTROLLER);
        }, newCfg, type);
    }

    close(type?: string): void {
        close(() => {
            super.close();
        }, this._currentConfig, type);
    }

    /**
     * Cancel a delay in opening or closing.
     * @param {String} action Action to be undone.
     * @variant opening
     * @variant closing
     */
    cancel(action: string): void {
        cancel(this._currentConfig, action);
    }

    static openPopup(config: IPreviewerPopupOptions, type?: string): Promise<IPreviewerPopupOptions> {
        return new Promise((resolve: Function) => {
            const newCfg: IPreviewerPopupOptions = prepareConfig(config);
            if (!newCfg.id) {
                newCfg.id = randomId('popup-');
            }
            open(() => {
                newCfg.isCancelOpening = false;
                BaseOpener.requireModules(newCfg, POPUP_CONTROLLER).then((result: ILoadDependencies) => {
                    if (!newCfg.isCancelOpening) {
                        BaseOpener.showDialog(result.template, newCfg, result.controller);
                    }
                });
            }, newCfg, type);
            resolve(newCfg);
        });
    }

    static closePopup(config: IPreviewerPopupOptions, type?: string): void {
        if (config) {
            close(() => {
                BaseOpener.closeDialog(config.id);
            }, config, type);
        }
    }

    static cancelPopup(config: IPreviewerPopupOptions, action: string): void {
        if (config) {
            cancel(config, action);
        }
    }

    // TODO перенести метод в baseOpener, ManagerController здесь не нужен
    static isOpenedPopup(config: IPreviewerPopupOptions): boolean {
        return config && !!ManagerController.find(config.id);
    }
}

export default Previewer;

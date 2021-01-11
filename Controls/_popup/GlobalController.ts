import InfoBox from './Opener/InfoBox';
import Dialog from './Opener/Dialog';
import Previewer from './Opener/Previewer';
import { goUpByControlTree } from 'UI/Focus';

class GlobalController {
    _infoBoxId: string = null;
    _previewerId: string = null;
    _activeInfobox;
    _activePreviewer;
    _closedDialodResolve;

    private _getPopupConfig(config) {
        // Find opener for Infobox
        if (!config.opener) {
            config.opener = goUpByControlTree(config.target)[0];
        }
        return config;
    }

    private _getManagerWrapperController() {
        // В старом окружении регистрируем GlobalPopup, чтобы к нему был доступ.
        // На вдоме ничего не зарегистрируется, т.к. слой совместимости там не подгрузится
        let ManagerWrapperControllerMod = 'Controls/Popup/Compatible/ManagerWrapper/Controller';
        return requirejs.defined(ManagerWrapperControllerMod) ? requirejs(ManagerWrapperControllerMod).default : null;
    }

    openInfoBoxHandler(event, config) {
        this._activeInfobox = event.target;
        this._getPopupConfig(config);
        this._infoBoxId = this.openInfoBox(config);
    }

    openInfoBox(config) {
        return InfoBox.openPopup(config);
    }

    closeInfoBox(delay) {
        InfoBox.closePopup(delay);
    }

    closeInfoBoxHandler(event, delay) {
        // TODO: fixed by https://online.sbis.ru/doc/d7b89438-00b0-404f-b3d9-cc7e02e61bb3
        let activeInf = this._activeInfobox && this._activeInfobox.get ? this._activeInfobox.get(0) : this._activeInfobox;
        let eventTarget = event.target && event.target.get ? event.target.get(0) : event.target;
        if (activeInf === eventTarget) {
            this._activeInfobox = null;
            this.closeInfoBox(delay);
        }
    }

    // Needed to immediately hide the infobox after its target or one
    // of their parent components are hidden
    // Will be removed:
    // https://online.sbis.ru/opendoc.html?guid=1b793c4f-848a-4735-b96a-f0c1cf479fab
    forceCloseInfoBoxHandler() {
        if (this._activeInfobox) {
            this._activeInfobox = null;
            this.closeInfoBox(0);
        }
    }

    openPreviewerHandler(event, config, type) {
        this._activePreviewer = event.target;
        return Previewer.openPopup(config, type).then((id: string) => {
            this._previewerId = id;
        });
    }

    closePreviewerHandler(event, type) {
        Previewer.closePopup(this._previewerId, type);
    }

    cancelPreviewerHandler(event, action) {
        Previewer.cancelPopup(this._previewerId, action);
    }

    isPreviewerOpenedHandler(event) {
        if (this._activePreviewer === event.target && this._previewerId) {
            return Previewer.isOpenedPopup(this._previewerId);
        }
        return false;
    }

    popupBeforeDestroyedHandler(event, popupCfg, popupList, popupContainer) {
        if (this._activeInfobox) {
            // If infobox is displayed inside the popup, then close infobox.
            if (this.needCloseInfoBox(this._activeInfobox, popupContainer)) {
                this._activeInfobox = null;
                this.closeInfoBox(0);
            }
        }
    }

    needCloseInfoBox(infobox, popup) {
        let parent = infobox.parentElement;
        while (parent) {
            if (parent === popup) {
                return true;
            }
            parent = parent.parentElement;
        }
        return false;
    }

    /**
     * open modal dialog
     * @param event
     * @param {String | Function} template
     * @param {Object} templateOptions
     * @param {UI/Base:Control} [opener=null]
     * @return {Promise.<{popupId: String, closeDialogPromise: Promise<void>}>} result promise
     * @private
     */
    openDialogHandler(event, template, templateOptions, opener = null) {
        // Нужно остановить всплытие события serviceError, так как оно обработано здесь.
        // Иначе другой popup:Global, который может быть на странице, покажет диалог ещё раз.
        event.stopPropagation();

        this.onDialogClosed();

        return Dialog.openPopup({
            template,
            templateOptions,
            opener,
            eventHandlers: {
                onClose: () => {
                    this.onDialogClosed();
                }
            }
        }).then((popupId) => ({
            popupId,
            closePopupPromise: new Promise((resolve) => {
                this._closedDialodResolve = resolve;
            })
        }));
    }

    onDialogClosed() {
        if (this._closedDialodResolve) {
            this._closedDialodResolve();
            delete this._closedDialodResolve;
        }
    }

    registerGlobalPopup() {
        let ManagerWrapperController = this._getManagerWrapperController();
        // COMPATIBLE: В слое совместимости для каждого окна с vdom шаблоном создается Global.js. Это нужно для работы
        // событий по открытию глобальный окон (openInfobox, etc). Но глобальные опенеры должны быть одни для всех из
        // созданных Global.js. Код ниже делает создание глобальных опенеров единоразовым, при создании второго и
        // следующего инстанса Global.js в качестве опенеров ему передаются уже созданные опенеры у первого инстанста
        // На Vdom странице Global.js всегда один.
        if (ManagerWrapperController && !ManagerWrapperController.getGlobalPopup()) {
            ManagerWrapperController.registerGlobalPopup(this);
        }
    }

    registerGlobalPopupEmpty() {
        let ManagerWrapperController = this._getManagerWrapperController();
        if (ManagerWrapperController && ManagerWrapperController.getGlobalPopup() === this) {
            ManagerWrapperController.registerGlobalPopup(null);
        }
    }
}

export default GlobalController;

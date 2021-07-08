import Control = require('Core/Control');
import template = require('wml!Controls/_popup/Global/Global');
import GlobalController from './GlobalController';
import {Bus as EventBus} from 'Env/Event';

/**
 * @class Controls/_popup/Global
 * @private
 */
const Global = Control.extend({
    _template: template,

    _afterMount() {
        this._globalController = new GlobalController();
        this._globalController.registerGlobalPopup();
        const channelPopupManager = EventBus.channel('popupManager');
        channelPopupManager.subscribe('managerPopupBeforeDestroyed', this._popupBeforeDestroyedHandler, this);
    },

    _beforeUnmount(): void {
        this._globalController.registerGlobalPopupEmpty();
        const channelPopupManager = EventBus.channel('popupManager');
        channelPopupManager.unsubscribe('managerPopupBeforeDestroyed', this._popupBeforeDestroyedHandler, this);
    },

    _openInfoBoxHandler(event, config) {
        this._globalController._openInfoBoxHandler(event, config);
    },

    _openInfoBox(config) {
        return this._globalController._openInfoBox(config);
    },

    _closeInfoBox(delay) {
        return this._globalController._closeInfoBox(delay);
    },

    _closeInfoBoxHandler(event, delay) {
        this._globalController._closeInfoBoxHandler(event, delay);
    },

    _forceCloseInfoBoxHandler() {
        this._globalController._forceCloseInfoBoxHandler();
    },

    _openPreviewerHandler(event, config, type) {
        return this._globalController._openPreviewerHandler(event, config, type);
    },

    _closePreviewerHandler(event, type) {
        this._globalController._closePreviewerHandler(event, type);
    },

    _cancelPreviewerHandler(event, action) {
        this._globalController._cancelPreviewerHandler(event, action);
    },

    _isPreviewerOpenedHandler(event) {
        return this._globalController._isPreviewerOpenedHandler(event);
    },
    _popupBeforeDestroyedHandler(event, popupCfg, popupList, popupContainer) {
        this._globalController._popupBeforeDestroyedHandler(event, popupCfg, popupList, popupContainer);
    },

    _needCloseInfoBox(infobox, popup) {
        return this._globalController._needCloseInfoBox(infobox, popup);
    },

    _openDialogHandler(event, template, templateOptions, opener = null) {
        return this._globalController._openDialogHandler(event, template, templateOptions, opener);
    },

    _onDialogClosed() {
        this._globalController.onDialogClosed();
    }

});

export default Global;

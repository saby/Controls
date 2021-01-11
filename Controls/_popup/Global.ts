import {Control} from 'UI/Base';
import template = require('wml!Controls/_popup/Global/Global');
import GlobalController from './GlobalController';
import {Bus as EventBus} from 'Env/Event';

/**
 * @class Controls/_popup/Global
 * @private
 */
const Global = Control.extend({
    _template: template,

    _beforeMount() {
        this._globalController = new GlobalController();
    },

    _afterMount() {
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
        this._globalController.openInfoBoxHandler(event, config);
    },

    _openInfoBox(config) {
        return this._globalController.openInfoBox(config);
    },

    _closeInfoBox(delay) {
        return this._globalController.closeInfoBox(delay);
    },

    _closeInfoBoxHandler(event, delay) {
        this._globalController.closeInfoBoxHandler(event, delay);
    },

    _forceCloseInfoBoxHandler() {
        this._globalController.forceCloseInfoBoxHandler();
    },

    _openPreviewerHandler(event, config, type) {
        return this._globalController.openPreviewerHandler(event, config, type);
    },

    _closePreviewerHandler(event, type) {
        this._globalController.closePreviewerHandler(event, type);
    },

    _cancelPreviewerHandler(event, action) {
        this._globalController.cancelPreviewerHandler(event, action);
    },

    _isPreviewerOpenedHandler(event) {
        return this._globalController.isPreviewerOpenedHandler(event);
    },
    _popupBeforeDestroyedHandler(event, popupCfg, popupList, popupContainer) {
        this._globalController.popupBeforeDestroyedHandler(event, popupCfg, popupList, popupContainer);
    },

    _needCloseInfoBox(infobox, popup) {
        return this._globalController.needCloseInfoBox(infobox, popup);
    },

    _openDialogHandler(event, template, templateOptions, opener = null) {
        return this._globalController.openDialogHandler(event, template, templateOptions, opener);
    },

    _onDialogClosed() {
        this._globalController.onDialogClosed();
    }

});

export default Global;

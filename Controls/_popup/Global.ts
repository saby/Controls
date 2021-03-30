import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import * as template from 'wml!Controls/_popup/Global/Global';
import GlobalController from './GlobalController';
import {Bus as EventBus} from 'Env/Event';

/**
 * @class Controls/_popup/Global
 * @private
 */

export default class Global extends Control<IControlOptions> {
    protected _template: TemplateFunction = template;
    private _globalController: GlobalController = new GlobalController();;

    protected _afterMount(): void {
        this._globalController.registerGlobalPopup();
        const channelPopupManager = EventBus.channel('popupManager');
        channelPopupManager.subscribe('managerPopupBeforeDestroyed', this._popupBeforeDestroyedHandler, this);
    }

    protected _beforeUnmount(): void {
        this._globalController.registerGlobalPopupEmpty();
        const channelPopupManager = EventBus.channel('popupManager');
        channelPopupManager.unsubscribe('managerPopupBeforeDestroyed', this._popupBeforeDestroyedHandler, this);
    }

    protected _openInfoBoxHandler(event, config): void {
        this._globalController.openInfoBoxHandler(event, config);
    }

    protected _closeInfoBoxHandler(event, delay): void {
        this._globalController.closeInfoBoxHandler(event, delay);
    }

    _openInfoBox(config): void {
        return this._globalController.openInfoBox(config);
    }

    _closeInfoBox(delay): void {
        return this._globalController.closeInfoBox(delay);
    }

    _needCloseInfoBox(infobox, popup): boolean {
        return this._globalController.needCloseInfoBox(infobox, popup);
    }

    _forceCloseInfoBoxHandler(): void {
        this._globalController.forceCloseInfoBoxHandler();
    }

    _openPreviewerHandler(event, config, type): void {
        return this._globalController.openPreviewerHandler(event, config, type);
    }

    _closePreviewerHandler(event, type): void {
        this._globalController.closePreviewerHandler(event, type);
    }

    _cancelPreviewerHandler(event, action): void {
        this._globalController.cancelPreviewerHandler(event, action);
    }

    _isPreviewerOpenedHandler(event): boolean {
        return this._globalController.isPreviewerOpenedHandler(event);
    }

    _popupBeforeDestroyedHandler(event, popupCfg, popupList, popupContainer): void {
        this._globalController.popupBeforeDestroyedHandler(event, popupCfg, popupList, popupContainer);
    }

    protected _openDialogHandler(event, template, templateOptions, opener = null): Promise<unknown> {
        return this._globalController.openDialogHandler(event, template, templateOptions, opener);
    }

    _onDialogClosed(): void {
        this._globalController.onDialogClosed();
    }
}

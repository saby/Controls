import BaseOpener, {IBaseOpenerOptions, ILoadDependencies} from 'Controls/_popup/Opener/BaseOpener';
import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import Template = require('wml!Controls/_popup/Opener/Confirmation');
import * as isNewEnvironment from 'Core/helpers/isNewEnvironment';
import {IConfirmationOpener, IConfirmationOptions} from 'Controls/_popup/interface/IConfirmation';

/**
 * Контрол, открывающий диалог подтверждения. Диалог позиционируется в центре экрана, а также блокирует работу
 * пользователя с родительским приложением.
 * @remark
 * Подробнее о работе с контролом читайте
 * {@link https://wi.sbis.ru/doc/platform/developmentapl/interface-development/controls/openers/confirmation/ здесь}.
 * См. <a href="/materials/demo-ws4-confirmation">демо-пример</a>.
 * @class Controls/_popup/Opener/Confirmation
 * @extends Controls/_popup/Opener/BaseOpener
 * @mixes Controls/_popup/interface/IConfirmation
 * @mixes Controls/_popup/interface/IConfirmationFooter
 * @implements Controls/_popup/interface/IConfirmationFooter
 * @control
 * @public
 * @category Popup
 * @author Красильников А.С.
 * @demo Controls-demo/Popup/Opener/ConfirmationPG
 */

interface IConfirmationOpenerOptions extends IBaseOpenerOptions {
    templateOptions?: IConfirmationOptions;
    isCentered?: boolean;
}

const POPUP_CONTROLLER = 'Controls/popupTemplate:DialogController';

class Confirmation extends Control<IControlOptions> implements IConfirmationOpener {
    '[Controls/_popup/interface/IConfirmationOpener]': boolean;
    protected _template: TemplateFunction = Template;

    protected _beforeMount(options: IControlOptions): void {
        super._beforeMount(options);
    }

    open(templateOptions: IConfirmationOptions = {}): Promise<boolean | undefined> {
        const options: IConfirmationOptions = {...templateOptions};
        options.opener = this;
        options.theme = this._options.theme;
        return Confirmation.openPopup(options);
    }

    private static _compatibleOptions(popupOptions: IConfirmationOpenerOptions): void {
        const OLD_ENVIRONMENT_Z_INDEX = 5000;
        popupOptions.zIndex = popupOptions.zIndex || popupOptions.templateOptions.zIndex;
        if (!isNewEnvironment()) {
            // For the old page, set the zIndex manually
            popupOptions.zIndex = OLD_ENVIRONMENT_Z_INDEX;
        }
    }

    private static _getConfig(templateOptions: IConfirmationOptions,
                              closeHandler: Function): IConfirmationOpenerOptions {
        templateOptions.closeHandler = closeHandler;
        const popupOptions: IConfirmationOpenerOptions = {
            template: 'Controls/popupTemplate:ConfirmationDialog',
            modal: true,
            autofocus: true,
            className: 'controls-Confirmation_popup',
            isCentered: true,
            templateOptions
        };
        Confirmation._compatibleOptions(popupOptions);
        return popupOptions;
    }

    static openPopup(templateOptions: IConfirmationOptions): Promise<boolean | undefined> {
        return new Promise((resolve) => {
            const config: IConfirmationOpenerOptions = Confirmation._getConfig(templateOptions, resolve);
            return BaseOpener.requireModules(config, POPUP_CONTROLLER).then((result: ILoadDependencies) => {
                BaseOpener.showDialog(result.template, config, result.controller);
            });
        });
    }
}

export default Confirmation;

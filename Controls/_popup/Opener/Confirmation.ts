import BaseOpener, {IBaseOpenerOptions, ILoadDependencies} from 'Controls/_popup/Opener/BaseOpener';
import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import Template = require('wml!Controls/_popup/Opener/BaseOpener');
import * as isNewEnvironment from 'Core/helpers/isNewEnvironment';
import {IConfirmationOpener, IConfirmationOptions} from 'Controls/_popup/interface/IConfirmation';

interface IConfirmationOpenerOptions extends IBaseOpenerOptions {
    templateOptions?: IConfirmationOptions;
    isCentered?: boolean;
}

const POPUP_CONTROLLER = 'Controls/popupTemplate:DialogController';
/**
 * Контрол, открывающий диалог подтверждения. Диалог позиционируется в центре экрана, а также блокирует работу
 * пользователя с родительским приложением.
 * 
 * @remark
 * Полезные ссылки:
 * * {@link /materials/Controls-demo/app/Controls-demo%2FConfirmation%2FConfirmation демо-пример}
 * * {@link /doc/platform/developmentapl/interface-development/controls/openers/confirmation/ руководство разработчика}
 * * {@link https://github.com/saby/wasaby-controls/blob/rc-20.4000/Controls-default-theme/aliases/_popupTemplate.less переменные тем оформления}
 * 
 * @class Controls/_popup/Opener/Confirmation
 * @extends Controls/_popup/Opener/BaseOpener
 * @mixes Controls/_popup/interface/IConfirmation
 * @implements Controls/_popup/interface/IConfirmationFooter
 * 
 * @public
 * @author Красильников А.С.
 * @demo Controls-demo/Confirmation/Confirmation
 */
class Confirmation extends Control<IControlOptions> implements IConfirmationOpener {
    '[Controls/_popup/interface/IConfirmationOpener]': boolean;
    protected _template: TemplateFunction = Template;

    protected _beforeMount(options: IControlOptions): void {
        super._beforeMount(options);
    }

    open(templateOptions: IConfirmationOptions = {}): Promise<boolean | undefined> {
        const options: IConfirmationOptions = {...templateOptions};
        options.theme = this._options.theme;
        return Confirmation.openPopup(options, this);
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
                              closeHandler: Function,
                              opener?: Control<IControlOptions, unknown>): IConfirmationOpenerOptions {
        templateOptions.closeHandler = closeHandler;

        // На шаблоне не должно быть опции opener, иначе ломаются базовые механизмы ядра (пример UI/hotKeys:Dispatcher)
        if (templateOptions.hasOwnProperty('opener')) {
            delete templateOptions.opener;
        }
        const popupOptions: IConfirmationOpenerOptions = {
            template: 'Controls/popupTemplate:ConfirmationDialog',
            topPopup: true,
            modal: true,
            autofocus: true,
            className: 'controls-Confirmation_popup',
            isCentered: true,
            opener,
            templateOptions
        };
        Confirmation._compatibleOptions(popupOptions);
        return popupOptions;
    }

    static openPopup(templateOptions: IConfirmationOptions,
                     opener?: Control<IControlOptions, unknown>): Promise<boolean | undefined> {
        return new Promise((resolve) => {
            const config: IConfirmationOpenerOptions = Confirmation._getConfig(templateOptions, resolve, opener);
            return BaseOpener.requireModules(config, POPUP_CONTROLLER).then((result: ILoadDependencies) => {
                BaseOpener.showDialog(result.template, config, result.controller);
            });
        });
    }
}

export default Confirmation;

import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import template = require('wml!Controls/_popupConfirmation/footer');
import * as tmplNotify from 'Controls/Utils/tmplNotify';
import {IConfirmationFooterOptions, IConfirmationFooter} from 'Controls/popupConfirmation';
import rk = require('i18n!Controls');

/**
 * Базовый шаблон футера окна диалога</a>.
 * @class Controls/_popupConfirmation/Footer
 * @implements Controls/_popup/interface/IConfirmationFooter
 * @extends Core/Control
 * @control
 * @public
 * @author Бондарь А.В.
 * @demo Controls-demo/PopupTemplate/Confirmation/Footer/Index
 */

export interface IFooterOptions extends IControlOptions, IConfirmationFooterOptions {}
class Footer extends Control<IFooterOptions> implements IConfirmationFooter {
    protected _template: TemplateFunction = template;
    protected _tmplNotify: Function = tmplNotify;

    static getDefaultOptions() {
        return {
            type: 'yesno',
            style: 'default',
            primaryAction: 'yes',
            yesCaption: rk('Да'),
            noCaption: rk('Нет'),
            cancelCaption: rk('Отмена'),
            okCaption: rk('ОК')
        };
    }
}
//TODO https://online.sbis.ru/doc/15f3d383-8953-4f38-a0f2-f5f8942cf148
export default Footer;

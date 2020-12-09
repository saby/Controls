import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import template = require('wml!Controls/_popupConfirmation/footer');
import {EventUtils} from 'UI/Events';
import {IConfirmationFooterOptions, IConfirmationFooter} from 'Controls/popupConfirmation';
import rk = require('i18n!Controls');


export interface IFooterOptions extends IControlOptions, IConfirmationFooterOptions {}
/**
 * Базовый шаблон футера окна диалога.
 *
 * @remark
 * Полезные ссылки:
 * * <a href="https://github.com/saby/wasaby-controls/blob/rc-20.4000/Controls-default-theme/aliases/_popupTemplate.less">переменные тем оформления</a>
 *
 * @class Controls/_popupConfirmation/Footer
 * @implements Controls/_popup/interface/IConfirmationFooter
 * @extends Core/Control
 *
 * @public
 * @author Красильников А.С.
 * @demo Controls-demo/PopupTemplate/Confirmation/Footer/Index
 */
class Footer extends Control<IFooterOptions> implements IConfirmationFooter {
    protected _template: TemplateFunction = template;
    protected _tmplNotify: Function = EventUtils.tmplNotify;

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

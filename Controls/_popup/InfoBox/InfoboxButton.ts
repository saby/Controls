import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import InfoboxButtonTemplate = require('wml!Controls/_popup/InfoBox/resources/InfoboxButton');
import {IIconSize, IIconSizeOptions} from 'Controls/interface';

export interface IInfoboxButton extends IControlOptions, IIconSizeOptions {
}

/**
 * Контрол, который представляет собой типовую кнопку для вызова подсказки.
 * 
 * @remark
 * Полезные ссылки:
 * * {@link https://github.com/saby/wasaby-controls/blob/rc-20.4000/Controls-default-theme/aliases/_popupTemplate.less переменные тем оформления}
 *
 * @class Controls/_popup/InfoBox/InfoboxButton
 * @extends Core/Control
 * @mixes Controls/_interface/IIconSize
 * 
 * @public
 * @author Красильников А.С.
 * @demo Controls-demo/InfoBox/InfoboxButtonHelp
 */

class InfoboxButton extends Control<IInfoboxButton> implements IIconSize {
    readonly '[Controls/_interface/IIconSize]': boolean;
    protected _template: TemplateFunction = InfoboxButtonTemplate;
    static _theme: string[] = ['Controls/popup'];

    static getDefaultOptions(): IInfoboxButton {
        return {
            iconSize: 'm'
        };
    }

}

export default InfoboxButton;

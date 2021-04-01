import {TemplateFunction} from 'UI/Base';
import Cut from './Cut';
import * as template from 'wml!Controls/_spoiler/AreaCut/AreaCut';

/**
 * Графический контрол, который ограничивает контент заданным числом строк в полях ввода.
 * Если контент превышает указанное число строк, то он обрезается и снизу добавляется многоточие.
 *
 * @class Controls/_spoiler/AreaCut
 * @extends UI/Base:Control
 * @mixes Controls/_spoiler/interface/ICut
 * @private
 *
 * @author Красильников А.С.
 */

class AreaCut extends Cut {
    protected _template: TemplateFunction = template;

    static getDefaultOptions(): object {
        return {
            cutButtonVisibility: true,
            lineHeight: 'm',
            backgroundStyle: 'default',
            buttonVisible: true
        };
    }
}

export default AreaCut;

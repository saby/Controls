import {Control, TemplateFunction, IControlOptions} from 'UI/Base';
import rk = require('i18n!Controls');
import {DOMUtil} from 'Controls/sizeUtils';

import template = require('wml!Controls/_moverDialog/BaseTemplate/BaseTemplate');
import 'css!Controls/moverDialog';

const MOVE_DIALOG_MEASURER_CLASS_TEMPLATE = 'controls-MoveDialog';

interface IOptions extends IControlOptions {
    headingCaption: string;
}

/**
 * Базовый шаблон диалогового окна, используемый в списках при перемещении элементов для выбора целевой папки.
 *
 * @remark
 * Полезные ссылки:
 * * {@link https://github.com/saby/wasaby-controls/blob/897d41142ed56c25fcf1009263d06508aec93c32/Controls-default-theme/variables/_moveDialog.less переменные тем оформления}
 *
 *
 * @public
 * @class Controls/_moverDialog/BaseTemplate
 * @author Авраменко А.С.
 */
export default class BaseTemplate extends Control<IOptions> {
    _template: TemplateFunction = template;
    _headingCaption: string;

    // Опция для проброса в Breadcrumbs. Позволяет правильно расчитать размеры Breadcrumbs
    _containerWidth: number;

    protected _beforeMount(options?: IOptions, contexts?: object, receivedState?: void): Promise<void> | void {
        this._headingCaption = options.headingCaption || rk('Выбор раздела');
        this._containerWidth = this._calculateWidth();
    }

    protected _calculateWidth(): number {
        return DOMUtil.getWidthForCssClass(MOVE_DIALOG_MEASURER_CLASS_TEMPLATE);
    }
}
/**
 * @name Controls/_moverDialog/BaseTemplate#headerContentTemplate
 * @cfg {function|String} Контент, располагающийся между заголовком и крестиком закрытия.
 */

/**
 * @name Controls/_moverDialog/BaseTemplate#bodyContentTemplate
 * @cfg {function|String} Основной контент шаблона, располагается под headerContentTemplate.
 */

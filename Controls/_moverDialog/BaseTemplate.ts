import {Control, TemplateFunction, IControlOptions} from 'UI/Base';
import {DOMUtil} from 'Controls/sizeUtils';

import template = require('wml!Controls/_moverDialog/BaseTemplate/BaseTemplate');

const MOVE_DIALOG_MEASURER_CLASS_TEMPLATE = 'controls-MoveDialog_theme-';

/**
 * Базовый шаблон диалогового окна, используемый в списках при перемещении элементов для выбора целевой папки.
 *
 * @remark
 * Полезные ссылки:
 * * {@link https://github.com/saby/wasaby-controls/blob/rc-20.4000/Controls-default-theme/aliases/_moveDialog.less переменные тем оформления}
 *
 * 
 * @public
 * @class Controls/_moverDialog/BaseTemplate
 * @author Авраменко А.С.
 */
export default class BaseTemplate extends Control<IControlOptions> {
    _template: TemplateFunction = template;

    // Опция для проброса в Breadcrumbs. Позволяет правильно расчитать размеры Breadcrumbs
    _containerWidth: number;

    protected _beforeMount(options?: IControlOptions, contexts?: object, receivedState?: void): Promise<void> | void {
        this._containerWidth = this._calculateWidth(options.theme);
    }

    protected _calculateWidth(theme: string): number {
        return DOMUtil.getWidthForCssClass(MOVE_DIALOG_MEASURER_CLASS_TEMPLATE + theme);
    }

    static _theme = ['Controls/moverDialog'];
}
/**
 * @name Controls/_moverDialog/BaseTemplate#headerContentTemplate
 * @cfg {function|String} Контент, располагающийся между заголовком и крестиком закрытия.
 */

/**
 * @name Controls/_moverDialog/BaseTemplate#bodyContentTemplate
 * @cfg {function|String} Основной контент шаблона, располагается под headerContentTemplate.
 */
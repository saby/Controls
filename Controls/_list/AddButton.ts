import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import * as template from 'wml!Controls/_list/AddButton/AddButton';
import {descriptor} from 'Types/entity';
import {SyntheticEvent} from 'Vdom/Vdom';
import 'css!Controls/list';

/**
 * Специализированный тип кнопки.
 *
 * @remark
 * Полезные ссылки:
 * * {@link https://github.com/saby/wasaby-controls/blob/897d41142ed56c25fcf1009263d06508aec93c32/Controls-default-theme/variables/_list.less переменные тем оформления}
 *
 * @class Controls/_list/AddButton
 * @mixes Controls/buttons:IClick
 * @extends UI/Base:Control
 *
 * @public
 * @author Красильников А.С.
 */

export default class AddButton extends Control<IControlOptions> {
    protected _template: TemplateFunction = template;

    protected clickHandler(e: SyntheticEvent<MouseEvent>): void {
        if (this._options.readOnly) {
            e.stopPropagation();
        }
    }

    static getOptionTypes(): object {
        return {
            caption: descriptor(String)
        };
    }
}

/**
 * @name Controls/_list/AddButton#caption
 * @cfg {String} Текст заголовка контрола.
 * @example
 * <pre class="brush: html">
 * <Controls.list:AddButton caption="add record"/>
 * </pre>
 */

import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import * as template from 'wml!Controls/_list/AddButton/AddButton';
import {descriptor} from 'Types/entity';
import {SyntheticEvent} from 'Vdom/Vdom';

/**
 * Специализированный тип кнопки.
 *
 * @remark
 * Полезные ссылки:
 * * {@link https://github.com/saby/wasaby-controls/blob/rc-20.4000/Controls-default-theme/aliases/_list.less переменные тем оформления}
 *
 * @class Controls/_list/AddButton
 * @mixes Controls/_buttons/interface/IClick
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

    static _theme: string[] = ['Controls/list'];

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

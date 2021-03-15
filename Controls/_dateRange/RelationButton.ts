import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import {descriptor} from 'Types/entity';
import * as template from 'wml!Controls/_dateRange/RelationButton/RelationButton';
import {SyntheticEvent} from 'Vdom/Vdom';

/**
 * Кнопка для связывания периодов. Контрол, который может использоваться с {@link Controls/_dateRange/RelationController RelationController}.
 *
 * @remark
 * Полезные ссылки:
 * {@link https://github.com/saby/wasaby-controls/blob/rc-20.4000/Controls-default-theme/aliases/_dateRange.less переменные тем оформления}
 *
 * @class Controls/_dateRange/RelationButton
 * @extends UI/Base:Control
 *
 * @public
 * @author Красильников А.С.
 * @demo Controls-demo/dateRange/RelationController
 *
 */

const valueMap = {
    normal: 'byCapacity',
    byCapacity: 'normal'
};

export default class RelationButton extends Control<IControlOptions> {
    protected _template: TemplateFunction = template;

    protected _valueChanged(event: SyntheticEvent<Event>): void {
        event.stopImmediatePropagation();
        this._notify('valueChanged', [valueMap[this._options.value]]);
        this._notify('relationButtonBindTypeChanged', [valueMap[this._options.value]], { bubbling: true });
    }

    static _theme: string[] = ['Controls/dateRange'];

    static getOptionTypes(): object {
        return {
            value: descriptor(String).oneOf([
                'normal',
                'byCapacity'
            ])
        };
    }

    static getDefaultOptions(): object {
        return {
            value: 'normal'
        };
    }
}

Object.defineProperty(RelationButton, 'defaultProps', {
   enumerable: true,
   configurable: true,

   get(): object {
      return RelationButton.getDefaultOptions();
   }
});

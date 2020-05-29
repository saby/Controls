import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import * as InputMask from 'Controls/_input/Mask';
import * as MaskFormatterValue from 'Controls/_input/Mask/FormatterValue';
import * as template from 'wml!Controls/_input/Adapter/Mask/Mask';
import * as tmplNotify from 'Controls/Utils/tmplNotify';

/**
 * Контрол обертка над полем ввода маски. Обеспечивает работу со значением с разделителями.
 * 
 * @remark
 * Полезные ссылки:
 * * <a href="https://github.com/saby/wasaby-controls/blob/rc-20.4000/Controls-default-theme/aliases/_input.less">переменные тем оформления</a>
 *
 * @class Controls/_input/Adapter/Mask
 * @extends UI/_base/Control
 *
 * @public
 * @demo Controls-demo/Adapter/Mask/Index
 *
 * @author Красильников А.С.
 */
class Mask extends Control<IControlOptions> {
    protected _notifyHandler = tmplNotify;

    protected _template: TemplateFunction = template;

    protected _beforeMount(options): void {
        this._value = MaskFormatterValue.formattedValueToValue(options.value, {
            mask: options.mask,
            replacer: options.replacer,
            formatMaskChars: options.formatMaskChars
        });
    }

    protected _beforeUpdate(newOptions): void {
        if (this._options.value !== newOptions.value ||
            this._options.mask !== newOptions.mask ||
            this._options.replacer !== newOptions.replacer
        ) {
            this._value = MaskFormatterValue.formattedValueToValue(newOptions.value, {
                mask: newOptions.mask,
                replacer: newOptions.replacer,
                formatMaskChars: newOptions.formatMaskChars
            });
        }
    }

    static getDefaultOptions = InputMask.getDefaultOptions;
}

export default Mask;

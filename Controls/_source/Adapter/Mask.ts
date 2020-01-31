import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import * as template from 'wml!Controls/_source/Adapter/Mask/Mask';
import {Mask as InputMask, MaskFormatterValue} from 'Controls/input';
import * as tmplNotify from 'Controls/Utils/tmplNotify';

/**
 * Контрол обертка над полем ввода маски. Обеспечивает работу со значением с разделителями.
 *
 * @class Controls/_source/Adapter/Mask
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

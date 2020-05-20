import {descriptor} from 'Types/entity';
import {FORMAT_MASK_CHARS, REPLACER, phoneMask} from './Phone/phoneMask';
import * as Formatter from './resources/Formatter';
import * as FormatBuilder from './resources/FormatBuilder';
import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
// @ts-ignore
import * as template from 'wml!Controls/_decorator/Phone/Phone';

import {phoneValue} from 'Controls/_decorator/ActualAPI';
import toString from 'Controls/Utils/Formatting/toString';

/**
 * @interface Controls/_decorator/Phone/IPhoneOptions
 * @public
 * @author Красильников А.С.
 */
export interface IPhoneOptions extends IControlOptions {
    number: string;
    /**
     * Декорируемый телефонный номер.
     * @default ''
     * @demo Controls-demo/Decorator/Phone/Index
     */
    value: string | null;
}

/**
 * Графический контрол, декорирующий телефонный номер таким образом, что он приводится к формату:
 *
 * * Российские мобильные номера, например +7(XXX) XXX-XX-XX[ доб. {остальные цифры}];
 * * Российские мобильные номера в зависимости от кода города, например +7(XXXX) XX-XX-XX[ доб. {остальные цифры}] или +7(XXXXX) X-XX-XX[ доб. {остальные цифры}];
 * * Иностранные номера, например +{иностранный код} {остальные цифры};
 * * Остальные номера отображаются как есть без формата.
 *
 * @class Controls/_decorator/Phone
 * @extends UI/Base:Control
 * @mixes Controls/_decorator/Phone/IPhoneOptions
 * @public
 * @demo Controls-demo/Decorator/Phone/Index
 *
 * @author Красильников А.С.
 */
class Phone extends Control<IPhoneOptions> {
    protected _formattedPhone: string = null;

    protected _template: TemplateFunction = template;

    protected _beforeMount(options: IPhoneOptions): void {
        this._formattedPhone = Phone._formatPhone(phoneValue(options.number, options.value, true));
    }

    protected _beforeUpdate(newOptions: IPhoneOptions): void {
        const oldValue = phoneValue(this._options.number, this._options.value);
        const newValue = phoneValue(newOptions.number, newOptions.value);

        if (oldValue !== newValue) {
            this._formattedPhone = Phone._formatPhone(newValue);
        }
    }

    private static _formatPhone(phone: string | null): string {
        const validPhone = toString(phone.replace(/[^+\d]/g, ''));
        const mask = phoneMask(validPhone);
        const format = FormatBuilder.getFormat(mask, FORMAT_MASK_CHARS, REPLACER);
        return Formatter.getFormatterData(format, {
            value: validPhone,
            position: 0
        }).value;
    }

    static getOptionTypes() {
        return {
            value: descriptor(String, null)
        };
    }

    static getDefaultOptions() {
        return {
            value: ''
        };
    }
}

export default Phone;

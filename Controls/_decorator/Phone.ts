import {descriptor} from 'Types/entity';
import toString from 'Controls/Utils/Formatting/toString';
import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import dictionary from 'Controls/_decorator/Phone/Dictionary';
// @ts-ignore
import * as template from 'wml!Controls/_decorator/Phone/Phone';

import {phoneValue} from 'Controls/_decorator/ActualAPI';

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
 * @remark
 * Полезные ссылки:
 * * <a href="https://github.com/saby/wasaby-controls/blob/rc-20.4000/Controls-default-theme/aliases/_decorator.less">переменные тем оформления</a>
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

    private static MAX_LENGTH_RUSSIAN_PHONE = 11;
    private static NON_NUMBER_CHARS: RegExp = /\D/g;
    private static BEGIN_RUSSIAN_PHONE: RegExp = /^0?[78]/;

    private static _isRussianPhone(phone: string, countryCode: string): boolean {
        return phone.length > 9 && countryCode === '7';
    }

    private static _isForeignPhone(phone: string, countryCode: string): boolean {
        return Boolean(dictionary.foreignCodes[countryCode]);
    }

    private static _formatCountryCode(phone: string): string {
        if (phone.length > 10) {
            return phone.replace(Phone.BEGIN_RUSSIAN_PHONE, '7');
        }
        if (phone.length === 10) {
            return `7${phone}`;
        }

        return phone;
    }
    
    private static _lengthForeignCode(phone: string, countryCode: string): number {
        const codes: string[] = dictionary.foreignCodes[countryCode];

        if (codes.length === 0) {
            return 1;
        }
        if (codes.includes(phone.substring(1, 2))) {
            return 2;
        }
        if (codes.indexOf(phone.substring(1, 3))) {
            return 3;
        }
        
        return 0;
    }

    private static _cityCode(phone: string, regionCode: string): string {
        const codes = dictionary.region[regionCode] || [];

        if (codes.length === 0) {
            return '';
        }
        for (let lengthCode = 1; lengthCode < 3; lengthCode++) {
            const code = phone.substr(1 + regionCode.length, lengthCode);
            if (codes.includes(code)) {
                return code;
            }
        }

        return '';
    }

    private static _tail(phone: string, regionCode: string, cityCode: string): string {
        const main = phone.substring(0, Phone.MAX_LENGTH_RUSSIAN_PHONE);
        const secondary = phone.substring(Phone.MAX_LENGTH_RUSSIAN_PHONE);
        const start = 1 + regionCode.length + cityCode.length;
        let tail = `${main.slice(start, -4)}-${main.slice(-4, -2)}-${main.slice(-2)}`;

        if (secondary) {
            tail += ` доб. ${secondary}`;
        }

        return tail;
    }

    private static _toForeignFormat(phone: string, codeLength: number): string {
        if (codeLength === 0) {
            return `+${phone}`;
        }

        return `+${phone.substring(0, codeLength)} ${phone.substring(codeLength)}`;
    }

    private static _removeNonNumberChars(original: string): string {
        return original.replace(Phone.NON_NUMBER_CHARS, '');
    }

    private static _formatPhone(phone: string | null): string {
        const strPhone = toString(phone);
        
        if (strPhone === '') {
            return '';
        }
        
        let numPhone = Phone._removeNonNumberChars(strPhone);

        if (numPhone.length < 5) {
            return numPhone;
        }

        numPhone = Phone._formatCountryCode(numPhone);
        const countryCode = numPhone.charAt(0);

        if (Phone._isRussianPhone(numPhone, countryCode)) {
            const regionCode = numPhone.substr(1, 3);
            const cityCode = Phone._cityCode(numPhone, regionCode);
            return `+7(${regionCode}${cityCode}) ${Phone._tail(numPhone, regionCode, cityCode)}`;
        }
        if (Phone._isForeignPhone(numPhone, countryCode)) {
            const codeLength = Phone._lengthForeignCode(numPhone, countryCode);
            return Phone._toForeignFormat(numPhone, codeLength);
        }

        return numPhone;
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

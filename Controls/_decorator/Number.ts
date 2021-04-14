import {descriptor} from 'Types/entity';
import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import {Logger} from 'UI/Utils';
import splitIntoTriads from 'Controls/_decorator/inputUtils/splitIntoTriads';
import toString from 'Controls/_decorator/inputUtils/toString';
import * as template from 'wml!Controls/_decorator/Number/Number';
import { abbreviateNumber, trimTrailingZeros, fillAdditionalZeros } from 'Controls/_decorator/resources/Formatter';
// @ts-ignore
import {
    INumberFormatOptions,
    INumberFormat,
    IFontColorStyle,
    IFontColorStyleOptions,
    IFontSize,
    IFontSizeOptions,
    IFontWeight,
    IFontWeightOptions, ITooltip
} from 'Controls/interface';
import 'css!Controls/decorator';

/**
 * Тип данных для форматируемого значения
 * @typedef {string|number|null} Controls/_decorator/INumber/TValue
 */
type TValue = string | number | null;

/**
 * Тип данных для аббревиатуры
 * @typedef {string} Controls/_decorator/INumber/TAbbreviationType
 * @variant short
 * @variant long
 * @variant none
 */
type TAbbreviationType = 'none' | 'short' | 'long';
type RoundingFn = (number: string, precision: number) => string;

/**
 * @typedef Controls/_decorator/INumber/RoundMode
 * @variant round При необходимости число округляется, а дробная часть дополняется нулями, чтобы она имела заданную длину.
 * @variant trunc Усекает (отсекает) цифры справа от точки так, чтобы дробная часть имела заданную длину, независимо от того, является ли аргумент положительным или отрицательным числом.
 */
export type RoundMode = 'round' | 'trunc';

export interface INumberOptions extends IControlOptions, INumberFormatOptions, IFontColorStyleOptions,
    IFontWeightOptions, IFontSizeOptions {
    /**
     * @name Controls/_decorator/INumber#value
     * @cfg {Controls/_decorator/INumber/TValue.typedef} Декорируемое число.
     * @demo Controls-demo/Decorator/Number/Value/Index
     */
    value: TValue;
    /**
     * @name Controls/_decorator/INumber#fractionSize
     * @cfg {Number} Количество знаков после запятой. Диапазон от 0 до 20.
     * @demo Controls-demo/Decorator/Number/FractionSize/Index
     * @deprecated Опция устарела и в ближайшее время её поддержка будет прекращена. Используйте опцию {@link Controls/_decorator/INumber#precision}.
     */
    fractionSize?: number;
    /**
     * @name Controls/_decorator/INumber#precision
     * @cfg {Number} Количество знаков после запятой. Диапазон от 0 до 20.
     * @demo Controls-demo/Decorator/Number/Precision/Index
     */
    precision?: number;
    /**
     * @name Controls/_decorator/INumber#roundMode
     * @cfg {Controls/_decorator/INumber/RoundMode.typedef} Режим форматирования дробной части числа.
     * @default trunc
     * @demo Controls-demo/Decorator/Number/RoundMode/Index
     */
    roundMode: RoundMode;
    /**
     * @name Controls/_decorator/INumber#abbreviationType
     * @cfg {Controls/_decorator/INumber/TAbbreviationType.typedef} Тип аббревиатуры.
     * @default 'none'
     * @demo Controls-demo/Decorator/Number/Abbreviation/Index
     */
    abbreviationType?: TAbbreviationType;
}

/**
 * Графический контрол, декорирующий число таким образом, что оно приводится к форматируемому виду.
 * Форматом является число разбитое на триады с ограниченной дробной частью.
 *
 * @remark
 * Полезные ссылки:
 * * {@link https://github.com/saby/wasaby-controls/blob/897d41142ed56c25fcf1009263d06508aec93c32/Controls-default-theme/variables/_decorator.less переменные тем оформления}
 *
 * @class Controls/_decorator/Number
 * @extends UI/Base:Control
 * @mixes Controls/decorator:INumber
 * @public
 * @demo Controls-demo/Decorator/Number/Index
 *
 * @author Красильников А.С.
 */
class NumberDecorator extends Control<INumberOptions> implements INumberFormat, ITooltip, IFontColorStyle, IFontSize, IFontWeight {
    private _fontColorStyle: string;

    protected _formattedNumber: string = null;

    protected _template: TemplateFunction = template;

    private _needChangeFormattedNumber(newOptions: INumberOptions): boolean {
        const currentOptions = this._options;

        return [
            'value',
            'roundMode',
            'fractionSize',
            'precision',
            'useGrouping'
        ].some((optionName: string) => {
            if (optionName === 'value') {
                const currentValue = currentOptions.value;
                const newValue = newOptions.value;
                return currentValue !== newValue;
            }

            return currentOptions[optionName] !== newOptions[optionName];
        });
    }

    private _setFontState(options: INumberOptions): void {
        if (options.readOnly || options.stroked) {
            this._fontColorStyle = 'readonly';
        } else {
            this._fontColorStyle = options.fontColorStyle;
        }
    }

    protected _beforeMount(options: INumberOptions): void {
        this._setFontState(options);
        this._formattedNumber = NumberDecorator._formatNumber(options.value, options);
    }

    protected _beforeUpdate(newOptions: INumberOptions): void {
        this._setFontState(newOptions);
        if (this._needChangeFormattedNumber(newOptions)) {
            this._formattedNumber = NumberDecorator._formatNumber(newOptions.value, newOptions);
        }
    }

    private static _formatNumber(number: string | number | null, format: INumberOptions): string {
        let strNumber = toString(number);

        if (strNumber === '') {
            return '';
        }

        const {useGrouping, roundMode, fractionSize, abbreviationType} = format;
        let precision: number = format.precision;

        if (typeof fractionSize === 'number') {
            Logger.warn('Controls/decorator:Number: Option "fractionSize" is deprecated and will be removed soon. Use "precision" option instead.', this);
            precision = fractionSize;
        }

        if (typeof precision === 'number') {
            switch (roundMode) {
                case 'round':
                    strNumber = NumberDecorator._round(strNumber, precision);
                    break;
                case 'trunc':
                    strNumber = NumberDecorator._trunc(strNumber, precision);
                    break;
            }
            if (format.showEmptyDecimals) {
                strNumber = fillAdditionalZeros(strNumber, precision);
            }
        }

        if (!format.showEmptyDecimals) {
            strNumber = trimTrailingZeros(strNumber);
        }

        if (abbreviationType && abbreviationType !== 'none') {
            return abbreviateNumber(strNumber, abbreviationType);
        }

        if (useGrouping) {
            return splitIntoTriads(strNumber);
        }

        return strNumber;
    }

    private static _round: RoundingFn = (number, precision) => {
        return toString(parseFloat(number).toFixed(precision));
    };

    private static _trunc: RoundingFn = (number, precision) => {
        if (precision) {
            const regExp = new RegExp(`-?\\d+.?\\d{0,${precision}}`);

            return  String.prototype.match.call(number, regExp)[0];
        } else {
            return  toString(Math.trunc(parseFloat(number)));
        }
    };

    static getOptionTypes() {
        return {
            useGrouping: descriptor(Boolean),
            value: descriptor(String, Number, null).required(),
            fractionSize: descriptor(Number),
            precision: descriptor(Number),
            roundMode: descriptor(String).oneOf([
                'trunc',
                'round'
            ]),
            showEmptyDecimals: descriptor(Boolean),
            abbreviationType: descriptor(String).oneOf([
                'none',
                'short',
                'long'
            ]),
            stroked: descriptor(Boolean),
            underline: descriptor(String)
        };
    }

    static getDefaultOptions() {
        return {
            useGrouping: true,
            roundMode: 'trunc',
            showEmptyDecimals: false,
            abbreviationType: 'none',
            stroked: false,
            underline: 'none'
        };
    }
}

Object.defineProperty(NumberDecorator, 'defaultProps', {
   enumerable: true,
   configurable: true,

   get(): object {
      return NumberDecorator.getDefaultOptions();
   }
});

export default NumberDecorator;

/**
 * Интерфейс для опций контрола {@link Controls/decorator:Number}.
 * @interface Controls/_decorator/INumber
 * @public
 * @author Красильников А.С.
 */
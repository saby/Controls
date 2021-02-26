import {descriptor} from 'Types/entity';
import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import splitIntoTriads from 'Controls/_decorator/inputUtils/splitIntoTriads';
import toString from 'Controls/_decorator/inputUtils/toString';
// @ts-ignore
import * as template from 'wml!Controls/_decorator/Number/Number';
import 'css!Controls/decorator';

type RoundingFn = (number: string, fractionSize: number) => string;

/**
 * @typedef RoundMode
 * @variant round При необходимости число округляется, а дробная часть дополняется нулями, чтобы она имела заданную длину.
 * @variant trunc Усекает (отсекает) цифры справа от точки так, чтобы дробная часть имела заданную длину, независимо от того, является ли аргумент положительным или отрицательным числом.
 */
export type RoundMode = 'round' | 'trunc';

/**
 * Интерфейс для опций контрола {@link Controls/decorator:Number}.
 * @interface Controls/_decorator/INumber
 * @public
 * @author Красильников А.С.
 */
export interface INumberOptions extends IControlOptions {
    /**
     * @name Controls/_decorator/INumber#value
     * @cfg {String|Number|null} Декорируемое число.
     * @demo Controls-demo/Decorator/Number/Value/Index
     */
    value: string | number | null;
    /**
     * @name Controls/_decorator/INumber#useGrouping
     * @cfg {Boolean} Определяет, следует ли использовать разделители группы.
     * @remark
     * true - число разделено на группы.
     * false - разделения не происходит.
     * @default true
     * @demo Controls-demo/Decorator/Number/UseGrouping/Index
     */
    useGrouping: boolean;
    /**
     * @name Controls/_decorator/INumber#fractionSize
     * @cfg {Number} Количество знаков после запятой. Диапазон от 0 до 20.
     * @demo Controls-demo/Decorator/Number/FractionSize/Index
     */
    fractionSize?: number;
    /**
     * @name Controls/_decorator/INumber#roundMode
     * @cfg {RoundMode} Режим форматирования дробной части числа.
     * @default trunc
     * @demo Controls-demo/Decorator/Number/RoundMode/Index
     */
    roundMode: RoundMode;
}

/**
 * Графический контрол, декорирующий число таким образом, что оно приводится к форматируемому виду.
 * Форматом является число разбитое на триады с ограниченной дробной частью.
 *
 * @remark
 * Полезные ссылки:
 * * {@link https://github.com/saby/wasaby-controls/blob/rc-20.4000/Controls-default-theme/aliases/_decorator.less переменные тем оформления}
 *
 * @class Controls/_decorator/Number
 * @extends UI/Base:Control
 * @mixes Controls/_decorator/INumber
 * @public
 * @demo Controls-demo/Decorator/Number/Index
 *
 * @author Красильников А.С.
 */
class NumberDecorator extends Control<INumberOptions> {
    protected _formattedNumber: string = null;

    protected _template: TemplateFunction = template;

    private _needChangeFormattedNumber(newOptions: INumberOptions): boolean {
        const currentOptions = this._options;

        return [
            'value',
            'roundMode',
            'fractionSize',
            'useGrouping'
        ].some((optionName: string) => {
            if (optionName === 'value') {
                const currentValue = currentOptions.value;
                const newValue = newOptions.value;
                return currentValue !== newValue;
            }

            return currentOptions[optionName] !== newOptions[optionName]
        });
    }

    protected _beforeMount(options: INumberOptions): void {
        this._formattedNumber = NumberDecorator._formatNumber(options.value, options);
    }

    protected _beforeUpdate(newOptions: INumberOptions): void {
        if (this._needChangeFormattedNumber(newOptions)) {
            this._formattedNumber = NumberDecorator._formatNumber(newOptions.value, newOptions);
        }
    }

    private static _formatNumber(number: string | number | null, format: INumberOptions): string {
        let strNumber = toString(number);

        if (strNumber === '') {
            return '';
        }

        const {useGrouping, roundMode, fractionSize} = format;

        if (typeof fractionSize === 'number') {
            switch (roundMode) {
                case "round":
                    strNumber = NumberDecorator._round(strNumber, fractionSize);
                    break;
                case "trunc":
                    strNumber = NumberDecorator._trunc(strNumber, fractionSize);
                    break;
            }
        }

        if (useGrouping) {
            return splitIntoTriads(strNumber);
        }

        return strNumber;
    }

    private static _round: RoundingFn = (number, fractionSize) => {
        return toString(parseFloat(number).toFixed(fractionSize));
    };

    private static _trunc: RoundingFn = (number, fractionSize) => {
        if (fractionSize) {
            const regExp = new RegExp(`-?\\d+.?\\d{0,${fractionSize}}`);

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
            roundMode: descriptor(String).oneOf([
                'trunc',
                'round'
            ])
        }
    }

    static getDefaultOptions() {
        return {
            useGrouping: true,
            roundMode: 'trunc'
        }
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

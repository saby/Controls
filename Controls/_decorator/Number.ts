import {descriptor} from 'Types/entity';
import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import {toString, splitIntoTriads} from 'Controls/inputUtils';
// @ts-ignore
import * as template from 'wml!Controls/_decorator/Number/Number';

type RoundingFn = (number: string, fractionSize: number) => string;

/**
 * @typedef RoundMode
 * @variant round При необходимости число округляется, а дробная часть дополняется нулями, чтобы она имела заданную длину.
 * @variant trunc Усекает (отсекает) цифры справа от точки так, чтобы дробная часть имела заданную длину, независимо от того, является ли аргумент положительным или отрицательным числом.
 */
export type RoundMode = 'round' | 'trunc';

/**
 * @interface Controls/_decorator/Number/INumberOptions
 * @public
 * @author Красильников А.С.
 */
export interface INumberOptions extends IControlOptions {
    /**
     * Декорируемое число.
     * @demo Controls-demo/Decorator/Number/Value/Index
     */
    value: string | number | null;
    /**
     * Определяет, следует ли использовать разделители группы.
     * @remark
     * true - число разделено на группы.
     * false - разделения не происходит.
     * @default true
     * @demo Controls-demo/Decorator/Number/UseGrouping/Index
     */
    useGrouping: boolean;
    /**
     * Количество знаков после запятой. Диапазон от 0 до 20.
     * @demo Controls-demo/Decorator/Number/FractionSize/Index
     */
    fractionSize?: number;
    /**
     * Режим форматирования дробной части числа.
     * @type RoundMode
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
 * * <a href="https://github.com/saby/wasaby-controls/blob/rc-20.4000/Controls-default-theme/aliases/_decorator.less">переменные тем оформления</a>
 *
 * @mixes Controls/_decorator/Number/INumberOptions
 *
 * @class Controls/_decorator/Number
 * @extends UI/Base:Control
 *
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

    static _theme = ['Controls/decorator'];

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

export default NumberDecorator;

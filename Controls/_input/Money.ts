import Base = require('Controls/_input/Base');
import readOnlyFieldTemplate = require('wml!Controls/_input/Money/ReadOnly');

import {descriptor} from 'Types/entity';
import ViewModel from 'Controls/_input/Money/ViewModel';
import {default as INumberLength, INumberLengthOptions} from 'Controls/_input/interface/INumberLength';

interface IMoneyOptions extends INumberLengthOptions {
    onlyPositive: boolean;
}

/**
 * Поле ввода денег.
 * <a href="/materials/demo-ws4-input">Демо-пример</a>.
 *
 * @class Controls/_input/Money
 * @extends Controls/_input/Base
 *
 * @mixes Controls/interface/IOnlyPositive
 * @mixes Controls/_input/interface/INumberLength
 *
 * @public
 * @demo Controls-demo/Input/Money/Base/Index
 *
 * @author Красильников А.С.
 */

class Money extends Base implements INumberLength {
    _options: IMoneyOptions;
    readonly '[Controls/_input/interface/INumberLength]' = true;

    protected _initProperties(): void {
        super._initProperties();

        this._readOnlyField.template = readOnlyFieldTemplate;
        this._readOnlyField.scope.integerPart = Money.integerPart;
        this._readOnlyField.scope.fractionPart = Money.fractionPart;
    }

    protected _getViewModelOptions(options: IMoneyOptions) {
        return {
            useGrouping: true,
            showEmptyDecimals: true,
            precision: options.precision,
            integersLength: options.integersLength,
            useAdditionToMaxPrecision: true,
            onlyPositive: options.onlyPositive
        };
    }

    protected _getViewModelConstructor() {
        return ViewModel;
    }

    private static calcStartFractionPart(value: string, precision: number): number {
        const splitterLength = 1;

        return value.length - precision - splitterLength;
    }

    private static integerPart(value: string, precision: number): string {
        return value.substring(0, Money.calcStartFractionPart(value, precision));
    }

    private static fractionPart(value: string, precision: number): string {
        return value.substring(Money.calcStartFractionPart(value, precision));
    }

    static getDefaultOptions() {
        const defaultOptions = Base.getDefaultOptions();

        defaultOptions.precision = 2;
        defaultOptions.onlyPositive = false;

        return defaultOptions;
    }

    static getOptionTypes() {
        const optionTypes = Base.getOptionTypes();

        optionTypes.value = descriptor(String, Number, null);
        optionTypes.onlyPositive = descriptor(Boolean);
        optionTypes.precision = descriptor(Number);
        optionTypes.integersLength = descriptor(Number);

        return optionTypes;
    }
}

export default Money;

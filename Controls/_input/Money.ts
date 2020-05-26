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
 * 
 * @remark
 * Полезные ссылки:
 * * <a href="/materials/Controls-demo/app/Controls-demo%2FExample%2FInput">демо-пример</a>
 * * <a href="/doc/platform/developmentapl/interface-development/controls/input/money/">руководство разработчика</a>
 * * <a href="https://github.com/saby/wasaby-controls/blob/rc-20.4000/Controls-default-theme/aliases/_input.less">переменные тем оформления</a>
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

// TODO: generics https://online.sbis.ru/opendoc.html?guid=ef345c4d-0aee-4ba6-b380-a8ca7e3a557f
/**
 * @name Controls/_input/Money#value
 * @cfg {String  | Number | null} Значение поля ввода.
 * @remark
 * При установке опции value в контроле ввода, отображаемое значение всегда будет соответствовать её значению. В этом случае родительский контрол управляет отображаемым значением. Например, вы можете менять значение по событию {@link valueChanged}:
 * <pre>
 *     <Controls.input:Money value="{{_value}}" on:valueChanged="_handleValueChange()"/>
 *
 *     export class Form extends Control<IControlOptions, void> {
 *         private _value: string = '';
 *
 *         private _handleValueChange(event: SyntheticEvent<Event>, value) {
 *             this._value = value;
 *         }
 *     }
 * </pre>
 * Пример можно упростить, воспользовавшись синтаксисом шаблонизатора {@link https://wi.sbis.ru/doc/platform/developmentapl/interface-development/ui-library/options/#two-way-binding bind}:
 * <pre>
 *     <Controls.input:Money bind:value="_value"/>
 * </pre>
 * Альтернатива - не задавать опцию value. Значение контрола будет кешироваться в контроле ввода:
 * <pre>
 *     <Controls.input:Money/>
 * </pre>
 * Не рекомендуем использовать опцию для изменения поведения обработки ввода. Такой подход увеличит время перерисовки.
 * Плохо:
 * <pre>
 *     <Controls.input:Money value="{{_value}}" on:valueChanged="_handleValueChange()"/>
 *
 *     export class Form extends Control<IControlOptions, void> {
 *         private _value: string = '';
 *
 *         private _handleValueChange(event: SyntheticEvent<Event>, value) {
 *             this._value = value.toUpperCase();
 *         }
 *     }
 * </pre>
 * Лучшим подходом будет воспользоваться опцией {@link inputCallback}.
 * Хорошо:
 * <pre>
 *     <Controls.input:Money bind:value="{{_value}}" inputCallback="{{_toUpperCase}}"/>
 *
 *     class Form extends Control<IControlOptions, void> {
 *         private _value: string = '';
 *
 *         private _toUpperCase(data) {
 *             return {
 *                 position: data.position,
 *                 value: data.value.toUpperCase()
 *             }
 *         }
 *     }
 * </pre>
 * @example
 * Сохраняем данные о пользователе и текущее время при отправке формы.
 * <pre>
 *     <form action="Auth.php" name="form">
 *         <Controls.input:Text bind:value="_login"/>
 *         <Controls.input:Password bind:value="_password"/>
 *         <Controls.buttons:Button on:click="_saveUser()" caption="Отправить"/>
 *     </form>
 *
 *     export class Form extends Control<IControlOptions, void> {
 *         private _login: string = '';
 *         private _password: string = '';
 *         private _server: Server = new Server();
 *
 *         private _saveUser() {
 *             this._server.saveData({
 *                 date: new Date(),
 *                 login: this._login,
 *                 password: this._password
 *             });
 *
 *             this._children.form.submit();
 *         }
 *     }
 * </pre>
 *
 * @see valueChanged
 * @see inputCompleted
 */
/**
 * @name Controls/_input/Money#valueChanged
 * @event Происходит при изменении отображаемого значения контрола ввода.
 * @param {String | Number} value Значение контрола ввода.
 * @param {String} displayValue Отображаемое значение контрола ввода.
 * @remark
 * Событие используется в качестве реакции на изменения, вносимые пользователем.
 * @example
 * Контрол ввода денег с информационной подсказкой. Подсказка содержит информацию, чему равна текущая сумма в других валютах.
 * <pre>
 *     <Controls.input:Money name="money" on:valueChanged="_validateMoney()"/>
 *
 *     export class InfoMoney extends Control<IControlOptions, void> {
 *         private _validateMoney(event, value) {
 *             let cfg = {
 *                 target: this._children.money,
 *                 targetSide: 'top',
 *                 alignment: 'end',
 *                 message: null
 *             }
 *
 *             ...
 *
 *             this._notify('openInfoBox', [cfg], {
 *                 bubbling: true
 *             });
 *         }
 *     }
 * </pre>
 *
 * @see value
 */
/**
 * @name Controls/_input/Money#inputCompleted
 * @event Происходит при завершении ввода. Завершение ввода — это контрол потерял фокус, или пользователь нажал клавишу "Enter".
 * @param {String | Number} value Значение контрола ввода.
 * @param {String} displayValue Отображаемое значение контрола ввода.
 * @remark
 * Событие используется в качестве реакции на завершение ввода пользователем. Например, проверка на валидность введенных данных или отправка данных в другой контрол.
 * @example
 * Подписываемся на событие inputCompleted и сохраняем значение поля в базе данных.
 * <pre>
 *    <Controls.input:Money on:inputCompleted="_inputCompletedHandler()"/>
 *
 *    export class Form extends Control<IControlOptions, void> {
 *        ...
 *        private _inputCompletedHandler(event, value) {
 *            this._saveEnteredValueToDatabase(value);
 *        }
 *        ...
 *    }
 * </pre>
 * @see value
 */

class Money extends Base implements INumberLength {
    _options: IMoneyOptions;
    readonly '[Controls/_input/interface/INumberLength]' = true;

    protected _initProperties(options: IMoneyOptions): void {
        super._initProperties(options);

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
        if (precision < 1) {
            return value.length;
        }

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

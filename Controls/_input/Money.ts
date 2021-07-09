import {default as Base, IBaseInputOptions} from 'Controls/_input/Base';
import readOnlyFieldTemplate = require('wml!Controls/_input/Money/ReadOnly');

import {descriptor} from 'Types/entity';
import ViewModel from './Number/ViewModel';
import {INumberLength, INumberLengthOptions} from 'Controls/_input/interface/INumberLength';
import {IOnlyPositive, IOnlyPositiveOptions} from 'Controls/decorator';
import {IFieldTemplateOptions} from 'Controls/_input/interface/IFieldTemplate';
import {Formatter} from 'Controls/decorator';

interface IMoneyOptions extends IBaseInputOptions, INumberLengthOptions, IOnlyPositiveOptions, IFieldTemplateOptions {}

/**
 * Поле ввода числовых значений. Отличается от {@link Controls/input:Number} отображением введенного значения, согласно стандарту денежных полей ввода.
 *
 * @remark
 * Полезные ссылки:
 * * {@link /materials/Controls-demo/app/Controls-demo%2FExample%2FInput демо-пример}
 * * {@link /doc/platform/developmentapl/interface-development/controls/input-elements/input/money/ руководство разработчика}
 * * {@link https://github.com/saby/wasaby-controls/blob/897d41142ed56c25fcf1009263d06508aec93c32/Controls-default-theme/variables/_input.less переменные тем оформления}
 *
 * @class Controls/_input/Money
 * @extends Controls/input:Base
 *
 * @mixes Controls/decorator:IOnlyPositive
 * @mixes Controls/input:INumberLength
 * @mixes Controls/input:IFieldTemplate
 *
 * @public
 * @demo Controls-demo/Input/Money/Base/Index
 *
 * @author Красильников А.С.
 */

class Money extends Base<IMoneyOptions> implements INumberLength, IOnlyPositive {
    protected _inputMode: string = 'decimal';

    readonly '[Controls/_input/interface/INumberLength]': boolean = true;
    readonly '[Controls/_decorator/interfaces/IOnlyPositive]': boolean = true;

    protected _initProperties(options: IMoneyOptions): void {
        super._initProperties(options);

        this._readOnlyField.template = readOnlyFieldTemplate;
        this._readOnlyField.scope.integerPart = Money.integerPart;
        this._readOnlyField.scope.fractionPart = Money.fractionPart;
    }

    protected _getViewModelOptions(options: IMoneyOptions): object {
        return {
            useGrouping: true,
            showEmptyDecimals: true,
            precision: options.precision,
            integersLength: options.integersLength,
            useAdditionToMaxPrecision: true,
            onlyPositive: options.onlyPositive
        };
    }
    protected _beforeUpdate(newOptions: IMoneyOptions): void {
        super._beforeUpdate(newOptions);
        /**
         * Когда выделяем весь текст, и нажимаем на пробел или del, displayValue устанавливается в ""
         * После в Base устанавливается значение 0.0, из-за чего в Field фиксируется текущее значение displayValue(0.0)
         * Из-за этого, при потере фокуса не стреляет событие inputCompleted.
         * Поэтому не даем Field зафиксировать новое значение
         */
        if (newOptions.value === this._getValue(newOptions)) {
            this._viewModel.displayValueBeforeUpdate = this._viewModel.displayValue;
        }
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
        return Formatter.correctNumberValue(value.substring(0, Money.calcStartFractionPart(value, precision)));
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

Object.defineProperty(Money, 'defaultProps', {
   enumerable: true,
   configurable: true,

   get(): object {
      return Money.getDefaultOptions();
   }
});

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
 * Пример можно упростить, воспользовавшись синтаксисом шаблонизатора {@link /doc/platform/developmentapl/interface-development/ui-library/options/#two-way-binding bind}:
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
export default Money;

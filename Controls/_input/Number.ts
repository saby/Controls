import {Logger} from 'UI/Utils';
import Base = require('Controls/_input/Base');
import entity = require('Types/entity');
import ViewModel = require('Controls/_input/Number/ViewModel');


/**
 * Поле ввода числовых значений.
 * <a href="/materials/Controls-demo/app/Controls-demo%2FExample%2FInput">Демо-пример</a>.
 *
 * @class Controls/_input/Number
 * @extends Controls/_input/Base
 *
 * @mixes Controls/interface/IOnlyPositive
 * @mixes Controls/interface/IInputNumber
 * @mixes Controls/_interface/INumberFormat
 * @mixes Controls/_input/interface/INumberLength
 *
 * @public
 * @demo Controls-demo/Input/Number/Base/Index
 *
 * @author Красильников А.С.
 */

/*
 * Controls that allows user to enter single-line number.
 * <a href="/materials/Controls-demo/app/Controls-demo%2FExample%2FInput">Demo example.</a>.
 *
 * @class Controls/_input/Number
 * @extends Controls/_input/Base
 *
 * @mixes Controls/interface/IOnlyPositive
 * @mixes Controls/interface/IInputNumber
 * @mixes Controls/_interface/INumberFormat
 * @mixes Controls/_input/interface/INumberLength
 *
 * @public
 * @demo Controls-demo/Input/Number/Base/Index
 *
 * @author Красильников А.С.
 */

// TODO: generics https://online.sbis.ru/opendoc.html?guid=ef345c4d-0aee-4ba6-b380-a8ca7e3a557f
/**
 * @name Controls/_input/Number#value
 * @cfg {String  | Number | null} Значение поля ввода.
 * @remark
 * При установке опции value в контроле ввода, отображаемое значение всегда будет соответствовать её значению. В этом случае родительский контрол управляет отображаемым значением. Например, вы можете менять значение по событию {@link valueChanged}:
 * <pre>
 *     <Controls.input:Number value="{{_value}}" on:valueChanged="_handleValueChange()"/>
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
 *     <Controls.input:Number bind:value="_value"/>
 * </pre>
 * Альтернатива - не задавать опцию value. Значение контрола будет кешироваться в контроле ввода:
 * <pre>
 *     <Controls.input:Number/>
 * </pre>
 * Не рекомендуем использовать опцию для изменения поведения обработки ввода. Такой подход увеличит время перерисовки.
 * Плохо:
 * <pre>
 *     <Controls.input:Number value="{{_value}}" on:valueChanged="_handleValueChange()"/>
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
 *     <Controls.input:Number bind:value="{{_value}}" inputCallback="{{_toUpperCase}}"/>
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
 *         <Controls.input:Number bind:value="_age" integerLengths="{{3}}" precision="{{0}}"/>
 *         <Controls.buttons:Button on:click="_saveUser()" caption="Отправить"/>
 *     </form>
 *
 *     export class Form extends Control<IControlOptions, void> {
 *         private _login: string = '';
 *         private _password: string = '';
 *         private _age: number = null;
 *         private _server: Server = new Server();
 *
 *         private _saveUser() {
 *             this._server.saveData({
 *                 date: new Date(),
 *                 login: this._login,
 *                 password: this._password,
 *                 age: this._age,
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
 * @name Controls/_input/Number#valueChanged
 * @event Происходит при изменении отображаемого значения контрола ввода.
 * @param {String | Number} value Значение контрола ввода.
 * @param {String} displayValue Отображаемое значение контрола ввода.
 * @remark
 * Событие используется в качестве реакции на изменения, вносимые пользователем.
 * @example
 * Контрол ввода числа с информационной подсказкой. Подсказка содержит информацию об унивкальности цифр в числе.
 * <pre>
 *     <Controls.input:Number name="number" on:valueChanged="_validateNumber()"/>
 *
 *     export class InfoNumber extends Control<IControlOptions, void> {
 *         private _validateNumber(event, value) {
 *             let cfg = {
 *                 target: this._children.number,
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
 * @name Controls/_input/Number#inputCompleted
 * @event Происходит при завершении ввода. Завершение ввода — это контрол потерял фокус, или пользователь нажал клавишу "Enter".
 * @param {String | Number} value Значение контрола ввода.
 * @param {String} displayValue Отображаемое значение контрола ввода.
 * @remark
 * Событие используется в качестве реакции на завершение ввода пользователем. Например, проверка на валидность введенных данных или отправка данных в другой контрол.
 * @example
 * Подписываемся на событие inputCompleted и сохраняем значение поля в базе данных.
 * <pre>
 *    <Controls.input:Number on:inputCompleted="_inputCompletedHandler()"/>
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

var _private = {
    validateOptions: function (options) {
        if (options.integersLength <= 0) {
            Logger.error('Number: Incorrect integers length: ' + options.integersLength + '. Integers length must be greater than 0.');
        }
    },
    convertToNumber: function (value) {
        return value === null ? void 0 : value;
    }
};

var NumberInput = Base.extend({
    _defaultValue: 0,

    _beforeMount: function (options) {
        NumberInput.superclass._beforeMount.apply(this, arguments);

        if (options.type) {
            this._type = options.type;
        }
    },

    _getViewModelOptions: function (options) {
        _private.validateOptions(options);

        return {
            precision: _private.convertToNumber(options.precision),
            useGrouping: options.useGrouping,
            onlyPositive: options.onlyPositive,
            integersLength: _private.convertToNumber(options.integersLength),
            showEmptyDecimals: options.showEmptyDecimals,
            useAdditionToMaxPrecision: options.showEmptyDecimals
        };
    },

    _getViewModelConstructor: function () {
        return ViewModel;
    },

    _changeHandler: function () {
        if (this._viewModel.trimTrailingZeros(true)) {
            this._notifyValueChanged();
        }

        NumberInput.superclass._changeHandler.apply(this, arguments);
    },

    _focusOutHandler: function () {
        if (this._viewModel.trimTrailingZeros(false)) {
            this._notifyValueChanged();
        }

        NumberInput.superclass._focusOutHandler.apply(this, arguments);
    }
});

NumberInput.getDefaultOptions = function () {
    var defaultOptions = Base.getDefaultOptions();

    defaultOptions.useGrouping = true;
    defaultOptions.onlyPositive = false;
    defaultOptions.showEmptyDecimals = false;

    return defaultOptions;
};

NumberInput.getOptionTypes = function () {
    const optionTypes = Base.getOptionTypes();

    optionTypes.value = entity.descriptor(Number, String, null);
    optionTypes.precision = entity.descriptor(Number, null);
    optionTypes.integersLength = entity.descriptor(Number, null);
    optionTypes.useGrouping = entity.descriptor(Boolean);
    optionTypes.onlyPositive = entity.descriptor(Boolean);
    optionTypes.showEmptyDecimals = entity.descriptor(Boolean);

    return optionTypes;
};

export = NumberInput;


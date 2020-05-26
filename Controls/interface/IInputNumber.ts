/**
 * Интерфейс управления значением числового контрола ввода.
 *
 * @interface Controls/interface/IInputNumber
 * @public
 * @author Красильников A.С.
 */

interface IInputNumber {
    readonly _options: {
        /**
         * @name Controls/interface/IInputNumber#value
         * @cfg {Number|String|null} Значение контрола ввода.
         * @default 0
         * @remark
         * Установливая опцию value в контроле ввода, отображаемое значение всегда будет соответствовать её значению. В этом случае родительский контрол управляет отображаемым значением. Например, вы можете менять значение по событию {@link valueChanged}:
         * <pre>
         *     <Controls:input:Number value="{{_value}}" on:valueChanged="_handleValueChange()"/>
         *
         *     export class Form extends Control<IControlOptions, void> {
         *         private _value: number = 0;
         *
         *         private _handleValueChange(event: SyntheticEvent<Event>, value) {
         *             this._value = value;
         *         }
         *     }
         * </pre>
         * Пример можно упростить воспользовавшись синтаксисом шаблонизатора {@link https://wi.sbis.ru/doc/platform/developmentapl/interface-development/ui-library/options/#two-way-binding bind}:
         * <pre>
         *     <Controls:input:Number bind:value="_value"/>
         * </pre>
         * Альтернатива - не задавать опцию value. Значение контрола будет кешироваться в контроле ввода:
         * <pre>
         *     <Controls.input:Text/>
         * </pre>
         * Не рекомендуем использовать опцию для изменения поведения обработки ввода. Такой подход увеличит время перерисовки.
         * Плохо:
         * <pre>
         *     <Controls:input:Number value="{{_value}}" on:valueChanged="_handleValueChange()"/>
         *
         *     export class Form extends Control<IControlOptions, void> {
         *         private _value: number = 0;
         *
         *         private _handleValueChange(event: SyntheticEvent<Event>, value) {
         *             this._value = Math.floor(value);
         *         }
         *     }
         * </pre>
         * Лучшим подходом будет воспользоваться опцией {@link Controls/interface/ICallback#inputCallback}.
         * Хорошо:
         * <pre>
         *     <Controls:input:Number bind:value="{{_value}}" inputCallback="{{_floor}}"/>
         *
         *     class Form extends Control<IControlOptions, void> {
         *         private _value: string = '';
         *
         *         private _floor(data) {
         *             return {
         *                 position: data.position,
         *                 value: Math.floor(data.value)
         *             }
         *         }
         *     }
         * </pre>
         * Работая с типом Number, можно столкнуться с проблемой потери точности. Например, числа 99999999999999999999 не существует. Оно представляется как 100000000000000000000, ввиду особенностей движка javascript, регламентируемых стандартом {@link http://www.softelectro.ru/ieee754.html IEEE 754}. Для того чтобы избежать этой проблемы, необходимо работать с типом String:
         * <pre>
         *     <Controls:input:Number bind:value="{{_value}}"/>
         *
         *     class Form extends Control<IControlOptions, void> {
         *         private _value: string = '0';
         *     }
         * </pre>
         * @example
         * Сохраняем данные о пользователе и текущее время при отправке формы.
         * <pre>
         *     <form action="Auth.php" name="form">
         *         <Controls.input:Text bind:value="_login"/>
         *         <Controls.input:Password bind:value="_password"/>
         *         <Controls.input:Number precision="{{0}}" integerLength="{{3}}" bind:value="_age"/>
         *         <Controls.buttons:Button on:click="_saveUser()" caption="Отправить"/>
         *     </form>
         *
         *     export class Form extends Control<IControlOptions, void> {
         *         private _login: string = '';
         *         private _password: string = '';
         *         private _age: number | null = null;
         *         private _server: Server = new Server();
         *
         *         private _saveUser() {
         *             this._server.saveData({
         *                 age: this._age,
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
        value: number | string | null;

        /**
         * @name Controls/interface/IInputNumber#type
         * @cfg {Enum} Сообщает браузеру, к какому типу относится элемент формы.
         * @variant text - Текстовое поле.
         * @variant number - Ввод чисел.
         * @example
         * В этом примере мы укажем числовую форму ввода.
         * <pre>
         *    <Controls.input:Number type="number"/>
         * </pre>
         */
        type: string;
    };
}

/**
 * @event Происходит при изменении отображаемого значения контрола ввода.
 * @name Controls/interface/IInputField#valueChanged
 * @param {Vdom/Vdom:SyntheticEvent} eventObject Дескриптор события.
 * @param {String|Number} value Значение контрола ввода.
 * @param {String} displayValue Отображаемое значение контрола ввода.
 * @remark
 * Событие используется в качестве реакции на изменения, вносимые пользователем.
 * @example
 * Контрол ввода пароля с информационной подсказкой. Подсказка содержит информацию о его безопасности.
 * <pre>
 *     <Controls.input:Password name="password" on:valueChanged="_validatePassword()"/>
 *
 *     export class InfoPassword extends Control<IControlOptions, void> {
 *         private _validatePassword(event, value) {
 *             let lengthPassword: number = value.length;
 *             let cfg = {
 *                 target: this._children.password,
 *                 targetSide: 'top',
 *                 alignment: 'end',
 *                 message: null
 *             }
 *
 *             if (lengthPassword < 6) {
 *                 cfg.message = 'Сложность пароля низкая';
 *             }
 *             if (lengthPassword >= 6 && lengthPassword < 10) {
 *                 cfg.message = 'Сложность пароля средняя';
 *             }
 *             if (lengthPassword >= 10) {
 *                 cfg.message = 'Сложность пароля высокая';
 *             }
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
 * @event inputCompleted Происходит при завершении ввода. Завершение ввода - это контрол потерял фокус, или пользователь нажал "enter".
 * @name Controls/interface/IInputField#inputCompleted
 * @param {String|Number} value Значение контрола ввода.
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

/*
 * Interface for Input.Number.
 *
 * @interface Controls/interface/IInputNumber
 * @public
 * @author Журалев М.С.
 */

/*
 * @name Controls/interface/IInputNumber#value
 * @cfg {Number|String|null} The number that will be projected to the text in the field.
 * @default 0
 * @remark
 * If you don`t update value option, will not be able to enter anything in the field. You need to subscribe to _valueChanged event and update value that is passed to the control. To make it simpler, you can use bind notation.
 * Working with the Number type you can face the problem of loss of accuracy. For example, the number 999999999999999999 does not exist. It is represented as 100000000000000000000. The thing is that the number in js is represented by the {@link http://www.softelectro.ru/ieee754.html IEEE 754} standard. To avoid this problem, you must work with the String type.
 * @example
 * In this example you bind _inputValue in control's state to the value of input field. At any time of control's lifecycle, _inputValue will contain the current value of the input field.
 * <pre>
 *    <Controls.input:Number bind:value="_inputValue" />
 *    <Controls.buttons:Button on:click="_sendButtonClick()" />
 * </pre>
 *
 * <pre>
 *    Control.extend({
 *        ...
 *       _inputValue: 0,
 *
 *       _sendButtonClick() {
 *          this._sendData(this._inputValue);
 *       }
 *       ...
 *    });
 * </pre>
 * @see valueChanged
 * @see inputCompleted
 */

/*
 * @event Occurs when field value was changed.
 * @name Controls/interface/IInputNumber#valueChanged
 * @param {Number|String|null} value The number that will be projected to the text in the field.
 * @param {String} displayValue Value of the field.
 * @remark
 * This event should be used to react to changes user makes in the field. Value returned in the event is not inserted in control unless you pass it back to the field as an option. Usually you would use bind notation instead. Example below shows the difference.
 * @example
 * In this example, we show how you can 'bind' control's value to the field. In the first field, we do it manually using valueChanged event. In the second field we use bind notation. Both fields in this examples will have identical behavior.
 * <pre>
 *    <Controls.input:Text value="_fieldValue" on:valueChanged="_valueChangedHandler()" />
 *
 *    <Controls.input:Text bind:value="_anotherFieldValue" />
 * </pre>
 *
 * <pre>
 *    Control.extend({
 *       ...
 *       _fieldValue: '',
 *
 *       _valueChangedHandler(value) {
 *          this._fieldValue = value;
 *       },
 *
 *       _anotherFieldValue: ''
 *
 *    });
 * </pre>
 * @see value
 */

/*
 * @event Occurs when input is completed (field lost focus or user pressed ‘enter’).
 * @name Controls/interface/IInputNumber#inputCompleted
 * @param {Number|String|null} value The number that will be projected to the text in the field.
 * @param {String} displayValue Value of the field.
 * @remark
 * This event can be used as a trigger to validate the field or send entered data to some other control.
 * @example
 * In this example, we subscribe to inputCompleted event and save field's value to the database.
 * <pre>
 *    <Controls.input:Text on:inputCompleted="_inputCompletedHandler()" />
 * </pre>
 *
 * <pre>
 *    Control.extend({
 *       ...
 *       _inputCompletedHandler(value) {
 *          this._saveEnteredValueToDatabase(value);
 *       }
 *       ...
 *    });
 * </pre>
 * @see value
 */

export default IInputNumber;

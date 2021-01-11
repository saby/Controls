/**
 * Интерфейс для ввода даты/времени.
 *
 * @public
 * @author Красильников А.С.
 */

/*
 * Interface for date/time inputs.
 *
 * @public
 * @author Красильников А.С.
 */ 
interface IInputDateTime {
    readonly _options: {
        /**
         * @cfg {Date} Дата, которую пользователь ввел в поле ввода.
         * @default null
         * @remark Если вы не обновите параметр "value", то не сможете ничего ввести в поле.
         * Вам необходимо подписаться на событие "valueChanged" и обновить значение, которое передается в контрол.
         * Для упрощения вы можете использовать синтаксис биндинга.
         * @example
         * В этом примере вы осуществляете привязку _inputValue в состоянии контрола к значению поля ввода.
         * В любое время жизненного цикла контрола, _inputValue будет содержать текущее значение поля ввода.
         * <pre>
         *    <Controls._input.DateTime bind:value="_inputValue" />
         *    <Controls.Button on:click="_sendButtonClick()" />
         * </pre>
         * <pre>
         *    Control.extend({
         *       ...
         *       _inputValue: new Date(),
         *
         *       _sendButtonClick() {
         *          this._sendData(this._inputValue);
         *       }
         *       ...
         *  });
         * </pre>
         */

        /*
         * @cfg {Date} The date that the user entered in the input field.
         * @default null
         * @remark If you don`t update value option, will not be able to enter anything in the field.
         * You need to subscribe to “valueChanged” event and update value that is passed to the control.
         * To make it simpler, you can use bind notation.
         * @example
         * In this example you bind _inputValue in control's state to the value of input field.
         * At any time of control's lifecycle, _inputValue will contain the current value of the input field.
         * <pre>
         *    <Controls._input.DateTime bind:value="_inputValue" />
         *    <Controls.buttons:Button on:click="_sendButtonClick()" />
         * </pre>
         * <pre>
         *    Control.extend({
         *       ...
         *       _inputValue: new Date(),
         *
         *       _sendButtonClick() {
         *          this._sendData(this._inputValue);
         *       }
         *       ...
         *  });
         * </pre>
         */         
        value: Date;
    }
}


/**
 * @event Происходит при изменении значения поля ввода.
 * @name Controls/interface/IInputDateTime#valueChanged
 * @param {Date} value Новое значение поля ввода.
 * @param {String} displayValue Текстовое значение поля ввода.
 * @remark
 * Это событие предназначено для реагирования на изменения, вносимые пользователем в поле ввода. 
 * Значение, возвращаемое в событии, не вставляется в контрол, если вы не передадите его обратно в поле в качестве опции.
 * Обычно, вместо этого используется синтаксис биндинга. Пример ниже иллюстрирует разницу.
 * @example
 * В этом примере покажем, как 'привязать' значение контрола к полю.
 * В первом поле мы делаем это вручную, используя событие valueChanged. Во втором поле мы используем синтаксис биндинга.
 * Оба поля в этом примере будут иметь одинаковое поведение.
 * <pre class="brush: html">
 * <!-- WML -->
 * <Controls.input:DateTime value="_fieldValue" on:valueChanged="_valueChangedHandler()"/>
 * <Controls.input:DateTime bind:value="_anotherFieldValue"/>
 * </pre>
 * <pre class="brush: js">
 * // JavaScript
 * Control.extend({
 *    _fieldValue: null,
 *    _valueChangedHandler(value, displayValue) {
 *       this._fieldValue = value;
 *       this._saveToDatabase(displayValue);
 *    },
 *    _anotherFieldValue: null
 * });
 * </pre>
 */

/*
 * @event Occurs when field value was changed.
 * @name Controls/interface/IInputDateTime#valueChanged
 * @param {Date} value New field value.
 * @param {String} displayValue Text value of the field.
 * @remark
 * This event should be used to react to changes user makes in the field.
 * Value returned in the event is not inserted in control unless you pass it back to the field as an option.
 * Usually you would use bind notation instead. Example below shows the difference.
 * @example
 * In this example, we show how you can 'bind' control's value to the field.
 * In the first field, we do it manually using valueChanged event. In the second field we use bind notation.
 * Both fields in this examples will have identical behavior.
 * <pre>
 *    <Controls._input.DateTime value="_fieldValue" on:valueChanged="_valueChangedHandler()"/>
 *    <Controls._input.DateTime bind:value="_anotherFieldValue"/>
 * </pre>
 * <pre>
 * Control.extend({
 *    ....
 *    _fieldValue: null,
 *    _valueChangedHandler(value, displayValue) {
 *       this._fieldValue = value;
 *       this._saveToDatabase(displayValue);
 *    },
 *
 *    _anotherFieldValue: null
 *    ...
 * });
 * </pre>
 */ 

/**
 * @event Происходит при завершении ввода в поле (поле потеряло фокус или пользователь нажал клавишу "enter").
 * @name Controls/interface/IInputDateTime#inputCompleted
 * @param {Date} value Значение поля.
 * @param {String} displayValue Текстовое значение поля.
 * @remark
 * Это событие можно использовать в качестве триггера для проверки поля или отправки введенных данных в другой контрол.
 * @example
 * В этом примере мы подписываемся на событие inputCompleted и сохраняем значение поля в первой базе данных, а отображаемое значение поля во второй базе данных.
 * <pre class="brush: html">
 * <!-- WML -->
 * <Controls._input.Text on:inputCompleted="_inputCompletedHandler()" />
 * </pre>
 * <pre class="brush: js">
 * // JavaScript
 * Control.extend({
 *    _inputCompletedHandler(value, displayValue) {
 *       this._saveEnteredValueToDabase1(value);
 *       this._saveEnteredValueToDabase2(displayValue);
 *    }
 * })
 * </pre>
 */

/*
 * @event Occurs when input was completed (field lost focus or user pressed ‘enter’).
 * @name Controls/interface/IInputDateTime#inputCompleted
 * @param {Date} value Field value.
 * @param {String} displayValue Text value of the field.
 * @remark
 * This event can be used as a trigger to validate the field or send entered data to some other control.
 * @example
 * In this example, we subscribe to inputCompleted event and save field's value to the first database and field`s display value to the second database.
 * <pre>
 *    <Controls._input.Text on:inputCompleted="_inputCompletedHandler()" />
 * </pre>
 * <pre>
 *    Control.extend({
 *       ....
 *       _inputCompletedHandler(value, displayValue) {
 *          this._saveEnteredValueToDabase1(value);
 *          this._saveEnteredValueToDabase2(displayValue);
 *       }
 *       ...
 *    })
 * </pre>
 */ 

/**
 * Интерфейс для ввода текста в поле с маской.
 * @public
 * @author Красильников А.С.
 */

/*
 * Interface for text inputs.
 * @public
 * @author Красильников А.С.
 */ 
interface IInputMaskValue {
    readonly _options: {
        /**
         * @cfg {String} Значение контрола ввода. 
         * Параметр представляет собой текст в поле ввода без разделителей.
         * @default '' (пустая строка)
         * @remark Для корректной работы поля ввода необходимо подписаться на событие _valueChanged и обновить "value", которое передается контролу. 
         * Вы можете использовать синтаксис биндинга. Передаваемый параметр "value" должен быть необработанным без разделителей. 
         * Если необходимо получить значение с разделителями, то вы можете сделать это с помощью события {@link Controls/interface/IInputMaskValue#valueChanged}.
         * @example
         * В этом примере вы осуществляете привязку _inputValue в состоянии контрола к значению поля ввода. В любое время жизненного цикла контрола _inputValue будет содержать текущее значение поля ввода.
         * <pre class="brush: html">
         * <!-- WML -->
         * <Controls.input:Mask bind:value="_inputValue" />
         * <Controls.buttons:Button on:click="_sendButtonClick()" />
         * </pre>
         *
         * <pre>
         * // JavaScript
         * Control.extend({
         *    _inputValue: '',
         *    _sendButtonClick(event) {
         *       this._sendData(this._inputValue);
         *    }
         * });
         * </pre>
         * @see valueChanged
         * @see inputCompleted
         */

        /*
         * @cfg {String} Text in the field without delimiters.
         * @default '' (empty string)
         * @remark If you don`t update value option, will not be able to enter anything in the field. You need to subscribe to _valueChanged event and update value that is passed to the control. To make it simpler, you can use bind notation.
         * The value passed must be raw without delimiters. If you need to get a value with delimiters, then you can do this by the {@link Controls/interface/IInputMaskValue#valueChanged} event.
         * @example
         * In this example you bind _inputValue in control's state to the value of input field. At any time of control's lifecycle, _inputValue will contain the current value of the input field.
         * <pre class="brush: html">
         * <!-- WML -->
         * <Controls.input:Mask bind:value="_inputValue" />
         * <Controls.buttons:Button on:click="_sendButtonClick()" />
         * </pre>
         *
         * <pre>
         * // JavaScript
         * Control.extend({
         *    _inputValue: '',
         *    _sendButtonClick(event) {
         *       this._sendData(this._inputValue);
         *    }
         * });
         * </pre>
         * @see valueChanged
         * @see inputCompleted
         */         
        value: string;
    }
}

/**
 * @event Происходит при изменении значения поля ввода.
 * @name Controls/interface/IInputMaskValue#valueChanged
 * @param {Vdom/Vdom:SyntheticEvent} eventObject Дескриптор события.
 * @param {String} value Значение поля без разделителей.
 * @param {String} displayValue Значение поля с разделителями.
 * @remark
 * Это событие должно использоваться для реагирования на изменения, вносимые пользователем в поле.
 * Значение, возвращаемое в событии, не вставляется в контрол, если вы не передадите его обратно в поле в качестве опции. 
 * Обычно используется синтаксис биндинга. Пример ниже показывает разницу.
 * @example
 * В этом примере рассмотрим, как осуществить привязку значения контрола к полю.
 * В первом поле мы делаем это вручную, используя событие valueChanged.
 * Во втором поле используем синтаксис биндинга. 
 * Оба поля в этом примере будут иметь одинаковое поведение.
 * <pre class="brush: html">
 * <!-- WML -->
 * <Controls.input:Mask value="_fieldValue" on:valueChanged="_valueChangedHandler()" />
 * <Controls.input:Text bind:value="_anotherFieldValue" />
 * </pre>
 *
 * <pre class="brush: js">
 * // JavaScript
 * Control.extend({
 *    _fieldValue: '',
 *    _valueChangedHandler(event, value, displayValue) {
 *       this._fieldValue = value;
 *       this._fieldValueWithDelimiters = displayValue;
 *    },
 *    _anotherFieldValue: ''
 * });
 * </pre>
 * @see value
 */

/*
 * @event Occurs when field value was changed.
 * @name Controls/interface/IInputMaskValue#valueChanged
 * @param {Vdom/Vdom:SyntheticEvent} eventObject Event Descriptor.
 * @param {String} value Value of the field without delimiters.
 * @param {String} displayValue Value of the field with delimiters.
 * @remark
 * This event should be used to react to changes user makes in the field. Value returned in the event is not inserted in control unless you pass it back to the field as an option. Usually you would use bind notation instead. Example below shows the difference.
 * @example
 * In this example, we show how you can 'bind' control's value to the field. In the first field, we do it manually using valueChanged event. In the second field we use bind notation. Both fields in this examples will have identical behavior.
 * <pre class="brush: html">
 * <!-- WML -->
 * <Controls.input:Mask value="_fieldValue" on:valueChanged="_valueChangedHandler()" />
 * <Controls.input:Text bind:value="_anotherFieldValue" />
 * </pre>
 *
 * <pre class="brush: js">
 * // JavaScript
 * Control.extend({
 *    _fieldValue: '',
 *    _valueChangedHandler(event, value, displayValue) {
 *       this._fieldValue = value;
 *       this._fieldValueWithDelimiters = displayValue;
 *    },
 *    _anotherFieldValue: ''
 * });
 * </pre>
 * @see value
 */ 

/**
 * @event Происходит при завершении ввода (поле потеряло фокус или пользователь нажал клавишу "enter").
 * @name Controls/interface/IInputMaskValue#inputCompleted
 * @param {Vdom/Vdom:SyntheticEvent} eventObject Дескриптор события.
 * @param {String} value Значение поля.
 * @param {String} displayValue Текстовое значение поля.
 * @remark
 * Это событие можно использовать в качестве триггера для проверки поля или отправки введенных данных в другой контрол.
 * @example
 * В этом примере мы подписываемся на событие inputCompleted и сохраняем значение поля в базе данных.
 * <pre class="brush: html">
 * <!-- WML -->
 * <Controls.input:Text on:inputCompleted="_inputCompletedHandler()" />
 * </pre>
 *
 * <pre class="brush: js">
 * // JavaScript
 * Control.extend({
 *    _inputCompletedHandler(event, value) {
 *       this._saveEnteredValueToDatabase(value);
 *    }
 * });
 * </pre>
 * @see value
 */

/*
 * @event Occurs when input is completed (field lost focus or user pressed ‘enter’).
 * @name Controls/interface/IInputMaskValue#inputCompleted
 * @param {Vdom/Vdom:SyntheticEvent} eventObject Event descriptor.
 * @param {String} value Value of the field.
 * @param {String} displayValue Value of the field with delimiters.
 * @remark
 * This event can be used as a trigger to validate the field or send entered data to some other control.
 * @example
 * In this example, we subscribe to inputCompleted event and save field's value to the database.
 * <pre class="brush: html">
 * <!-- WML -->
 * <Controls.input:Text on:inputCompleted="_inputCompletedHandler()" />
 * </pre>
 *
 * <pre class="brush: js">
 * // JavaScript
 * Control.extend({
 *    _inputCompletedHandler(event, value) {
 *       this._saveEnteredValueToDatabase(value);
 *    }
 * });
 * </pre>
 * @see value
 */ 

export default IInputMaskValue;

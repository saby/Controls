export interface IInputMaskValueOptions {
    value: string;
}

/**
 * @name Controls/_input/interface/IInputMaskValue#value
 * @cfg {String} Значение контрола ввода.
 * Параметр представляет собой текст в поле ввода без разделителей.
 * @default '' (пустая строка)
 * @remark Для корректной работы поля ввода необходимо подписаться на событие _valueChanged и обновить "value", которое передается контролу.
 * Вы можете использовать синтаксис биндинга. Передаваемый параметр "value" должен быть необработанным без разделителей.
 * Если необходимо получить значение с разделителями, то вы можете сделать это с помощью события {@link Controls/_input/interface/IInputMaskValue#valueChanged}.
 * @example
 * В этом примере вы осуществляете привязку _inputValue в состоянии контрола к значению поля ввода. В любое время жизненного цикла контрола _inputValue будет содержать текущее значение поля ввода.
 * <pre class="brush: html">
 * <!-- WML -->
 * <Controls.input:Mask bind:value="_inputValue" />
 * <Controls.buttons:Button on:click="_sendButtonClick()" />
 * </pre>
 *
 * <pre class="brush: js">
 * // JavaScript
 * class MyControl extends Control<IControlOptions> {
 *    _inputValue: '',
 *    _sendButtonClick(event) {
 *       this._sendData(this._inputValue);
 *    }
 * }
 * </pre>
 * @see valueChanged
 * @see inputCompleted
 */

/**
 * @event Происходит при изменении значения поля ввода.
 * @name Controls/_input/interface/IInputMaskValue#valueChanged
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
 * class MyControl extends Control<IControlOptions> {
 *    _fieldValue: '',
 *    _valueChangedHandler(event, value, displayValue) {
 *       this._fieldValue = value;
 *       this._fieldValueWithDelimiters = displayValue;
 *    },
 *    _anotherFieldValue: ''
 * }
 * </pre>
 * @see value
 */

/**
 * @event Происходит при завершении ввода (поле потеряло фокус или пользователь нажал клавишу "enter").
 * @name Controls/_input/interface/IInputMaskValue#inputCompleted
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
 * class MyControl extends Control<IControlOptions> {
 *    _inputCompletedHandler(event, value) {
 *       this._saveEnteredValueToDatabase(value);
 *    }
 * };
 * </pre>
 * @see value
 */


/**
 * Интерфейс для ввода текста в поле с маской.
 * @public
 * @author Красильников А.С.
 */
export interface IInputMaskValue {
    readonly '[Controls/_input/interface/IInputMaskValue]': boolean;
}

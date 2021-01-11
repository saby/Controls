export interface IDateSelectorOptions {
    value?: Date;
}

/**
 * Интерфейс для поддержки ввода даты.
 * @interface Controls/_dateRange/interfaces/IDateSelector
 * @public
 * @author Красильников А.С.
 */

/**
 * @name Controls/_dateRange/interfaces/IDateSelector#value
 * @cfg {Date} Выбранная дата.
 * @example
 * <pre>
 *    <Controls.dateRange:DateSelector bind:value="value" />
 *    <Controls.buttons:Button on:click="_sendButtonClick()" />
 * </pre>
 * <pre>
 *    Control.extend({
 *       ...
 *       value: new Date(),
 *       _sendButtonClick() {
 *          this._sendData(this._startValue);
 *       }
 *       ...
 *   });
 * </pre>
 */

/**
 * @event Происходит при изменении значения.
 * @name Controls/_dateRange/interfaces/IDateSelector#valueChanged
 * @param {Vdom/Vdom:SyntheticEvent} eventObject Дескриптор события.
 * @param {Date} value Новое значение поля.
 * @remark
 * Это событие должно использоваться для реагирования на изменения, вносимые пользователем в поле.
 * @example
 * <pre>
 *    <Controls.dateRange:Input value="_fieldValue" on:valueChanged="_valueChangedHandler()"/>
 * </pre>
 * <pre>
 *    Control.extend({
 *       ....
 *       _fieldValue: null,
 *       _valueChangedHandler(value) {
 *          this._fieldValue = value;
 *       }
 *       ...
 *    });
 * </pre>
 */

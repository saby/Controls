/**
 * Интерфейс для поля ввода периода дат.
 * @interface Controls/_dateRange/interfaces/IInput
 * @public
 * @author Красильников А.С.
 */

/**
 * @event Controls/_dateRange/interfaces/IInput#inputCompleted Происходит при завершении ввода (поле потеряло фокус или пользователь нажал "enter").
 * @param {Vdom/Vdom:SyntheticEvent} eventObject Дескриптор события.
 * @param {Date} startValue Начальное значение поля.
 * @param {Date} endValue Конечно значение поля.
 * @param {String} displayedStartValue Начальное текстовое значение поля.
 * @param {String} displayedEndValue Конечное текстовое значение поля.
 * @remark
 * Это событие можно использовать в качестве триггера для проверки поля или отправки введенных данных в какой-либо другой контрол.
 * @example
 * В этом примере мы подписываемся на событие inputCompleted и сохраняем значение поля в первой базе данных и отображаемое значение поля во второй базе данных.
 * <pre>
 *    <Controls.dateRange:Input on:inputCompleted="_inputCompletedHandler()" />
 * </pre>
 * <pre>
 *    Control.extend({
 *       ....
 *       _inputCompletedHandler(startValue, endValue, displaydStartValue, displaydEndValue) {
 *          this._saveEnteredValueToDabase1(startValue, endValue);
 *          this._saveEnteredValueToDabase2(displaydStartValue, displaydEndValue);
 *       },
 *       ...
 *    })
 * </pre>
 */

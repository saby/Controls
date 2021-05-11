/**
 * Интерфейс для поля ввода диапазона дат.
 * @interface Controls/_dateRange/interfaces/IInput
 * @implements Controls/interface:IContrastBackground
 * @public
 * @author Красильников А.С.
 */

/*
 * Interface for date range inputs.
 * @interface Controls/_dateRange/interfaces/IInput
 * @public
 * @author Красильников А.С.
 */

/**
 * @event Происходит при завершении ввода (поле потеряло фокус или пользователь нажал "enter").
 * @name Controls/_dateRange/interfaces/IInput#inputCompleted
 * @param {UICommon/Events:SyntheticEvent} eventObject Дескриптор события.
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
 *    class MyControl extends Control<IControlOptions>{
 *       ....
 *       _inputCompletedHandler(startValue, endValue, displaydStartValue, displaydEndValue) {
 *          this._saveEnteredValueToDabase1(startValue, endValue);
 *          this._saveEnteredValueToDabase2(displaydStartValue, displaydEndValue);
 *       },
 *       ...
 *    }
 * </pre>
 */

/*
 * @event Occurs when input was completed (field lost focus or user pressed ‘enter’).
 * @name Controls/_dateRange/interfaces/IInput#inputCompleted
 * @param {Date} startValue Start field value.
 * @param {Date} endValue End field value.
 * @param {String} displayedStartValue Text value of the start field.
 * @param {String} displayedEndValue Text value of the end field.
 * @remark
 * This event can be used as a trigger to validate the field or send entered data to some other control.
 * @example
 * In this example, we subscribe to inputCompleted event and save field's value to the first database and field`s display value to the second database.
 * <pre>
 *    <Controls.dateRange:Input on:inputCompleted="_inputCompletedHandler()" />
 * </pre>
 * <pre>
 *    class MyControl extends Control<IControlOptions> {
 *       ....
 *       _inputCompletedHandler(startValue, endValue, displaydStartValue, displaydEndValue) {
 *          this._saveEnteredValueToDabase1(startValue, endValue);
 *          this._saveEnteredValueToDabase2(displaydStartValue, displaydEndValue);
 *       }
 *       ...
 *    }
 * </pre>
 */

/*
 * @name Controls/_dateRange/interfaces/IInput#rightFieldTemplate
 * @cfg {TemplateFunction} Шаблон, содержащие прикладной контент, который будет отображаться справа от полей ввода.
 * @remark
 * В шаблон будет переданы опции
 * <ul>
 *   <li>value - дата, которая установлена в поле ввода</li>
 *   <li>inputPosition - указывает с какой стороны находится поле ввода. 'right' или 'left'</li>
 * </ul>
*/

/**
 * @name Controls/_dateRange/interfaces/IInput#contrastBackground
 * @demo Controls-demo/dateRange/Input/ContrastBackground/Index
 */

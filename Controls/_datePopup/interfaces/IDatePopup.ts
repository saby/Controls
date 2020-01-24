/**
 * Интерфейс диалога выбора периода.
 * @interface Controls/datePopup/interfaces/IDatePopup
 * @public
 * @author Красильников А.С.
 */

/*
 * Interface to select the period of the dialogue.
 * @interface Controls/_datePopup/interfaces/IDatePopup
 * @public
 * @author Красильников А.С.
 */

/**
 * @name Controls/datePopup/interfaces/IDatePopup#startValue
 * @cfg {Date} Начало периода.
 * @example
 * В этом примере вы привязываете _startValue в состоянии контрола к значению периода.
 * В любое время жизненного цикла контрола, _startValue будет содержать текущее начальное значение периода.
 * <pre>
 *    <Controls.datePopup bind:startValue="_startValue" />
 *    <Controls.buttons:Button on:click="_sendButtonClick()" />
 * </pre>
 * <pre>
 *    Base.Control.extend({
 *       ...
 *       _startValue: new Date(),
 *       _sendButtonClick() {
 *          this._sendData(this._startValue);
 *       }
 *       ...
 *    });
 * </pre>
 */

/*
 * @name Controls/_datePopup/interfaces/IDatePopup#startValue
 * @cfg {Date} Beginning of period
 * @example
 * In this example you bind _startValue in control's state to the value of period.
 * At any time of control's lifecycle, _startValue will contain the current start value of the period.
 * <pre>
 *    <Controls.datePopup bind:startValue="_startValue" />
 *    <Controls.buttons:Button on:click="_sendButtonClick()" />
 * </pre>
 * <pre>
 *    Base.Control.extend({
 *       ...
 *       _startValue: new Date(),
 *       _sendButtonClick() {
 *          this._sendData(this._startValue);
 *       }
 *       ...
 *    });
 * </pre>
 */

/**
 * @name Controls/datePopup/interfaces/IDatePopup#endValue
 * @cfg {Date} Конец периода.
 * @example
 * В этом примере вы привязываете _endValue в состоянии контрола к значению периода.
 * В любое время жизненного цикла контрола, _endValue будет содержать текущее конечное значение периода.
 * <pre>
 *    <Controls.datePopup bind:endValue="_endValue" />
 *    <Controls.Button on:click="_sendButtonClick()" />
 * </pre>
 * <pre>
 *    Base.Control.extend({
 *       ...
 *       _endValue: new Date(),
 *       _sendButtonClick() {
 *          this._sendData(this._endValue);
 *       }
 *       ...
 *    });
 * </pre>
 */

/*
 * @name Controls/_datePopup/interfaces/IDatePopup#endValue
 * @cfg {Date} End of period
 * @example
 * In this example you bind _endValue in control's state to the value of period.
 * At any time of control's lifecycle, _endValue will contain the current ens value of the period.
 * <pre>
 *    <Controls.datePopup bind:endValue="_endValue" />
 *    <Controls.buttons:Button on:click="_sendButtonClick()" />
 * </pre>
 * <pre>
 *    Base.Control.extend({
 *       ...
 *       _endValue: new Date(),
 *       _sendButtonClick() {
 *          this._sendData(this._endValue);
 *       }
 *       ...
 *    });
 * </pre>
 */

/**
 * @event Controls/_datePopup/interfaces/IDatePopup#startValueChanged Происходит при изменении начального значения периода.
 * @param {Vdom/Vdom:SyntheticEvent} eventObject Дескриптор события.
 * @param {Date} value Значение нового периода.
 * @param {String} displayValue Текстовое значение периода.
 * @remark
 * Это событие должно использоваться для реагирования на изменения, внесенные пользователем в период.
 * @example
 * В этом примере мы покажем, как можно "привязать" значение контрола к периоду.
 * В первом периоде мы делаем это вручную, используя событие "valueChanged". Во втором периоде мы используем конструкцию привязки.
 * Оба периода в этом примере будут иметь одинаковое поведение.
 * <pre>
 *    <Controls.datePopup startValue="_fieldValue" on:startValueChanged="_valueChangedHandler()"/>
 *    <Controls.datePopup bind:startValue="_anotherFieldValue"/>
 * </pre>
 * <pre>
 *    Base.Control.extend({
 *       ....
 *       _fieldValue: null,
 *       _valueChangedHandler(value, displayValue) {
 *          this._fieldValue = value;
 *          this._saveToDatabase(displayValue);
 *       },
 *       _anotherFieldValue: null
 *       ...
 *    });
 * </pre>
 */

/*
 * @event Controls/_datePopup/interfaces/IDatePopup#startValueChanged Occurs when period start value was changed.
 * @param {Date} value New period value.
 * @param {String} displayValue Text value of the period.
 * @remark
 * This event should be used to react to changes user makes in the period.
 * @example
 * In this example, we show how you can 'bind' control's value to the period.
 * In the first period, we do it manually using valueChanged event. In the second period we use bind notation.
 * Both period in this examples will have identical behavior.
 * <pre>
 *    <Controls.datePopup startValue="_fieldValue" on:startValueChanged="_valueChangedHandler()"/>
 *    <Controls.datePopup bind:startValue="_anotherFieldValue"/>
 * </pre>
 * <pre>
 *    Base.Control.extend({
 *       ....
 *       _fieldValue: null,
 *       _valueChangedHandler(value, displayValue) {
 *          this._fieldValue = value;
 *          this._saveToDatabase(displayValue);
 *       },
 *       _anotherFieldValue: null
 *       ...
 *    });
 * </pre>
 */

/**
 * @event Controls/_datePopup/interfaces/IDatePopup#endValueChanged Происходит при изменении конечного значения периода.
 * @param {Vdom/Vdom:SyntheticEvent} eventObject Дескриптор события.
 * @param {Date} value Значение нового периода.
 * @param {String} displayValue Текстовое значение периода.
 * @remark
 * Это событие должно использоваться для реагирования на изменения, внесенные пользователем в период.
 * @example
 * В этом примере мы покажем, как можно "привязать" значение контрола к периоду.
 * В первом периоде мы делаем это вручную, используя событие "valueChanged". Во втором периоде мы используем конструкцию привязки.
 * Оба периода в этом примере будут иметь одинаковое поведение.
 * <pre>
 *    <Controls.datePopup endValue="_fieldValue" on:endValueChanged="_valueChangedHandler()"/>
 *    <Controls.datePopup bind:endValue="_anotherFieldValue"/>
 * </pre>
 * <pre>
 *    Base.Control.extend({
 *       ....
 *       _fieldValue: null,
 *       _valueChangedHandler(value, displayValue) {
 *          this._fieldValue = value;
 *          this._saveToDatabase(displayValue);
 *       },
 *       _anotherFieldValue: null,
 *       ...
 *    });
 * </pre>
 */

/*
 * @event Controls/_datePopup/interfaces/IDatePopup#endValueChanged Occurs when period end value was changed.
 * @param {Date} value New period value.
 * @param {String} displayValue Text value of the period.
 * @remark
 * This event should be used to react to changes user makes in the period.
 * @example
 * In this example, we show how you can 'bind' control's value to the period.
 * In the first period, we do it manually using valueChanged event. In the second period we use bind notation.
 * Both period in this examples will have identical behavior.
 * <pre>
 *    <Controls.datePopup endValue="_fieldValue" on:endValueChanged="_valueChangedHandler()"/>
 *    <Controls.datePopup bind:endValue="_anotherFieldValue"/>
 * </pre>
 * <pre>
 *    Base.Control.extend({
 *       ....
 *       _fieldValue: null,
 *       _valueChangedHandler(value, displayValue) {
 *          this._fieldValue = value;
 *          this._saveToDatabase(displayValue);
 *       },
 *       _anotherFieldValue: null,
 *       ...
 *    });
 * </pre>
 */

/**
 * @event Controls/_datePopup/interfaces/IDatePopup#inputCompleted Происходит при завершении ввода (поле ввода периода потеряло фокус или пользователь нажал клавишу "Enter").
 * @param {Vdom/Vdom:SyntheticEvent} eventObject Дескриптор события.
 * @param {Date} startValue Начальное значение периода.
 * @param {Date} endValue Конечное значение периода.
 * @param {String} displayedStartValue Текстовое значение начала периода.
 * @param {String} displayedEndValue Текстовое значение конца периода.
 * @remark
 * Это событие можно использовать в качестве триггера для проверки периода или отправки введенных данных в какой-либо другой контрол.
 * @example
 * В этом примере мы подписываемся на событие inputCompleted и сохраняем значение периода в первой базе данных и отображаемое значение периода во второй базе данных.
 * <pre>
 *    <Controls.datePopup on:inputCompleted="_inputCompletedHandler()" />
 * </pre>
 * <pre>
 *    Base.Control.extend({
 *       ....
 *       _inputCompletedHandler(event, startValue, endValue, displaydStartValue, displaydEndValue) {
 *          this._saveEnteredValueToDabase1(startValue, endValue);
 *          this._saveEnteredValueToDabase2(displaydStartValue, displaydEndValue);
 *       },
 *       ...
 *    })
 * </pre>
 */

/*
 * @event Controls/datePopup/interfaces/IDatePopup#inputCompleted Occurs when input was completed (period lost focus or user pressed ‘enter’).
 * @param {Date} startValue Start period value.
 * @param {Date} endValue End period value.
 * @param {String} displayedStartValue Text value of the start period.
 * @param {String} displayedEndValue Text value of the end period.
 * @remark
 * This event can be used as a trigger to validate the period or send entered data to some other control.
 * @example
 * In this example, we subscribe to inputCompleted event and save period's value to the first database and period`s display value to the second database.
 * <pre>
 *    <Controls.datePopup on:inputCompleted="_inputCompletedHandler()" />
 * </pre>
 * <pre>
 *    Base.Control.extend({
 *       ....
 *       _inputCompletedHandler(event, startValue, endValue, displaydStartValue, displaydEndValue) {
 *          this._saveEnteredValueToDabase1(startValue, endValue);
 *          this._saveEnteredValueToDabase2(displaydStartValue, displaydEndValue);
 *       },
 *       ...
 *    })
 * </pre>
 */
/**
 * @name Controls/datePopup/interfaces/IDatePopup#popupClassName
 * @cfg {String} Имена классов, которые будут применены к корневой ноде всплывающего окна.
 */

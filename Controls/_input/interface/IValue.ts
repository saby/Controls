/**
 * @interface Controls/_input/interface/IFieldData
 * @author Красильников А.С.
 * @public
 */
export interface IFieldData {
    /**
     * Положение каретки.
     */
    position: number;
    /**
     * Значение, которое будет отображено в поле.
     */
    displayValue: string;
}

/**
 * @interface Controls/_input/interface/ICallbackData
 * @author Красильников А.С.
 * @public
 *
 * @param T Тип значения поля ввода.
 */
export interface ICallbackData<T> extends IFieldData {
    /**
     * Значение поля ввода.
     */
    value: T;
}

/**
 * Определяет функцию обратного вызова, изменяющую обработку ввода.
 * @callback ICallback
 * @param T Тип значения поля ввода.
 * @param {ICallbackData} data данные основного процесса обработки ввода.
 * @return {IFieldData} измененные данные.
 */
export type ICallback<T> = (data: ICallbackData<T>) => IFieldData;

/**
 * Интерфейс управления значением поля ввода.
 *
 * @interface Controls/_input/interface/IValue
 * @author Красильников А.С.
 * @public
 *
 * @param T Тип значения поля ввода.
 */
export interface IValueOptions<T> {
    /**
     * @cfg {String} Значение поля ввода.
     * @remark
     * При установке опции value в контроле ввода, отображаемое значение всегда будет соответствовать её значению. В этом случае родительский контрол управляет отображаемым значением. Например, вы можете менять значение по событию {@link valueChanged}:
     * <pre>
     *     <Controls:input:Text value="{{_value}}" on:valueChanged="_handleValueChange()"/>
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
     *     <Controls:input:Text bind:value="_value"/>
     * </pre>
     * Альтернатива - не задавать опцию value. Значение контрола будет кешироваться в контроле ввода:
     * <pre>
     *     <Controls.input:Text/>
     * </pre>
     * Не рекомендуем использовать опцию для изменения поведения обработки ввода. Такой подход увеличит время перерисовки.
     * Плохо:
     * <pre>
     *     <Controls:input:Text value="{{_value}}" on:valueChanged="_handleValueChange()"/>
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
     *     <Controls:input:Text bind:value="{{_value}}" inputCallback="{{_toUpperCase}}"/>
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
    value: T | null;

    /**
     * @cfg {ICallback} Функция обратного вызова, вызывается после основного процесса обработки входных данных.
     * @remark
     * Метод используется, когда требуется измененить поведение обработки ввода.
     * @demo Controls-demo/Input/InputCallback/Index
     */
    inputCallback: ICallback<T>;
}

export interface IValue {
    readonly '[Controls/_input/interface/IValue]': boolean;
}

/**
 * @name Controls/_input/interface/IValue#valueChanged
 * @event Происходит при изменении отображаемого значения контрола ввода.
 * @param {Vdom/Vdom:SyntheticEvent} eventObject Дескриптор события.
 * @param {String} value Значение контрола ввода.
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
 * @name Controls/_input/interface/IValue#inputCompleted
 * @event Происходит при завершении ввода. Завершение ввода — это контрол потерял фокус, или пользователь нажал клавишу "Enter".
 * @param {String} value Значение контрола ввода.
 * @param {String} displayValue Отображаемое значение контрола ввода.
 * @remark
 * Событие используется в качестве реакции на завершение ввода пользователем. Например, проверка на валидность введенных данных или отправка данных в другой контрол.
 * @example
 * Подписываемся на событие inputCompleted и сохраняем значение поля в базе данных.
 * <pre>
 *    <Controls.input:Text on:inputCompleted="_inputCompletedHandler()"/>
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

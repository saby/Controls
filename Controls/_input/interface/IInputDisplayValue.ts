
export const enum INPUT_MODE {
    default = 'default',
    partial = 'partial'
}

export interface IInputDisplayValueOptions {
    displayValue?: string;
    inputMode?: INPUT_MODE;
}

/**
 * Интерфейс базового поля ввода.
 *
 * @interface Controls/_input/interface/IInputDisplayValue
 * @public
 * @author Красильников А.С.
 */
export interface IInputDisplayValue {
    readonly '[Controls/_input/interface/IInputDisplayValue]': boolean;
}

/**
 * @typedef {String} InputMode
 * @variant default Автокорректировка и валидация работают по умолчанию.
 * @variant partial Автокоректировка и валидация позволяют не вводить дату и месяц.
 */

/**
 * @name Controls/_input/interface/IInputDisplayValue#displayValue
 * @cfg {String} Задает отображаемый текст.
 * Не работает с двусторонним биндингом. Если надо получить текстовое значене из контрола, то необходимо пользоваться событием {@link Controls/_input/interface/IInputDateTime#valueChanged valueChanged}.
 *
 * @example
 * В этом примере дата задается текстом. Изменение даты отслеживается с помощью события {@link Controls/_input/interface/IInputDateTime#valueChanged valueChanged}.
 * <pre>
 *    <Controls.input:DateBase displayValue="{{_displayValue}}" inputMode="partial" on:valueChanged="_onValueChanged()"/>
 * </pre>
 * <pre>
 *    protected _displayValue: string = '  .  .21';
 *    protected _onValueChanged(e: SyntheticEvent, value: Date, displayValue: string): void {
 *       this._displayValue = displayValue;
 *    }
 * </pre>
 *
 * @demo Controls-demo/Input/DateBase/DisplayValue/Index
 * @see Controls/_input/interface/IInputDisplayValue#inputMode
 */

/**
 * @name Controls/_input/interface/IInputDisplayValue#inputMode
 * @cfg {InputMode} Задает режим ввода текста.
 *
 * @example
 * В этом примере настроен режим ввода так, что позволяет вводить дату без числа и месяца.
 * В этом случае получается не срабатывает автоподстановка и валидация. Но дата получается невалидная.
 * По этому работаем с ее текстовым представленем через опцию displayValue.
 * <pre>
 *    <Controls.input:DateBase displayValue="{{_displayValue}}" inputMode="partial" on:valueChanged="_onValueChanged()"/>
 * </pre>
 * <pre>
 *    protected _displayValue: string = '  .  .21';
 *    protected _onValueChanged(e: SyntheticEvent, value: Date, displayValue: string): void {
 *       this._displayValue = displayValue;
 *    }
 * </pre>
 *
 * @demo Controls-demo/Input/DateBase/DisplayValue/Index
 * @see Controls/_input/interface/IInputDisplayValue#displayValue
 */
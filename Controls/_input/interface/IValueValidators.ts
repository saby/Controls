import {descriptor} from 'Types/entity';

export interface ValueValidatorObject {
   validator: Function;
   arguments: object
}

export type ValueValidators = ValueValidatorObject[] | Function[]

export interface IValueValidatorsOptions {
    valueValidators: ValueValidators;
    validateByFocusOut: boolean;
}

export function getDefaultOptions() {
    return {
        valueValidators: [],
        validateByFocusOut: true
    }
}

export function getOptionTypes() {
    return {
        valueValidators: descriptor(Array),
        validateByFocusOut: descriptor(Boolean)
    };
}

/**
 * Интерфейс для полей ввода с внутренней валидацией. Позволяет заать валидаторы для возвращаемого значения.
 *
 * @interface Controls/_input/interface/IValueValidators
 * @public
 */

export default interface IValueValidators {
    readonly '[Controls/_input/interface/IValueValidators]': boolean;
}

/**
 * @name Controls/_input/interface/IValueValidators#valueValidators
 * @cfg {Array} Массив вылидаторов или объектов содержащих валидаторы и их аргументы.
 *
 * @remark
 * При вызове валидатора в качестве аргументов он получает введнное в поле значение и заданные из прикладного кода
 * аргументы.
 *
 * @example
 * Поле ввода даты с валидатором, который проверяет, что в поле введено значение. Так же этот валидатор устанавливается
 * в поле ввода в диалоге выбора даты, который открывается по клику на кнопку рядом с полем ввода.
 * <pre>
 * <Controls.input:Date>
 *     <ws:valueValidators>
 *         <ws:Array>
 *             <ws:Function>Controls/validate:isRequired</ws:Function>
 *         </ws:Array>
 *     </ws:valueValidators>
 * </Controls.input:DateBase>
 * </pre>
 * Поле ввода с прикладным валидатором, который проверяет, что введенное значение лежит в интервале между _startValue
 * и _endValue.
 * <pre>
 * <Controls.input:DateBase>
 *     <ws:valueValidators>
 *         <ws:Array>
 *             <ws:Object>
 *                 <ws:validator>
 *                     <ws:Function>Controls-demo/Input/DateBase/Validators/isInRange:default</ws:Function>
 *                 </ws:validator>
 *                 <ws:arguments startValue="{{_startValue}}" endValue="{{_endValue}}"/>
 *             </ws:Object>
 *         </ws:Array>
 *     </ws:valueValidators>
 * </Controls.input:DateBase>
 * </pre>
 *
 * @see Controls/_input/interface/IValueValidators#validateByFocusOut
 */
/**
 * @name Controls/_input/interface/IValueValidators#validateByFocusOut
 * @cfg {Boolean} Если true, то внутренняя валидация будет срабатывать по уходу фокуса из контрола, если false то
 * будет срабатывать только по внешнему триггеру, например при валидации формы.
 * @default true
 *
 * @example
 * Включаем срабатывание валидации только по внешнему тригеру. Например при валидации формы.
 * <Controls.input:Date validateByFocusOut="{{false}}"/>
 *
 * @see Controls/_input/interface/IValueValidators#valueValidators
 */

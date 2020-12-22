import {descriptor} from 'Types/entity';

export interface DateRangeValidatorObject {
   validator: Function;
   arguments: object
}

export type DateRangeValidators = DateRangeValidatorObject[] | Function[]

export interface IDateRangeValidatorsOptions {
    startValueValidators: DateRangeValidators;
    endValueValidators: DateRangeValidators;
    validateByFocusOut: boolean;
}

/**
 * Интерфейс для полей ввода с внутренней валидацией. Позволяет заать валидаторы для возвращаемого значения.
 * @public
 * @author Красильников А.С.
 */

export default interface IDateRangeValidators {
    readonly '[Controls/_interface/IDateRangeValidators]': boolean;
}

/**
 * @name Controls/_interface/IDateRangeValidators#startValueValidators
 * @cfg {Array} Массив вылидаторов или объектов, содержащих валидаторы и их аргументы.
 *
 * @remark
 * При вызове валидатора в качестве аргументов он получает введнное в поле значение и заданные из прикладного кода
 * аргументы.
 *
 * @example
 * Поле ввода периода с валидатором, который проверяет, что в поле ввода начала периода введено значение.
 * Так же этот валидатор устанавливается в поле ввода в диалоге выбора периода, который открывается
 * по клику на кнопку рядом с полями ввода.
 *
 * <pre class="brush: html">
 * <!-- WML -->
 * <Controls.dateRange:Input>
 *    <ws:startValueValidators>
 *       <ws:Array>
 *          <ws:Function>Controls/validate:isRequired</ws:Function>
 *       </ws:Array>
 *    </ws:startValueValidators>
 * </Controls.dateRange:Input>
 * </pre>
 *
 * Поле ввода с прикладным валидатором, который проверяет, что начало периода лежит в интервале между _startValue
 * и _endValue.
 *
 * <pre class="brush: html">
 * <!-- WML -->
 * <Controls.dateRange:Input>
 *    <ws:startValueValidators>
 *       <ws:Array>
 *          <ws:Object>
 *             <ws:validator>
 *                <ws:Function>Controls-demo/Input/DateBase/Validators/isInRange:default</ws:Function>
 *             </ws:validator>
 *             <ws:arguments startValue="{{_startValue}}" endValue="{{_endValue}}"/>
 *          </ws:Object>
 *       </ws:Array>
 *    </ws:startValueValidators>
 * </Controls.dateRange:Input>
 * </pre>
 * @demo Controls-demo/dateRange/Input/Validators/Index
 *
 * @see Controls/_interface/IDateRangeValidators#endValueValidators
 * @see Controls/_interface/IDateRangeValidators#validateByFocusOut
 */

/**
 * @name Controls/_interface/IDateRangeValidators#endValueValidators
 * @cfg {Array} Массив вылидаторов или объектов, содержащих валидаторы и их аргументы.
 *
 * @remark
 * При вызове валидатора в качестве аргументов он получает введенное в поле значение и заданные из прикладного кода
 * аргументы.
 *
 * @example
 * Поле ввода периода с валидатором, который проверяет, что в поле ввода конца периода введено значение.
 * Так же этот валидатор устанавливается в поле ввода в диалоге выбора периода, который открывается
 * по клику на кнопку рядом с полями ввода.
 *
 * <pre class="brush: html">
 * <!-- WML -->
 * <Controls.dateRange:Input>
 *     <ws:endValueValidators>
 *         <ws:Array>
 *             <ws:Function>Controls/validate:isRequired</ws:Function>
 *         </ws:Array>
 *     </ws:endValueValidators>
 * </Controls.dateRange:Input>
 * </pre>
 *
 * Поле ввода с прикладным валидатором, который проверяет, что конец периода лежит в интервале между _startValue
 * и _endValue.
 *
 * <pre class="brush: html">
 * <!-- WML -->
 * <Controls.dateRange:Input>
 *     <ws:endValueValidators>
 *         <ws:Array>
 *             <ws:Object>
 *                 <ws:validator>
 *                     <ws:Function>Controls-demo/Input/DateBase/Validators/isInRange:default</ws:Function>
 *                 </ws:validator>
 *                 <ws:arguments startValue="{{_startValue}}" endValue="{{_endValue}}"/>
 *             </ws:Object>
 *         </ws:Array>
 *     </ws:endValueValidators>
 * </Controls.dateRange:Input>
 * </pre>
 * @demo Controls-demo/dateRange/Input/Validators/Index
 *
 * @see Controls/_interface/IDateRangeValidators#startValueValidators
 * @see Controls/_interface/IDateRangeValidators#validateByFocusOut
 */

/**
 * @name Controls/_interface/IDateRangeValidators#validateByFocusOut
 * @cfg {Boolean} Если true, то внутренняя валидация будет срабатывать по уходу фокуса из контрола, если false то
 * будет срабатывать только по внешнему триггеру, например при валидации формы.
 * @default true
 *
 * @example
 * Включаем срабатывание валидации только по внешнему триггеру. Например при валидации формы.
 *
 * <pre class="brush: html">
 * <!-- WML -->
 * <Controls.input:Date validateByFocusOut="{{false}}"/>
 * </pre>
 * @demo Controls-demo/dateRange/Input/Validators/Index
 *
 * @see Controls/_interface/IDateRangeValidators#startValueValidators
 * @see Controls/_interface/IDateRangeValidators#endValueValidators
 * @see Controls/_interface/IDateRangeValidators#valueValidators
 */

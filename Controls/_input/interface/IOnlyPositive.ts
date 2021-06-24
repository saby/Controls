export interface IOnlyPositiveOptions {
    onlyPositive?: boolean;
}

/**
 * @name Controls/_input/interface/IOnlyPositive#onlyPositive
 * @cfg {Boolean} Определяет, можно ли вводить в поле только положительные числа.
 * @default false
 * @remark
 * true - в поле можно вводить только положительные числа.
 * false - в поле можно вводить положительные и отрицательные числа.
 * @example
 * В этом примере _inputValue в состоянии контрола будет хранить только положительные числа.
 * <pre class="brush: html">
 * <!-- WML -->
 * <Controls.input:Number bind:value="_inputValue" onlyPositive="{{true}}"/>
 * </pre>
 */

/**
 * Интерфейс для контролов, которые поддерживают ввод положительных чисел.
 * @public
 * @author Красильников А.С.
 */
export interface IOnlyPositive {
    readonly '[Controls/_input/interface/IOnlyPositive]': boolean;
}

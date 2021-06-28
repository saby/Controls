export interface IOnlyPositiveOptions {
    onlyPositive?: boolean;
}

/**
 * @name Controls/_decorator/interfaces/IOnlyPositive#onlyPositive
 * @cfg {Boolean} Определяет, будут ли отображаться только положительные числа.
 * @default false
 * @remark
 * true - только положительные числа.
 * false - положительные и отрицательные числа.
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
export default interface IOnlyPositive {
    readonly '[Controls/_decorator/interfaces/IOnlyPositive]': boolean;
}

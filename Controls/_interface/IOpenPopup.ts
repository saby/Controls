/**
 * Интерфейс для контролов, которые имеют возможность открывать диалоговое окно.
 * @public
 * @author Красильников А.С.
 */
export default interface IOpenPopup {
    readonly '[Controls/_interface/IOpenPopup]': boolean;
    openPopup(): void;
}

/**
 * Открывает диалоговое окно контрола.
 * @name Controls/_interface/IOpenPopup#openPopup
 * @function
 * @example
 * <pre class="brush: html">
 * <!-- WML -->
 * <Controls.dateRange:RangeSelector name='dateRange'/>
 * <Controls.Button on:click="_openPopup()" />
 * </pre>
 * <pre class="brush: js">
 * // JavaScript
 * openPopup() {
 *    this._children.dateRange.openPopup();
 * }
 * </pre>
 */

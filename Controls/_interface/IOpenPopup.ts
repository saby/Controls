export default interface IOpenPopup {
    readonly '[Controls/_interface/IOpenPopup]': boolean;
    openPopup(): void;
}
/**
 * Открывает диалоговое окно контрола.
 * @function Controls/_interface/IOpenPopup#openPopup
 * @example
 * <pre>
 *     <Controls.dateRange:Selector name='dateRange'/>
 *     <Controls.Button on:click="_openPopup()" />
 * </pre>
 * <pre>
 *     openPopup() {
 *         this._children.dateRange.openPopup();
 *     }
 * </pre>
 */

export default interface IOpenPopup {
    readonly '[Controls/_interface/IOpenPopup]': boolean;
    openPopup(): void;
}
/**
 * Интерфейс для контролов, которые имеют возможность открывать диалоговое окно.
 * @interface Controls/_interface/IOpenPopup
 * @public
 */

/**
 * Открывает диалоговое окно контрола.
 * @name Controls/_interface/IOpenPopup#openPopup
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

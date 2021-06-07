export interface IHeightOptions {
   inlineHeight?: string;
}

/**
 * Интерфейс для контролов, которые поддерживают разные значения высоты.
 * @public
 * @author Авраменко А.С.
 */
/*
 * Interface for control, which has different height values
 *
 * @public
 */
export default interface IHeight {
   readonly '[Controls/_interface/IHeight]': boolean;
}
/**
 * @name Controls/_interface/IHeight#inlineHeight
 * @cfg {Enum} Высота контрола.
 * @variant xs
 * @variant s
 * @variant m
 * @variant l
 * @variant xl
 * @variant 2xl
 * @variant default
 * @demo Controls-demo/Buttons/SizesAndHeights/Index
 * @demo Controls-demo/Input/SizesAndHeights/Index
 * @remark
 * Высота задается константой из стандартного набора размеров, который определен для текущей темы оформления.
 * @example
 * Кнопка большого размера (l).
 * <pre class="brush: html">
 * <!-- WML -->
 * <Controls.buttons:Button icon="icon-Add" inlineHeight="l" viewMode="button"/>
 * </pre>
 * @remark
 * Строковым значениям опции inlineHeight соответствуют числовые (px), которые различны для каждой темы оформления.
 * @see Icon
 */

/*
 * @name Controls/_interface/IHeight#inlineHeight
 * @cfg {Enum} Control height value
 * @variant xs
 * @variant s
 * @variant m
 * @variant l
 * @variant xl
 * @variant 2xl
 * @variant default
 * @example
 * Button with large height.
 * <pre>
 *    <Controls.buttons:Button icon="icon-Add" inlineHeight="l" viewMode="button"/>
 * </pre>
 * @see Icon
 */

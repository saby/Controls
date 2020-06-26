export interface IFontSizeOptions {
   fontSize?: string;
}

/**
 * Интерфейс для контролов, которые поддерживают разные размеры шрифта.
 *
 * @interface Controls/_interface/IFontSize
 * @public
 */

/*
 * Interface for control, which has different font sizes
 *
 * @interface Controls/_interface/IFontSize
 * @public
 */
export default interface IFontSize {
   readonly '[Controls/_interface/IFontSize]': boolean;
}
/**
 * @name Controls/_interface/IFontSize#fontSize
 * @cfg {Enum} Размер шрифта.
 * @variant inherit
 * @variant xs
 * @variant s
 * @variant m
 * @variant l
 * @variant xl
 * @variant 2xl
 * @variant 3xl
 * @variant 4xl
 * @variant 5xl
 * @demo Controls-demo/Buttons/SizesAndHeights/Index
 * @demo Controls-demo/Input/SizesAndHeights/Index
 * @demo Controls-demo/Decorator/Money/FontSize/Index
 * @demo Controls-demo/breadCrumbs_new/FontSize/Index
 * @remark
 * Размер шрифта задается константой из стандартного набора размеров шрифта, который определен для текущей темы оформления.
 * @example
 * Кнопка с размером шрифта xl.
 * <pre>
 *    <Controls.buttons:Button icon="icon-Add" fontSize="xl" viewMode="button"/>
 * </pre>
 * @see Icon
 */

/*
 * @name Controls/_interface/IFontSize#fontSize
 * @cfg {Enum} Font size value
 * @variant inherit
 * @variant xs
 * @variant s
 * @variant m
 * @variant l
 * @variant xl
 * @variant 2xl
 * @variant 3xl
 * @variant 4xl
 * @variant 5xl
 * @example
 * Button with xl font size.
 * <pre>
 *    <Controls.buttons:Button icon="icon-Add" fontSize="xl" viewMode="button"/>
 * </pre>
 * @see Icon
 */

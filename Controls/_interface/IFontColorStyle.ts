export interface IFontColorStyleOptions {
   fontColorStyle?: string;
}

/**
 * Интерфейс для контролов, которые поддерживают разные цвета текста.
 *
 * @interface Controls/_interface/IFontColorStyle
 * @public
 * @author Красильников А.С.
 */

/*APPROVED
 * Interface for controls, which support different colors of text
 *
 * @interface Controls/_interface/IFontColorStyle
 * @public
 */
export default interface IFontColorStyle {
   readonly '[Controls/_interface/IFontColorStyle]': boolean;
}
/**
 * @name Controls/_interface/IFontColorStyle#fontColorStyle
 * @cfg {Enum} Стиль цвета текста контрола.
 * @variant primary
 * @variant secondary
 * @variant success
 * @variant warning
 * @variant danger
 * @variant unaccented
 * @variant link
 * @variant label
 * @variant info
 * @variant default
 * @demo Controls-demo/Buttons/FontStyles/Index
 * @demo Controls-demo/Input/FontStyles/Index
 * @demo Controls-demo/Decorator/Money/FontColorStyle/Index
 * @demo Controls-demo/breadCrumbs_new/FontColorStyle/Index
 * @remark
 * Стиль цвета текста задается константой из стандартного набора цветов, который определен для текущей темы оформления.
 * @example
 * Кнопка со стилем шрифта по умолчанию.
 * <pre>
 *    <Controls.buttons:Button icon="icon-Add" viewMode="button"/>
 * </pre>
 * Кнопка со стилем шрифта "success".
 * <pre>
 *    <Controls.buttons:Button icon="icon-Add" fontColorStyle="success" viewMode="button"/>
 * </pre>
 * @see Icon
 */

/*
 * @name Controls/_interface/IFontColorStyle#fontColorStyle
 * @cfg {Enum} Text color style.
 * @variant primary
 * @variant secondary
 * @variant success
 * @variant warning
 * @variant danger
 * @variant unaccented
 * @variant link
 * @variant label
 * @variant default
 * @demo Controls-demo/Buttons/FontStyles/Index
 * @remark
 * Text color style is set by a constant from default color set. The color values are determined by the theme.
 * @example
 * Button with default font style.
 * <pre>
 *    <Controls.buttons:Button icon="icon-Add" viewMode="button"/>
 * </pre>
 * Button with success font style.
 * <pre>
 *    <Controls.buttons:Button icon="icon-Add" fontColorStyle="success" viewMode="button"/>
 * </pre>
 * @see Icon
 */

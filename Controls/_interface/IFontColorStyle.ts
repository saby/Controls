/**
 * @typedef {String} TFontColorStyle
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
 */
export type TFontColorStyle = 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'unaccented' | 'link' | 'label' | 'info' | 'default'  | string;

export interface IFontColorStyleOptions {
   fontColorStyle?: TFontColorStyle;
}

/**
 * Интерфейс для контролов, которые поддерживают разные цвета текста.
 *
 * @public
 * @author Красильников А.С.
 */

/*APPROVED
 * Interface for controls, which support different colors of text
 *
 * @public
 */
export default interface IFontColorStyle {
   readonly '[Controls/_interface/IFontColorStyle]': boolean;
}
/**
 * @name Controls/_interface/IFontColorStyle#fontColorStyle
 * @cfg {TFontColorStyle} Стиль цвета текста контрола.
 * @demo Controls-demo/Buttons/FontStyles/Index
 * @demo Controls-demo/Input/FontStyles/Index
 * @demo Controls-demo/Decorator/Money/FontColorStyle/Index
 * @demo Controls-demo/breadCrumbs_new/FontColorStyle/Index
 * @remark
 * Стиль цвета текста задается константой из стандартного набора цветов, который определен для текущей темы оформления.
 * @example
 * Кнопка со стилем шрифта по умолчанию.
 * <pre class="brush: html">
 * <!-- WML -->
 * <Controls.buttons:Button icon="icon-Add" viewMode="button"/>
 * </pre>
 * Кнопка со стилем шрифта "success".
 * <pre class="brush: html">
 * <!-- WML -->
 * <Controls.buttons:Button icon="icon-Add" fontColorStyle="success" viewMode="button"/>
 * </pre>
 * @see Icon
 */

/*
 * @name Controls/_interface/IFontColorStyle#fontColorStyle
 * @cfg {Enum} Text color style.
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

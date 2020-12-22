import {TemplateFunction} from 'UI/Base';
export interface ICaptionOptions {
   caption?: string | TemplateFunction;
}

/**
 * Текст заголовка.
 * @public
 * @author Красильников А.С.
 */

/*
 * Caption text.
 *
 * @public
 * @author Красильников А.С.
 */
export default interface ICaption {
   readonly '[Controls/_interface/ICaption]': boolean;
}
/**
 * @name Controls/_interface/ICaption#caption
 * @cfg {String} Определяет текст заголовка контрола.
 * @example
 * <pre class="brush: html">
 *    <Controls.buttons:Button caption="Hello Wasaby"/>
 * </pre>
 */

/*
 * @name Controls/_interface/ICaption#caption
 * @cfg {String} Control caption text.
 * @example
 * Control has caption 'Dialog'.
 * <pre>
 *    <ControlsDirectory.Control caption="Dialog"/>
 * </pre>
 */

/**
 * Интерфейс для поддержки клика по элементу.
 *
 * @public
 * @author Красильников А.С.
 */

/*
 * Click event interface.
 *
 * @interface Controls/_buttons/interface/IClick
 * @public
 * @author Красильников А.С.
 */
export interface IClick {
   readonly '[Controls/_buttons/interface/IClick]': boolean;
}
/**
 * @event Происходит при клике по элементу.
 * @name Controls/_buttons/interface/IClick#click
 * @remark Если кнопка с readOnly установлена в true, то событие не всплывает.
 * @example
 * Кнопка со стилем 'primary', режимом отображения 'button' и иконкой 'icon-Send'. Если пользователь произведет клик по кнопке, произойдет отправка документа.
 * <pre class="brush: html; highlight: [3]">
 * <!-- WML -->
 * <Controls.buttons:Button
 *    on:click="_clickHandler()"
 *    icon="icon-Send"
 *    buttonStyle="primary"
 *    viewMode="button"/>
 * </pre>
 * <pre class="brush: js;">
 * // TypeScript
 * class MyControl extends Control<IControlOptions> {
 *    _clickHandler(e) {
 *       this.sendDocument();
 *    }
 * }
 * </pre>
 */

/*
 * @event Occurs when item was clicked.
 * @name Controls/_buttons/interface/IClick#click
 * @remark If button with readOnly set to true then event does not bubble.
 * @example
 * Button with style 'primary' viewMode 'button' and icon 'icon-Send'. If user click to button then document send.
 * <pre>
 *    <Controls.buttons:Button on:click="_clickHandler()" icon="icon-Send" buttonStyle="primary" viewMode="button"/>
 * </pre>
 * <pre>
 *    class MyControl extends Control<IControlOptions> {
 *       ...
 *       _clickHandler(e) {
 *          this.sendDocument();
 *       }
 *       ...
 *    }
 * </pre>
 */

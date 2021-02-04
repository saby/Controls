/**
 * Интерфейс для ввода тегов (цветные индикаторы в правом верхнем углу поля).
 * @public
 * @author Красильников А.С.
 */

export interface IInputTagOptions {
    tagStyle?: 'info' | 'danger' | 'primary' | 'success' | 'secondary';
}

/**
 * @name Controls/_interface/IInputTag#tagStyle
 * @cfg {String} Стиль тега (цветной индикатор, который отображается в правом верхнем углу поля).
 * @variant secondary
 * @variant success
 * @variant primary
 * @variant danger
 * @variant info
 * @remark
 * Тег используется для отображения некоторой информации о поле (например, если поле является обязательным). Часто информационное окно с подсказкой отображается при щелчке или наведении на тег (см. tag Click, tag Hover).
 * @example
 * В этом примере поле будет к полю будет применен стиль "danger". Когда вы кликните по тегу, появится информационное окно с сообщением "This field is required".
 * <pre class="brush: html">
 * <!-- WML -->
 * <Controls.input:Text tagStyle="danger" on:tagClick="tagClickHandler()"/>
 * <Controls.popup:InfoboxTarget name="infoboxOpener"/>
 * </pre>
 *
 * <pre class="brush: js">
 * // JavaScript
 * Base.Control.extend({
 *    _tagClickHandler(target) {
 *       this._children.infoboxOpener.open({
 *          target: target,
 *          text: 'This field is required'
 *       });
 *    }
 * });
 * </pre>
 * @see tagHover
 * @see tagClick
 */

/**
 * @event Происходит при клике на тег.
 * @name Controls/_interface/IInputTag#tagClick
 * @param {Object} event Нативное событие. Может быть использовано для получения тега как DOM-элемента для отображения инфобокса.
 * @remark Событие никогда не запустится, если вы не укажете опцию tagStyle.
 * @example
 * В этом примере при нажатии на тег будет отображаться информационное окно с сообщением "This field is required".
 * <pre class="brush: html">
 * <!-- WML -->
 * <Controls.input:Text tagStyle="danger" on:tagClick="tagClickHandler()"/>
 * <Controls.popup:InfoboxTarget name="infoboxOpener"/>
 * </pre>
 *
 * <pre class="brush: js">
 * // JavaScript
 * Base.Control.extend({
 *    _tagClickHandler(event) {
 *       this._children.infoboxOpener.open({
 *          target: event.target,
 *          text: 'This field is required'
 *       });
 *    }
 * });
 * </pre>
 * @see tagStyle
 * @see tagHover
 */

/**
 * @event Происходит при наведении курсора мыши на тег.
 * @name Controls/_interface/IInputTag#tagHover
 * @param {Object} event Нативное событие. Может быть использовано для получения тега как DOM-элемента для отображения инфобокса.
 * @remark Событие никогда не запустится, если вы не укажете опцию tagStyle.
 * @example
 * В этом примере при наведении курсора на тег будет отображаться информационное окно с сообщением "This field is required".
 * <pre class="brush: html">
 * <!-- WML -->
 * <Controls.input:Text tagStyle="danger" on:tagHover="_tagHoverHandler()"/>
 * <Controls.popup:InfoboxTarget name="infoboxOpener"/>
 * </pre>
 *
 * <pre class="brush: js">
 * // JavaScript
 * Base.Control.extend({
 *    _tagHoverHandler(event) {
 *       this._children.infoboxOpener.open({
 *          target: event.target,
 *          text: 'This field is required'
 *       });
 *    }
 * });
 * </pre>
 * @see tagStyle
 * @see tagClick
 */

export interface IInputTag {
    readonly '[Controls/_interface/IInputTag]': boolean;
}


export interface IInputPlaceholderOptions {
    placeholder?: string | Function;
}

/**
 * @name Controls/_interface/IInputPlaceholder#placeholder
 * @cfg {String|TemplateFunction} Текст, который отображается в пустом поле ввода.
 * @remark
 * Отображает текст в пустом поле ввода. Мы не используем собственные HTML-подсказки и не отображаем подсказки как div, наложенный поверх поля, чтобы разрешить использование пользовательских шаблонов.
 * Элементам, по которым можно произвести клик, в пользовательских шаблонах необходимо задать CSS-свойство pointer-events: auto.
 * @example
 * В этом примере создается текстовое поле с простой подсказкой.
 * <pre class="brush: html">
 * <!-- WML -->
 * <Controls.input:Text placeholder="Enter your name" />
 * </pre>
 * В этом примере мы визуализируем пользовательский шаблон в текстовой подсказке поля. Мы помещаем в текстовое поле кнопку, по который пользователь может произвести клик, чтобы открыть список для выбора.
 * <pre class="brush: html">
 * <!-- WML -->
 * <Controls.input:Text>
 *    <ws:placeholder>
 *       <span>Enter your name or <Controls.buttons:Button class="example__button" caption="choose from the list" on:click="openListHandler()"/></span>
 *    </ws:placeholder>
 * </Controls.input:Text>
 * </pre>
 *
 * <pre class="brush: css">
 * .example__button {
 *    pointer-events: auto;
 * }
 * </pre>
 */

/**
 * Интерфейс для текста подсказки в поле ввода.
 *
 * @public
 * @author Красильников А.С.
 */
export interface IInputPlaceholder {
    readonly '[Controls/_interface/IInputPlaceholder]': boolean;
}

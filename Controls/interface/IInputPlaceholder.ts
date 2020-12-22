/**
 * Интерфейс для текста подсказки в поле ввода.
 *
 * @public
 * @author Красильников А.С.
 */

/*
 * Interface for input placeholder.
 *
 * @public
 * @author Красильников А.С.
 */
interface IInputPlaceholder {
    readonly _options: {
        /**
         * @cfg {String|Function} Текст, который отображается в пустом поле ввода.
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

        /*
         * @name Controls/interface/IInputPlaceholder#placeholder
         * @cfg {String|Function} Field placeholder.
         * @remark
         * Renders placeholder in the field when it is empty. We do not use native HTML placeholders and render placeholder as div overlaid on top of the field to allow the use of custom templates.
         * Clickable elements in custom templates need to set the css property pointer-events: auto.
         * @example
         * In this example, we create a text field with simple text placeholder.
         * <pre class="brush: html">
         * <!-- WML -->
         * <Controls.input:Text placeholder="Enter your name" />
         * </pre>
         * In this example, we render a custom template in field's placeholder. We put a Button in the placeholder that user can click on to open the list to pick from.
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
        placeholder?: string | Function;
    }
}

export default IInputPlaceholder;

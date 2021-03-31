/**
 * Шаблон, который по умолчанию используется для отображения выбранных значений в контролах {@link Controls/lookup:Input} и {@link Controls/lookup:Selector}.
 *
 * @class Controls/lookup:ItemTemplate
 * @author Герасимов А.М.
 * @public
 * @see Controls/lookup
 * @see Controls/lookup:Input
 *
 * @remark
 *
 * Если вы переопределите contentTemplate/crossTemplate, вы не будете уведомлены о событиях itemClick/crossClick.
 * Для правильной работы необходимо пометить свой контент классами:
 * 
 * * js-controls-SelectedCollection__item__caption
 * * js-controls-SelectedCollection__item__cross
 *
 * @example
 * <pre class="brush: html">
 * <!-- WML -->
 * <Controls.lookup:Selector
 *     source="{{_source}}"
 *     keyProperty="id">
 *     <ws:itemTemplate>
 *         <ws:partial template="Controls/lookup:ItemTemplate"
 *             style="primary"
 *             size="xl"
 *             displayProperty="title"
 *             clickable="{{true}}" />
 *     </ws:itemTemplate>
 * </Controls.lookup:Selector>
 * </pre>
 */

export default interface IItemTemplateOptions {
    /**
     * @name Controls/lookup:ItemTemplate#contentTemplate
     * @cfg {String|TemplateFunction} Шаблон отображения выбранной записи.
     */
    contentTemplate?: string;
    /**
     * @name Controls/lookup:ItemTemplate#crossTemplate
     * @cfg {String|TemplateFunction} Шаблон крестика удаления элемента.
     */
    crossTemplate?: string;
    /**
     * @name Controls/lookup:ItemTemplate#displayProperty
     * @cfg {String} Название поля, значение которого отображается при выборе элемента.
     */
    displayProperty?: string;
    /**
     * @name Controls/lookup:ItemTemplate#clickable
     * @cfg {Boolean} Позволяет установить кликабельность выбранного значения.
     *
     * @remark
     * Использование параметра допустимо только в случае применения contentTemplate по умолчанию.
     */
    clickable?: boolean;
    /**
     * @name Controls/lookup:ItemTemplate#size
     * @cfg {String} Размер записей.
     *
     * @remark
     * Использование параметра допустимо только в случае применения contentTemplate по умолчанию.
     * Доступные значения: m, l, xl, 2xl, 3xl.
     */
    size?: string;
    /**
     * @name Controls/lookup:ItemTemplate#style
     * @cfg {String} Cтиль записей.
     *
     * @remark
     * Использование параметра допустимо только в случае применения contentTemplate по умолчанию.
     * Доступные значения: default, bold, accent, primary, label.
     */
    style?: string;
 }

